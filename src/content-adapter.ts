/**
 * Content Adapter for transforming Edge Function data to template format
 * 
 * The Edge Function sends data in this format:
 * {
 *   templateId: "two_column",
 *   props: {
 *     title: "...",
 *     subtitle: "...",
 *     content: [
 *       {type: "text", content: "...", position: {x: 0, width: 50}},
 *       {type: "text", content: "...", position: {x: 50, width: 50}}
 *     ]
 *   }
 * }
 * 
 * But templates expect:
 * {
 *   title: "...",
 *   subtitle: "...", 
 *   column1: {content: [...]},
 *   column2: {content: [...]}
 * }
 */

interface ContentItem {
  type: 'text' | 'image' | 'list' | 'table' | 'chart';
  content: string | string[] | Record<string, any>;
  style?: {
    fontSize?: string;
    fontWeight?: string;
    color?: string;
    alignment?: 'left' | 'center' | 'right';
    margin?: string;
    padding?: string;
  };
  position?: {
    x?: number;
    y?: number;
    width?: number;
    height?: number;
  };
}

interface EdgeFunctionProps {
  title?: string;
  subtitle?: string;
  content: ContentItem[];
  theme?: {
    primaryColor?: string;
    secondaryColor?: string;
    backgroundColor?: string;
    textColor?: string;
  };
  layout?: {
    columns?: number;
    spacing?: string;
    padding?: string;
  };
}

interface ResolvedContentItem {
  type: 'keypoint' | 'detail' | 'media';
  content: string;
  styling?: any;
}

interface ResolvedContent {
  content: ResolvedContentItem[];
  type?: string;
}

/**
 * Transform Edge Function content format to template format
 */
export function adaptContentForTemplate(templateId: string, props: EdgeFunctionProps): any {
  console.log('🔄 Adapting content for template:', templateId);
  console.log('📋 Input props:', JSON.stringify(props, null, 2));
  
  // Handle title slide - no adaptation needed
  if (templateId === 'title_slide') {
    return {
      title: props.title,
      subtitle: props.subtitle
    };
  }
  
  // For column-based templates, we need to transform the content array
  const adaptedProps: any = {
    title: props.title,
    subtitle: props.subtitle
  };
  
  if (props.content && Array.isArray(props.content)) {
    // Group content by column based on position.x
    const columnGroups = groupContentByColumn(props.content, templateId);
    
    // Convert to template format
    Object.entries(columnGroups).forEach(([columnKey, items]) => {
      adaptedProps[columnKey] = {
        content: items.map(item => convertToResolvedContentItem(item)),
        type: determineColumnType(items)
      };
    });
  }
  
  console.log('✅ Adapted props:', JSON.stringify(adaptedProps, null, 2));
  return adaptedProps;
}

/**
 * Group content items by column based on position.x
 */
function groupContentByColumn(content: ContentItem[], templateId: string): Record<string, ContentItem[]> {
  const columnCount = getColumnCount(templateId);
  const groups: Record<string, ContentItem[]> = {};
  
  // Initialize column groups
  for (let i = 1; i <= columnCount; i++) {
    groups[`column${i}`] = [];
  }
  
  content.forEach(item => {
    if (item.position?.x !== undefined) {
      // Determine which column based on x position
      const columnIndex = Math.floor((item.position.x / 100) * columnCount) + 1;
      const columnKey = `column${Math.min(columnIndex, columnCount)}`;
      groups[columnKey].push(item);
    } else {
      // No position specified, add to first column
      groups.column1.push(item);
    }
  });
  
  return groups;
}

/**
 * Convert ContentItem to ResolvedContentItem format
 */
function convertToResolvedContentItem(item: ContentItem): ResolvedContentItem {
  // Determine type based on content
  let type: 'keypoint' | 'detail' | 'media' = 'detail';
  
  if (typeof item.content === 'string') {
    if (item.content.startsWith('•') || item.content.startsWith('-')) {
      type = 'keypoint';
    } else if (item.content.length > 100) {
      type = 'detail';
    } else {
      type = 'keypoint';
    }
  }
  
  if (item.type === 'image') {
    type = 'media';
  }
  
  return {
    type,
    content: typeof item.content === 'string' ? item.content : JSON.stringify(item.content),
    styling: item.style ? {
      bulletStyle: type === 'keypoint' ? 'bullet' : undefined,
      textStyle: type === 'detail' ? 'body' : undefined,
      ...item.style
    } : undefined
  };
}

/**
 * Determine column type based on content
 */
function determineColumnType(items: ContentItem[]): string {
  const hasKeypoints = items.some(item => 
    typeof item.content === 'string' && 
    (item.content.startsWith('•') || item.content.startsWith('-'))
  );
  const hasDetails = items.some(item => 
    typeof item.content === 'string' && 
    item.content.length > 100
  );
  const hasMedia = items.some(item => item.type === 'image');
  
  if (hasKeypoints && hasDetails) return 'mixed';
  if (hasKeypoints) return 'keypoints';
  if (hasDetails) return 'details';
  if (hasMedia) return 'media';
  return 'mixed';
}

/**
 * Get column count for template
 */
function getColumnCount(templateId: string): number {
  switch (templateId) {
    case 'one_column': return 1;
    case 'two_column': return 2;
    case 'three_column': return 3;
    case 'four_column': return 4;
    default: return 2;
  }
}
