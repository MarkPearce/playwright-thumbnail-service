import React from 'react';
import { getSlideContainerClasses, getSlideContentClasses } from './slideStyleUtils';

interface SlideContainerProps {
  children: React.ReactNode;
  className?: string;
}

export const SlideContainer: React.FC<SlideContainerProps> = ({ 
  children, 
  className = ''
}) => {
  // Simplified version for thumbnail generation - no template context needed
  const isEditing = false; // Always false for thumbnails
  
  return (
    <div className={`${getSlideContainerClasses(className)} ${getSlideContentClasses()}`} data-slide-container>
      {children}
    </div>
  );
};
