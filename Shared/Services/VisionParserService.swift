import Foundation
import ImageIO
import UIKit
import Vision

// MARK: - Modelos OCR

/// Una línea de texto reconocida por Vision.
struct RecognizedLine: Sendable {
    let text: String
    /// Caja normalizada (0...1) en coordenadas Vision (origen abajo-izquierda).
    let boundingBox: CGRect
    let confidence: Float
}

enum VisionParserError: LocalizedError {
    case invalidImage
    case noTextFound
    case recognitionFailed(String)

    var errorDescription: String? {
        switch self {
        case .invalidImage:
            "No se ha podido leer la imagen."
        case .noTextFound:
            "No hemos encontrado texto. Prueba con una foto más nítida y bien iluminada."
        case .recognitionFailed(let reason):
            "Error al analizar la imagen: \(reason)"
        }
    }
}

// MARK: - Servicio público

/// OCR (Vision) + extracción determinista de fecha, hora, título y lugar.
/// 100 % on-device: no hay red, ni modelos remotos, ni APIs de pago.
struct VisionParserService: Sendable {
    var recognitionLanguages: [String] = ["es-ES", "en-US", "fr-FR", "it-IT", "de-DE", "pt-BR"]
    var minimumConfidence: Float = 0.3

    init() {}

    /// Analiza la imagen y devuelve un evento sugerido listo para editar.
    func analyze(_ image: UIImage, referenceDate: Date = .now) async throws -> DetectedEvent {
        let lines = try await recognizeText(in: image)
        guard !lines.isEmpty else { throw VisionParserError.noTextFound }
        return EventExtractor(referenceDate: referenceDate).extract(from: lines)
    }

    /// Ejecuta `VNRecognizeTextRequest` fuera del hilo principal.
    func recognizeText(in image: UIImage) async throws -> [RecognizedLine] {
        let languages = recognitionLanguages
        let minConfidence = minimumConfidence
        return try await withCheckedThrowingContinuation { continuation in
            DispatchQueue.global(qos: .userInitiated).async {
                do {
                    let lines = try Self.performRecognition(
                        on: image,
                        languages: languages,
                        minimumConfidence: minConfidence
                    )
                    continuation.resume(returning: lines)
                } catch {
                    continuation.resume(throwing: error)
                }
            }
        }
    }

    private static func performRecognition(
        on image: UIImage,
        languages: [String],
        minimumConfidence: Float
    ) throws -> [RecognizedLine] {
        let cgImage: CGImage
        let orientation: CGImagePropertyOrientation
        if let backing = image.cgImage {
            cgImage = backing
            orientation = CGImagePropertyOrientation(image.imageOrientation)
        } else if let rendered = image.renderedCGImage() {
            cgImage = rendered          // El render ya aplica la orientación.
            orientation = .up
        } else {
            throw VisionParserError.invalidImage
        }

        let request = VNRecognizeTextRequest()
        request.recognitionLevel = .accurate
        request.usesLanguageCorrection = true
        request.automaticallyDetectsLanguage = true
        if let supported = try? request.supportedRecognitionLanguages() {
            let filtered = languages.filter { supported.contains($0) }
            if !filtered.isEmpty { request.recognitionLanguages = filtered }
        }

        let handler = VNImageRequestHandler(cgImage: cgImage, orientation: orientation, options: [:])
        do {
            try handler.perform([request])
        } catch {
            throw VisionParserError.recognitionFailed(error.localizedDescription)
        }

        let lines: [RecognizedLine] = (request.results ?? []).compactMap { observation in
            guard let candidate = observation.topCandidates(1).first,
                  candidate.confidence >= minimumConfidence else { return nil }
            let text = candidate.string.trimmingCharacters(in: .whitespacesAndNewlines)
            guard !text.isEmpty else { return nil }
            return RecognizedLine(text: text, boundingBox: observation.boundingBox, confidence: candidate.confidence)
        }

        // Orden de lectura: de arriba abajo (Vision tiene el origen abajo) y de izquierda a derecha.
        return lines.sorted {
            if $0.boundingBox.midY != $1.boundingBox.midY { return $0.boundingBox.midY > $1.boundingBox.midY }
            return $0.boundingBox.minX < $1.boundingBox.minX
        }
    }
}

// MARK: - Extracción de evento (pura y testeable)

/// Convierte líneas OCR en un `DetectedEvent` usando `NSDataDetector`
/// más reglas deterministas para formatos europeos/españoles.
struct EventExtractor {
    let referenceDate: Date
    var calendar: Calendar = .autoupdatingCurrent
    var defaultDuration: TimeInterval = 60 * 60

    func extract(from lines: [RecognizedLine]) -> DetectedEvent {
        let fullText = lines.map(\.text).joined(separator: "\n")
        let nsText = fullText as NSString
        let lineRanges = Self.lineRanges(for: lines)

        let detection = DataDetection(text: fullText)
        let times = TimeParser.tokens(in: fullText)

        var dates = detection.dates.map { classify($0, in: nsText) }
        if !dates.contains(where: \.hasDay) {
            // NSDataDetector no siempre entiende "15 de marzo" o "15/03/2026".
            dates += FallbackDateParser.candidates(in: fullText, calendar: calendar, referenceDate: referenceDate)
        }
        dates = dates.map(rollForwardIfNeeded)

        let schedule = resolveSchedule(dates: dates, times: times, text: nsText)

        let excluded = dates.map(\.range) + times.map(\.range) + detection.addresses
            + detection.links.map { $0.range } + detection.phones
        let title = suggestTitle(lines: lines, lineRanges: lineRanges, excluded: excluded)
        let location = suggestLocation(addresses: detection.addresses, lines: lines, text: nsText, title: title)
        let url = detection.links.first?.url

        return DetectedEvent(
            title: title,
            startDate: schedule.start,
            endDate: schedule.end,
            isAllDay: schedule.isAllDay,
            location: location,
            notes: buildNotes(fullText: fullText, url: url),
            url: url,
            rawText: fullText,
            dateWasDetected: schedule.detected
        )
    }

    // MARK: Fechas

    private struct Schedule {
        let start: Date
        let end: Date
        let isAllDay: Bool
        let detected: Bool
    }

    private func classify(_ raw: DataDetection.RawDate, in text: NSString) -> DateCandidate {
        let substring = text.substring(with: raw.range)
        let innerTimes = TimeParser.tokens(in: substring)
        let comps = calendar.dateComponents([.hour, .minute], from: raw.date)

        // NSDataDetector fija las 12:00 cuando sólo hay día.
        let hasTime = !innerTimes.isEmpty || !(comps.hour == 12 && comps.minute == 0)

        var remainder = substring
        for token in innerTimes.reversed() {
            if let r = Range(token.range, in: remainder) { remainder.removeSubrange(r) }
        }
        let hasDay = remainder.rangeOfCharacter(from: .decimalDigits) != nil
            || DateVocabulary.containsDayWord(remainder)
        let hasYear = substring.range(of: #"\b(19|20)\d{2}\b"#, options: .regularExpression) != nil

        return DateCandidate(
            date: raw.date,
            duration: raw.duration,
            range: raw.range,
            hasDay: hasDay,
            hasTime: hasTime,
            hasExplicitYear: hasYear
        )
    }

    /// "15 de marzo" leído en noviembre → marzo del año siguiente.
    private func rollForwardIfNeeded(_ candidate: DateCandidate) -> DateCandidate {
        guard candidate.hasDay, !candidate.hasExplicitYear,
              candidate.date < calendar.startOfDay(for: referenceDate),
              let next = calendar.date(byAdding: .year, value: 1, to: candidate.date) else { return candidate }
        var copy = candidate
        copy.date = next
        return copy
    }

    private func score(_ c: DateCandidate, textLength: Int) -> Double {
        var s = 0.0
        if c.hasDay { s += 4 }
        if c.hasTime { s += 2 }
        if c.date >= calendar.startOfDay(for: referenceDate) { s += 3 }
        s -= Double(c.range.location) / Double(max(textLength, 1))   // Desempate: lo que aparece antes.
        return s
    }

    private func resolveSchedule(dates: [DateCandidate], times: [TimeParser.Token], text: NSString) -> Schedule {
        let best = dates.max { score($0, textLength: text.length) < score($1, textLength: text.length) }

        if let best, best.hasDay {
            if best.hasTime {
                let start = best.date
                if best.duration > 0 {
                    return Schedule(start: start, end: start.addingTimeInterval(best.duration), isAllDay: false, detected: true)
                }
                let startToken = times.first { NSIntersectionRange($0.range, best.range).length > 0 }
                let end = startToken.flatMap { endDate(after: $0, start: start, times: times, text: text) }
                return Schedule(start: start, end: end ?? start.addingTimeInterval(defaultDuration), isAllDay: false, detected: true)
            }

            // Día sin hora: buscar la hora suelta más cercana en el texto ("Sábado 15" … "21:00h").
            if let token = nearest(to: best.range, in: times) {
                let start = combine(best.date, hour: token.hour, minute: token.minute)
                let end = endDate(after: token, start: start, times: times, text: text)
                return Schedule(start: start, end: end ?? start.addingTimeInterval(defaultDuration), isAllDay: false, detected: true)
            }

            let day = calendar.startOfDay(for: best.date)
            return Schedule(start: day, end: day, isAllDay: true, detected: true)
        }

        // Sólo hora: hoy (o mañana si ya pasó).
        let hourMinute: (Int, Int)? = {
            if let best, best.hasTime {
                let c = calendar.dateComponents([.hour, .minute], from: best.date)
                return (c.hour ?? 0, c.minute ?? 0)
            }
            return times.first.map { ($0.hour, $0.minute) }
        }()
        if let hourMinute {
            var start = combine(referenceDate, hour: hourMinute.0, minute: hourMinute.1)
            if start < referenceDate, let tomorrow = calendar.date(byAdding: .day, value: 1, to: start) { start = tomorrow }
            return Schedule(start: start, end: start.addingTimeInterval(defaultDuration), isAllDay: false, detected: true)
        }

        // Nada detectado: próxima hora en punto, marcado para revisión.
        let comps = calendar.dateComponents([.year, .month, .day, .hour], from: referenceDate.addingTimeInterval(3600))
        let start = calendar.date(from: comps) ?? referenceDate
        return Schedule(start: start, end: start.addingTimeInterval(defaultDuration), isAllDay: false, detected: false)
    }

    private func combine(_ day: Date, hour: Int, minute: Int) -> Date {
        calendar.date(bySettingHour: hour, minute: minute, second: 0, of: day) ?? day
    }

    private func nearest(to range: NSRange, in times: [TimeParser.Token]) -> TimeParser.Token? {
        times.min { abs($0.range.location - range.location) < abs($1.range.location - range.location) }
    }

    /// Detecta rangos tipo "20:00 - 23:30", "20h a 22h", "8pm to 11pm".
    private func endDate(after token: TimeParser.Token, start: Date, times: [TimeParser.Token], text: NSString) -> Date? {
        let tokenEnd = NSMaxRange(token.range)
        guard let next = times.first(where: { $0.range.location >= tokenEnd && $0.range.location - tokenEnd <= 8 }) else {
            return nil
        }
        let gap = text.substring(with: NSRange(location: tokenEnd, length: next.range.location - tokenEnd))
            .trimmingCharacters(in: .whitespaces)
            .lowercased()
        let connectors: Set<String> = ["-", "–", "—", "~", "a", "to", "hasta", "till", "until"]
        guard connectors.contains(gap) else { return nil }

        var end = combine(start, hour: next.hour, minute: next.minute)
        if end <= start, let nextDay = calendar.date(byAdding: .day, value: 1, to: end) { end = nextDay }
        return end
    }

    // MARK: Título

    private func suggestTitle(lines: [RecognizedLine], lineRanges: [NSRange], excluded: [NSRange]) -> String {
        let noisePrefixes = ["www", "http", "@", "#", "lugar", "venue", "precio", "price", "entradas", "tickets",
                             "info", "tel", "dirección", "direccion", "organiza", "patrocina", "más info"]

        func isCandidate(_ i: Int) -> Bool {
            let text = lines[i].text
            let letters = text.unicodeScalars.filter { CharacterSet.letters.contains($0) }.count
            guard text.count >= 3, letters >= 3, Double(letters) / Double(text.count) >= 0.45 else { return false }
            let lower = text.lowercased()
            guard !noisePrefixes.contains(where: { lower.hasPrefix($0) }) else { return false }
            let range = lineRanges[i]
            let covered = excluded.reduce(0) { $0 + NSIntersectionRange($1, range).length }
            return Double(covered) / Double(max(range.length, 1)) < 0.5
        }

        func score(_ i: Int) -> Double {
            let line = lines[i]
            let sizeScore = Double(line.boundingBox.height) * 1000 * Double(line.confidence)  // Texto grande = titular.
            let topScore = Double(line.boundingBox.maxY) * 40                                 // Cerca de la parte superior.
            let lengthScore = (4...45).contains(line.text.count) ? 15.0 : 0
            return sizeScore + topScore + lengthScore
        }

        let candidates = lines.indices.filter(isCandidate)
        guard let best = candidates.max(by: { score($0) < score($1) }) else {
            return lines.first.map { Self.prettify($0.text) } ?? "Nuevo evento"
        }

        // Une titulares partidos en dos líneas con tamaño similar ("FESTIVAL DE" / "JAZZ 2026").
        var title = lines[best].text
        let next = best + 1
        if next < lines.count, isCandidate(next) {
            let a = lines[best].boundingBox
            let b = lines[next].boundingBox
            let similarHeight = abs(a.height - b.height) <= a.height * 0.25
            let gap = a.minY - b.maxY
            if similarHeight, gap < a.height * 0.8, gap > -a.height * 0.5 {
                title += " " + lines[next].text
            }
        }
        return Self.prettify(title)
    }

    private static func prettify(_ text: String) -> String {
        var result = text.trimmingCharacters(in: .whitespacesAndNewlines.union(CharacterSet(charactersIn: ":-–—•|·")))
        let isAllCaps = result == result.uppercased() && result != result.lowercased()
        if isAllCaps { result = result.localizedCapitalized }
        return String(result.prefix(100))
    }

    // MARK: Ubicación y notas

    private func suggestLocation(addresses: [NSRange], lines: [RecognizedLine], text: NSString, title: String) -> String {
        if let range = addresses.first {
            return text.substring(with: range)
                .components(separatedBy: .newlines)
                .map { $0.trimmingCharacters(in: .whitespaces) }
                .filter { !$0.isEmpty }
                .joined(separator: ", ")
        }

        let prefix = /(?i)^(?:lugar|ubicaci[oó]n|direcci[oó]n|sitio|d[oó]nde|venue|location|where|place)\s*[:\-–]\s*(.+)$/
        for line in lines {
            if let match = line.text.firstMatch(of: prefix) {
                return String(match.output.1).trimmingCharacters(in: .whitespaces)
            }
        }

        let venueWords = ["teatro", "sala ", "auditorio", "estadio", "palacio", "pabellón", "pabellon", "museo",
                          "centro cultural", "plaza ", "calle ", "c/", "avda", "avenida", "paseo ", "parque ",
                          "theatre", "theater", "hall", "arena", "stadium", "club "]
        for line in lines where !title.localizedCaseInsensitiveContains(line.text) {
            let lower = line.text.lowercased() + " "
            if venueWords.contains(where: { lower.contains($0) }) { return line.text }
        }
        return ""
    }

    private func buildNotes(fullText: String, url: URL?) -> String {
        var parts: [String] = []
        if let url { parts.append(url.absoluteString) }
        parts.append("Texto detectado por SilentSnap:\n\(fullText)")
        return String(parts.joined(separator: "\n\n").prefix(2000))
    }

    private static func lineRanges(for lines: [RecognizedLine]) -> [NSRange] {
        var location = 0
        return lines.map { line in
            let length = (line.text as NSString).length
            defer { location += length + 1 }   // +1 por el "\n" del join.
            return NSRange(location: location, length: length)
        }
    }
}

// MARK: - Tipos auxiliares

struct DateCandidate {
    var date: Date
    var duration: TimeInterval
    var range: NSRange
    var hasDay: Bool
    var hasTime: Bool
    var hasExplicitYear: Bool
}

/// Envoltorio sobre `NSDataDetector` (fechas, direcciones, enlaces y teléfonos).
private struct DataDetection {
    struct RawDate {
        let date: Date
        let duration: TimeInterval
        let range: NSRange
    }

    private(set) var dates: [RawDate] = []
    private(set) var addresses: [NSRange] = []
    private(set) var links: [(url: URL, range: NSRange)] = []
    private(set) var phones: [NSRange] = []

    init(text: String) {
        let types: NSTextCheckingResult.CheckingType = [.date, .address, .link, .phoneNumber]
        guard let detector = try? NSDataDetector(types: types.rawValue) else { return }
        let range = NSRange(location: 0, length: (text as NSString).length)

        for match in detector.matches(in: text, options: [], range: range) {
            switch match.resultType {
            case .date:
                if let date = match.date {
                    dates.append(RawDate(date: date, duration: match.duration, range: match.range))
                }
            case .address:
                addresses.append(match.range)
            case .link:
                if let url = match.url { links.append((url, match.range)) }
            case .phoneNumber:
                phones.append(match.range)
            default:
                break
            }
        }
    }
}

/// Vocabulario de días/meses (es + en) para clasificar coincidencias.
private enum DateVocabulary {
    static let monthNames = [
        "enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto",
        "septiembre", "setiembre", "octubre", "noviembre", "diciembre",
        "january", "february", "march", "april", "june", "july", "august",
        "september", "october", "november", "december",
    ]
    static let dayWords = [
        "lunes", "martes", "miércoles", "miercoles", "jueves", "viernes", "sábado", "sabado", "domingo",
        "monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday",
        "hoy", "mañana", "manana", "today", "tomorrow", "tonight", "esta noche",
    ] + monthNames

    static func containsDayWord(_ text: String) -> Bool {
        let lower = text.lowercased()
        return dayWords.contains { lower.contains($0) }
    }

    static func month(from token: String) -> Int? {
        switch token.lowercased().prefix(3) {
        case "ene", "jan": 1
        case "feb": 2
        case "mar": 3
        case "abr", "apr": 4
        case "may": 5
        case "jun": 6
        case "jul": 7
        case "ago", "aug": 8
        case "sep", "set": 9
        case "oct": 10
        case "nov": 11
        case "dic", "dec": 12
        default: nil
        }
    }
}

/// Fechas en formato europeo / español que `NSDataDetector` puede no reconocer.
private enum FallbackDateParser {
    private static let numeric = try! NSRegularExpression(
        pattern: #"(?<![\d:.])(0?[1-9]|[12]\d|3[01])([/.\-])(0?[1-9]|1[0-2])(?:\2((?:19|20)?\d{2}))?(?![\d:])"#
    )
    private static let textual = try! NSRegularExpression(
        pattern: #"(?<!\d)(0?[1-9]|[12]\d|3[01])\s*(?:de\s+)?(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|setiembre|octubre|noviembre|diciembre|january|february|march|april|may|june|july|august|september|october|november|december|ene|feb|mar|abr|apr|jun|jul|ago|aug|sept|sep|set|oct|nov|dic|dec|jan)\.?(?:\s*(?:del|de|,)?\s*((?:19|20)\d{2}))?(?![a-záéíóúñ])"#,
        options: [.caseInsensitive]
    )

    static func candidates(in text: String, calendar: Calendar, referenceDate: Date) -> [DateCandidate] {
        let ns = text as NSString
        let full = NSRange(location: 0, length: ns.length)
        let currentYear = calendar.component(.year, from: referenceDate)

        func string(_ r: NSRange) -> String? { r.location == NSNotFound ? nil : ns.substring(with: r) }
        func normalizeYear(_ y: Int) -> Int { y < 100 ? 2000 + y : y }

        func makeCandidate(day: Int, month: Int, year: Int?, range: NSRange) -> DateCandidate? {
            let comps = DateComponents(year: year ?? currentYear, month: month, day: day)
            guard let date = calendar.date(from: comps),
                  calendar.component(.month, from: date) == month else { return nil }   // Descarta 31/02.
            return DateCandidate(date: date, duration: 0, range: range,
                                 hasDay: true, hasTime: false, hasExplicitYear: year != nil)
        }

        var result: [DateCandidate] = []

        for m in numeric.matches(in: text, range: full) {
            guard let day = string(m.range(at: 1)).flatMap(Int.init),
                  let separator = string(m.range(at: 2)),
                  let month = string(m.range(at: 3)).flatMap(Int.init) else { continue }
            let year = string(m.range(at: 4)).flatMap(Int.init).map(normalizeYear)
            // "21.30" o "10-11" sin año son ambiguos (pueden ser horas o rangos): sólo "/" sin año.
            guard year != nil || separator == "/" else { continue }
            if let c = makeCandidate(day: day, month: month, year: year, range: m.range) { result.append(c) }
        }

        for m in textual.matches(in: text, range: full) {
            guard let day = string(m.range(at: 1)).flatMap(Int.init),
                  let month = string(m.range(at: 2)).flatMap(DateVocabulary.month(from:)) else { continue }
            let year = string(m.range(at: 3)).flatMap(Int.init)
            if let c = makeCandidate(day: day, month: month, year: year, range: m.range) { result.append(c) }
        }

        return result.sorted { $0.range.location < $1.range.location }
    }
}

/// Horas sueltas: "21:00", "21h", "21h30", "21.30h", "9pm", "9:30 a.m.", "a las 9".
enum TimeParser {
    struct Token {
        let range: NSRange
        let hour: Int
        let minute: Int
    }

    private enum Kind { case twelveHour, twentyFourHour }

    private static let rules: [(NSRegularExpression, Kind)] = {
        // El orden importa: las reglas más específicas primero; las siguientes no pisan rangos ya tomados.
        let raw: [(String, Kind)] = [
            (#"(?<![\d:.])(1[0-2]|0?[1-9])(?:[:.]([0-5]\d))?\s?([ap])\.?\s?m\.?(?![a-z])"#, .twelveHour),
            (#"(?<![\d/.:])([01]?\d|2[0-3])\s?[:h]\s?([0-5]\d)(?![\d/.:])"#, .twentyFourHour),
            (#"(?<![\d/.:])([01]?\d|2[0-3])\.([0-5]\d)\s?h(?![a-z])"#, .twentyFourHour),
            (#"(?<![\d/.:])([01]?\d|2[0-3])\s?(?:h|hrs?|horas?)(?![a-z0-9])"#, .twentyFourHour),
            (#"\ba\s+las\s+([01]?\d|2[0-3])(?![\d:.h])"#, .twentyFourHour),
        ]
        return raw.map { (try! NSRegularExpression(pattern: $0.0, options: [.caseInsensitive]), $0.1) }
    }()

    static func tokens(in text: String) -> [Token] {
        let ns = text as NSString
        let full = NSRange(location: 0, length: ns.length)
        var tokens: [Token] = []

        for (regex, kind) in rules {
            for m in regex.matches(in: text, range: full) {
                guard !tokens.contains(where: { NSIntersectionRange($0.range, m.range).length > 0 }) else { continue }
                guard var hour = Int(ns.substring(with: m.range(at: 1))) else { continue }

                var minute = 0
                if m.numberOfRanges > 2, m.range(at: 2).location != NSNotFound {
                    minute = Int(ns.substring(with: m.range(at: 2))) ?? 0
                }
                if kind == .twelveHour, m.numberOfRanges > 3 {
                    let meridiem = ns.substring(with: m.range(at: 3)).lowercased()
                    if meridiem == "p", hour < 12 { hour += 12 }
                    if meridiem == "a", hour == 12 { hour = 0 }
                }
                guard (0...23).contains(hour) else { continue }
                tokens.append(Token(range: m.range, hour: hour, minute: minute))
            }
        }
        return tokens.sorted { $0.range.location < $1.range.location }
    }
}

// MARK: - Utilidades de imagen

private extension UIImage {
    func renderedCGImage() -> CGImage? {
        UIGraphicsImageRenderer(size: size).image { _ in draw(at: .zero) }.cgImage
    }
}

private extension CGImagePropertyOrientation {
    init(_ orientation: UIImage.Orientation) {
        switch orientation {
        case .up: self = .up
        case .upMirrored: self = .upMirrored
        case .down: self = .down
        case .downMirrored: self = .downMirrored
        case .left: self = .left
        case .leftMirrored: self = .leftMirrored
        case .right: self = .right
        case .rightMirrored: self = .rightMirrored
        @unknown default: self = .up
        }
    }
}
