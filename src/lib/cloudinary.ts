/**
 * Utility to upload images to Cloudinary via the server-side proxy.
 * This keeps API keys secure and centralized.
 */
export async function uploadImage(file: File | string, folder: string = 'user_uploads'): Promise<{ url: string; public_id: string }> {
  let imageData: string;

  if (file instanceof File) {
    imageData = await fileToBase64(file);
  } else {
    imageData = file;
  }

  const response = await fetch('/api/upload', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ image: imageData, folder }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Upload failed');
  }

  return response.json();
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
}
