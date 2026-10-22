// swift-tools-version: 5.9
import PackageDescription

// The package and product name must equal what the Capacitor CLI derives from
// the npm name (@shared-next/capacitor-system-auth -> SharedNextCapacitorSystemAuth).
let package = Package(
    name: "SharedNextCapacitorSystemAuth",
    platforms: [.iOS(.v15)],
    products: [
        .library(
            name: "SharedNextCapacitorSystemAuth",
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
