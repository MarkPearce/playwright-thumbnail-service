import React from 'react';
import { TemplateDefinition, TwoColumnProps } from './types';
import { SlideContainer, SlideHeader, GridContainer, ResolvedContentColumn } from './shared';

export const TwoColumn: TemplateDefinition = {
  id: 'two_column',
  name: 'Two Column',
  description: 'Layout with title, subtitle, and two content columns',
  thumbnail: '/slide-templates/two_column.png',
  columnCount: 2,
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
      placeholder: 'Enter content for left column'
    },
    {
      name: 'column2',
      type: 'rich_text',
      required: true,
      defaultValue: '<p>Column 2 content...</p>',
      placeholder: 'Enter content for right column'
    }
  ],
  component: (props: TwoColumnProps) => {
    const { title, subtitle, column1, column2 } = props;
    
    return (
      <SlideContainer>
        <SlideHeader title={title || ''} subtitle={subtitle} />
        <GridContainer columns={2}>
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
        </GridContainer>
      </SlideContainer>
    );
  }
};
