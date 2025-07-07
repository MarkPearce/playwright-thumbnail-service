import { 
  container, 
  grid, 
  editor 
} from './slideStyles';

// ============================================================================
// UTILITY FUNCTIONS - Simple functions for common slide styling needs
// ============================================================================

export const getSlideContainerClasses = (className = '') => {
  return `${container.base} ${className}`;
};

export const getSlideContentClasses = () => {
  return container.responsive;
};

export const getGridClasses = (columns: 1 | 2 | 3 | 4) => {
  return `${grid.container} ${grid.templates[columns]}`;
};

export const getColumnEditingClasses = (columnNumber: number, className = '') => {
  // Get the appropriate outline color for this column number
  const outlineColor = editor.columnOutlines[columnNumber as keyof typeof editor.columnOutlines] || editor.columnOutlines[1];
  return `${editor.editingOutline} ${outlineColor} ${className}`;
};

// Template utility functions for centralized styling
export const getSlideHeaderClasses = () => {
  return 'flex flex-col justify-start items-start';
};

export const getSlideColumnClasses = () => {
  return 'flex-1 flex flex-col space-y-6 p-3 relative';
};
