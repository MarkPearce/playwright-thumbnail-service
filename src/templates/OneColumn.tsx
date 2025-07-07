import { TemplateDefinition } from './types';
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
      name: 'content',
      type: 'rich_text',
      required: true,
      defaultValue: '<p>Your content goes here...</p>',
      placeholder: 'Enter slide content'
    }
  ],
  component: ({ 
    title, 
    subtitle, 
    content
  }) => {
            return (
      <SlideContainer>
        <SlideHeader title={title} subtitle={subtitle} />
        <GridContainer columns={1}>
          <ResolvedContentColumn 
            resolvedContent={content}
            columnNumber={1}
            columnId="content"
          />
        </GridContainer>
      </SlideContainer>
    );
  }
};
