import React from 'react';
import { typography } from './slideStyles.js';

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
    <p className={`${typography.header.subtitle.base} ${typography.header.subtitle.responsive} mb-4 ${className}`}>
      {children}
    </p>
  );
};
