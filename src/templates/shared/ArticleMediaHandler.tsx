import { MediaItemWithSource, collectAllMediaItems, formatMediaItemLabel, PresentationData, AdditionalMediaItem } from './types.js';
import {
  initializeCanonicalContent
} from './ContentManagementUtils.js';

/**
 * Article Media Handler
 * Handles selection and management of media from other slides
 */

export const getArticleMediaOptions = (presentationData?: PresentationData) => {
  if (!presentationData) {
    return [];
  }
  
  const allMediaItems = collectAllMediaItems(presentationData);
  
  // If no media items found, return empty array (this prevents errors in dropdown)
  if (allMediaItems.length === 0) {
    console.log('📝 No media items found in presentation for article media options');
    return [];
  }
  
  return allMediaItems.map((mediaWithSource: MediaItemWithSource) => ({
    id: `slide-${mediaWithSource.sourceSlideId}-media-${mediaWithSource.slideSpecificIndex}`, // Use slide-specific index
    label: formatMediaItemLabel(mediaWithSource)
  }));
};

export const handleArticleMediaSelect = (
  articleMediaId: string,
  slideContent: any,
  columnId?: string,
  presentationData?: PresentationData,
  onMediaSelect?: (mediaItem: MediaItemWithSource) => void
) => {
  if (!onMediaSelect || !presentationData || !slideContent) {
    return;
  }

  // Parse the article media ID to get the source slide ID and index
  const match = articleMediaId.match(/^article-media-(.+)-(\d+)$/);
  if (!match) {
    console.error('Invalid article media ID format:', articleMediaId);
    return;
  }

  const [, sourceSlideId, indexStr] = match;
  const index = parseInt(indexStr, 10);

  // Get all media items and find the matching one
  const allMediaItems = collectAllMediaItems(presentationData);
  const mediaItem = allMediaItems.find((item: MediaItemWithSource, i: number) => 
    item.sourceSlideId === sourceSlideId && i === index
  );

  if (mediaItem) {
    // Initialize canonical/additional structure if needed
    initializeCanonicalContent(slideContent);
    
    // Ensure additional structure exists
    if (!slideContent.additional) {
      slideContent.additional = {
        keyPoints: [],
        details: [],
        media: []
      };
    }

    // Check if this specific media item is already selected in this column
    const existingIndex = slideContent.additional.media!.findIndex((item: AdditionalMediaItem) => 
      item.columnId === columnId && 
      item.source?.originalSlideId === sourceSlideId &&
      item.id === mediaItem.mediaItem.id
    );
    
    if (existingIndex !== -1) {
      // Item exists, remove it (deselect)
      slideContent.additional.media.splice(existingIndex, 1);
      console.log(`✅ Deselected media item from column ${columnId}:`, mediaItem.mediaItem.id);
    } else {
      // Item doesn't exist, but first remove any existing media from this column (swap behavior)
      // Remove all existing additional media for this column
      slideContent.additional.media = slideContent.additional.media.filter((item: AdditionalMediaItem) => 
        item.columnId !== columnId
      );
      
      // Add the new media item
      const additionalMediaItem: AdditionalMediaItem = {
        ...mediaItem.mediaItem,
        columnId: columnId || 'default',
        source: {
          type: 'external_slide',
          originalSlideId: sourceSlideId,
          originalChunkId: mediaItem.chunkId
        }
      };
      
      slideContent.additional.media.push(additionalMediaItem);
      console.log(`✅ Swapped to new media item in column ${columnId}:`, mediaItem.mediaItem.id);
    }
    
    // Always trigger the callback to notify of the change
    onMediaSelect(mediaItem);
  } else {
    console.error('Could not find media item for ID:', articleMediaId);
  }
};
