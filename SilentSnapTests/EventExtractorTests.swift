import CoreGraphics
import Foundation
import Testing
@testable import SilentSnap

@Suite("EventExtractor — Extracción determinista de eventos")
struct EventExtractorTests {
    /// Fecha de referencia fija: 2 de noviembre de 2026 a las 18:00 UTC.
    private var referenceDate: Date {
        var comps = DateComponents()
        comps.year = 2026
        comps.month = 11
        comps.day = 2
        comps.hour = 18
        comps.minute = 0
        return Calendar.current.date(from: comps)!
    }

    @Test("Cartel de concierto con título en dos líneas, fecha en español y rango horario")
    func spanishConcertPoster() {
        let lines = [
            RecognizedLine(text: "FESTIVAL DE", boundingBox: CGRect(x: 0.1, y: 0.82, width: 0.8, height: 0.08), confidence: 0.98),
            RecognizedLine(text: "JAZZ EN VIVO", boundingBox: CGRect(x: 0.1, y: 0.72, width: 0.8, height: 0.08), confidence: 0.97),
            RecognizedLine(text: "15 de noviembre de 2026", boundingBox: CGRect(x: 0.1, y: 0.50, width: 0.6, height: 0.04), confidence: 0.95),
            RecognizedLine(text: "20:00 - 23:00", boundingBox: CGRect(x: 0.1, y: 0.44, width: 0.4, height: 0.04), confidence: 0.95),
            RecognizedLine(text: "Lugar: Teatro Real, Madrid", boundingBox: CGRect(x: 0.1, y: 0.30, width: 0.7, height: 0.035), confidence: 0.92),
            RecognizedLine(text: "https://festivaljazz.es", boundingBox: CGRect(x: 0.1, y: 0.15, width: 0.5, height: 0.03), confidence: 0.90),
        ]

        let extractor = EventExtractor(referenceDate: referenceDate)
        let event = extractor.extract(from: lines)

        #expect(event.title == "Festival De Jazz En Vivo")
        #expect(event.dateWasDetected)
        #expect(!event.isAllDay)
        #expect(event.location == "Teatro Real, Madrid")
        #expect(event.url?.absoluteString == "https://festivaljazz.es")

        let comps = Calendar.current.dateComponents([.year, .month, .day, .hour, .minute], from: event.startDate)
        #expect(comps.year == 2026)
        #expect(comps.month == 11)
        #expect(comps.day == 15)
        #expect(comps.hour == 20)
        #expect(comps.minute == 0)

        let endComps = Calendar.current.dateComponents([.hour, .minute], from: event.endDate)
        #expect(endComps.hour == 23)
        #expect(endComps.minute == 0)
    }

    @Test("Fecha sin año ya pasada salta automáticamente al año siguiente")
    func rollsForwardPastDateWithoutYear() {
        // 15 de marzo leído el 2 de noviembre de 2026 → 15 de marzo de 2027.
        let lines = [
            RecognizedLine(text: "Feria del Libro", boundingBox: CGRect(x: 0.1, y: 0.80, width: 0.8, height: 0.07), confidence: 0.96),
            RecognizedLine(text: "15 de marzo", boundingBox: CGRect(x: 0.1, y: 0.55, width: 0.5, height: 0.04), confidence: 0.94),
            RecognizedLine(text: "Parque del Retiro", boundingBox: CGRect(x: 0.1, y: 0.40, width: 0.6, height: 0.04), confidence: 0.91),
        ]

        let extractor = EventExtractor(referenceDate: referenceDate)
        let event = extractor.extract(from: lines)

        let comps = Calendar.current.dateComponents([.year, .month, .day], from: event.startDate)
        #expect(comps.year == 2027)
        #expect(comps.month == 3)
        #expect(comps.day == 15)
        #expect(event.isAllDay)
        #expect(event.location == "Parque del Retiro")
    }

    @Test("Cita con formato numérico europeo DD/MM/YYYY y hora estilo 21h30")
    func europeanNumericDateAndHourH() {
        let lines = [
            RecognizedLine(text: "Revisión Dental Clínica Sonrisa", boundingBox: CGRect(x: 0.1, y: 0.78, width: 0.8, height: 0.06), confidence: 0.95),
            RecognizedLine(text: "24/11/2026 a las 17h30", boundingBox: CGRect(x: 0.1, y: 0.52, width: 0.6, height: 0.04), confidence: 0.95),
            RecognizedLine(text: "Calle Mayor 12", boundingBox: CGRect(x: 0.1, y: 0.35, width: 0.5, height: 0.04), confidence: 0.90),
        ]

        let extractor = EventExtractor(referenceDate: referenceDate)
        let event = extractor.extract(from: lines)

        let comps = Calendar.current.dateComponents([.year, .month, .day, .hour, .minute], from: event.startDate)
        #expect(comps.year == 2026)
        #expect(comps.month == 11)
        #expect(comps.day == 24)
        #expect(comps.hour == 17)
        #expect(comps.minute == 30)
        #expect(!event.isAllDay)
    }

    @Test("Parser de horas reconoce formatos de 12h y 24h habituales")
    func timeParserVariants() {
        let tokens = TimeParser.tokens(in: "Puertas 20h · Concierto 21:30 · Cierre 1:15 am")
        #expect(tokens.count == 3)
        #expect(tokens[0].hour == 20 && tokens[0].minute == 0)
        #expect(tokens[1].hour == 21 && tokens[1].minute == 30)
        #expect(tokens[2].hour == 1 && tokens[2].minute == 15)
    }
}
