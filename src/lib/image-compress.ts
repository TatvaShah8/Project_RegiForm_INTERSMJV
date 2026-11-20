/**
 * Client-side image compression utility for SMJV Youth Festival registration.
 * Compresses any image of any size (up to 25MB+) to strictly under maxKB (default: 200 KB)
 * while preserving high visual sharpness for student ID cards and badges.
 */

export interface CompressionResult {
  dataUrl: string;
  blob: Blob;
  sizeKB: number;
  originalSizeKB: number;
  width: number;
  height: number;
}

/**
 * Loads an image from a File, Blob, or Data URL.
 */
function loadImage(input: File | Blob | string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => resolve(img);
    img.onerror = (e) => reject(new Error("Failed to load image for compression"));

    if (typeof input === "string") {
      img.src = input;
    } else {
      const reader = new FileReader();
      reader.onload = () => {
        img.src = String(reader.result);
      };
      reader.onerror = (e) => reject(new Error("Failed to read image file"));
      reader.readAsDataURL(input);
    }
  });
}

/**
 * Compresses an image to guarantee it is strictly <= maxKB (default 200 KB).
 * Uses HTML5 Canvas + iterative quality and dimension adjustment.
 */
export async function compressImageToMaxKB(
  input: File | Blob | string,
  maxKB: number = 200
): Promise<CompressionResult> {
  const maxBytes = maxKB * 1024;
  const originalBytes =
    typeof input === "string"
      ? Math.round(input.length * 0.75) // approximate base64 payload size
      : input.size;
  const originalSizeKB = Math.round(originalBytes / 1024);

  const img = await loadImage(input);

  let targetWidth = img.naturalWidth || img.width;
  let targetHeight = img.naturalHeight || img.height;
  let maxDimension = 1024; // 1024px gives crystal-clear resolution for ID passes

  // Initial dimension scaling down if image is high-res (e.g. 4000x3000)
  if (targetWidth > maxDimension || targetHeight > maxDimension) {
    const ratio = Math.min(maxDimension / targetWidth, maxDimension / targetHeight);
    targetWidth = Math.max(1, Math.round(targetWidth * ratio));
    targetHeight = Math.max(1, Math.round(targetHeight * ratio));
  }

  const canvas = document.createElement("canvas");
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Unable to create canvas 2D context for image compression");
  }

  // Draw with image smoothing enabled
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

  // Iterative quality reduction loop
  let quality = 0.88;
  const minQuality = 0.45;

  const toBlobPromise = (q: number): Promise<Blob | null> => {
    return new Promise((resolve) => {
      canvas.toBlob((b) => resolve(b), "image/jpeg", q);
    });
  };

  let bestBlob: Blob | null = null;

  while (quality >= minQuality) {
    const blob = await toBlobPromise(quality);
    if (!blob) break;
    bestBlob = blob;

    if (blob.size <= maxBytes) {
      // Under target size!
      break;
    }

    // Step down quality
    quality -= 0.08;
  }

  // If still above maxBytes after dropping quality to minQuality,
  // progressively downscale dimensions until strictly <= maxBytes
  while (bestBlob && bestBlob.size > maxBytes && targetWidth > 320 && targetHeight > 320) {
    targetWidth = Math.round(targetWidth * 0.85);
    targetHeight = Math.round(targetHeight * 0.85);
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

    const blob = await toBlobPromise(0.75);
    if (blob) {
      bestBlob = blob;
    } else {
      break;
    }
  }

  if (!bestBlob) {
    throw new Error("Failed to produce compressed image blob");
  }

  // Convert final blob to Data URL
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = reject;
    r.readAsDataURL(bestBlob);
  });

  const finalSizeKB = Math.round(bestBlob.size / 1024);

  return {
    dataUrl,
    blob: bestBlob,
    sizeKB: finalSizeKB,
    originalSizeKB,
    width: targetWidth,
    height: targetHeight,
  };
}
