import SwiftUI
import UIKit
import UniformTypeIdentifiers

/// Punto de entrada de la Share Extension (NSExtensionPrincipalClass).
/// Aloja la interfaz SwiftUI y traduce sus acciones al `NSExtensionContext`.
@objc(ShareViewController)
final class ShareViewController: UIViewController {
    override func viewDidLoad() {
        super.viewDidLoad()

        let model = ShareViewModel(
            imageLoader: { [weak self] in
                guard let self else { throw ShareError.noImage }
                return try await self.loadSharedImage()
            },
            onComplete: { [weak self] in
                self?.extensionContext?.completeRequest(returningItems: [], completionHandler: nil)
            },
            onCancel: { [weak self] in
                self?.extensionContext?.cancelRequest(
                    withError: NSError(domain: NSCocoaErrorDomain, code: NSUserCancelledError)
                )
            }
        )

        let host = UIHostingController(rootView: ShareRootView(model: model))
        addChild(host)
        host.view.frame = view.bounds
        host.view.autoresizingMask = [.flexibleWidth, .flexibleHeight]
        view.addSubview(host.view)
        host.didMove(toParent: self)
    }

    private func loadSharedImage() async throws -> UIImage {
        let items = extensionContext?.inputItems.compactMap { $0 as? NSExtensionItem } ?? []
        let providers = items.flatMap { $0.attachments ?? [] }
        guard let provider = providers.first(where: {
            $0.hasItemConformingToTypeIdentifier(UTType.image.identifier)
        }) else {
            throw ShareError.noImage
        }
        return try await SharedImageLoader.load(from: provider)
    }
}
