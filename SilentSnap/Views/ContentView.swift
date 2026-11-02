import PhotosUI
import SwiftUI
import VisionKit

struct ContentView: View {
    @Environment(PurchaseManager.self) private var purchases
    @Environment(CalendarManager.self) private var calendarManager
    @Environment(ScanQuotaStore.self) private var quota
    @Environment(\.openURL) private var openURL

    @State private var phase: Phase = .idle
    @State private var sourceImage: UIImage?
    @State private var draft = DetectedEvent.empty
    @State private var isSaving = false
    @State private var savedCount = 0

    @State private var galleryItem: PhotosPickerItem?
    @State private var isShowingGallery = false
    @State private var isShowingCamera = false
    @State private var isShowingSourceDialog = false
    @State private var isShowingPaywall = false
    @State private var alert: AlertContent?

    private let parser = VisionParserService()

    private enum Phase: Equatable { case idle, processing, editing, saved }
    private enum Source { case camera, gallery }

    private var canScan: Bool { purchases.isPro || quota.remaining > 0 }

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 24) {
                    HeaderView(isPro: purchases.isPro, scansRemaining: quota.remaining) {
                        isShowingPaywall = true
                    }
                    content
                        .transition(.opacity.combined(with: .scale(scale: 0.98)))
                }
                .padding(20)
                .animation(.snappy, value: phase)
            }
            .scrollDismissesKeyboard(.interactively)
            .background(Color(.systemGroupedBackground).ignoresSafeArea())
            .toolbar(.hidden, for: .navigationBar)
        }
        .photosPicker(isPresented: $isShowingGallery, selection: $galleryItem, matching: .images)
        .onChange(of: galleryItem) { _, item in
            if let item { loadFromGallery(item) }
        }
        .fullScreenCover(isPresented: $isShowingCamera) {
            DocumentCameraView { image in
                isShowingCamera = false
                if let image { process(image) }
            }
            .ignoresSafeArea()
        }
        .sheet(isPresented: $isShowingPaywall) {
            PaywallView()
        }
        .confirmationDialog("Importar evento", isPresented: $isShowingSourceDialog, titleVisibility: .visible) {
            Button("Hacer Foto") { requestScan(.camera) }
            Button("Elegir de Galería") { requestScan(.gallery) }
        }
        .alert(alert?.title ?? "", isPresented: isShowingAlert, presenting: alert) { content in
            if content.offersSettings {
                Button("Abrir Ajustes") { openSettings() }
                Button("Cancelar", role: .cancel) {}
            } else {
                Button("OK", role: .cancel) {}
            }
        } message: { content in
            Text(content.message)
        }
        .sensoryFeedback(.success, trigger: savedCount)
    }

    // MARK: - Contenido según fase

    @ViewBuilder
    private var content: some View {
        switch phase {
        case .idle:
            ImportZoneView(
                onTapZone: { isShowingSourceDialog = true },
                onCamera: { requestScan(.camera) },
                onGallery: { requestScan(.gallery) }
            )
            #if targetEnvironment(simulator)
            SimulatorSamplesCard { sample in
                guard canScan else {
                    isShowingPaywall = true
                    return
                }
                let image = SamplePosters.render(sample)
                process(image)
            }
            #endif
        case .processing:
            ScanningView(image: sourceImage)
        case .editing:
            EventCardView(event: $draft, image: sourceImage, isSaving: isSaving, onSave: save, onDiscard: reset)
        case .saved:
            SavedView(title: draft.title, onScanAnother: reset)
        }
    }

    // MARK: - Acciones

    private func requestScan(_ source: Source) {
        guard canScan else {
            isShowingPaywall = true
            return
        }
        switch source {
        case .camera:
            guard VNDocumentCameraViewController.isSupported else {
                alert = AlertContent(title: "Cámara no disponible",
                                     message: "Este dispositivo no admite el escáner de documentos. Elige una foto de la galería.")
                return
            }
            isShowingCamera = true
        case .gallery:
            isShowingGallery = true
        }
    }

    private func loadFromGallery(_ item: PhotosPickerItem) {
        galleryItem = nil
        sourceImage = nil
        phase = .processing
        Task {
            do {
                guard let data = try await item.loadTransferable(type: Data.self),
                      let image = UIImage(data: data) else {
                    throw VisionParserError.invalidImage
                }
                process(image)
            } catch {
                phase = .idle
                alert = AlertContent(title: "No se pudo abrir la foto", message: error.localizedDescription)
            }
        }
    }

    private func process(_ image: UIImage) {
        sourceImage = image
        phase = .processing
        Task {
            let start = ContinuousClock.now
            do {
                let event = try await parser.analyze(image)

                // Duración mínima para que la animación no "parpadee" en imágenes simples.
                let elapsed = ContinuousClock.now - start
                if elapsed < .milliseconds(1200) {
                    try? await Task.sleep(for: .milliseconds(1200) - elapsed)
                }

                // Se descuenta al terminar el escaneo con éxito (persistido en Keychain).
                if !purchases.isPro { quota.consume() }
                draft = event
                phase = .editing
            } catch {
                phase = .idle
                alert = AlertContent(title: "No se pudo analizar", message: error.localizedDescription)
            }
        }
    }

    private func save() {
        isSaving = true
        let event = draft
        Task {
            defer { isSaving = false }
            do {
                try await calendarManager.save(event)
                savedCount += 1
                phase = .saved
            } catch CalendarManager.CalendarError.accessDenied {
                alert = AlertContent(title: "Permiso necesario",
                                     message: CalendarManager.CalendarError.accessDenied.localizedDescription,
                                     offersSettings: true)
            } catch {
                alert = AlertContent(title: "No se pudo guardar", message: error.localizedDescription)
            }
        }
    }

    private func reset() {
        phase = .idle
        sourceImage = nil
        draft = .empty
    }

    private func openSettings() {
        if let url = URL(string: UIApplication.openSettingsURLString) { openURL(url) }
    }

    private var isShowingAlert: Binding<Bool> {
        Binding(get: { alert != nil }, set: { if !$0 { alert = nil } })
    }
}

// MARK: - Modelos de UI

private struct AlertContent: Identifiable {
    let id = UUID()
    let title: String
    let message: String
    var offersSettings = false
}

// MARK: - Subvistas

private struct HeaderView: View {
    let isPro: Bool
    let scansRemaining: Int
    let onBadgeTap: () -> Void

    var body: some View {
        HStack(alignment: .center) {
            VStack(alignment: .leading, spacing: 2) {
                Text("SilentSnap")
                    .font(.largeTitle.bold())
                Text("Foto → Calendario. Sin nube.")
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
            }
            Spacer()
            Button(action: onBadgeTap) {
                Group {
                    if isPro {
                        Label("Pro Lifetime", systemImage: "infinity")
                            .foregroundStyle(.white)
                    } else {
                        Label("\(scansRemaining) restantes", systemImage: "viewfinder")
                            .foregroundStyle(scansRemaining <= 2 ? Color.orange : Color.primary)
                    }
                }
                .font(.footnote.weight(.semibold))
                .padding(.horizontal, 12)
                .padding(.vertical, 7)
                .background {
                    if isPro {
                        Capsule().fill(LinearGradient(colors: [.indigo, .purple],
                                                      startPoint: .leading, endPoint: .trailing))
                    } else {
                        Capsule().fill(.thinMaterial)
                    }
                }
            }
            .buttonStyle(.plain)
            .disabled(isPro)
            .accessibilityLabel(isPro ? "Pro Lifetime activo" : "\(scansRemaining) escaneos gratuitos restantes")
        }
    }
}

private struct ImportZoneView: View {
    let onTapZone: () -> Void
    let onCamera: () -> Void
    let onGallery: () -> Void

    var body: some View {
        VStack(spacing: 20) {
            Button(action: onTapZone) {
                VStack(spacing: 14) {
                    Image(systemName: "doc.text.viewfinder")
                        .font(.system(size: 60, weight: .light))
                        .foregroundStyle(.tint)
                        .symbolEffect(.pulse, options: .repeating)
                    Text("Escanea un cartel, ticket o folleto")
                        .font(.headline)
                    Text("Detectamos fecha, hora y lugar directamente en tu iPhone.")
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                        .multilineTextAlignment(.center)
                        .padding(.horizontal, 24)
                }
                .frame(maxWidth: .infinity, minHeight: 300)
                .background(
                    RoundedRectangle(cornerRadius: 28, style: .continuous)
                        .fill(Color(.secondarySystemGroupedBackground))
                )
                .overlay(
                    RoundedRectangle(cornerRadius: 28, style: .continuous)
                        .strokeBorder(style: StrokeStyle(lineWidth: 2, dash: [8, 6]))
                        .foregroundStyle(.tint.opacity(0.4))
                )
                .contentShape(RoundedRectangle(cornerRadius: 28, style: .continuous))
            }
            .buttonStyle(.plain)

            HStack(spacing: 12) {
                Button(action: onCamera) {
                    Label("Hacer Foto", systemImage: "camera.fill")
                        .frame(maxWidth: .infinity)
                }
                .buttonStyle(.borderedProminent)

                Button(action: onGallery) {
                    Label("Elegir de Galería", systemImage: "photo.on.rectangle")
                        .frame(maxWidth: .infinity)
                }
                .buttonStyle(.bordered)
            }
            .controlSize(.large)

            Label("100 % offline · Sin cuentas · Sin servidores", systemImage: "lock.shield")
                .font(.caption)
                .foregroundStyle(.secondary)
        }
    }
}

private struct ScanningView: View {
    let image: UIImage?
    @State private var sweep = false

    var body: some View {
        VStack(spacing: 18) {
            Group {
                if let image {
                    Image(uiImage: image)
                        .resizable()
                        .scaledToFit()
                } else {
                    RoundedRectangle(cornerRadius: 24, style: .continuous)
                        .fill(.quaternary)
                        .frame(height: 320)
                }
            }
            .frame(maxWidth: .infinity, maxHeight: 400)
            .overlay {
                GeometryReader { geo in
                    LinearGradient(colors: [.clear, Color.accentColor.opacity(0.55), .clear],
                                   startPoint: .top, endPoint: .bottom)
                        .frame(height: 80)
                        .offset(y: sweep ? geo.size.height - 40 : -40)
                }
            }
            .clipShape(RoundedRectangle(cornerRadius: 24, style: .continuous))
            .onAppear {
                withAnimation(.easeInOut(duration: 1.4).repeatForever(autoreverses: true)) {
                    sweep = true
                }
            }

            ProgressView {
                Text("Analizando texto en el dispositivo…")
                    .font(.subheadline)
            }
        }
        .accessibilityElement(children: .combine)
        .accessibilityLabel("Analizando imagen")
    }
}

private struct SavedView: View {
    let title: String
    let onScanAnother: () -> Void

    var body: some View {
        VStack(spacing: 16) {
            Image(systemName: "checkmark.circle.fill")
                .font(.system(size: 72))
                .foregroundStyle(.green)
                .symbolEffect(.bounce, options: .nonRepeating, value: title)
            Text("Añadido al Calendario")
                .font(.title2.bold())
            Text("«\(title)» con aviso 24 h antes.")
                .foregroundStyle(.secondary)
                .multilineTextAlignment(.center)
            Button(action: onScanAnother) {
                Label("Escanear otro", systemImage: "doc.text.viewfinder")
                    .frame(maxWidth: .infinity)
            }
            .buttonStyle(.borderedProminent)
            .controlSize(.large)
            .padding(.top, 8)
        }
        .padding(28)
        .frame(maxWidth: .infinity)
        .background(
            RoundedRectangle(cornerRadius: 28, style: .continuous)
                .fill(Color(.secondarySystemGroupedBackground))
        )
    }
}

#if targetEnvironment(simulator)
private struct SimulatorSamplesCard: View {
    let onSelect: (SamplePosters.Sample) -> Void

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Label("Modo Simulador · Carteles de prueba", systemImage: "iphone.gen3")
                .font(.footnote.weight(.semibold))
                .foregroundStyle(.secondary)

            Text("El simulador no tiene cámara física. Pulsa un ejemplo para generar una imagen real y probar el OCR (Vision) y el Calendario:")
                .font(.caption)
                .foregroundStyle(.secondary)

            VStack(spacing: 8) {
                ForEach(SamplePosters.all) { sample in
                    Button {
                        onSelect(sample)
                    } label: {
                        HStack(spacing: 12) {
                            Image(systemName: sample.icon)
                                .font(.body.weight(.semibold))
                                .foregroundStyle(.tint)
                                .frame(width: 28)
                            VStack(alignment: .leading, spacing: 2) {
                                Text(sample.label)
                                    .font(.subheadline.weight(.medium))
                                    .foregroundStyle(.primary)
                                Text("\(sample.title) · \(sample.dateLine)")
                                    .font(.caption2)
                                    .foregroundStyle(.secondary)
                                    .lineLimit(1)
                            }
                            Spacer()
                            Image(systemName: "sparkles")
                                .font(.caption)
                                .foregroundStyle(.tint)
                        }
                        .padding(.horizontal, 14)
                        .padding(.vertical, 10)
                        .background(
                            RoundedRectangle(cornerRadius: 14, style: .continuous)
                                .fill(Color(.tertiarySystemGroupedBackground))
                        )
                    }
                    .buttonStyle(.plain)
                }
            }
        }
        .padding(16)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(
            RoundedRectangle(cornerRadius: 22, style: .continuous)
                .fill(Color(.secondarySystemGroupedBackground))
        )
    }
}
#endif

#Preview {
    ContentView()
        .environment(PurchaseManager())
        .environment(CalendarManager())
        .environment(ScanQuotaStore())
}
