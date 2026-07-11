import React from 'react';
import { typography } from './slideStyles.js';

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
    <h1 className={`${typography.header.title.base} ${typography.header.title.responsive} py-1 mb-4 ${className}`}>
      {children}
    </h1>
  );
};
