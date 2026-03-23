// Image optimization utilities
export const optimizeBase64Image = (base64String, maxWidth = 400, quality = 0.7) => {
  return new Promise((resolve) => {
    if (!base64String || !base64String.startsWith('data:image/')) {
      resolve(base64String);
      return;
    }

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // Calculate new dimensions
      let { width, height } = img;
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }
      
      canvas.width = width;
      canvas.height = height;
      
      // Draw and compress
      ctx.drawImage(img, 0, 0, width, height);
      
      // Convert back to base64 with compression
      const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
      resolve(compressedBase64);
    };
    
    img.onerror = () => resolve(base64String); // Fallback to original
    img.src = base64String;
  });
};

export const getOptimizedImageUrl = (imageData, size = 'medium') => {
  if (!imageData) return null;
  
  // If it's already a URL, return as is
  if (typeof imageData === 'string' && !imageData.startsWith('data:')) {
    return imageData;
  }
  
  // For base64 images, we'll optimize them on the fly
  return imageData;
};

export const preloadImage = (src) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
};

export const lazyLoadImage = (imgElement, src) => {
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target;
            img.src = src;
            img.classList.remove('lazy');
            observer.unobserve(img);
          }
        });
      },
      { rootMargin: '50px' }
    );
    
    imgElement.classList.add('lazy');
    observer.observe(imgElement);
  } else {
    // Fallback for browsers without IntersectionObserver
    imgElement.src = src;
  }
};
