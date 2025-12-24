export const convertImage = async (file, outputFormat = 'image/jpeg', quality = 0.92, targetSizeKB = null) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        
        // Fill white background for non-transparent formats if needed
        if (outputFormat === 'image/jpeg' || outputFormat === 'image/bmp') {
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        
        ctx.drawImage(img, 0, 0);

        const getBlob = (q) => {
          return new Promise((res) => {
            canvas.toBlob(
              (blob) => {
                res(blob);
              },
              outputFormat,
              q
            );
          });
        };

        const getExtension = (mime) => {
            switch(mime) {
                case 'image/jpeg': return '.jpg';
                case 'image/png': return '.png';
                case 'image/webp': return '.webp';
                default: return '.jpg';
            }
        };

        // If no target size or format doesn't support quality (PNG), just convert
        // PNG quality arg in toBlob is usuall ignored or different, strictly it's for lossy formats (jpeg, webp)
        if (!targetSizeKB || outputFormat === 'image/png') {
          getBlob(quality).then((blob) => {
            resolve({
              blob,
              fileName: file.name.replace(/\.[^/.]+$/, "") + getExtension(outputFormat),
              originalSize: file.size,
              newSize: blob.size
            });
          });
          return;
        }

        // Iterative approach for target size (only for lossy formats)
        const attempt = async (q) => {
           const blob = await getBlob(q);
           if (blob.size <= targetSizeKB * 1024 || q <= 0.1) {
             resolve({
                blob,
                fileName: file.name.replace(/\.[^/.]+$/, "") + getExtension(outputFormat),
                originalSize: file.size,
                newSize: blob.size
             });
           } else {
             attempt(q - 0.1);
           }
        };
        
        attempt(quality); 
      };
      img.onerror = reject;
      img.src = event.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};
