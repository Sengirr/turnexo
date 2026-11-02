@preconcurrency import EventKit
import Foundation
import Observation

/// Gestiona permisos y escritura en el Calendario del sistema.
///
/// Usa **acceso de sólo escritura** (iOS 17+): la app puede crear eventos sin
/// poder leer la agenda del usuario, coherente con la promesa de privacidad.
@MainActor
@Observable
final class CalendarManager {
    enum CalendarError: LocalizedError {
        case accessDenied
        case accessRestricted
        case noWritableCalendar
        case saveFailed(String)

        var errorDescription: String? {
            switch self {
            case .accessDenied:
                "SilentSnap no tiene permiso para añadir eventos. Actívalo en Ajustes › SilentSnap › Calendarios."
            case .accessRestricted:
                "El acceso al Calendario está restringido en este dispositivo."
            case .noWritableCalendar:
                "No hay ningún calendario disponible para guardar eventos."
            case .saveFailed(let reason):
                "No se pudo guardar el evento: \(reason)"
            }
        }
    }

    private(set) var authorizationStatus: EKAuthorizationStatus

    /// Alarma por defecto: 24 h antes del inicio.
    var defaultAlarmOffset: TimeInterval = -24 * 60 * 60
    /// Para eventos de todo el día (que empiezan a las 00:00): el día anterior a las 09:00.
    var allDayAlarmOffset: TimeInterval = -15 * 60 * 60

    @ObservationIgnored private let store = EKEventStore()

    init() {
        authorizationStatus = EKEventStore.authorizationStatus(for: .event)
    }

    var canWriteEvents: Bool {
        authorizationStatus == .writeOnly || authorizationStatus == .fullAccess
    }

    func refreshStatus() {
        authorizationStatus = EKEventStore.authorizationStatus(for: .event)
    }

    /// Solicita acceso de sólo escritura si aún no se ha decidido.
    func requestAccessIfNeeded() async throws {
        refreshStatus()
        switch authorizationStatus {
        case .fullAccess, .writeOnly:
            return
        case .notDetermined:
            let granted = try await requestWriteOnlyAccess()
            refreshStatus()
            guard granted else { throw CalendarError.accessDenied }
        case .restricted:
            throw CalendarError.accessRestricted
        default:
            throw CalendarError.accessDenied
        }
    }

    /// Crea el evento en el calendario por defecto del usuario con alarma.
    /// - Returns: El `eventIdentifier` del evento creado.
    @discardableResult
    func save(_ event: DetectedEvent) async throws -> String? {
        try await requestAccessIfNeeded()

        guard let calendar = store.defaultCalendarForNewEvents else {
            throw CalendarError.noWritableCalendar
        }

        let ekEvent = EKEvent(eventStore: store)
        ekEvent.calendar = calendar

        let title = event.title.trimmingCharacters(in: .whitespacesAndNewlines)
        ekEvent.title = title.isEmpty ? "Evento" : title

        if event.isAllDay {
            let day = Calendar.current.startOfDay(for: event.startDate)
            ekEvent.isAllDay = true
            ekEvent.startDate = day
            ekEvent.endDate = max(Calendar.current.startOfDay(for: event.endDate), day)
        } else {
            ekEvent.startDate = event.startDate
            ekEvent.endDate = max(event.endDate, event.startDate.addingTimeInterval(60))
        }

        let location = event.location.trimmingCharacters(in: .whitespacesAndNewlines)
        ekEvent.location = location.isEmpty ? nil : location
        ekEvent.notes = event.notes.isEmpty ? nil : event.notes
        ekEvent.url = event.url
        ekEvent.addAlarm(EKAlarm(relativeOffset: event.isAllDay ? allDayAlarmOffset : defaultAlarmOffset))

        do {
            try store.save(ekEvent, span: .thisEvent, commit: true)
        } catch {
            throw CalendarError.saveFailed(error.localizedDescription)
        }
        return ekEvent.eventIdentifier
    }

    // MARK: - Privado

    /// Se usa la variante con completion handler (en lugar de la `async`) porque
    /// `EKEventStore` no es `Sendable` y Swift 6 rechaza "enviarlo" fuera del MainActor.
    /// El closure es `@Sendable` para que no herede el aislamiento del MainActor:
    /// EventKit lo invoca en una cola arbitraria.
    private func requestWriteOnlyAccess() async throws -> Bool {
        try await withCheckedThrowingContinuation { continuation in
            store.requestWriteOnlyAccessToEvents { @Sendable granted, error in
                if let error {
                    continuation.resume(throwing: error)
                } else {
                    continuation.resume(returning: granted)
                }
            }
        }
    }
}
