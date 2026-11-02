#if targetEnvironment(simulator)
import UIKit

/// Genera carteles y tickets sintéticos en memoria (con `UIGraphicsImageRenderer`)
/// para poder probar todo el flujo real de OCR (`Vision`) + `NSDataDetector` + `EventKit`
/// directamente en el Simulador de iOS (por ejemplo, en Appetize.io o Xcode Simulator)
/// sin necesitar cámara física ni subir fotos a la galería.
enum SamplePosters {
    struct Sample: Identifiable, Sendable {
        let id: String
        let label: String
        let icon: String
        let header: String
        let title: String
        let dateLine: String
        let timeLine: String
        let venueLine: String
        let addressLine: String
        let footerLine: String
        let accentRed: CGFloat
        let accentGreen: CGFloat
        let accentBlue: CGFloat
    }

    static let all: [Sample] = [
        Sample(
            id: "concert",
            label: "Cartel de Concierto",
            icon: "music.mic",
            header: "CICLO NOCHES DEL BOTÁNICO",
            title: "FESTIVAL DE JAZZ MADRID",
            dateLine: "Sábado 21 de noviembre de 2026",
            timeLine: "21:00 - 23:30",
            venueLine: "Lugar: Teatro Real",
            addressLine: "Plaza de Isabel II, s/n, 28013 Madrid",
            footerLine: "Entradas en https://teatroreal.es · Prohibida la entrada a menores",
            accentRed: 0.30, accentGreen: 0.22, accentBlue: 0.72
        ),
        Sample(
            id: "dentist",
            label: "Cita Médica / Ticket",
            icon: "cross.case.fill",
            header: "CLÍNICA DENTAL SONRISA SALUD",
            title: "Revisión y Limpieza Dental",
            dateLine: "15/12/2026",
            timeLine: "a las 17:30h",
            venueLine: "Dirección: Calle Serrano 45, Madrid",
            addressLine: "Gabinete 3 · Dr. Alejandro Martín",
            footerLine: "Por favor, acuda 10 minutos antes de su cita.",
            accentRed: 0.08, accentGreen: 0.52, accentBlue: 0.58
        ),
        Sample(
            id: "conference",
            label: "Entrada Conferencia",
            icon: "ticket.fill",
            header: "ENTRADA GENERAL · #SS-8842",
            title: "SWIFT DEVELOPERS SUMMIT",
            dateLine: "28 de enero de 2027",
            timeLine: "10:00 a 18:00",
            venueLine: "Auditorio Nacional de Música",
            addressLine: "Calle del Príncipe de Vergara 146, Madrid",
            footerLine: "Más info en https://swift.org",
            accentRed: 0.85, accentGreen: 0.32, accentBlue: 0.16
        ),
    ]

    @MainActor
    static func render(_ sample: Sample) -> UIImage {
        let size = CGSize(width: 900, height: 1200)
        let renderer = UIGraphicsImageRenderer(size: size)

        return renderer.image { ctx in
            let cg = ctx.cgContext
            let accent = UIColor(red: sample.accentRed, green: sample.accentGreen, blue: sample.accentBlue, alpha: 1)

            // Fondo estilo papel / póster
            UIColor(red: 0.98, green: 0.98, blue: 0.96, alpha: 1).setFill()
            cg.fill(CGRect(origin: .zero, size: size))

            // Franja superior de color
            accent.setFill()
            cg.fill(CGRect(x: 0, y: 0, width: size.width, height: 140))

            // Marco interior
            cg.setStrokeColor(accent.withAlphaComponent(0.35).cgColor)
            cg.setLineWidth(4)
            cg.stroke(CGRect(x: 44, y: 180, width: size.width - 88, height: size.height - 230))

            func drawCentered(_ text: String, y: CGFloat, font: UIFont, color: UIColor) {
                let paragraph = NSMutableParagraphStyle()
                paragraph.alignment = .center
                let attrs: [NSAttributedString.Key: Any] = [
                    .font: font,
                    .foregroundColor: color,
                    .paragraphStyle: paragraph,
                ]
                let rect = CGRect(x: 70, y: y, width: size.width - 140, height: 220)
                (text as NSString).draw(in: rect, withAttributes: attrs)
            }

            drawCentered(sample.header, y: 50,
                         font: .systemFont(ofSize: 28, weight: .semibold),
                         color: .white)

            drawCentered(sample.title, y: 260,
                         font: .systemFont(ofSize: 54, weight: .heavy),
                         color: UIColor(white: 0.10, alpha: 1))

            drawCentered(sample.dateLine, y: 500,
                         font: .systemFont(ofSize: 40, weight: .bold),
                         color: accent)

            drawCentered(sample.timeLine, y: 580,
                         font: .systemFont(ofSize: 38, weight: .semibold),
                         color: UIColor(white: 0.18, alpha: 1))

            drawCentered(sample.venueLine, y: 740,
                         font: .systemFont(ofSize: 34, weight: .medium),
                         color: UIColor(white: 0.15, alpha: 1))

            drawCentered(sample.addressLine, y: 810,
                         font: .systemFont(ofSize: 28, weight: .regular),
                         color: UIColor(white: 0.30, alpha: 1))

            drawCentered(sample.footerLine, y: 1020,
                         font: .systemFont(ofSize: 24, weight: .regular),
                         color: UIColor(white: 0.45, alpha: 1))
        }
    }
}
#endif
