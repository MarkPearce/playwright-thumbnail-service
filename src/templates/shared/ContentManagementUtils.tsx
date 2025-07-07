import { AdditionalMediaItem } from '@/types/slide';
import { ContentSelectionState } from "@/shared/components/ui/ui/content-selection-dropdown";

/**
 * Content Management Utilities
 * Helper functions for managing canonical/additional content structure
 */


// Helper functions to work with canonical/additional structure
export const initializeCanonicalContent = (slideContent: any) => {
  // If slide doesn't have canonical structure, migrate legacy data
  if (!slideContent.canonical && (slideContent.keyPoints || slideContent.details || slideContent.media)) {
    slideContent.canonical = {
      keyPoints: slideContent.keyPoints || [],
      details: slideContent.details || '',
      media: slideContent.media || []
    };
    slideContent.additional = {
      keyPoints: [],
      details: [],
      media: []
    };
  }
};

export const getAllKeyPoints = (slideContent: any) => {
  if (!slideContent) return [];
  
  initializeCanonicalContent(slideContent);
  
  const canonical = slideContent.canonical?.keyPoints || slideContent.keyPoints || [];
  const additional = slideContent.additional?.keyPoints || [];
  
  return [...canonical, ...additional.map((item: any) => item.text)];
};

export const getAllMedia = (slideContent: any) => {
  if (!slideContent) return [];
  
  initializeCanonicalContent(slideContent);
  
  const canonical = slideContent.canonical?.media || slideContent.media || [];
  const additional = slideContent.additional?.media || [];
  
  return [...canonical, ...additional];
};

export const getColumnMedia = (slideContent: any, columnId?: string) => {
  if (!slideContent || !columnId) return [];
  
  initializeCanonicalContent(slideContent);
  
  const canonical = slideContent.canonical?.media || slideContent.media || [];
  const columnSpecificAdditional = slideContent.additional?.media?.filter((item: AdditionalMediaItem) => 
    item.columnId === columnId
  ) || [];
  
  return [...canonical, ...columnSpecificAdditional];
};

export const getCanonicalMediaOnly = (slideContent: any) => {
  if (!slideContent) return [];
  
  initializeCanonicalContent(slideContent);
  
  return slideContent.canonical?.media || slideContent.media || [];
};

// Helper functions for editing mode
export const getKeyPointOptions = (slideContent: any) => {
  // Only get canonical/AMBOSS key points, not custom ones
  const canonicalKeyPoints = slideContent?.canonical?.keyPoints || slideContent?.keyPoints || [];
  
  if (canonicalKeyPoints.length === 0) {
    return [
      { id: 'keypoint-0', label: 'Key Point 1' },
      { id: 'keypoint-1', label: 'Key Point 2' },
      { id: 'keypoint-2', label: 'Key Point 3' },
      { id: 'keypoint-3', label: 'Key Point 4' },
    ];
  }
  
  return canonicalKeyPoints.map((point: string, index: number) => ({
    id: `keypoint-${index}`,
    label: `${index + 1}. ${point.substring(0, 40)}...`
  }));
};


export const getMediaOptions = (slideContent: any) => {
  const canonicalMedia = getCanonicalMediaOnly(slideContent);
  
  if (canonicalMedia.length === 0) {
    return [];
  }
  
  return canonicalMedia.map((item: any, index: number) => ({
    id: `media-${index}`,
    label: `${item.component || 'Media'} ${index + 1}`
  }));
};

// Get custom key point options for the dropdown
export const getCustomKeyPointOptions = (slideContent: any) => {
  console.log('🔍 getCustomKeyPointOptions called with slideContent:', {
    hasSlideContent: !!slideContent,
    hasAdditional: !!slideContent?.additional,
    hasKeyPoints: !!slideContent?.additional?.keyPoints,
    keyPointsLength: slideContent?.additional?.keyPoints?.length || 0,
    keyPoints: slideContent?.additional?.keyPoints,
    fullSlideContent: slideContent
  });
  
  if (!slideContent?.additional?.keyPoints || slideContent.additional.keyPoints.length === 0) {
    console.log('🔍 No custom key points found in slideContent.additional.keyPoints');
    return [];
  }
  
  const options = slideContent.additional.keyPoints.map((keyPoint: any) => ({
    id: keyPoint.id,
    label: keyPoint.text.length > 40 ? `${keyPoint.text.substring(0, 40)}...` : keyPoint.text
  }));
  
  console.log('🔍 getCustomKeyPointOptions returning:', options);
  
  return options;
};

// Get custom detail options for the dropdown
export const getCustomDetailOptions = (slideContent: any) => {
  if (!slideContent?.additional?.details) {
    return [];
  }
  
  return slideContent.additional.details.map((detail: any) => ({
    id: detail.id,
    label: detail.text.length > 24 ? `${detail.text.substring(0, 24)}...` : detail.text
  }));
};

// Get custom media options for the dropdown
export const getCustomMediaOptions = (slideContent: any) => {
  const options = [];
  
  // Include media from additional.media (external media from other slides)
  if (slideContent?.additional?.media) {
    slideContent.additional.media.forEach((media: any) => {
      options.push({
        id: media.id,
        label: `${media.component || 'Custom Media'}`
      });
    });
  }
  
  // Include user-uploaded media from additional.userMedia
  if (slideContent?.additional?.userMedia) {
    slideContent.additional.userMedia.forEach((media: any) => {
      options.push({
        id: `user-media-${media.id}`,
        label: media.caption || media.filename || 'Uploaded Image'
      });
    });
  }
  
  return options;
};

// Duplicate detection functions
export const isMediaDuplicate = (mediaItem: any, existingMedia: any): boolean => {
  // Compare by component type and key properties
  if (mediaItem.component !== existingMedia.component) {
    return false;
  }
  
  // For images, compare URL and caption
  if (mediaItem.component === 'ImageFigure') {
    return mediaItem.props?.url === existingMedia.props?.url &&
           mediaItem.props?.caption === existingMedia.props?.caption;
  }
  
  // For videos, compare URL
  if (mediaItem.component === 'CustomVideo') {
    return mediaItem.props?.url === existingMedia.props?.url;
  }
  
  // For tables, compare HTML content and caption
  if (mediaItem.component === 'DataTable') {
    return mediaItem.props?.htmlContent === existingMedia.props?.htmlContent &&
           mediaItem.props?.caption === existingMedia.props?.caption;
  }
  
  // For other types, compare by key if available
  return mediaItem.key === existingMedia.key;
};

export const isKeyPointDuplicate = (keyPoint: string, existingKeyPoints: string[]): boolean => {
  return existingKeyPoints.includes(keyPoint);
};

export const isDetailsDuplicate = (details: string, existingDetails: string): boolean => {
  return details === existingDetails;
};
