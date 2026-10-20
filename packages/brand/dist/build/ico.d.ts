export interface IcoImage {
    readonly size: number;
    readonly png: Uint8Array;
}
/**
 * Packs PNG images into an .ico file (PNG-compressed entries, supported by
 * every browser that reads favicon.ico). Sizes must be 1 to 256 pixels.
 */
export declare function encodeIco(images: readonly IcoImage[]): Uint8Array;
