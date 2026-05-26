const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME as string;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET as string;

/**
 * Upload satu file ke Cloudinary, kembalikan URL-nya.
 * @param file  - File yang akan diupload
 * @param folder - Folder di Cloudinary (opsional, e.g. "portfolio/photos")
 */
export async function uploadToCloudinary(file: File, folder = 'portfolio'): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET);
  formData.append('folder', folder);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message ?? 'Cloudinary upload failed');
  }

  const data = await res.json();
  return data.secure_url as string;
}

/**
 * Upload banyak file sekaligus, kembalikan array URL.
 */
export async function uploadManyToCloudinary(files: File[], folder = 'portfolio'): Promise<string[]> {
  return Promise.all(files.map((f) => uploadToCloudinary(f, folder)));
}
