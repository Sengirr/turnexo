import ImageIO
import UIKit
import UniformTypeIdentifiers

enum ShareError: LocalizedError {
    case noImage
    case unreadableImage

    var errorDescription: String? {
        switch self {
        case .noImage: "No se ha recibido ninguna imagen."
        case .unreadableImage: "No se ha podido abrir la imagen compartida."
        }
    }
}

/// Carga la imagen compartida de forma eficiente en memoria.
///
/// Las Share Extensions tienen un límite de memoria bajo (~120 MB): en vez de
/// decodificar la foto completa (48 MP en iPhones recientes), se genera una miniatura
/// de hasta 3000 px con ImageIO, suficiente para un OCR preciso.
enum SharedImageLoader {
    static let maxPixelSize = 3000

    @MainActor
    static func load(from provider: NSItemProvider) async throws -> UIImage {
        do {
            return try await loadFile(from: provider)
        } catch {
            // Algunas apps comparten la imagen solo en memoria (sin archivo).
            return try await loadData(from: provider)
        }
    }

    @MainActor
    private static func loadFile(from provider: NSItemProvider) async throws -> UIImage {
        try await withCheckedThrowingContinuation { continuation in
            _ = provider.loadFileRepresentation(forTypeIdentifier: UTType.image.identifier) { @Sendable url, error in
                // La URL solo es válida dentro de este closure: se decodifica aquí mismo.
                if let url, let image = downsample(CGImageSourceCreateWithURL(url as CFURL, nil)) {
                    continuation.resume(returning: image)
                } else {
                    continuation.resume(throwing: error ?? ShareError.unreadableImage)
                }
            }
        }
    }

    @MainActor
    private static func loadData(from provider: NSItemProvider) async throws -> UIImage {
        try await withCheckedThrowingContinuation { continuation in
            _ = provider.loadDataRepresentation(forTypeIdentifier: UTType.image.identifier) { @Sendable data, error in
                if let data, let image = downsample(CGImageSourceCreateWithData(data as CFData, nil)) {
                    continuation.resume(returning: image)
                } else {
                    continuation.resume(throwing: error ?? ShareError.unreadableImage)
                }
            }
        }
    }

    private static func downsample(_ source: CGImageSource?) -> UIImage? {
        guard let source else { return nil }
        let options: [CFString: Any] = [
            kCGImageSourceCreateThumbnailFromImageAlways: true,
            kCGImageSourceCreateThumbnailWithTransform: true,   // Aplica la orientación EXIF.
            kCGImageSourceShouldCacheImmediately: true,
            kCGImageSourceThumbnailMaxPixelSize: maxPixelSize,
        ]
        guard let cgImage = CGImageSourceCreateThumbnailAtIndex(source, 0, options as CFDictionary) else { return nil }
        return UIImage(cgImage: cgImage)
    }
}
