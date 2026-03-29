const MAX_DIMENSION = 1000;
const TARGET_FORMAT = "image/webp";
const INITIAL_QUALITY = 0.82;
const MIN_QUALITY = 0.5;
const MAX_FILE_SIZE = 300 * 1024; // 300 KB

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = URL.createObjectURL(file);
  });
}

function calculateDimensions(
  width: number,
  height: number,
): { w: number; h: number } {
  if (width <= MAX_DIMENSION && height <= MAX_DIMENSION) return { w: width, h: height };
  const ratio = Math.min(MAX_DIMENSION / width, MAX_DIMENSION / height);
  return { w: Math.round(width * ratio), h: Math.round(height * ratio) };
}

function canvasToBlob(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Canvas toBlob failed"))),
      TARGET_FORMAT,
      quality,
    );
  });
}

export async function optimizeImage(file: File): Promise<File> {
  if (file.type === "image/gif") return file;

  const img = await loadImage(file);
  const { w, h } = calculateDimensions(img.naturalWidth, img.naturalHeight);

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, 0, 0, w, h);

  URL.revokeObjectURL(img.src);

  let quality = INITIAL_QUALITY;
  let blob = await canvasToBlob(canvas, quality);

  while (blob.size > MAX_FILE_SIZE && quality > MIN_QUALITY) {
    quality -= 0.08;
    blob = await canvasToBlob(canvas, quality);
  }

  const optimizedName = file.name.replace(/\.[^.]+$/, ".webp");
  return new File([blob], optimizedName, { type: TARGET_FORMAT });
}
