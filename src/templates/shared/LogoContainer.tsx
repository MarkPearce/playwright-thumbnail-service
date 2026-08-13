interface LogoContainerProps {
  src: string;
  alt?: string;
  position?: 'top-left' | 'top-right' | 'center' | 'bottom-left' | 'bottom-right';
  className?: string;
}

export const LogoContainer = ({ 
  src, 
  alt = 'Logo',
  position = 'top-right',
  className = '' 
}: LogoContainerProps) => {
  if (!src) return null;
  
  const positionClasses = {
    'top-left': 'absolute top-4 left-4',
    'top-right': 'absolute top-4 right-4',
    'center': 'mx-auto',
    'bottom-left': 'absolute bottom-4 left-4',
    'bottom-right': 'absolute bottom-4 right-4'
  };
  
  return (
    <div className={`${positionClasses[position]} ${className}`}>
      <img 
        src={src} 
        alt={alt}
        className="w-full h-full object-contain"
      />
    </div>
  );
};
