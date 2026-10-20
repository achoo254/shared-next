function color(brand, key) {
    const value = brand.colors[key];
    if (value === undefined) {
        throw new Error(`brand: the web manifest needs colors.${key}`);
    }
    return value;
}
export function webManifest(brand, options) {
    // Key order is the order of the files the products already ship.
    return {
        ...(options.id === undefined ? {} : { id: options.id }),
        name: brand.appName,
        short_name: brand.shortName,
        description: brand.description,
        lang: options.lang,
        ...(options.dir === undefined ? {} : { dir: options.dir }),
        start_url: "/",
        scope: "/",
        display: options.display ?? "standalone",
        ...(options.orientation === undefined
            ? {}
            : { orientation: options.orientation }),
        theme_color: color(brand, options.themeColor),
        background_color: color(brand, options.backgroundColor ?? "background"),
        ...(options.categories === undefined
            ? {}
            : { categories: [...options.categories] }),
        ...(options.preferRelatedApplications === undefined
            ? {}
            : { prefer_related_applications: options.preferRelatedApplications }),
        icons: options.icons.map((icon) => ({ ...icon })),
    };
}
/**
 * What capacitor.config.ts spreads. Android is configured when the brand
 * has an Android id. No server.hostname: the WebView keeps its own
 * localhost origin; the production host would make the local server answer
 * the app's API requests and pin one tenant into a binary that serves all.
 */
export function capacitorManifest(brand, options = {}) {
    return {
        appId: brand.appIds.ios,
        appName: brand.appName,
        ...(brand.appIds.android === undefined
            ? {}
            : { android: { applicationId: brand.appIds.android } }),
        ...(options.urlScheme === false ? {} : { urlScheme: brand.urlScheme }),
    };
}
export function generateManifests(brand, options) {
    const capacitor = options.capacitor ?? false;
    return {
        "web.webmanifest.json": webManifest(brand, options.web),
        ...(capacitor === false
            ? {}
            : {
                "capacitor.json": capacitorManifest(brand, capacitor === true ? {} : capacitor),
            }),
    };
}
/** Text of a generated JSON file; the same content always gives the same bytes. */
export function formatGenerated(content, indent = 2) {
    return `${JSON.stringify(content, null, indent)}\n`;
}
