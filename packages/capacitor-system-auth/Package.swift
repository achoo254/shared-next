// swift-tools-version: 5.9
import PackageDescription

// The package and product name must equal what the Capacitor CLI derives from
// the npm name (@achoo254/capacitor-system-auth -> Achoo254CapacitorSystemAuth).
let package = Package(
    name: "Achoo254CapacitorSystemAuth",
    platforms: [.iOS(.v15)],
    products: [
        .library(
            name: "Achoo254CapacitorSystemAuth",
            targets: ["SystemAuthPlugin"])
    ],
    dependencies: [
        .package(url: "https://github.com/ionic-team/capacitor-swift-pm.git", from: "8.0.0")
    ],
    targets: [
        .target(
            name: "SystemAuthPlugin",
            dependencies: [
                .product(name: "Capacitor", package: "capacitor-swift-pm"),
                .product(name: "Cordova", package: "capacitor-swift-pm")
            ],
            path: "ios/Sources/SystemAuthPlugin")
    ]
)
