import Foundation
import StoreKit

/// Estado Pro consultable desde cualquier target (app o Share Extension).
enum ProStatus {
    static let unlimitedProductID = "com.silentsnap.unlimited"

    /// Comprueba las transacciones verificadas de StoreKit 2 (funciona offline).
    /// Si StoreKit no confirma, recurre a la caché escrita por `PurchaseManager`.
    static func current() async -> Bool {
        for await result in Transaction.currentEntitlements {
            if case .verified(let transaction) = result,
               transaction.productID == unlimitedProductID,
               transaction.revocationDate == nil {
                ScanQuota.isProCached = true
                return true
            }
        }
        return ScanQuota.isProCached
    }
}
