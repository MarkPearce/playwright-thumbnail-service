import React from 'react';

// Import all templates
import { OneColumn } from './templates/OneColumn';
import { TwoColumn } from './templates/TwoColumn';
import { ThreeColumn } from './templates/ThreeColumn';
import { FourColumn } from './templates/FourColumn';
import { TitleSlide } from './templates/TitleSlide';
import { LogoCard } from './templates/LogoCard';

// Map of template names to their components
const templateMap: Record<string, any> = {
  'one_column': OneColumn,
  'two_column': TwoColumn,
  'three_column': ThreeColumn,
  'four_column': FourColumn,
  'title_slide': TitleSlide,
  'logo_card': LogoCard
};

// Function to get the component for a template
export function getTemplateComponent(templateId: string) {
  const template = templateMap[templateId];
  if (!template) {
    throw new Error(`Template ${templateId} not found`);
  }
  
  // Return the component function directly for thumbnail generation
  return template.component;
}

// Function to render a template with props
export function renderTemplate(templateId: string, props: any) {
  const Component = getTemplateComponent(templateId);
  return React.createElement(Component, props);
}

// Export all template IDs
export const templateIds = Object.keys(templateMap);
