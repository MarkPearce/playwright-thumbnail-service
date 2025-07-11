import { TemplateDefinition, FourColumnProps } from './types.js';
import { SlideContainer, SlideHeader, GridContainer, ResolvedContentColumn } from './shared/index.js';

export const FourColumn: TemplateDefinition = {
  id: 'four_column',
  name: 'Four Column',
  description: 'Layout with title, subtitle, and four content columns',
  thumbnail: '/slide-templates/four_column.png',
  columnCount: 4,
  fields: [
    {
      name: 'title',
      type: 'text',
      required: false,
      defaultValue: 'Title',
      placeholder: 'Enter slide title'
    },
    {
      name: 'subtitle',
      type: 'text',
      required: false,
      defaultValue: 'Subtitle',
      placeholder: 'Enter slide subtitle'
    },
    {
      name: 'column1',
      type: 'rich_text',
      required: true,
      defaultValue: '<p>Column 1 content...</p>',
      placeholder: 'Enter content for first column'
    },
    {
      name: 'column2',
      type: 'rich_text',
      required: true,
      defaultValue: '<p>Column 2 content...</p>',
      placeholder: 'Enter content for second column'
    },
    {
      name: 'column3',
      type: 'rich_text',
      required: true,
      defaultValue: '<p>Column 3 content...</p>',
      placeholder: 'Enter content for third column'
    },
    {
      name: 'column4',
      type: 'rich_text',
      required: true,
      defaultValue: '<p>Column 4 content...</p>',
      placeholder: 'Enter content for fourth column'
    }
  ],
  component: (props) => {
    // Type assertion since we know this template receives FourColumnProps
    const fourColumnProps = props as FourColumnProps;
    
    // Extract title and subtitle from props
    const title = fourColumnProps.title;
    const subtitle = fourColumnProps.subtitle;
    
    // Extract column data directly from resolved_content structure
    const column1 = fourColumnProps.column1;
    const column2 = fourColumnProps.column2;
    const column3 = fourColumnProps.column3;
    const column4 = fourColumnProps.column4;
    
    return (
      <SlideContainer>
        <SlideHeader title={title || ''} subtitle={subtitle} />
        <GridContainer columns={4}>
          <ResolvedContentColumn 
            resolvedContent={column1}
            columnNumber={1}
            columnId="column1"
          />
          <ResolvedContentColumn 
            resolvedContent={column2}
            columnNumber={2}
            columnId="column2"
          />
          <ResolvedContentColumn 
            resolvedContent={column3}
            columnNumber={3}
            columnId="column3"
          />
          <ResolvedContentColumn 
            resolvedContent={column4}
            columnNumber={4}
            columnId="column4"
          />
        </GridContainer>
      </SlideContainer>
    );
  }
};
