import { getSlideColumnClasses } from './slideStyleUtils.js';
import { ContentRenderer } from './ContentRenderer.js';

interface ResolvedContentColumnProps {
  resolvedContent?: any;
  columnNumber?: number;
  className?: string;
  columnId: string;
}

export const ResolvedContentColumn = ({ 
  resolvedContent,
  className = '',
  columnId
}: ResolvedContentColumnProps) => {
  // Simplified version for thumbnail generation - no editing functionality
  
  return (
    <div className={`${getSlideColumnClasses()} ${className}`} data-content-column>
      <ContentRenderer 
        resolvedContent={resolvedContent}
        slideContent={null}
        columnId={columnId}
      />
    </div>
  );
};
