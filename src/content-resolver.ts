/**
 * Content Resolution Service for Playwright Thumbnail Service
 * Handles the resolution of slide content into template-ready format
 * Ported from main application's ContentResolver
 */

interface SlideContent {
  title?: string;
  subtitle?: string;
  keyPoints?: string[];
  details?: string;
  media?: any[];
  additional?: {
    keyPoints?: Array<{ id: string; text: string }>;
    details?: Array<{ id: string; text: string }>;
    userMedia?: Array<{ id: string; url: string; caption?: string; filename: string; showCaption?: boolean }>;
  };
}

interface ColumnAssignment {
  sourceKeyPoints: number[];
  userKeyPoints: string[];
  sourceDetails: boolean;
  userTextBlocks: string | null;
  sourceMedia: number | null;
  userMedia: number[];
}

interface ResolvedContentItem {
  type: 'keypoint' | 'detail' | 'media';
  content: string | any;
  styling?: {
    bulletStyle?: 'bullet' | 'number';
    textStyle?: 'body' | 'emphasis';
  };
}

interface ResolvedColumnContent {
  type: 'keypoints' | 'details' | 'media' | 'mixed';
  content: ResolvedContentItem[];
}

interface ResolvedSlideContent {
  title?: string;
  subtitle?: string;
  [key: string]: any; // For column1, column2, etc.
}

export class ContentResolver {
  /**
   * Create standardized 4-column assignments that remain consistent across templates
   */
  static createDefaultAssignments(content: SlideContent, templateId: string): Record<string, ColumnAssignment> {
    const keyPointCount = content.keyPoints?.length || 0;
    const hasDetails = !!(content.details && content.details.trim());
    const hasMedia = !!(content.media && content.media.length > 0);
    
    // Distribute key points across columns
    const keyPointsPerColumn = Math.ceil(keyPointCount / 4);
    const column1KeyPoints = content.keyPoints?.slice(0, keyPointsPerColumn).map((_, i) => i) || [];
    const column2KeyPoints = content.keyPoints?.slice(keyPointsPerColumn, keyPointsPerColumn * 2).map((_, i) => i + keyPointsPerColumn) || [];
    const column3KeyPoints = content.keyPoints?.slice(keyPointsPerColumn * 2, keyPointsPerColumn * 3).map((_, i) => i + keyPointsPerColumn * 2) || [];
    const column4KeyPoints = content.keyPoints?.slice(keyPointsPerColumn * 3).map((_, i) => i + keyPointsPerColumn * 3) || [];
    
    // Always return standardized 4-column assignments regardless of template
    return {
      column1: {
        sourceKeyPoints: column1KeyPoints,
        userKeyPoints: [],
        sourceDetails: false,
        userTextBlocks: null,
        sourceMedia: null,
        userMedia: []
      },
      column2: {
        sourceKeyPoints: column2KeyPoints,
        userKeyPoints: [],
        sourceDetails: false,
        userTextBlocks: null,
        sourceMedia: null,
        userMedia: []
      },
      column3: {
        sourceKeyPoints: column3KeyPoints,
        userKeyPoints: [],
        sourceDetails: hasDetails,
        userTextBlocks: null,
        sourceMedia: null,
        userMedia: []
      },
      column4: {
        sourceKeyPoints: column4KeyPoints,
        userKeyPoints: [],
        sourceDetails: false,
        userTextBlocks: null,
        sourceMedia: hasMedia ? 0 : null,
        userMedia: []
      }
    };
  }

  /**
   * Resolve slide content into template-ready format
   */
  static resolveSlideContent(
    content: SlideContent,
    columnAssignments: Record<string, ColumnAssignment>,
    templateId: string
  ): ResolvedSlideContent {
    const resolved: ResolvedSlideContent = {
      title: content.title,
      subtitle: content.subtitle
    };

    // Resolve each column assignment
    Object.entries(columnAssignments).forEach(([columnId, assignment]) => {
      const columnContent = this.resolveColumnContent(content, assignment);
      resolved[columnId] = columnContent;
    });

    return resolved;
  }

  /**
   * Convenience method to resolve content with default assignments
   */
  static resolveSlideContentWithDefaults(content: SlideContent, templateId: string): ResolvedSlideContent {
    const columnAssignments = this.createDefaultAssignments(content, templateId);
    return this.resolveSlideContent(content, columnAssignments, templateId);
  }

  /**
   * Resolve content for a specific column
   */
  private static resolveColumnContent(
    content: SlideContent,
    assignment: ColumnAssignment
  ): ResolvedColumnContent {
    const items: ResolvedContentItem[] = [];

    // Add source key points
    assignment.sourceKeyPoints.forEach(index => {
      if (content.keyPoints && content.keyPoints[index]) {
        items.push({
          type: 'keypoint',
          content: content.keyPoints[index],
          styling: { bulletStyle: 'bullet' }
        });
      }
    });

    // Add user key points (custom key points)
    if (assignment.userKeyPoints && assignment.userKeyPoints.length > 0 && content.additional?.keyPoints) {
      assignment.userKeyPoints.forEach(keyPointId => {
        const customKeyPoint = content.additional?.keyPoints?.find(kp => kp.id === keyPointId);
        if (customKeyPoint) {
          items.push({
            type: 'keypoint',
            content: customKeyPoint.text,
            styling: { bulletStyle: 'bullet' }
          });
        }
      });
    }

    // Add source details
    if (assignment.sourceDetails && content.details) {
      items.push({
        type: 'detail',
        content: content.details,
        styling: { textStyle: 'body' }
      });
    }

    // Add custom details (user-generated details)
    if (assignment.userTextBlocks && content.additional?.details) {
      const customDetail = content.additional.details.find(detail => detail.id === assignment.userTextBlocks);
      if (customDetail) {
        items.push({
          type: 'detail',
          content: customDetail.text,
          styling: { textStyle: 'body' }
        });
      }
    }

    // Add source media
    if (assignment.sourceMedia !== null && content.media && content.media[assignment.sourceMedia]) {
      items.push({
        type: 'media',
        content: content.media[assignment.sourceMedia]
      });
    }

    // Add user media
    if (assignment.userMedia && assignment.userMedia.length > 0 && content.additional?.userMedia) {
      assignment.userMedia.forEach(userMediaIndex => {
        const userMediaItem = content.additional?.userMedia?.[userMediaIndex];
        if (userMediaItem) {
          items.push({
            type: 'media',
            content: {
              id: userMediaItem.id,
              component: 'ImageFigure',
              key: `user-media-${userMediaItem.id}`,
              props: {
                type: 'figure',
                url: userMediaItem.url,
                caption: userMediaItem.showCaption !== false ? userMediaItem.caption : '',
                alt: userMediaItem.filename
              }
            }
          });
        }
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

    return {
      type,
      content: items
    };
  }
}
