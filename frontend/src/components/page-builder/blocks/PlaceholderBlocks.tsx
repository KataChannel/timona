import React from 'react';
import { PageBlock } from '@/types/page-builder';

export const GalleryBlock: React.FC<{ block: PageBlock; isEditable?: boolean; onUpdate?: any; onDelete?: any }> = ({ block }) => {
  return <div className="p-4 bg-gray-100 border border-gray-300 rounded text-center"><p className="text-gray-600">Gallery Block - Coming Soon</p></div>;
};

export const CardBlock: React.FC<{ block: PageBlock; isEditable?: boolean; onUpdate?: any; onDelete?: any }> = ({ block }) => {
  return <div className="p-4 bg-gray-100 border border-gray-300 rounded text-center"><p className="text-gray-600">Card Block - Coming Soon</p></div>;
};

export const TestimonialBlock: React.FC<{ block: PageBlock; isEditable?: boolean; onUpdate?: any; onDelete?: any }> = ({ block }) => {
  return <div className="p-4 bg-gray-100 border border-gray-300 rounded text-center"><p className="text-gray-600">Testimonial Block - Coming Soon</p></div>;
};

export const FAQBlock: React.FC<{ block: PageBlock; isEditable?: boolean; onUpdate?: any; onDelete?: any }> = ({ block }) => {
  return <div className="p-4 bg-gray-100 border border-gray-300 rounded text-center"><p className="text-gray-600">FAQ Block - Coming Soon</p></div>;
};

export const ContactFormBlock: React.FC<{ block: PageBlock; isEditable?: boolean; onUpdate?: any; onDelete?: any }> = ({ block }) => {
  return <div className="p-4 bg-gray-100 border border-gray-300 rounded text-center"><p className="text-gray-600">Contact Form Block - Coming Soon</p></div>;
};