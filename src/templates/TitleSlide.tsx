import React from 'react';
import { TemplateDefinition } from './types';
import { SlideContainer, ImageContainer } from './shared';
import { SLIDE_STYLES } from './shared/slideStyles';

export const TitleSlide: TemplateDefinition = {
  id: 'title_slide',
  name: 'Title Slide',
  description: 'Title slide with background image and author information',
  thumbnail: '/slide-templates/title_slide.png',
  columnCount: 0, // Special layout without content columns
  fields: [
    {
      name: 'background_image',
      type: 'image_url',
      required: false,
      defaultValue: '/placeholder.webp',
      placeholder: 'Enter background image URL'
    },
    {
      name: 'title',
      type: 'text',
      required: true,
      defaultValue: 'Presentation Title',
      placeholder: 'Enter presentation title'
    },
    {
      name: 'subtitle',
      type: 'text',
      required: false,
      defaultValue: 'Subtitle',
      placeholder: 'Enter presentation subtitle'
    },
    {
      name: 'author',
      type: 'text',
      required: false,
      defaultValue: 'Author',
      placeholder: 'Enter author name'
    },
    {
      name: 'organization',
      type: 'text',
      required: false,
      defaultValue: 'Organization',
      placeholder: 'Enter organization name'
    }
  ],
  component: ({ 
    background_image, 
    title, 
    subtitle, 
    author, 
    organization
  }) => (
    <SlideContainer>
      {background_image && (
        <ImageContainer 
          src={background_image} 
          alt="Background" 
          className="absolute inset-0 w-full h-full object-contain opacity-20"
        />
      )}
      <div className="flex flex-col items-center justify-center flex-1 text-center px-12">
        <h1 className={`${SLIDE_STYLES.typography.titleSlide.title.base} ${SLIDE_STYLES.typography.titleSlide.title.responsive} mb-8`}>
          {title}
        </h1>
        {subtitle && (
          <h2 className={`${SLIDE_STYLES.typography.titleSlide.subtitle.base} ${SLIDE_STYLES.typography.titleSlide.subtitle.responsive}`}>
            {subtitle}
          </h2>
        )}
      </div>
      <div className="flex justify-center md:justify-end items-end pb-12">
        <div className="p-3 md:p-4 bg-white/75 rounded-lg flex flex-col gap-2 md:gap-3">
          <div className="text-slate-500 text-lg md:text-2xl font-bold font-lato">{author}</div>
          <div className="text-slate-500 text-lg md:text-2xl font-bold font-lato">{organization}</div>
        </div>
      </div>
    </SlideContainer>
  )
};
