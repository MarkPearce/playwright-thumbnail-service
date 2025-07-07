import React from 'react';
import { getSlideColumnClasses } from './slideStyleUtils';
import { ContentRenderer } from './ContentRenderer';

interface ResolvedContentColumnProps {
  resolvedContent?: any;
  columnNumber?: number;
  className?: string;
  columnId: string;
}

export const ResolvedContentColumn: React.FC<ResolvedContentColumnProps> = ({ 
  resolvedContent,
  columnNumber = 1,
  className = '',
  columnId
}) => {
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
