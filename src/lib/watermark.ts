/**
 * Render an image onto a canvas with a repeating diagonal watermark.
 * Returns a data URL (PNG) of the watermarked image.
 */
export async function applyWatermark(
  src: string,
  text: string = '© Aditya Tri'
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;

      const ctx = canvas.getContext('2d')!;
      // Draw original image
      ctx.drawImage(img, 0, 0);

      // ── Repeating diagonal watermark text ──────────────
      const fontSize = Math.max(18, Math.round(canvas.width * 0.025));
      ctx.font = `bold ${fontSize}px Inter, Arial, sans-serif`;
      ctx.fillStyle = 'rgba(255,255,255,0.18)';
      ctx.strokeStyle = 'rgba(0,0,0,0.10)';
      ctx.lineWidth = 0.5;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      const gap = fontSize * 7;
      ctx.save();
      ctx.rotate(-Math.PI / 6); // -30°

      // Cover rotated canvas with tiles
      const diagonal = Math.sqrt(canvas.width ** 2 + canvas.height ** 2);
      for (let y = -diagonal; y < diagonal; y += gap) {
        for (let x = -diagonal; x < diagonal * 2; x += gap * 3) {
          ctx.strokeText(text, x, y);
          ctx.fillText(text, x, y);
        }
      }
      ctx.restore();

      resolve(canvas.toDataURL('image/png'));
    };

    img.onerror = () => reject(new Error('Failed to load image for watermark'));
    img.src = src;
  });
}
