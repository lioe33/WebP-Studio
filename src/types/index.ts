export type FitMode = 'cover' | 'contain' | 'stretch' | 'custom';

export type BackgroundMode = 'transparent' | 'white' | 'dark' | 'blur' | 'custom';

export interface ProcessOptions {
  targetWidth: number;
  targetHeight: number;
  fitMode: FitMode;
  quality: number; // 0.0 to 1.0 (1.0 is lossless WebP)
  backgroundMode: BackgroundMode;
  customBgColor: string;
  // Custom crop coordinates relative to original image
  cropX?: number;
  cropY?: number;
  cropWidth?: number;
  cropHeight?: number;
  zoom?: number;
  panX?: number;
  panY?: number;
}

export interface ImageMetadata {
  name: string;
  originalSize: number;
  originalWidth: number;
  originalHeight: number;
  originalFormat: string;
  originalUrl: string;
  file?: File;
}

export interface ProcessResult {
  blob: Blob;
  dataUrl: string;
  width: number;
  height: number;
  fileSize: number;
  durationMs: number;
  format: 'image/webp';
}

export interface BatchItem {
  id: string;
  meta: ImageMetadata;
  status: 'pending' | 'processing' | 'completed' | 'error';
  error?: string;
  result?: ProcessResult;
}
