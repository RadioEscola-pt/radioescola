import { PDFDocument, PageSizes, degrees } from "pdf-lib";
import type { ExamPage } from "@/lib/types";

const SUBMISSION_MAX_DIMENSION = 2048;
const SUBMISSION_QUALITY = 0.8;
const THUMBNAIL_MAX_DIMENSION = 300;
const THUMBNAIL_QUALITY = 0.6;

/**
 * Generate a single PDF from exam pages.
 * - Image pages are embedded onto A4 sheets, scaled to fit and centered.
 * - Uploaded PDF pages are merged in with their real content preserved
 *   (a single uploaded PDF may contribute multiple pages).
 * Page order matches the order of `pages`.
 */
export async function generatePdf(pages: ExamPage[]): Promise<Blob> {
  const doc = await PDFDocument.create();

  for (const page of pages) {
    if (!page) continue;

    if (page.file.type === "application/pdf") {
      // Merge the actual pages of the uploaded PDF.
      const donor = await PDFDocument.load(dataUrlToUint8Array(page.dataUrl));
      const copiedPages = await doc.copyPages(donor, donor.getPageIndices());
      for (const copiedPage of copiedPages) {
        if (page.rotation) {
          const current = copiedPage.getRotation().angle;
          copiedPage.setRotation(degrees((current + page.rotation) % 360));
        }
        doc.addPage(copiedPage);
      }
      continue;
    }

    // Image page: bake in rotation, then embed scaled-to-fit on an A4 sheet.
    const imgData = await rotateImage(page.dataUrl, page.rotation);
    const jpg = await doc.embedJpg(dataUrlToUint8Array(imgData));

    const sheet = doc.addPage(PageSizes.A4);
    const { width: pageWidth, height: pageHeight } = sheet.getSize();
    const scale = Math.min(pageWidth / jpg.width, pageHeight / jpg.height);
    const drawWidth = jpg.width * scale;
    const drawHeight = jpg.height * scale;
    sheet.drawImage(jpg, {
      x: (pageWidth - drawWidth) / 2,
      y: (pageHeight - drawHeight) / 2,
      width: drawWidth,
      height: drawHeight,
    });
  }

  // pdf-lib cannot serialize a document with zero pages.
  if (doc.getPageCount() === 0) {
    doc.addPage(PageSizes.A4);
  }

  const bytes = await doc.save();
  // Copy into a fresh ArrayBuffer-backed view so the result is a valid BlobPart.
  return new Blob([new Uint8Array(bytes)], { type: "application/pdf" });
}

/**
 * Rotate an image by the specified degrees using canvas
 */
async function rotateImage(dataUrl: string, rotation: number): Promise<string> {
  if (rotation === 0) return dataUrl;

  const img = await loadImage(dataUrl);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not get canvas context");

  // Swap dimensions for 90/270 degree rotations
  if (rotation === 90 || rotation === 270) {
    canvas.width = img.height;
    canvas.height = img.width;
  } else {
    canvas.width = img.width;
    canvas.height = img.height;
  }

  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate((rotation * Math.PI) / 180);
  ctx.drawImage(img, -img.width / 2, -img.height / 2);

  return canvas.toDataURL("image/jpeg", SUBMISSION_QUALITY);
}

/**
 * Load an image from a data URL
 */
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/**
 * Compress an image file using canvas resize + JPEG encoding.
 * Returns a data URL of the compressed image.
 */
export async function compressImage(
  file: File,
  maxDimension: number,
  quality: number
): Promise<string> {
  const objectUrl = URL.createObjectURL(file);
  try {
    const img = await loadImage(objectUrl);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Could not get canvas context");

    // Scale to fit within maxDimension, preserving aspect ratio
    let { width, height } = img;
    if (width > maxDimension || height > maxDimension) {
      if (width > height) {
        height = Math.round((height * maxDimension) / width);
        width = maxDimension;
      } else {
        width = Math.round((width * maxDimension) / height);
        height = maxDimension;
      }
    }

    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(img, 0, 0, width, height);
    return canvas.toDataURL("image/jpeg", quality);
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

/** Compress image for PDF submission (max 2048px, quality 0.8) */
export function compressImageForSubmission(file: File): Promise<string> {
  return compressImage(file, SUBMISSION_MAX_DIMENSION, SUBMISSION_QUALITY);
}

/** Compress image for thumbnail display (max 300px, quality 0.6) */
export function compressImageForThumbnail(file: File): Promise<string> {
  return compressImage(file, THUMBNAIL_MAX_DIMENSION, THUMBNAIL_QUALITY);
}

/**
 * Decode a base64 data URL (e.g. "data:application/pdf;base64,...") into bytes.
 */
function dataUrlToUint8Array(dataUrl: string): Uint8Array {
  const commaIndex = dataUrl.indexOf(",");
  const base64 = commaIndex >= 0 ? dataUrl.slice(commaIndex + 1) : dataUrl;
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/**
 * Convert a File to a data URL
 */
export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Convert a Blob to base64 string (without data URL prefix)
 */
export function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      resolve(result.split(",")[1] ?? "");
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
