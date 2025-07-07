interface ImageContainerProps {
  src: string;
  alt?: string;
  overlayTitle?: string;
  className?: string;
}

export const ImageContainer = ({ 
  src, 
  alt = '',
  overlayTitle,
  className = '' 
}: ImageContainerProps) => {
  if (!src) return null;
  
  return (
    <div className={`relative overflow-hidden rounded-lg ${className}`}>
      <img 
        src={src} 
        alt={alt}
        className="w-full h-full object-contain lg:h-auto xl:h-auto 2xl:h-auto"
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
