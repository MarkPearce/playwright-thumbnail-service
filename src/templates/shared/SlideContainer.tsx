import { getSlideContainerClasses, getSlideContentClasses } from './slideStyleUtils.js';

interface SlideContainerProps {
  children: any;
  className?: string;
}

export const SlideContainer = ({ 
  children, 
  className = ''
}: SlideContainerProps) => {
  // Simplified version for thumbnail generation - no template context needed
  
  return (
    <div className={`${getSlideContainerClasses(className)} ${getSlideContentClasses()}`} data-slide-container>
      {children}
    </div>
  );
};
