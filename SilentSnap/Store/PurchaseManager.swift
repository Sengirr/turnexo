import Foundation
import Observation
import StoreKit

/// Compras integradas con StoreKit 2. Modelo: 10 escaneos gratis + compra única "Lifetime".
///
/// Vive durante toda la vida de la app (se crea en `SilentSnapApp`), por eso no
/// necesita cancelar la escucha de `Transaction.updates` en `deinit`.
@MainActor
@Observable
final class PurchaseManager {
    static let unlimitedProductID = ProStatus.unlimitedProductID

    enum PurchaseState: Equatable {
        case idle
        case purchasing
        case pending
        case failed(String)
    }

    private(set) var unlimitedProduct: Product?
    private(set) var isPro: Bool
    private(set) var isLoadingProducts = false
    private(set) var purchaseState: PurchaseState = .idle

    @ObservationIgnored private var updatesTask: Task<Void, Never>?

    init() {
        // Arranque optimista con la caché (funciona offline); se confirma con StoreKit enseguida.
        isPro = ScanQuota.isProCached
        updatesTask = observeTransactionUpdates()
        Task {
            await refreshEntitlements()
            await loadProducts()
        }
    }

    /// Precio localizado según el storefront del usuario (p. ej. "14,99 €").
    var displayPrice: String? { unlimitedProduct?.displayPrice }

    func loadProducts() async {
        guard !isLoadingProducts else { return }
        isLoadingProducts = true
        defer { isLoadingProducts = false }
        do {
            unlimitedProduct = try await Product.products(for: [Self.unlimitedProductID]).first
        } catch {
            purchaseState = .failed("No se pudo cargar la tienda. Comprueba tu conexión.")
        }
    }

    func purchase() async {
        if unlimitedProduct == nil { await loadProducts() }
        guard let product = unlimitedProduct else {
            purchaseState = .failed("El producto no está disponible ahora mismo.")
            return
        }

        purchaseState = .purchasing
        do {
            switch try await product.purchase() {
            case .success(let verification):
                let transaction = try checkVerified(verification)
                await transaction.finish()
                await refreshEntitlements()
                purchaseState = .idle
            case .pending:
                // Ask to Buy / SCA: se completará vía Transaction.updates.
                purchaseState = .pending
            case .userCancelled:
                purchaseState = .idle
            @unknown default:
                purchaseState = .idle
            }
        } catch {
            purchaseState = .failed(error.localizedDescription)
        }
    }

    /// "Restaurar compras": fuerza la sincronización con el App Store.
    func restore() async {
        purchaseState = .purchasing
        do {
            try await AppStore.sync()
            await refreshEntitlements()
            purchaseState = isPro ? .idle : .failed("No se encontraron compras previas con este Apple ID.")
        } catch {
            purchaseState = .failed(error.localizedDescription)
        }
    }

    /// Recalcula el estado Pro a partir de las transacciones verificadas actuales.
    func refreshEntitlements() async {
        var owned = false
        for await result in Transaction.currentEntitlements {
            guard case .verified(let transaction) = result else { continue }
            if transaction.productID == Self.unlimitedProductID, transaction.revocationDate == nil {
                owned = true
            }
        }
        isPro = owned
        ScanQuota.isProCached = owned   // Visible para la Share Extension vía App Group.
    }

    // MARK: - Privado

    private func observeTransactionUpdates() -> Task<Void, Never> {
        Task { [weak self] in
            for await result in Transaction.updates {
                guard case .verified(let transaction) = result else { continue }
                await transaction.finish()
                await self?.refreshEntitlements()
                if self?.purchaseState == .pending { self?.purchaseState = .idle }
            }
        }
    }

    private func checkVerified<T>(_ result: VerificationResult<T>) throws -> T {
        switch result {
        case .verified(let value): return value
        case .unverified(_, let error): throw error
        }
    }
}
