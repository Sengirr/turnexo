/**
 * Comprime cualquier foto tomada por la limpiadora desde el móvil a formato WebP/JPEG ligero (~45-60 KB)
 * para que quepan más de 16.000 fotos dentro del 1 GB gratuito de Supabase sin gastar almacenamiento.
 */
export async function compressCleanerPhoto(
  file: File,
  maxWidth = 960,
  quality = 0.68
): Promise<{ dataUrl: string; sizeKb: number }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('No se pudo leer la imagen'));
    reader.onload = (event) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Formato de imagen no válido'));
      img.onload = () => {
        const scale = img.width > maxWidth ? maxWidth / img.width : 1;
        const width = Math.round(img.width * scale);
        const height = Math.round(img.height * scale);

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Error al inicializar compresor'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Intentar WebP primero (mucho más ligero), con fallback a JPEG
        let dataUrl = canvas.toDataURL('image/webp', quality);
        if (!dataUrl.startsWith('data:image/webp')) {
          dataUrl = canvas.toDataURL('image/jpeg', quality);
        }

        const approximateBytes = Math.round((dataUrl.length * 3) / 4);
        const sizeKb = Math.max(1, Math.round(approximateBytes / 1024));

        resolve({ dataUrl, sizeKb });
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}
