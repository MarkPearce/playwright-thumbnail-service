/**
 * Basic Slide Data Model
 * Minimal types needed for template testing
 */

// Base slide types - Simplified to AMBOSS vs Custom content
export type SlideType = 'amboss' | 'custom';

// Media types
export interface MediaItem {
  id: string;
  component: 'ImageFigure' | 'CustomVideo' | 'DataTable';
  props: ImageFigureProps | CustomVideoProps | DataTableProps;
  key: string;
  sourceInfo?: {
    type: 'external_slide';
    sourceSlideId: string;
    originalId: string;
    originalKey: string;
  };
}

export interface ImageFigureProps {
  type: 'figure';
  url: string;
  alt?: string;
  caption: string;
  htmlContent?: string;
}

export interface CustomVideoProps {
  type: 'video';
  url: string;
  alt?: string;
  caption?: string;
  title?: string;
}

export interface DataTableProps {
  type: 'table';
  url?: string;
  caption?: string;
  htmlContent: string;
}

// Additional content items with source tracking
export interface AdditionalKeyPoint {
  id: string;
  text: string;
  source: {
    type: 'external_slide' | 'user_generated';
    originalSlideId?: string;
    originalChunkId?: string;
    createdAt?: Date;
  };
}

export interface AdditionalDetail {
  id: string;
  text: string;
  source: {
    type: 'external_slide' | 'user_generated';
    originalSlideId?: string;
    originalChunkId?: string;
    createdAt?: Date;
  };
}

export interface AdditionalMediaItem extends MediaItem {
  columnId: string; // Which column this media item belongs to
  source: {
    type: 'external_slide' | 'user_generated' | 'user_uploaded';
    originalSlideId?: string;
    originalChunkId?: string;
    uploadedAt?: Date;
  };
}

// User-uploaded media item
export interface UserMediaItem {
  id: string;
  url: string;
  caption: string;
  filename: string;
  mimeType: string;
  uploadedAt: Date;
  showCaption?: boolean;  // Whether to show caption on slide (default: true)
}

// Core slide content structure
export interface SlideContent {
  title: string;
  subtitle?: string;
  
  // Original canonical content (immutable, for revert capability)
  canonical?: {
    keyPoints?: string[];
    details?: string;
    media?: MediaItem[];
  };
  
  // All additional content (cross-slide + user-generated)
  additional?: {
    keyPoints?: AdditionalKeyPoint[];
    details?: AdditionalDetail[];
    media?: AdditionalMediaItem[];
    userMedia?: UserMediaItem[];        // User-uploaded media (NEW)
  };
  
  // Legacy fields for backward compatibility
  keyPoints?: string[];
  details?: string;
  media?: MediaItem[];
}

// Column assignment configuration for layouts
export interface ColumnAssignment {
  sourceKeyPoints: number[];
  userKeyPoints: string[]; // Changed to string[] to store custom key point IDs
  sourceDetails: boolean;
  userTextBlocks: string | null; // Changed to string | null to store single custom detail ID
  sourceMedia: number | null;
  userMedia: number[];
}

// Output configuration for slide rendering
export interface SlideOutputConfig {
  columnAssignments: Record<string, ColumnAssignment>;
}

// Base slide model
export interface Slide {
  id: string;
  type: SlideType;
  layout_id?: string;
  created_at: string;
  last_modified_at: string;
  content: SlideContent;
  resolved_content?: ResolvedSlideContent;
  output_config?: SlideOutputConfig;
  thumbnail_url?: string;
  thumbnail_generated_at?: string;
  metadata?: Record<string, any>;
}

// Resolved content structure for consistent rendering
export interface ResolvedSlideContent {
  title: string;
  subtitle?: string;
  column1?: ResolvedColumnContent;
  column2?: ResolvedColumnContent;
  column3?: ResolvedColumnContent;
  column4?: ResolvedColumnContent;
  content?: ResolvedColumnContent;
}

export interface ResolvedColumnContent {
  type: 'keypoints' | 'details' | 'media' | 'mixed';
  content: ResolvedContentItem[];
}

export interface ResolvedContentItem {
  type: 'keypoint' | 'detail' | 'media';
  content: string | MediaItem;
  styling?: ContentStyling;
}

export interface ContentStyling {
  className?: string;
  bulletStyle?: 'bullet' | 'number' | 'none';
  textStyle?: 'body' | 'emphasis' | 'caption';
}
