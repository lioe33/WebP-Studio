import { ProcessOptions, ProcessResult } from '../types';

/**
 * Loads an image from a URL or ObjectURL and returns an HTMLImageElement
 */
export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(new Error('无法加载图片文件，可能已损坏或格式不受支持: ' + e));
    img.src = src;
  });
}

/**
 * High quality downscaling helper to avoid jagged edges when shrinking huge images
 */
function createSteppedDownsampleCanvas(
  source: CanvasImageSource,
  currentWidth: number,
  currentHeight: number,
  targetWidth: number,
  targetHeight: number
): HTMLCanvasElement {
  let cWidth = currentWidth;
  let cHeight = currentHeight;
  let currentSource: CanvasImageSource = source;

  // Step down by halves if more than 2x larger
  while (cWidth * 0.5 > targetWidth && cHeight * 0.5 > targetHeight) {
    const nextWidth = Math.floor(cWidth * 0.5);
    const nextHeight = Math.floor(cHeight * 0.5);
    const stepCanvas = document.createElement('canvas');
    stepCanvas.width = nextWidth;
    stepCanvas.height = nextHeight;
    const stepCtx = stepCanvas.getContext('2d');
    if (stepCtx) {
      stepCtx.imageSmoothingEnabled = true;
      stepCtx.imageSmoothingQuality = 'high';
      stepCtx.drawImage(currentSource, 0, 0, nextWidth, nextHeight);
      currentSource = stepCanvas;
      cWidth = nextWidth;
      cHeight = nextHeight;
    } else {
      break;
    }
  }

  const finalCanvas = document.createElement('canvas');
  finalCanvas.width = targetWidth;
  finalCanvas.height = targetHeight;
  const finalCtx = finalCanvas.getContext('2d')!;
  finalCtx.imageSmoothingEnabled = true;
  finalCtx.imageSmoothingQuality = 'high';
  finalCtx.drawImage(currentSource, 0, 0, targetWidth, targetHeight);
  return finalCanvas;
}

/**
 * Main image processor converting image to WebP with target resolution (1612x801)
 */
export async function processImageToWebP(
  imageSource: HTMLImageElement | string,
  options: ProcessOptions
): Promise<ProcessResult> {
  const startTime = performance.now();

  const img = typeof imageSource === 'string' ? await loadImage(imageSource) : imageSource;
  const { targetWidth, targetHeight, fitMode, quality, backgroundMode, customBgColor } = options;

  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;

  const ctx = canvas.getContext('2d', { willReadFrequently: false });
  if (!ctx) {
    throw new Error('无法初始化 Canvas 2D 渲染上下文');
  }

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // Draw background if not transparent
  if (backgroundMode === 'white') {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, targetWidth, targetHeight);
  } else if (backgroundMode === 'dark') {
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, targetWidth, targetHeight);
  } else if (backgroundMode === 'custom') {
    ctx.fillStyle = customBgColor || '#ffffff';
    ctx.fillRect(0, 0, targetWidth, targetHeight);
  } else if (backgroundMode === 'blur' && fitMode === 'contain') {
    // Elegant blurred backdrop
    ctx.save();
    ctx.filter = 'blur(28px) brightness(0.85)';
    // Scale up blurred backdrop slightly to cover bleed edges
    ctx.drawImage(img, -20, -20, targetWidth + 40, targetHeight + 40);
    ctx.restore();
    // Subtle scrim over the blur
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.fillRect(0, 0, targetWidth, targetHeight);
  } else {
    // Transparent background (cleared)
    ctx.clearRect(0, 0, targetWidth, targetHeight);
  }

  const origW = img.naturalWidth || img.width;
  const origH = img.naturalHeight || img.height;

  if (fitMode === 'cover') {
    // Scale and center crop to fill exactly 1612x801
    const scale = Math.max(targetWidth / origW, targetHeight / origH);
    const drawW = origW * scale;
    const drawH = origH * scale;
    const drawX = (targetWidth - drawW) / 2;
    const drawY = (targetHeight - drawH) / 2;

    if (origW > drawW * 2 && origH > drawH * 2) {
      const scaledCanvas = createSteppedDownsampleCanvas(img, origW, origH, Math.round(drawW), Math.round(drawH));
      ctx.drawImage(scaledCanvas, drawX, drawY);
    } else {
      ctx.drawImage(img, drawX, drawY, drawW, drawH);
    }
  } else if (fitMode === 'contain') {
    // Scale image proportionally so it completely fits inside 1612x801
    const scale = Math.min(targetWidth / origW, targetHeight / origH);
    const drawW = origW * scale;
    const drawH = origH * scale;
    const drawX = (targetWidth - drawW) / 2;
    const drawY = (targetHeight - drawH) / 2;

    if (origW > drawW * 2 && origH > drawH * 2) {
      const scaledCanvas = createSteppedDownsampleCanvas(img, origW, origH, Math.round(drawW), Math.round(drawH));
      ctx.drawImage(scaledCanvas, drawX, drawY);
    } else {
      ctx.drawImage(img, drawX, drawY, drawW, drawH);
    }
  } else if (fitMode === 'stretch') {
    // Force stretch to exactly 1612x801
    ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
  } else if (fitMode === 'custom') {
    // Interactive crop coordinates or pan/zoom
    const zoom = options.zoom ?? 1;
    const panX = options.panX ?? 0;
    const panY = options.panY ?? 0;

    // Base cover scale
    const baseScale = Math.max(targetWidth / origW, targetHeight / origH);
    const scale = baseScale * zoom;
    const drawW = origW * scale;
    const drawH = origH * scale;

    const centerX = (targetWidth - drawW) / 2;
    const centerY = (targetHeight - drawH) / 2;
    const drawX = centerX + panX;
    const drawY = centerY + panY;

    ctx.drawImage(img, drawX, drawY, drawW, drawH);
  }

  // Convert to WebP blob
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => {
        if (b) {
          resolve(b);
        } else {
          reject(new Error('浏览器未能生成 WebP 格式图像'));
        }
      },
      'image/webp',
      quality
    );
  });

  const dataUrl = canvas.toDataURL('image/webp', quality);
  const durationMs = Math.round(performance.now() - startTime);

  return {
    blob,
    dataUrl,
    width: targetWidth,
    height: targetHeight,
    fileSize: blob.size,
    durationMs,
    format: 'image/webp',
  };
}

/**
 * Format bytes into human readable format with 2 decimals
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const val = bytes / Math.pow(k, i);
  return `${val.toFixed(i === 0 ? 0 : 2)} ${sizes[i]}`;
}
