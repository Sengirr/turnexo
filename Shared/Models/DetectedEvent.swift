import Foundation

/// Resultado editable del análisis de una imagen.
///
/// Es un tipo valor `Sendable` para poder cruzar fronteras de concurrencia
/// (Vision en background → UI en MainActor) sin riesgo de data races.
struct DetectedEvent: Identifiable, Equatable, Sendable {
    let id: UUID
    var title: String
    var startDate: Date
    var endDate: Date
    var isAllDay: Bool
    var location: String
    var notes: String
    var url: URL?
    /// Texto OCR completo (útil para depuración o para mostrarlo al usuario).
    let rawText: String
    /// `false` si no se encontró ninguna fecha y se usó un valor por defecto.
    let dateWasDetected: Bool

    init(
        id: UUID = UUID(),
        title: String,
        startDate: Date,
        endDate: Date,
        isAllDay: Bool = false,
        location: String = "",
        notes: String = "",
        url: URL? = nil,
        rawText: String = "",
        dateWasDetected: Bool = true
    ) {
        self.id = id
        self.title = title
        self.startDate = startDate
        self.endDate = endDate
        self.isAllDay = isAllDay
        self.location = location
        self.notes = notes
        self.url = url
        self.rawText = rawText
        self.dateWasDetected = dateWasDetected
    }

    /// Evento vacío usado como estado inicial de la UI.
    static var empty: DetectedEvent {
        let now = Date.now
        return DetectedEvent(title: "", startDate: now, endDate: now.addingTimeInterval(3600))
    }
}
