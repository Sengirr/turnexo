import SwiftUI

@main
struct SilentSnapApp: App {
    @State private var purchases = PurchaseManager()
    @State private var calendarManager = CalendarManager()
    @State private var quota = ScanQuotaStore()
    @Environment(\.scenePhase) private var scenePhase

    var body: some Scene {
        WindowGroup {
            ContentView()
                .environment(purchases)
                .environment(calendarManager)
                .environment(quota)
        }
        .onChange(of: scenePhase) { _, phase in
            // La Share Extension puede haber descontado escaneos mientras la app estaba en segundo plano.
            if phase == .active { quota.refresh() }
        }
    }
}
