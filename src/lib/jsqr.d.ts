declare module "@/lib/jsqr" {
  export interface QRCodePoint {
    x: number;
    y: number;
  }
  export interface QRCode {
    binaryData: number[];
    data: string;
    chunks: any[];
    location: {
      topRightCorner: QRCodePoint;
      topLeftCorner: QRCodePoint;
      bottomRightCorner: QRCodePoint;
      bottomLeftCorner: QRCodePoint;
    };
  }
  export interface Options {
    inversionAttempts?: "dontInvert" | "onlyInvert" | "attemptBoth" | "invertFirst";
  }
  function jsQR(
    data: Uint8ClampedArray,
    width: number,
    height: number,
    options?: Options
  ): QRCode | null;

  export default jsQR;
  export { jsQR };
}
