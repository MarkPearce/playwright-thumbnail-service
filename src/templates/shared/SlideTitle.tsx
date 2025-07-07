import React from 'react';

interface SlideTitleProps {
  children: React.ReactNode;
  className?: string;
}

export const SlideTitle: React.FC<SlideTitleProps> = ({ 
  children, 
  className = '' 
}) => {
  if (!children) return null;
  
  return (
    <h1 className={`text-2xl md:text-3xl lg:text-4xl xl:text-5xl 2xl:text-6xl font-black text-cyan-600 leading-tight py-2 mb-4 text-balance ${className}`}>
      {children}
    </h1>
  );
};
