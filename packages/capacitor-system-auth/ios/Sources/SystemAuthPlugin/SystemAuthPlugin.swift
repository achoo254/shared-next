import AuthenticationServices
import Capacitor
import Foundation

/// Opens an authorization URL in `ASWebAuthenticationSession` and returns the
/// callback URL. PKCE, `state` and the code exchange stay in the app's JS.
/// Keep this the only objc-renamed class in the sources: the Capacitor CLI registers
/// the first `@objc` name of every Swift file as a plugin class.
@objc(SystemAuthPlugin)
public class SystemAuthPlugin: CAPPlugin, CAPBridgedPlugin, ASWebAuthenticationPresentationContextProviding {
    public let identifier = "SystemAuthPlugin"
    public let jsName = "SystemAuth"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "authenticate", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "isAvailable", returnType: CAPPluginReturnPromise)
    ]

    private enum Callback {
        case scheme(String)
        case https(host: String, path: String)
    }

    /// Strong reference: the sheet closes if the session is deallocated. Main thread only.
    private var session: ASWebAuthenticationSession?

    @objc func isAvailable(_ call: CAPPluginCall) {
        call.resolve(["https": Self.httpsCallbackSupported])
    }

    @objc func authenticate(_ call: CAPPluginCall) {
        guard let urlString = call.getString("url"),
              let url = URL(string: urlString),
              let urlScheme = url.scheme?.lowercased(),
              urlScheme == "https" || urlScheme == "http",
              url.host != nil
        else {
            call.reject("`url` must be an absolute http(s) URL", "FAILED")
            return
        }
        let callback: Callback
        switch Self.parseCallback(call.getObject("callback")) {
        case .success(let parsed): callback = parsed
        case .failure(let message):
            call.reject(message.text, "FAILED")
            return
        }
        if case .https = callback, !Self.httpsCallbackSupported {
            call.reject("https callbacks need iOS 17.4 or later", "UNSUPPORTED")
            return
        }
        let preferEphemeral = call.getBool("preferEphemeral") ?? false

        DispatchQueue.main.async { [weak self] in
            guard let self else { return }
            self.start(call: call, url: url, callback: callback, preferEphemeral: preferEphemeral)
        }
    }

    public func presentationAnchor(for session: ASWebAuthenticationSession) -> ASPresentationAnchor {
        bridge?.viewController?.view.window ?? ASPresentationAnchor()
    }

    private func start(call: CAPPluginCall, url: URL, callback: Callback, preferEphemeral: Bool) {
        guard session == nil else {
            call.reject("An authentication session is already in progress", "FAILED")
            return
        }
        let completion: (URL?, Error?) -> Void = { [weak self] callbackURL, error in
            DispatchQueue.main.async {
                self?.session = nil
                if let callbackURL {
                    call.resolve(["url": callbackURL.absoluteString])
                } else if let error = error as? ASWebAuthenticationSessionError, error.code == .canceledLogin {
                    call.reject("The user closed the sign-in sheet", "CANCELLED")
                } else {
                    call.reject(error?.localizedDescription ?? "The sign-in sheet returned no URL", "FAILED", error)
                }
            }
        }
        let session = Self.makeSession(url: url, callback: callback, completion: completion)
        session.presentationContextProvider = self
        session.prefersEphemeralWebBrowserSession = preferEphemeral
        self.session = session
        if !session.start() {
            self.session = nil
            call.reject("Could not open the sign-in sheet", "FAILED")
        }
    }

    private static var httpsCallbackSupported: Bool {
        if #available(iOS 17.4, *) { return true }
        return false
    }

    private static func makeSession(
        url: URL,
        callback: Callback,
        completion: @escaping (URL?, Error?) -> Void
    ) -> ASWebAuthenticationSession {
        if #available(iOS 17.4, *) {
            let matcher: ASWebAuthenticationSession.Callback
            switch callback {
            case .scheme(let scheme): matcher = .customScheme(scheme)
            case .https(let host, let path): matcher = .https(host: host, path: path)
            }
            return ASWebAuthenticationSession(url: url, callback: matcher, completionHandler: completion)
        }
        // https was rejected before this point on older iOS.
        guard case .scheme(let scheme) = callback else {
            preconditionFailure("https callback requires iOS 17.4")
        }
        return ASWebAuthenticationSession(url: url, callbackURLScheme: scheme, completionHandler: completion)
    }

    private struct InvalidOption: Error {
        let text: String
    }

    private static func parseCallback(_ object: JSObject?) -> Result<Callback, InvalidOption> {
        guard let object else {
            return .failure(InvalidOption(text: "`callback` is required"))
        }
        if let scheme = object["scheme"] as? String {
            // RFC 3986 scheme: ALPHA *( ALPHA / DIGIT / "+" / "-" / "." ); "http(s)" belongs to the https form.
            let valid = scheme.range(of: "^[A-Za-z][A-Za-z0-9+.-]*$", options: .regularExpression) != nil
            guard valid, !["http", "https"].contains(scheme.lowercased()) else {
                return .failure(InvalidOption(text: "`callback.scheme` must be a custom URL scheme"))
            }
            return .success(.scheme(scheme))
        }
        if let https = object["https"] as? JSObject {
            guard let host = https["host"] as? String, !host.isEmpty, !host.contains("/"),
                  let path = https["path"] as? String, path.hasPrefix("/")
            else {
                return .failure(InvalidOption(text: "`callback.https` needs a `host` and a `path` starting with /"))
            }
            return .success(.https(host: host, path: path))
        }
        return .failure(InvalidOption(text: "`callback` must have `scheme` or `https`"))
    }
}
