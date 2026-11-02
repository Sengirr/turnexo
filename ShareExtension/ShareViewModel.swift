import Observation
import UIKit

/// Lógica de la Share Extension: comprobar cuota → cargar imagen → OCR → editar → guardar.
@MainActor
@Observable
final class ShareViewModel {
    enum Phase: Equatable {
        case loading
        case processing
        case editing
        case saved
        case outOfScans
        case failed(String)
    }

    private(set) var phase: Phase = .loading
    private(set) var image: UIImage?
    private(set) var isSaving = false
    private(set) var isPro = false
    /// Escaneos restantes tras este análisis (`nil` si es Pro o aún no se sabe).
    private(set) var remainingScans: Int?
    private(set) var saveError: String?
    var draft = DetectedEvent.empty

    @ObservationIgnored private let parser = VisionParserService()
    @ObservationIgnored private let calendarManager = CalendarManager()
    @ObservationIgnored private let imageLoader: @MainActor () async throws -> UIImage
    @ObservationIgnored private let onComplete: @MainActor () -> Void
    @ObservationIgnored private let onCancel: @MainActor () -> Void
    @ObservationIgnored private var hasStarted = false

    init(
        imageLoader: @escaping @MainActor () async throws -> UIImage,
        onComplete: @escaping @MainActor () -> Void,
        onCancel: @escaping @MainActor () -> Void
    ) {
        self.imageLoader = imageLoader
        self.onComplete = onComplete
        self.onCancel = onCancel
    }

    func start() async {
        guard !hasStarted else { return }
        hasStarted = true

        isPro = await ProStatus.current()
        if !isPro {
            guard let remaining = ScanQuota.loadRemaining() else {
                phase = .failed("Desbloquea el iPhone e inténtalo de nuevo.")
                return
            }
            guard remaining > 0 else {
                phase = .outOfScans
                return
            }
        }

        do {
            let image = try await imageLoader()
            self.image = image
            phase = .processing

            let event = try await parser.analyze(image)
            // Mismo criterio que la app: se descuenta al terminar el escaneo con éxito.
            if !isPro { remainingScans = ScanQuota.consume() }
            draft = event
            phase = .editing
        } catch {
            phase = .failed(error.localizedDescription)
        }
    }

    func save() async {
        isSaving = true
        saveError = nil
        defer { isSaving = false }
        do {
            try await calendarManager.save(draft)
            phase = .saved
            try? await Task.sleep(for: .seconds(1.2))
            onComplete()
        } catch {
            saveError = error.localizedDescription
        }
    }

    func cancel() {
        onCancel()
    }

    func close() {
        onComplete()
    }
}
