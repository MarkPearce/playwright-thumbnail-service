/**
 * DEPRECATED: Content Resolver for Playwright Thumbnail Service
 * 
 * ⚠️ THIS FILE IS NO LONGER USED ⚠️
 * 
 * As of Phase 3 of the Article Processing & Thumbnail System Refactor,
 * all content resolution is done during canonical generation.
 * The Playwright service now receives pre-resolved renderData directly.
 * 
 * This file is kept for reference only and will be removed in Phase 5 (cleanup).
 * 
 * Migration notes:
 * - Content resolution now happens in src/domains/content/services/content-resolution/
 * - Canonical slides contain pre-resolved renderData field
 * - Thumbnail service receives and uses renderData directly without transformation
 */

// Original code preserved below for reference during migration

interface SimpleColumnContent {
  keyPoints?: string[];
  details?: string;
  media?: any;
}

interface SimpleResolvedContent {
  title?: string;
  subtitle?: string;
  [key: string]: any; // For column1, column2, etc.
}

interface ResolvedContentItem {
  type: 'keypoint' | 'detail' | 'media';
  content: string | any;
  styling?: {
    className?: string;
    bulletStyle?: 'bullet' | 'number' | 'none';
    textStyle?: 'body' | 'emphasis' | 'caption';
  };
}

interface ResolvedColumnContent {
  type: 'keypoints' | 'details' | 'media' | 'mixed';
  content: ResolvedContentItem[];
}

interface TemplateProps {
  title?: string;
  subtitle?: string;
  [key: string]: any;
}

export class ContentResolver {
  /**
   * @deprecated Use pre-resolved renderData from canonical slides instead
   */
  static formatResolvedContentForTemplate(resolvedContent: SimpleResolvedContent): TemplateProps {
    console.warn('⚠️ ContentResolver.formatResolvedContentForTemplate is deprecated. Content should be pre-resolved in canonical generation.');
    
    const templateProps: TemplateProps = {
      title: resolvedContent.title,
      subtitle: resolvedContent.subtitle
    };

    // Format each column's resolved content for template consumption
    ['column1', 'column2', 'column3', 'column4', 'content'].forEach(columnId => {
      const columnContent = resolvedContent[columnId] as SimpleColumnContent;
      if (columnContent) {
        const items: ResolvedContentItem[] = [];

        // Add keypoints
        if (columnContent.keyPoints && columnContent.keyPoints.length > 0) {
          columnContent.keyPoints.forEach(keyPoint => {
            items.push({
              type: 'keypoint',
              content: keyPoint,
              styling: { bulletStyle: 'bullet' }
            });
          });
        }

        // Add details
        if (columnContent.details) {
          items.push({
            type: 'detail',
            content: columnContent.details,
            styling: { textStyle: 'body' }
          });
        }

        // Add media
        if (columnContent.media) {
          items.push({
            type: 'media',
            content: columnContent.media
          });
        }

        // Determine content type
        const hasKeypoints = items.some(item => item.type === 'keypoint');
        const hasDetails = items.some(item => item.type === 'detail');
        const hasMedia = items.some(item => item.type === 'media');

        let type: 'keypoints' | 'details' | 'media' | 'mixed' = 'keypoints';
        if (hasKeypoints && hasDetails) type = 'mixed';
        else if (hasDetails && !hasKeypoints) type = 'details';
        else if (hasMedia && !hasKeypoints && !hasDetails) type = 'media';

        const resolvedColumnContent: ResolvedColumnContent = {
          type,
          content: items
        };

        templateProps[columnId] = resolvedColumnContent;
      }
    });

    return templateProps;
  }
}
