import { ResolvedColumnContent } from './slide';

/**
 * Standardized template props interface for all templates
 * This ensures consistency between main app and thumbnail service
 */

/**
 * Base props that all templates receive
 */
export interface BaseTemplateProps {
  title?: string;
  subtitle?: string;
}

/**
 * Props for title slide template
 */
export interface TitleSlideProps extends BaseTemplateProps {
  background_image?: string;
  author?: string;
  organization?: string;
}

/**
 * Props for column-based templates
 */
export interface ColumnTemplateProps extends BaseTemplateProps {
  column1?: ResolvedColumnContent;
  column2?: ResolvedColumnContent;
  column3?: ResolvedColumnContent;
  column4?: ResolvedColumnContent;
}

/**
 * Props for one column template
 */
export interface OneColumnProps extends BaseTemplateProps {
  column1?: ResolvedColumnContent;
}

/**
 * Props for two column template
 */
export interface TwoColumnProps extends BaseTemplateProps {
  column1?: ResolvedColumnContent;
  column2?: ResolvedColumnContent;
}

/**
 * Props for three column template
 */
export interface ThreeColumnProps extends BaseTemplateProps {
  column1?: ResolvedColumnContent;
  column2?: ResolvedColumnContent;
  column3?: ResolvedColumnContent;
}

/**
 * Props for four column template
 */
export interface FourColumnProps extends BaseTemplateProps {
  column1?: ResolvedColumnContent;
  column2?: ResolvedColumnContent;
  column3?: ResolvedColumnContent;
  column4?: ResolvedColumnContent;
}

/**
 * Props for logo card template
 */
export interface LogoCardProps {
  logo_url?: string;
  title?: string;
  subtitle?: string;
}

/**
 * Union type for all template props
 */
export type TemplateProps = 
  | TitleSlideProps 
  | OneColumnProps 
  | TwoColumnProps 
  | ThreeColumnProps 
  | FourColumnProps 
  | LogoCardProps;

/**
 * Type guard functions
 */
export function isTitleSlideProps(props: TemplateProps): props is TitleSlideProps {
  return 'background_image' in props || 'author' in props || 'organization' in props;
}

export function isColumnTemplateProps(props: TemplateProps): props is ColumnTemplateProps {
  return 'column1' in props || 'column2' in props || 'column3' in props || 'column4' in props;
}

export function isLogoCardProps(props: TemplateProps): props is LogoCardProps {
  return 'logo_url' in props;
}
