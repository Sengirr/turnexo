import Foundation
import Security

/// Envoltorio mínimo sobre Keychain Services para guardar enteros.
///
/// Los elementos del Keychain **sobreviven a la desinstalación de la app**, a diferencia
/// de `UserDefaults`. Se guardan en el App Group como *access group* para que la app y
/// la Share Extension lean y escriban el mismo valor.
enum KeychainStore {
    enum KeychainError: Error {
        case unexpectedStatus(OSStatus)
        case corruptedData
    }

    private static let service = "com.silentsnap.quota"

    private static func baseQuery(account: String) -> [String: Any] {
        [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: service,
            kSecAttrAccount as String: account,
            kSecAttrAccessGroup as String: AppGroup.identifier,
        ]
    }

    /// - Returns: el valor guardado, o `nil` si el elemento no existe.
    static func readInt(account: String) throws -> Int? {
        var query = baseQuery(account: account)
        query[kSecReturnData as String] = true
        query[kSecMatchLimit as String] = kSecMatchLimitOne

        var result: CFTypeRef?
        let status = SecItemCopyMatching(query as CFDictionary, &result)
        switch status {
        case errSecSuccess:
            guard let data = result as? Data,
                  let string = String(data: data, encoding: .utf8),
                  let value = Int(string) else { throw KeychainError.corruptedData }
            return value
        case errSecItemNotFound:
            return nil
        default:
            throw KeychainError.unexpectedStatus(status)
        }
    }

    static func writeInt(_ value: Int, account: String) throws {
        let data = Data(String(value).utf8)
        let query = baseQuery(account: account)

        let updateStatus = SecItemUpdate(query as CFDictionary, [kSecValueData as String: data] as CFDictionary)
        switch updateStatus {
        case errSecSuccess:
            return
        case errSecItemNotFound:
            var attributes = query
            attributes[kSecValueData as String] = data
            // Accesible en segundo plano tras el primer desbloqueo. No es "ThisDeviceOnly",
            // así que también se conserva al restaurar una copia cifrada en un iPhone nuevo.
            attributes[kSecAttrAccessible as String] = kSecAttrAccessibleAfterFirstUnlock
            let addStatus = SecItemAdd(attributes as CFDictionary, nil)
            guard addStatus == errSecSuccess else { throw KeychainError.unexpectedStatus(addStatus) }
        default:
            throw KeychainError.unexpectedStatus(updateStatus)
        }
    }

    static func delete(account: String) {
        SecItemDelete(baseQuery(account: account) as CFDictionary)
    }
}
