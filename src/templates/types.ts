import { ReactNode } from 'react';

export interface TemplateField {
  name: string;
  type: 'text' | 'rich_text' | 'image_url' | 'color';
  required: boolean;
  defaultValue?: string;
  placeholder?: string;
}

export interface TemplateDefinition {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  fields: TemplateField[];
  columnCount: number; // Number of content columns (0 for special layouts like title_slide)
  component: (props: TemplateRenderProps) => ReactNode;
}

export interface TemplateRenderProps {
  // Template field values - only layout-specific data
  [key: string]: any;
  
  // Note: Editor functionality is now provided via TemplateContext
  // Templates should use useTemplateContext() for editor operations
}

export interface TemplateProps {
  [key: string]: any;
}

// Layout registry interface for unified layout system
export interface LayoutDefinition {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  columnCount: number;
  template: TemplateDefinition;
}
