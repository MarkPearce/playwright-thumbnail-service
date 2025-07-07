export interface ThumbnailOptions {
  width?: number;
  height?: number;
  deviceScaleFactor?: number;
  format?: 'png' | 'jpeg' | 'webp';
  quality?: number;
}

export interface ThumbnailRequest {
  component: string; // TSX component code as string
  props?: Record<string, any>;
  options?: ThumbnailOptions;
}

export interface SlideContent {
  type: 'keypoint' | 'detail' | 'media';
  content: string | MediaContent;
}

export interface MediaContent {
  component: string;
  props: {
    url: string;
    type?: string;
    caption?: string;
    htmlContent?: string;
  };
}

export interface ResolvedContent {
  content: SlideContent[];
  columnNumber?: number;
  totalColumns?: number;
}

export interface SlideProps {
  title?: string;
  subtitle?: string;
  content?: ResolvedContent;
  leftContent?: ResolvedContent;
  rightContent?: ResolvedContent;
  centerContent?: ResolvedContent;
  column1Content?: ResolvedContent;
  column2Content?: ResolvedContent;
  column3Content?: ResolvedContent;
  column4Content?: ResolvedContent;
  media?: MediaContent[];
  logoUrl?: string;
}
