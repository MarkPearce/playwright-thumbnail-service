/**
 * Simplified Slide Styling System
 *
 * Type sizing is a single fluid root on the slide container plus em multiples
 * inside it. `--slide-scale` (measured step-down, see useSlideFitScale) and
 * `--slide-density-boost` (data-density) both fold into that one root, so every
 * type and type-proportional gap follows without breakpoint chains.
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
  // SERVICE DRIFT (deliberate, re-apply on every sync): md:h-full overflow-hidden
  // lg:h-auto lg:aspect-video pin the 16:9 box for fixed 1280x720 rendering.
  // The cq units resolve against #root, which entry.tsx makes a size container.
  base: 'w-full bg-white min-h-full md:h-full flex flex-col overflow-hidden lg:h-auto lg:aspect-video text-[length:calc(clamp(0.85rem,min(1.25cqw,2.22cqh),1.6rem)*var(--slide-scale,1)*var(--slide-density-boost,1))]',
  responsive: 'p-6 gap-[0.8em] md:px-8 md:pt-6 md:pb-8 lg:px-12 lg:pt-9 lg:pb-12 xl:px-16 xl:pt-12 xl:pb-16',
} as const;

// _________________Grid_________________________
export const grid = {
  container: 'flex-1',
  templates: {
    1: 'grid grid-cols-1 gap-3 md:gap-4 lg:gap-6',
    2: 'grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-3 md:gap-4 lg:gap-6',
    3: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 lg:gap-6',
    4: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-6',
  },
} as const;

// _________________Column_________________________
export const column = {
  base: 'relative flex flex-1 flex-col p-3',
  content: 'flex flex-col gap-[0.75em]',
} as const;

// _________________Typography_________________________
export const typography = {
  header: {
    title: {
      base: 'font-black tracking-tight text-cyan-700 leading-tight text-balance break-words hyphens-auto line-clamp-3',
      responsive: 'text-[2.6em]',
    },
    subtitle: {
      base: 'font-normal text-slate-500 text-balance break-words hyphens-auto line-clamp-2',
      responsive: 'text-[1.3em]',
    },
  },
  titleSlide: {
    title: {
      base: 'font-black tracking-tight text-cyan-700 leading-tight text-balance break-words hyphens-auto line-clamp-3',
      responsive: 'text-[4em]',
    },
    subtitle: {
      base: 'font-normal text-slate-500 text-balance break-words hyphens-auto line-clamp-2',
      responsive: 'text-[2em]',
    },
  },
} as const;

// _________________Content_________________________
export const content = {
  keypoint: {
    list: 'space-y-[0.7em]',
    item: 'flex items-start gap-[0.5em]',
    // dot is em-sized and carries the same font-size as the text so it scales with it
    bullet: 'flex-shrink-0 mt-[0.55em] h-[0.4em] w-[0.4em] rounded-full bg-cyan-600 text-[1.4em]',
    text: 'flex-1 text-[1.4em] font-medium text-slate-800 leading-snug break-words hyphens-auto',
  },
  detail: 'text-[1.4em] font-normal text-slate-700 leading-snug break-words hyphens-auto',
  media: {
    container: 'flex items-center justify-center',
    placeholder: 'flex items-center justify-center bg-slate-50 rounded-lg border-2 border-dashed border-slate-200',
    frame: 'rounded-lg',
    figure: {
      container: 'flex flex-col items-center justify-center',
      image: {
        base: 'w-full rounded-lg',
        responsive: 'h-auto',
      },
    },
    video: {
      container: 'w-full',
      iframe: {
        base: 'w-full rounded-lg border-0',
        responsive: 'aspect-video',
      },
      element: {
        base: 'w-full rounded-lg',
        responsive: 'h-auto',
      },
    },
    caption: {
      base: 'text-center max-w-full font-normal text-slate-500 mt-[0.35em]',
      responsive: 'text-[0.95em]',
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
  column,
  typography,
  content,
  editor,
  breakpoints: BREAKPOINTS,
} as const;

export type SlideStyleSystem = typeof SLIDE_STYLES;
export type ColumnCount = 1 | 2 | 3 | 4;
export type BreakpointKey = keyof typeof BREAKPOINTS;
