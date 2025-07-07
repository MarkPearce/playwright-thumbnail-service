// Shared types for template components

export interface MediaItemWithSource {
  mediaItem: any;
  sourceSlideId: string;
  chunkId: string;
  slideSpecificIndex: number;
}

export interface PresentationData {
  slides: any[];
}

export interface ContentSelectionState {
  selectedItems: string[];
  isOpen: boolean;
}

export interface AdditionalMediaItem {
  id: string;
  component: string;
  props?: any;
  columnId: string;
  source?: {
    type: string;
    originalSlideId: string;
    originalChunkId: string;
  };
}

// Helper function to collect all media items from presentation data
export const collectAllMediaItems = (presentationData: PresentationData): MediaItemWithSource[] => {
  const allMediaItems: MediaItemWithSource[] = [];
  
  if (!presentationData?.slides) {
    return allMediaItems;
  }
  
  presentationData.slides.forEach((slide, slideIndex) => {
    if (slide.media && Array.isArray(slide.media)) {
      slide.media.forEach((mediaItem: any, mediaIndex: number) => {
        allMediaItems.push({
          mediaItem,
          sourceSlideId: slide.id || `slide-${slideIndex}`,
          chunkId: `chunk-${mediaIndex}`,
          slideSpecificIndex: mediaIndex
        });
      });
    }
  });
  
  return allMediaItems;
};

// Helper function to format media item labels
export const formatMediaItemLabel = (mediaWithSource: MediaItemWithSource): string => {
  const { mediaItem } = mediaWithSource;
  
  if (mediaItem.component === 'ImageFigure') {
    return mediaItem.props?.caption || 'Image';
  }
  
  if (mediaItem.component === 'CustomVideo') {
    return 'Video';
  }
  
  if (mediaItem.component === 'DataTable') {
    return mediaItem.props?.caption || 'Table';
  }
  
  return mediaItem.component || 'Media';
};
