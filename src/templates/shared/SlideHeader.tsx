import React from 'react';

interface SlideHeaderProps {
  title: string;
  subtitle?: string;
  showLogo?: boolean;
  className?: string;
}

export const SlideHeader: React.FC<SlideHeaderProps> = ({
  title,
  subtitle,
  showLogo = false,
  className = ""
}) => {
  return (
    <div className={`flex flex-col justify-start items-start ${className}`} data-slide-header>
      {showLogo && (
        <div className="mb-2 md:mb-4 lg:mb-6" data-logo-container>
          {/* Logo placeholder - can be replaced with actual logo component */}
          <div className="bg-blue-100 rounded-lg flex items-center justify-center w-10 h-10 md:w-12 md:h-12 lg:w-16 lg:h-16 xl:w-20 xl:h-20" data-logo-placeholder>
            <span className="text-blue-600 font-bold text-xs md:text-sm lg:text-base" data-logo-text>LOGO</span>
          </div>
        </div>
      )}
      
      <div className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl 2xl:text-6xl font-black text-cyan-600 leading-tight py-2" data-slide-title>
        {title}
      </div>
      
      {subtitle && (
        <div className="text-lg md:text-xl lg:text-xl xl:text-2xl 2xl:text-3xl font-medium text-slate-500 mb-4" data-slide-subtitle>
          {subtitle}
        </div>
      )}
    </div>
  );
};
