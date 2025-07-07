import { getGridClasses } from './slideStyleUtils.js';
import { type ColumnCount } from './slideStyles.js';

interface GridContainerProps {
  children: any;
  columns: ColumnCount;
  className?: string;
}

export const GridContainer = ({ 
  children, 
  columns,
  className = ''
}: GridContainerProps) => {
  return (
    <div className={`${getGridClasses(columns)} ${className}`} data-grid-container>
      {children}
    </div>
  );
};
