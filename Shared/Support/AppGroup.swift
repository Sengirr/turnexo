import Foundation
import Observation

/// Identificador del App Group compartido entre la app y la Share Extension.
/// Debe coincidir con el configurado en Signing & Capabilities de ambos targets.
/// También se usa como *access group* del Keychain.
enum AppGroup {
    static let identifier = "group.com.silentsnap.shared"
}

extension UserDefaults {
    /// Defaults compartidos (App Group). Solo para datos no sensibles (caché del estado Pro).
    /// `UserDefaults` es thread-safe según la documentación de Apple.
    nonisolated(unsafe) static let shared: UserDefaults = UserDefaults(suiteName: AppGroup.identifier) ?? .standard
}

/// Cuota de escaneos del plan gratuito, persistida en el **Keychain** para que
/// desinstalar y reinstalar la app no devuelva los 10 escaneos gratis.
///
/// Se descuenta un escaneo cada vez que un análisis termina con éxito.
enum ScanQuota {
    static let freeScans = 10
    static let proCacheKey = "isProUnlocked"
    private static let account = "scansRemaining"

    /// Escaneos restantes. Crea el registro con `freeScans` solo si no ha existido nunca
    /// en este dispositivo. Devuelve `nil` si el Keychain no está disponible
    /// (p. ej. antes del primer desbloqueo tras reiniciar); en ese caso no se escribe nada.
    static func loadRemaining() -> Int? {
        do {
            if let stored = try KeychainStore.readInt(account: account) { return stored }
            try KeychainStore.writeInt(freeScans, account: account)
            return freeScans
        } catch {
            return nil
        }
    }

    /// Descuenta un escaneo y devuelve el nuevo valor (`nil` si el Keychain falla).
    @discardableResult
    static func consume() -> Int? {
        guard let current = loadRemaining() else { return nil }
        let updated = max(0, current - 1)
        do {
            try KeychainStore.writeInt(updated, account: account)
            return updated
        } catch {
            return nil
        }
    }

    /// Copia en caché del estado Pro, escrita por `PurchaseManager` tras verificar
    /// las transacciones de StoreKit 2 (la fuente de verdad sigue siendo StoreKit).
    static var isProCached: Bool {
        get { UserDefaults.shared.bool(forKey: proCacheKey) }
        set { UserDefaults.shared.set(newValue, forKey: proCacheKey) }
    }

    #if DEBUG
    /// Solo para desarrollo: el Keychain también persiste entre instalaciones en el simulador.
    static func resetForTesting() {
        KeychainStore.delete(account: account)
    }
    #endif
}

/// Envoltorio observable de `ScanQuota` para SwiftUI.
@MainActor
@Observable
final class ScanQuotaStore {
    private(set) var remaining: Int

    init() {
        // Si el Keychain no responde, se arranca en 0 (conservador) y `refresh()` lo corrige.
        remaining = ScanQuota.loadRemaining() ?? 0
    }

    /// Relee el Keychain (p. ej. al volver a primer plano, por si la Share Extension descontó).
    func refresh() {
        if let value = ScanQuota.loadRemaining() { remaining = value }
    }

    func consume() {
        if let value = ScanQuota.consume() { remaining = value }
    }

    #if DEBUG
    func resetForTesting() {
        ScanQuota.resetForTesting()
        refresh()
    }
    #endif
}
