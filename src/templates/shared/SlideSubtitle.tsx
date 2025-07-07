import React from 'react';

interface SlideSubtitleProps {
  children: React.ReactNode;
  className?: string;
}

export const SlideSubtitle: React.FC<SlideSubtitleProps> = ({ 
  children, 
  className = '' 
}) => {
  if (!children) return null;
  
  return (
    <p className={`text-lg md:text-xl lg:text-xl xl:text-2xl 2xl:text-3xl font-medium text-slate-500 mb-4 text-balance ${className}`}>
      {children}
    </p>
  );
};
