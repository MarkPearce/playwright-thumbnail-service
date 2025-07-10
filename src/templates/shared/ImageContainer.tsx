interface ImageContainerProps {
  src: string;
  alt?: string;
  overlayTitle?: string;
  className?: string;
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
  objectPosition?: string;
}

export const ImageContainer = ({ 
  src, 
  alt = '',
  overlayTitle,
  className = '',
  objectFit = 'cover',
  objectPosition = 'center'
}: ImageContainerProps) => {
  if (!src) return null;
  
  // Build the image class based on objectFit prop
  const objectFitClass = {
    'contain': 'object-contain',
    'cover': 'object-cover',
    'fill': 'object-fill',
    'none': 'object-none',
    'scale-down': 'object-scale-down'
  }[objectFit];
  
  return (
    <div className={`relative overflow-hidden rounded-lg ${className}`}>
      <img 
        src={src} 
        alt={alt}
        className={`w-full h-full ${objectFitClass}`}
        style={{ objectPosition }}
      />
      {overlayTitle && (
        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
          <h2 className="text-white text-slide-title font-slide-display text-center px-8 text-balance">
            {overlayTitle}
          </h2>
        </div>
      )}
    </div>
  );
};
