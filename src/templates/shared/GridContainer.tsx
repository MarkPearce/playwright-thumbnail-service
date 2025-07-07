import React from 'react';
import { getGridClasses } from './slideStyleUtils';
import { type ColumnCount } from './slideStyles';

interface GridContainerProps {
  children: React.ReactNode;
  columns: ColumnCount;
  className?: string;
}

export const GridContainer: React.FC<GridContainerProps> = ({ 
  children, 
  columns,
  className = ''
}) => {
  return (
    <div className={`${getGridClasses(columns)} ${className}`} data-grid-container>
      {children}
    </div>
  );
};
