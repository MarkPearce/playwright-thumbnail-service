/**
 * Simplified Slide Styling System
 * 
 * This file defines basic responsive styles for slide templates.
 * Components now use direct Tailwind classes for better maintainability.
 */

export const BREAKPOINTS = {
  mobile: '< 768px',
  tablet: '≥ 768px (md)',
  desktop: '≥ 1024px (lg)', 
  large: '≥ 1280px (xl)',
  xlarge: '≥ 1536px (2xl)',
} as const;

// _________________Container_________________________
export const container = {
  base: 'w-full bg-white min-h-full md:h-full flex flex-col overflow-hidden lg:h-auto lg:aspect-video',
  responsive: 'p-6 gap-3 md:px-8 md:pt-6 md:pb-8 md:gap-4 lg:px-12 lg:pt-9 lg:pb-12 xl:px-16 xl:pt-12 xl:pb-16 2xl:gap-6',
} as const;

// _________________Grid_________________________
export const grid = {
  container: 'flex-1',
  templates: {
    1: 'grid grid-cols-1 gap-3 md:gap-4 lg:gap-4',
    2: 'grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-3 md:gap-4 lg:gap-4',
    3: 'grid grid-cols-1 md:grid-cols-1 lg:grid-cols-3 gap-3 md:gap-4 lg:gap-4',
    4: 'grid grid-cols-1 md:grid-cols-1 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-4',
  },
} as const;

// _________________Typography_________________________
export const typography = {
  titleSlide: {
    title: {
      base: 'font-black text-cyan-600 leading-tight text-balance',
      responsive: 'text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl',
    },
    subtitle: {
      base: 'font-medium text-slate-500 text-balance',
      responsive: 'text-xl md:text-2xl lg:text-2xl xl:text-3xl 2xl:text-4xl',
    },
  },
} as const;

// _________________Content_________________________
export const content = {
  media: {
    container: 'flex items-center justify-center',
    placeholder: 'flex items-center justify-center bg-gray-100 rounded-lg border-2 border-dashed border-gray-300',
    figure: {
      container: 'flex flex-col items-center justify-center',
      image: {
        base: 'w-full object-contain rounded shadow',
        responsive: 'h-auto',
      },
    },
    video: {
      container: 'w-full',
      iframe: {
        base: 'w-full rounded shadow border-0',
        responsive: 'aspect-video',
      },
      element: {
        base: 'w-full rounded shadow',
        responsive: 'h-auto',
      },
    },
    caption: {
      base: 'text-center max-w-full font-medium text-gray-600 mt-2',
      responsive: 'text-base md:text-lg lg:text-xl xl:text-2xl 2xl:text-3xl',
    },
    table: {
      container: 'flex flex-col bg-gray-50 rounded-lg',
      wrapper: 'relative w-full overflow-auto',
      element: 'w-full caption-bottom text-sm',
      header: '[&_tr]:border-b',
      body: '[&_tr:last-child]:border-0',
      footer: 'border-t bg-muted/50 font-medium [&>tr]:last:border-b-0',
      row: 'border-b transition-colors hover:bg-muted/50',
      headerCell: 'h-12 px-4 text-left align-middle font-medium text-muted-foreground',
      cell: 'p-4 align-middle',
      responsive: {
        text: 'text-xs md:text-sm lg:text-base',
        padding: '',
        headerHeight: 'h-8 md:h-10 lg:h-12',
      },
    },
  },
} as const;

// _________________Editor_________________________
export const editor = {
  columnOutlines: {
    1: 'outline-purple-400',
    2: 'outline-orange-400', 
    3: 'outline-pink-400',
    4: 'outline-indigo-400',
  },
  editingOutline: 'rounded-lg outline-dashed outline-2 outline-offset-0',
  selectionButton: 'absolute top-2 left-2 w-8 h-8 bg-blue-500 hover:bg-blue-600 text-white rounded-full flex items-center justify-center cursor-pointer z-10 shadow-md',
} as const;

export const SLIDE_STYLES = {
  container,
  grid,
  typography,
  content,
  editor,
  breakpoints: BREAKPOINTS,
} as const;

export type SlideStyleSystem = typeof SLIDE_STYLES;
export type ColumnCount = 1 | 2 | 3 | 4;
export type BreakpointKey = keyof typeof BREAKPOINTS;
