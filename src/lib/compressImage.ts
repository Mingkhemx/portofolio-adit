/**
 * Kompres gambar di browser sebelum upload ke Cloudinary.
 * - Convert ke WebP (30-50% lebih kecil dari JPG)
 * - Resize max 1920px (tetap HD di layar apapun)
 * - Quality 0.82 (tidak ada bedanya secara visual, ukuran sangat berkurang)
 */
export async function compressImage(
  file: File,
  options: {
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
    outputFormat?: 'image/webp' | 'image/jpeg';
  } = {}
): Promise<{ file: File; width: number; height: number }> {
  const {
    maxWidth = 1920,
    maxHeight = 1920,
    quality = 0.82,
    outputFormat = 'image/webp',
  } = options;

  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      let { width, height } = img;
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) return reject(new Error('Canvas compression failed'));
          const ext = outputFormat === 'image/webp' ? 'webp' : 'jpg';
          const compressed = new File(
            [blob],
            file.name.replace(/\.[^.]+$/, `.${ext}`),
            { type: outputFormat }
          );
          resolve({ file: compressed, width, height });
        },
        outputFormat,
        quality
      );
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = objectUrl;
  });
}

/**
 * Kompres banyak gambar sekaligus
 */
export async function compressManyImages(files: File[], options = {}): Promise<{ file: File; width: number; height: number }[]> {
  return Promise.all(files.map((f) => compressImage(f, options)));
}
