import { ReactNode } from 'react';
import type { 
  TitleSlideProps, 
  OneColumnProps, 
  TwoColumnProps, 
  ThreeColumnProps, 
  FourColumnProps,
  LogoCardProps,
  TemplateProps 
} from '../types/template-props';

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
  component: (props: TemplateProps) => ReactNode;
}

// Re-export standardized template props for convenience
export type {
  TitleSlideProps,
  OneColumnProps,
  TwoColumnProps,
  ThreeColumnProps,
  FourColumnProps,
  LogoCardProps,
  TemplateProps
};

// Layout registry interface for unified layout system
export interface LayoutDefinition {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  columnCount: number;
  template: TemplateDefinition;
}
