import SwiftUI

/// Tarjeta editable con el evento detectado. Vive en `Shared/` para reutilizarla
/// también en la Share Extension.
struct EventCardView: View {
    @Binding var event: DetectedEvent
    var image: UIImage?
    var isSaving: Bool
    var onSave: () -> Void
    var onDiscard: () -> Void

    @FocusState private var focusedField: Field?
    private enum Field { case title, location, notes }

    private var dateComponents: DatePickerComponents {
        event.isAllDay ? [.date] : [.date, .hourAndMinute]
    }

    private var canSave: Bool {
        !isSaving && !event.title.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 18) {
            header

            if !event.dateWasDetected {
                Label("No encontramos una fecha clara. Revísala antes de guardar.",
                      systemImage: "exclamationmark.triangle.fill")
                    .font(.footnote)
                    .foregroundStyle(.orange)
            }

            Divider()

            VStack(spacing: 12) {
                Toggle(isOn: $event.isAllDay.animation()) {
                    Label("Todo el día", systemImage: "sun.max")
                }
                DatePicker(selection: $event.startDate, displayedComponents: dateComponents) {
                    Label("Empieza", systemImage: "calendar")
                }
                DatePicker(selection: $event.endDate, in: event.startDate..., displayedComponents: dateComponents) {
                    Label("Termina", systemImage: "calendar.badge.clock")
                }
            }

            Divider()

            row(icon: "mappin.and.ellipse") {
                TextField("Ubicación", text: $event.location, axis: .vertical)
                    .focused($focusedField, equals: .location)
            }
            row(icon: "text.alignleft") {
                TextField("Notas", text: $event.notes, axis: .vertical)
                    .lineLimit(2...6)
                    .focused($focusedField, equals: .notes)
            }

            Label("Aviso 24 h antes", systemImage: "bell.badge")
                .font(.footnote)
                .foregroundStyle(.secondary)

            VStack(spacing: 10) {
                Button {
                    focusedField = nil
                    onSave()
                } label: {
                    HStack(spacing: 8) {
                        if isSaving {
                            ProgressView().tint(.white)
                        } else {
                            Image(systemName: "calendar.badge.plus")
                        }
                        Text("Guardar en Calendario").bold()
                    }
                    .frame(maxWidth: .infinity)
                }
                .buttonStyle(.borderedProminent)
                .controlSize(.large)
                .disabled(!canSave)

                Button("Descartar", role: .destructive, action: onDiscard)
                    .frame(maxWidth: .infinity)
                    .disabled(isSaving)
            }
        }
        .padding(20)
        .background(
            RoundedRectangle(cornerRadius: 28, style: .continuous)
                .fill(Color(.secondarySystemGroupedBackground))
        )
        .onChange(of: event.startDate) { oldValue, newValue in
            // Mantiene la duración al mover el inicio.
            let duration = max(event.endDate.timeIntervalSince(oldValue), 0)
            event.endDate = newValue.addingTimeInterval(duration)
        }
    }

    private var header: some View {
        HStack(alignment: .top, spacing: 12) {
            if let image {
                Image(uiImage: image)
                    .resizable()
                    .scaledToFill()
                    .frame(width: 56, height: 56)
                    .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
                    .accessibilityHidden(true)
            }
            VStack(alignment: .leading, spacing: 4) {
                Text("EVENTO DETECTADO")
                    .font(.caption.weight(.semibold))
                    .foregroundStyle(.secondary)
                TextField("Título del evento", text: $event.title, axis: .vertical)
                    .font(.title3.bold())
                    .focused($focusedField, equals: .title)
            }
        }
    }

    private func row<Content: View>(icon: String, @ViewBuilder content: () -> Content) -> some View {
        HStack(alignment: .firstTextBaseline, spacing: 12) {
            Image(systemName: icon)
                .foregroundStyle(.secondary)
                .frame(width: 22)
            content()
        }
    }
}

#Preview {
    @Previewable @State var event = DetectedEvent(
        title: "Concierto de Jazz en el Parque",
        startDate: .now.addingTimeInterval(86_400 * 3),
        endDate: .now.addingTimeInterval(86_400 * 3 + 7200),
        location: "Parque del Retiro, Madrid"
    )
    ScrollView {
        EventCardView(event: $event, isSaving: false, onSave: {}, onDiscard: {})
            .padding()
    }
    .background(Color(.systemGroupedBackground))
}
