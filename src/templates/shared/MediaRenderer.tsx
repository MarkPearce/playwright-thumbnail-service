import { MediaItem } from '../../types/slide';
import { content } from './slideStyles.js';

interface MediaRendererProps {
  media: MediaItem;
}

export const MediaRenderer = ({ media }: MediaRendererProps) => {
  const handleImageError = (event: any) => {
    const img = event.currentTarget;
    console.error(`❌ Failed to load image: ${img.src}`);
    
    // Replace the image with an error message
    const errorDiv = document.createElement('div');
    errorDiv.className = 'p-4 border-2 border-red-200 bg-red-50 rounded-lg';
    errorDiv.innerHTML = `
      <div class="text-red-600 font-medium">Image Load Error</div>
      <div class="text-red-500 text-sm mt-1">Failed to load: ${img.src}</div>
    `;
    
    if (img.parentNode) {
      img.parentNode.replaceChild(errorDiv, img);
    }
  };

  if (media.component === 'ImageFigure') {
    const imageProps = media.props as any; // ImageFigureProps
    
    // Validate URL before rendering
    if (!imageProps.url || imageProps.url.trim() === '') {
      console.error(`❌ ImageFigure has empty URL:`, imageProps);
      return (
        <div className="p-4 border-2 border-red-200 bg-red-50 rounded-lg" data-media-error>
          <div className="text-red-600 font-medium">Image Error</div>
          <div className="text-red-500 text-sm mt-1">Missing image URL</div>
        </div>
      );
    }
    
    // Check if caption should be shown (default to true if not specified)
    const shouldShowCaption = (media as any).showCaption !== false;
    
    // If there's a caption and it should be shown, render as a figure element
    if (imageProps.caption && shouldShowCaption) {
      return (
        <figure className={content.media.figure.container} data-media-figure>
          <div className={`relative w-full h-full overflow-hidden ${content.media.frame}`}>
            <img 
              src={imageProps.url} 
              alt={imageProps.alt || 'Media content'}
              className="w-full h-full object-cover"
              style={{ objectPosition: 'center' }}
              data-media-image
              onError={handleImageError}
            />
          </div>
          <figcaption className={`${content.media.caption.base} ${content.media.caption.responsive}`} data-media-caption>
            {imageProps.caption}
          </figcaption>
        </figure>
      );
    } else {
      // No caption, render as simple image wrapper
      return (
        <div className={content.media.figure.container} data-media-wrapper>
          <div className={`relative w-full h-full overflow-hidden ${content.media.frame}`}>
            <img 
              src={imageProps.url} 
              alt={imageProps.alt || 'Media content'}
              className="w-full h-full object-cover"
              style={{ objectPosition: 'center' }}
              data-media-image
              onError={handleImageError}
            />
          </div>
        </div>
      );
    }
  } else if (media.component === 'CustomVideo') {
    const videoProps = media.props as any; // CustomVideoProps
    
    // Validate URL before rendering
    if (!videoProps.url || videoProps.url.trim() === '') {
      console.error(`❌ CustomVideo has empty URL:`, videoProps);
      return (
        <div className="p-4 border-2 border-red-200 bg-red-50 rounded-lg" data-media-error>
          <div className="text-red-600 font-medium">Video Error</div>
          <div className="text-red-500 text-sm mt-1">Missing video URL</div>
        </div>
      );
    }
    
    // Check if title should be shown (default to true if not specified)
    const shouldShowTitle = (media as any).showCaption !== false;
    
    // Check if it's a YouTube embed URL
    if (videoProps.url.includes('youtube') || videoProps.url.includes('youtu.be')) {
      return (
        <div className="w-full" data-media-wrapper>
          <iframe 
            src={videoProps.url}
            className={`${content.media.video.iframe.base} ${content.media.video.iframe.responsive}`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            onError={() => console.error(`❌ Failed to load video: ${videoProps.url}`)}
          />
          {videoProps.title && shouldShowTitle && (
            <figcaption className={`${content.media.caption.base} ${content.media.caption.responsive}`} data-media-caption>
              {videoProps.title}
            </figcaption>
          )}
        </div>
      );
    } else {
      // For direct video files, use video element
      return (
        <div className="w-full" data-media-wrapper>
          <video 
            src={videoProps.url}
            controls
            className={`${content.media.video.element.base} ${content.media.video.element.responsive}`}
            onError={() => console.error(`❌ Failed to load video: ${videoProps.url}`)}
          />
          {videoProps.title && shouldShowTitle && (
            <figcaption className={`${content.media.caption.base} ${content.media.caption.responsive}`} data-media-caption>
              {videoProps.title}
            </figcaption>
          )}
        </div>
      );
    }
  } else if (media.component === 'DataTable') {
    const tableProps = media.props as any; // DataTableProps
    
    // Validate HTML content before rendering
    if (!tableProps.htmlContent || tableProps.htmlContent.trim() === '') {
      console.error(`❌ DataTable has empty htmlContent:`, tableProps);
      return (
        <div className="p-4 border-2 border-red-200 bg-red-50 rounded-lg" data-media-error>
          <div className="text-red-600 font-medium">Table Error</div>
          <div className="text-red-500 text-sm mt-1">Missing table HTML content</div>
        </div>
      );
    }
    
    return (
      <div className="w-full overflow-x-auto" data-media-wrapper>
        <div 
          className="prose prose-sm max-w-none"
          dangerouslySetInnerHTML={{ __html: tableProps.htmlContent }}
          style={{
            '--tw-prose-th-color': '#334155',
            '--tw-prose-td-color': '#475569',
          } as any}
        />
        {tableProps.caption && (
          <div className={`${content.media.caption.base} ${content.media.caption.responsive}`}>
            {tableProps.caption}
          </div>
        )}
      </div>
    );
  }
  
  // Don't render anything for unsupported media types - let the error be visible
  console.error(`❌ Unsupported media component: ${media.component}`, media);
  return (
    <div className="p-4 border-2 border-red-200 bg-red-50 rounded-lg" data-media-error>
      <div className="text-red-600 font-medium">Media Error</div>
      <div className="text-red-500 text-sm mt-1">
        Unsupported media type: {media.component}
      </div>
    </div>
  );
};
