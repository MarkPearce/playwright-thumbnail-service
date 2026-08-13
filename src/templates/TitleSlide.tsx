import { TemplateDefinition, TitleSlideProps } from './types.js';
import { SlideContainer, ImageContainer } from './shared/index.js';
import { typography } from './shared/slideStyles.js';

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
  component: (props: TitleSlideProps) => {
    const { background_image, title, subtitle, author, organization } = props;
    
    return (
    <SlideContainer>
      {background_image && (
        <ImageContainer 
          src={background_image} 
          alt="Background" 
          className="absolute inset-0 w-full h-full opacity-20"
          objectFit="cover"
          objectPosition="center"
        />
      )}
      <div className="flex flex-col items-center justify-center flex-1 text-center px-6 md:px-12">
        <h1 className={`${typography.titleSlide.title.base} ${typography.titleSlide.title.responsive} mb-[0.25em]`}>
          {title}
        </h1>
        {subtitle && (
          <h2 className={`${typography.titleSlide.subtitle.base} ${typography.titleSlide.subtitle.responsive}`}>
            {subtitle}
          </h2>
        )}
      </div>
      {(author || organization) && (
        <div className="flex justify-center md:justify-end items-end pb-6 md:pb-12">
          <div className="px-4 py-3 md:px-5 md:py-4 bg-white/85 rounded-lg flex flex-col gap-1">
            {author && <div className="text-slate-700 text-[1.15em] font-bold">{author}</div>}
            {organization && <div className="text-slate-500 text-[1.15em] font-normal">{organization}</div>}
          </div>
        </div>
      )}
    </SlideContainer>
    );
  }
};
