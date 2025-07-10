import { TemplateDefinition, TitleSlideProps } from './types.js';
import { SlideContainer, ImageContainer } from './shared/index.js';

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
      <div className="flex flex-col items-center justify-center flex-1 text-center px-12">
        <h1 className="font-black text-cyan-600 leading-tight text-balance text-5xl md:text-6xl lg:text-7xl xl:text-8xl 2xl:text-9xl mb-8">
          {title}
        </h1>
        {subtitle && (
          <h2 className="font-medium text-slate-500 text-balance text-2xl md:text-3xl lg:text-4xl xl:text-5xl 2xl:text-6xl">
            {subtitle}
          </h2>
        )}
      </div>
      {(author || organization) && (
        <div className="flex justify-center md:justify-end items-end pb-12">
          <div className="p-3 md:p-4 bg-white/75 rounded-lg flex flex-col gap-2 md:gap-3">
            {author && <div className="text-slate-500 text-lg md:text-2xl font-bold font-lato">{author}</div>}
            {organization && <div className="text-slate-500 text-lg md:text-2xl font-bold font-lato">{organization}</div>}
          </div>
        </div>
      )}
    </SlideContainer>
    );
  }
};
