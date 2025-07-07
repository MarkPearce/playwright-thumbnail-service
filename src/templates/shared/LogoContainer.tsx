import React from 'react';

interface LogoContainerProps {
  src: string;
  alt?: string;
  size?: 'small' | 'medium' | 'large';
  position?: 'top-left' | 'top-right' | 'center' | 'bottom-left' | 'bottom-right';
  className?: string;
}

export const LogoContainer: React.FC<LogoContainerProps> = ({ 
  src, 
  alt = 'Logo',
  size = 'medium',
  position = 'top-right',
  className = '' 
}) => {
  if (!src) return null;
  
  const sizeClasses = {
    small: 'w-16 h-16',
    medium: 'w-24 h-24',
    large: 'w-32 h-32'
  };
  
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
        className={`${sizeClasses[size]} object-contain`}
      />
    </div>
  );
};
