import React from 'react';
import { TemplateDefinition } from './types';
import { SlideContainer, SlideHeader, LogoContainer } from './shared';

export const LogoCard: TemplateDefinition = {
  id: 'logo_card',
  name: 'Logo Card',
  description: 'Simple card layout with logo, title, and subtitle',
  thumbnail: '/slide-templates/full_page.png',
  columnCount: 0, // Special layout without content columns
  fields: [
    {
      name: 'logo',
      type: 'image_url',
      required: true,
      defaultValue: '/amboss-logo.webp',
      placeholder: 'Enter logo URL'
    },
    {
      name: 'title',
      type: 'text',
      required: true,
      defaultValue: 'Card Title',
      placeholder: 'Enter card title'
    },
    {
      name: 'subtitle',
      type: 'text',
      required: false,
      defaultValue: 'Card Subtitle',
      placeholder: 'Enter card subtitle'
    },
    {
      name: 'background_color',
      type: 'color',
      required: false,
      defaultValue: '#ffffff',
      placeholder: 'Background color'
    }
  ],
  component: ({ 
    logo, 
    title, 
    subtitle, 
    background_color
  }) => (
    <SlideContainer>
      <div className="flex-1 flex flex-col justify-center items-center" style={{ backgroundColor: background_color }}>
        <LogoContainer src={logo} alt="Logo" className="w-12 h-12 md:w-16 md:h-16 mb-3 md:mb-4" />
        <SlideHeader title={title} subtitle={subtitle} className="text-center" />
      </div>
    </SlideContainer>
  )
};
