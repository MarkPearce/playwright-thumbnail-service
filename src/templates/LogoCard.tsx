import { TemplateDefinition, LogoCardProps } from './types.js';
import { SlideContainer, SlideHeader, LogoContainer } from './shared/index.js';

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
  component: (props) => {
    // Type assertion since we know this template receives LogoCardProps
    const logoCardProps = props as LogoCardProps;
    
    const logo = logoCardProps.logo_url;
    const title = logoCardProps.title;
    const subtitle = logoCardProps.subtitle;
    const background_color = logoCardProps.background_color;
    
    return (
      <SlideContainer>
        <div className="flex-1 flex flex-col justify-center items-center" style={{ backgroundColor: background_color }}>
          {logo && <LogoContainer src={logo} alt="Logo" className="w-12 h-12 md:w-16 md:h-16 mb-3 md:mb-4" />}
          <SlideHeader title={title || ''} subtitle={subtitle} className="text-center" />
        </div>
      </SlideContainer>
    );
  }
};
