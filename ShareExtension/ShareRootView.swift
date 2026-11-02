import SwiftUI

struct ShareRootView: View {
    @Bindable var model: ShareViewModel

    var body: some View {
        NavigationStack {
            ScrollView {
                content
                    .padding(20)
                    .animation(.snappy, value: model.phase)
            }
            .scrollDismissesKeyboard(.interactively)
            .background(Color(.systemGroupedBackground).ignoresSafeArea())
            .navigationTitle("SilentSnap")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancelar") { model.cancel() }
                        .disabled(model.isSaving)
                }
                ToolbarItem(placement: .topBarTrailing) {
                    if model.isPro {
                        Label("Pro", systemImage: "infinity")
                            .font(.footnote.weight(.semibold))
                    } else if let remaining = model.remainingScans {
                        Text("\(remaining) restantes")
                            .font(.footnote.weight(.semibold))
                            .foregroundStyle(remaining <= 2 ? .orange : .secondary)
                    }
                }
            }
        }
        .sensoryFeedback(.success, trigger: model.phase == .saved)
        .task { await model.start() }
    }

    @ViewBuilder
    private var content: some View {
        switch model.phase {
        case .loading:
            ProgressView("Abriendo imagen…")
                .frame(maxWidth: .infinity, minHeight: 300)

        case .processing:
            VStack(spacing: 18) {
                if let image = model.image {
                    Image(uiImage: image)
                        .resizable()
                        .scaledToFit()
                        .frame(maxHeight: 360)
                        .clipShape(RoundedRectangle(cornerRadius: 24, style: .continuous))
                        .overlay(ScanSweep())
                }
                ProgressView("Analizando texto en el dispositivo…")
            }

        case .editing:
            VStack(spacing: 12) {
                EventCardView(
                    event: $model.draft,
                    image: model.image,
                    isSaving: model.isSaving,
                    onSave: { Task { await model.save() } },
                    onDiscard: { model.cancel() }
                )
                if let error = model.saveError {
                    Text(error)
                        .font(.footnote)
                        .foregroundStyle(.red)
                        .multilineTextAlignment(.center)
                }
            }

        case .saved:
            StatusView(icon: "checkmark.circle.fill", tint: .green,
                       title: "Añadido al Calendario",
                       message: "«\(model.draft.title)» con aviso 24 h antes.")

        case .outOfScans:
            StatusView(icon: "lock.circle.fill", tint: .orange,
                       title: "Sin escaneos gratuitos",
                       message: "Has usado tus \(ScanQuota.freeScans) escaneos. Abre SilentSnap para desbloquear escaneos ilimitados de por vida.",
                       buttonTitle: "Cerrar", action: { model.close() })

        case .failed(let message):
            StatusView(icon: "exclamationmark.triangle.fill", tint: .orange,
                       title: "No se pudo analizar",
                       message: message,
                       buttonTitle: "Cerrar", action: { model.close() })
        }
    }
}

private struct StatusView: View {
    let icon: String
    let tint: Color
    let title: String
    let message: String
    var buttonTitle: String?
    var action: (() -> Void)?

    var body: some View {
        VStack(spacing: 14) {
            Image(systemName: icon)
                .font(.system(size: 64))
                .foregroundStyle(tint)
            Text(title)
                .font(.title2.bold())
            Text(message)
                .foregroundStyle(.secondary)
                .multilineTextAlignment(.center)
            if let buttonTitle, let action {
                Button(buttonTitle, action: action)
                    .buttonStyle(.borderedProminent)
                    .controlSize(.large)
                    .padding(.top, 8)
            }
        }
        .padding(28)
        .frame(maxWidth: .infinity)
        .background(RoundedRectangle(cornerRadius: 28, style: .continuous)
            .fill(Color(.secondarySystemGroupedBackground)))
    }
}

/// Línea de escaneo animada sobre la imagen.
private struct ScanSweep: View {
    @State private var sweep = false

    var body: some View {
        GeometryReader { geo in
            LinearGradient(colors: [.clear, Color.accentColor.opacity(0.55), .clear],
                           startPoint: .top, endPoint: .bottom)
                .frame(height: 80)
                .offset(y: sweep ? geo.size.height - 40 : -40)
        }
        .clipShape(RoundedRectangle(cornerRadius: 24, style: .continuous))
        .allowsHitTesting(false)
        .onAppear {
            withAnimation(.easeInOut(duration: 1.4).repeatForever(autoreverses: true)) { sweep = true }
        }
    }
}
