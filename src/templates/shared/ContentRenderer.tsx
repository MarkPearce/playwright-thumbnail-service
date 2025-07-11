import { ResolvedColumnContent, ResolvedContentItem, MediaItem, AdditionalMediaItem } from '../../types/slide';
import { MediaRenderer } from './MediaRenderer.js';
// Simple markdown parser replacement
const parseMarkdown = (text: string) => {
  return <div dangerouslySetInnerHTML={{ __html: text.replace(/\n/g, '<br>') }} />;
};

interface ContentRendererProps {
  resolvedContent?: ResolvedColumnContent | string;
  slideContent?: any;
  columnId?: string;
}

export const ContentRenderer = ({
  resolvedContent,
  slideContent,
  columnId
}: ContentRendererProps) => {
  
  // Render a single resolved content item using simplified styles
  const renderContentItem = (item: ResolvedContentItem, index: number) => {
    switch (item.type) {
      case 'keypoint':
        return (
          <li key={`keypoint-${index}`} className="flex items-start space-x-3" data-bullet-list-item>
            <p className="flex-shrink-0 text-lg md:text-xl lg:text-2xl xl:text-3xl 2xl:text-4xl font-bold text-cyan-600">•</p>
            <span className="flex-1 text-lg md:text-xl lg:text-2xl xl:text-3xl 2xl:text-4xl font-bold text-gray-800 leading-relaxed lg:leading-tight">{item.content as string}</span>
          </li>
        );
      
      case 'detail':
        return (
          <div key={`detail-${index}`} className="text-lg md:text-xl lg:text-2xl xl:text-3xl 2xl:text-4xl font-medium text-gray-800 leading-relaxed lg:leading-tight" data-detail>
            {parseMarkdown(item.content as string)}
          </div>
        );
      
      case 'media':
        const media = item.content as MediaItem;
        return (
          <div key={`media-${index}`} className="w-full" data-media-container>
            <MediaRenderer media={media} />
          </div>
        );
      
      default:
        return null;
    }
  };

  // Render all content items using simplified styles
  const renderContent = () => {
    const contentElements = [];

    // Handle resolved content if it exists
    if (resolvedContent && typeof resolvedContent !== 'string' && resolvedContent.content && resolvedContent.content.length > 0) {
      // Group content by type for better rendering
      const keyPoints = resolvedContent.content.filter(item => item.type === 'keypoint');
      const details = resolvedContent.content.filter(item => item.type === 'detail');
      const media = resolvedContent.content.filter(item => item.type === 'media');

      // Render key points as bullet list
      if (keyPoints.length > 0) {
        contentElements.push(
          <ul key="keypoints" className="space-y-2" data-bullet-list-container>
            {keyPoints.map((item, index) => renderContentItem(item, index))}
          </ul>
        );
      }

      // Render details as paragraphs
      if (details.length > 0) {
        contentElements.push(
          ...details.map((item, index) => renderContentItem(item, index))
        );
      }

      // Render media
      if (media.length > 0) {
        contentElements.push(
          ...media.map((item, index) => renderContentItem(item, index))
        );
      }
    }

    // Render additional media from "From other slides" - only for this column
    if (slideContent?.additional?.media && slideContent.additional.media.length > 0 && columnId) {
      const columnSpecificMedia = slideContent.additional.media.filter((mediaItem: AdditionalMediaItem) => 
        mediaItem.columnId === columnId
      );
      
      columnSpecificMedia.forEach((mediaItem: AdditionalMediaItem, index: number) => {
        contentElements.push(
          <div key={`additional-media-${columnId}-${index}`} className="w-full" data-media-container>
            <MediaRenderer media={mediaItem} />
          </div>
        );
      });
    }

    // If no content at all, return null
    if (contentElements.length === 0) {
      return null;
    }

    return (
      <div>
        {contentElements}
      </div>
    );
  };

  return renderContent();
};
