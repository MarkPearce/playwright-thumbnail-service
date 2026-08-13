import { typography } from './slideStyles.js';

interface SlideHeaderProps {
  title: string;
  subtitle?: string;
  showLogo?: boolean;
  className?: string;
}

export const SlideHeader = ({
  title,
  subtitle,
  showLogo = false,
  className = ""
}: SlideHeaderProps) => {
  return (
    <div className={`flex flex-col ${className}`} data-slide-header>
      {showLogo && (
        <div className="mb-2 md:mb-4 lg:mb-6" data-logo-container>
          {/* Logo placeholder - can be replaced with actual logo component */}
          <div className="bg-blue-100 rounded-lg flex items-center justify-center w-10 h-10 md:w-12 md:h-12 lg:w-16 lg:h-16 xl:w-20 xl:h-20" data-logo-placeholder>
            <span className="text-blue-600 font-bold text-xs md:text-sm lg:text-base" data-logo-text>LOGO</span>
          </div>
        </div>
      )}
      
      {/* line-clamp brings overflow:hidden with it; the padding keeps descenders off the clip edge */}
      <div className={`${typography.header.title.base} ${typography.header.title.responsive} py-[0.06em]`} data-slide-title>
        {title}
      </div>

      {subtitle && (
        <div className={`${typography.header.subtitle.base} ${typography.header.subtitle.responsive} mt-[0.3em]`} data-slide-subtitle>
          {subtitle}
        </div>
      )}
    </div>
  );
};
