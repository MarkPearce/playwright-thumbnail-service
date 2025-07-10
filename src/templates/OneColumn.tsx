import { TemplateDefinition, OneColumnProps } from './types';
import { SlideContainer, SlideHeader, GridContainer, ResolvedContentColumn } from './shared/index.js';

export const OneColumn: TemplateDefinition = {
  id: 'one_column',
  name: 'One Column',
  description: 'Simple layout with title, subtitle, and single content area',
  thumbnail: '/slide-templates/one_column.png',
  columnCount: 1,
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
      defaultValue: '<p>Your content goes here...</p>',
      placeholder: 'Enter slide content'
    }
  ],
  component: (props: OneColumnProps) => {
    // Extract title and subtitle from props
    const title = props.title || '';
    const subtitle = props.subtitle;
    
    // Extract column data directly from resolved_content structure
    const column1 = props.column1;
    
    return (
      <SlideContainer>
        <SlideHeader title={title} subtitle={subtitle} />
        <GridContainer columns={1}>
          <ResolvedContentColumn 
            resolvedContent={column1}
            columnNumber={1}
            columnId="column1"
          />
        </GridContainer>
      </SlideContainer>
    );
  }
};
