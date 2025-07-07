import { TemplateDefinition } from './types';
import { SlideContainer, SlideHeader, GridContainer, ResolvedContentColumn } from './shared/index.js';

export const ThreeColumn: TemplateDefinition = {
  id: 'three_column',
  name: 'Three Column',
  description: 'Layout with title, subtitle, and three content columns',
  thumbnail: '/slide-templates/three_column.png',
  columnCount: 3,
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
    }
  ],
  component: ({ 
    title, 
    subtitle, 
    column1, 
    column2, 
    column3
  }) => {
            return (
      <SlideContainer>
        <SlideHeader title={title} subtitle={subtitle} />
        <GridContainer columns={3}>
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
        </GridContainer>
      </SlideContainer>
    );
  }
};
