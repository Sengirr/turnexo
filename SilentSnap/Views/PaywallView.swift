import StoreKit
import SwiftUI

struct PaywallView: View {
    @Environment(PurchaseManager.self) private var purchases
    @Environment(\.dismiss) private var dismiss
    @Environment(ScanQuotaStore.self) private var quota

    private var scansRemaining: Int { quota.remaining }

    private var isBusy: Bool { purchases.purchaseState == .purchasing }

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 28) {
                    Image(systemName: "infinity.circle.fill")
                        .font(.system(size: 76))
                        .symbolRenderingMode(.hierarchical)
                        .foregroundStyle(.tint)
                        .padding(.top, 12)

                    VStack(spacing: 8) {
                        Text("Escaneos ilimitados")
                            .font(.largeTitle.bold())
                        Text(scansRemaining == 0
                             ? "Has usado tus \(ScanQuota.freeScans) escaneos gratuitos."
                             : "Te quedan \(scansRemaining) escaneos gratuitos.")
                            .foregroundStyle(.secondary)
                    }
                    .multilineTextAlignment(.center)

                    VStack(alignment: .leading, spacing: 16) {
                        feature("infinity", "Escanea sin límite, para siempre")
                        feature("creditcard", "Pago único. Sin suscripciones")
                        feature("lock.shield", "Todo sigue en tu dispositivo")
                        feature("square.and.arrow.up", "Desde la app Fotos con Compartir")
                    }
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .padding(20)
                    .background(RoundedRectangle(cornerRadius: 20, style: .continuous)
                        .fill(Color(.secondarySystemGroupedBackground)))

                    VStack(spacing: 12) {
                        Button {
                            Task { await purchases.purchase() }
                        } label: {
                            Group {
                                if isBusy {
                                    ProgressView().tint(.white)
                                } else if let price = purchases.displayPrice {
                                    Text("Desbloquear por \(price)").bold()
                                } else {
                                    Text("Cargando precio…")
                                }
                            }
                            .frame(maxWidth: .infinity)
                        }
                        .buttonStyle(.borderedProminent)
                        .controlSize(.large)
                        .disabled(isBusy || purchases.unlimitedProduct == nil)

                        Button("Restaurar compras") {
                            Task { await purchases.restore() }
                        }
                        .disabled(isBusy)

                        statusMessage
                    }

                    Text("Compra única vinculada a tu Apple ID. Se puede compartir en familia.")
                        .font(.footnote)
                        .foregroundStyle(.secondary)
                        .multilineTextAlignment(.center)
                }
                .padding(24)
            }
            .background(Color(.systemGroupedBackground).ignoresSafeArea())
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cerrar") { dismiss() }
                }
            }
        }
        .interactiveDismissDisabled(isBusy)
        .task {
            if purchases.unlimitedProduct == nil { await purchases.loadProducts() }
        }
        .onChange(of: purchases.isPro) { _, isPro in
            if isPro { dismiss() }
        }
    }

    @ViewBuilder
    private var statusMessage: some View {
        switch purchases.purchaseState {
        case .pending:
            Label("Compra pendiente de aprobación.", systemImage: "hourglass")
                .font(.footnote)
                .foregroundStyle(.secondary)
        case .failed(let message):
            Text(message)
                .font(.footnote)
                .foregroundStyle(.red)
                .multilineTextAlignment(.center)
        case .idle, .purchasing:
            EmptyView()
        }
    }

    private func feature(_ icon: String, _ text: String) -> some View {
        Label {
            Text(text)
        } icon: {
            Image(systemName: icon)
                .foregroundStyle(.tint)
                .frame(width: 26)
        }
    }
}

#Preview {
    PaywallView()
        .environment(PurchaseManager())
        .environment(ScanQuotaStore())
}
