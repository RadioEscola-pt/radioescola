import { jsPDF } from "jspdf";
import type { ExamPage } from "@/lib/types";

const A4_WIDTH_MM = 210;
const A4_HEIGHT_MM = 297;
const SUBMISSION_MAX_DIMENSION = 2048;
const SUBMISSION_QUALITY = 0.8;
const THUMBNAIL_MAX_DIMENSION = 300;
const THUMBNAIL_QUALITY = 0.6;

/**
 * Generate a PDF from exam pages
 * Images are scaled to fit A4 while maintaining aspect ratio
 */
export async function generatePdf(pages: ExamPage[]): Promise<Blob> {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  for (let i = 0; i < pages.length; i++) {
    const page = pages[i];
    if (!page) continue;

    if (i > 0) {
      doc.addPage();
    }

    // Handle PDF files - just add a placeholder for now
    if (page.file.type === "application/pdf") {
      doc.setFontSize(12);
      doc.text(`PDF attachment: ${page.originalName}`, 20, 30);
      doc.setFontSize(10);
      doc.text("(Original PDF file included in submission)", 20, 40);
      continue;
    }

    // Process image with rotation
    const imgData = await rotateImage(page.dataUrl, page.rotation);

    // Calculate dimensions to fit A4 while maintaining aspect ratio
    const img = await loadImage(imgData);
    const { width, height, x, y } = calculateFitDimensions(
      img.width,
      img.height
    );

    doc.addImage(imgData, "JPEG", x, y, width, height);
  }

  return doc.output("blob");
}

/**
 * Calculate dimensions to fit image on A4 page while maintaining aspect ratio
 */
function calculateFitDimensions(
  imgWidth: number,
  imgHeight: number
): { width: number; height: number; x: number; y: number } {
  const imgAspect = imgWidth / imgHeight;
  const pageAspect = A4_WIDTH_MM / A4_HEIGHT_MM;

  let width: number;
  let height: number;
  let x: number;
  let y: number;

  if (imgAspect > pageAspect) {
    // Image is wider - fit to width
    width = A4_WIDTH_MM;
    height = A4_WIDTH_MM / imgAspect;
    x = 0;
    y = (A4_HEIGHT_MM - height) / 2;
  } else {
    // Image is taller - fit to height
    height = A4_HEIGHT_MM;
    width = A4_HEIGHT_MM * imgAspect;
    x = (A4_WIDTH_MM - width) / 2;
    y = 0;
  }

  return { width, height, x, y };
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
