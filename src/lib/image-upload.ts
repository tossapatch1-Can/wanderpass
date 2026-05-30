// Client-side image pipeline for trip photos (browser only).
// Steps: validate → convert HEIC/HEIF → JPEG → compress → return a JPEG Blob.
// Used by the photo uploader. Direct-to-Storage upload happens in the component.

export const MAX_PHOTOS_PER_COUNTRY = 10;
export const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10 MB (PRD rule)

const ACCEPTED_EXT = ["jpg", "jpeg", "png", "webp", "heic", "heif"];
export const ACCEPT_ATTR = ".jpg,.jpeg,.png,.webp,.heic,.heif,image/*";

export class ImageError extends Error {}

function ext(name: string): string {
  return name.split(".").pop()?.toLowerCase() ?? "";
}

function isHeic(file: File): boolean {
  const e = ext(file.name);
  return e === "heic" || e === "heif" || file.type === "image/heic" || file.type === "image/heif";
}

export type ProcessedPhoto = {
  blob: Blob; // JPEG
  preview: string; // object URL for <img>
};

// Validate + convert + compress a single file. Throws ImageError with a
// friendly Thai message on bad input.
export async function processImageFile(file: File): Promise<ProcessedPhoto> {
  const e = ext(file.name);
  const okType = ACCEPTED_EXT.includes(e) || file.type.startsWith("image/");
  if (!okType) {
    throw new ImageError(
      "ไฟล์นี้ไม่รองรับ — รับเฉพาะ JPG, PNG, HEIC, WebP เท่านั้น"
    );
  }
  if (file.size > MAX_FILE_BYTES) {
    throw new ImageError("รูปใหญ่เกินไป (สูงสุด 10 MB ต่อรูป)");
  }

  let working: Blob = file;

  // HEIC/HEIF (iPhone default) → JPEG so it opens everywhere.
  if (isHeic(file)) {
    try {
      const heic2any = (await import("heic2any")).default;
      const out = await heic2any({ blob: file, toType: "image/jpeg", quality: 0.9 });
      working = Array.isArray(out) ? out[0] : out;
    } catch {
      throw new ImageError("แปลงไฟล์ HEIC ไม่สำเร็จ ลองรูปอื่นดูนะ");
    }
  }

  // Compress + resize for fast loading.
  try {
    const imageCompression = (await import("browser-image-compression")).default;
    const asFile =
      working instanceof File
        ? working
        : new File([working], "photo.jpg", { type: "image/jpeg" });
    const compressed = await imageCompression(asFile, {
      maxSizeMB: 2,
      maxWidthOrHeight: 2000,
      useWebWorker: true,
      fileType: "image/jpeg",
    });
    return { blob: compressed, preview: URL.createObjectURL(compressed) };
  } catch {
    // If compression fails, fall back to the (already valid) working blob.
    return { blob: working, preview: URL.createObjectURL(working) };
  }
}
