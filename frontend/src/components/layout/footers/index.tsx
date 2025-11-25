'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FooterProps, SocialLink } from '@/types/layout';
import { cn } from '@/lib/utils';
import { Facebook, Twitter, Github, Linkedin, Instagram, Youtube } from 'lucide-react';

const SocialIcon = ({ platform }: { platform: SocialLink['platform'] }) => {
  const icons = {
    github: Github,
    twitter: Twitter,
    facebook: Facebook,
    linkedin: Linkedin,
    instagram: Instagram,
    youtube: Youtube,
  };
  const Icon = icons[platform];
  return <Icon className="h-5 w-5" />;
};

/**
 * Default Footer Variant
 * Full footer with multiple columns
 */
export function DefaultFooter({
  brand = { name: 'rausachcore', tagline: 'Enterprise Starter Kit' },
  columns = [],
  socialLinks = [],
  copyright,
  backgroundColor = 'bg-gray-900',
  textColor = 'text-gray-300',
}: FooterProps) {
  return (
    <footer className={cn('w-full', backgroundColor, textColor)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Column */}
          <div className="col-span-1">
            <div className="text-white text-xl font-bold mb-4">{brand.name}</div>
            {brand.tagline && (
              <p className="text-sm mb-4">{brand.tagline}</p>
            )}
            {socialLinks.length > 0 && (
              <div className="flex space-x-4">
                {socialLinks.map((link, index) => (
                  <a
                    key={index}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white transition-colors"
                  >
                    <SocialIcon platform={link.platform} />
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Link Columns */}
          {columns.map((column, index) => (
            <div key={index}>
              <h3 className="text-white font-semibold mb-4">{column.title}</h3>
              <ul className="space-y-2">
                {column.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <Link
                      href={link.href}
                      className="text-sm hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-8 border-t border-gray-800 text-center text-sm">
          {copyright || `© ${new Date().getFullYear()} ${brand.name}. All rights reserved.`}
        </div>
      </div>
    </footer>
  );
}

/**
 * Minimal Footer Variant
 * Compact footer with just copyright
 */
export function MinimalFooter({
  brand = { name: 'rausachcore' },
  copyright,
  backgroundColor = 'bg-gray-900',
  textColor = 'text-gray-400',
}: FooterProps) {
  return (
    <footer className={cn('w-full', backgroundColor, textColor)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="text-center text-sm">
          {copyright || `© ${new Date().getFullYear()} ${brand.name}. All rights reserved.`}
        </div>
      </div>
    </footer>
  );
}

/**
 * Extended Footer Variant
 * Footer with newsletter signup
 */
export function ExtendedFooter({
  brand = { name: 'rausachcore', tagline: 'Enterprise Starter Kit' },
  columns = [],
  socialLinks = [],
  copyright,
  backgroundColor = 'bg-gray-900',
  textColor = 'text-gray-300',
  showNewsletter = true,
  newsletterTitle = 'Subscribe to our newsletter',
  newsletterDescription = 'Get the latest updates and news.',
}: FooterProps) {
  return (
    <footer className={cn('w-full', backgroundColor, textColor)}>
      {/* Newsletter Section */}
      {showNewsletter && (
        <div className="border-b border-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center max-w-2xl mx-auto">
              <h2 className="text-white text-2xl font-bold mb-2">
                {newsletterTitle}
              </h2>
              <p className="mb-6">{newsletterDescription}</p>
              <div className="flex gap-2 max-w-md mx-auto">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  className="bg-gray-800 border-gray-700 text-white"
                />
                <Button variant="default">Subscribe</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          {/* Brand Column - Takes 2 cols */}
          <div className="md:col-span-2">
            <div className="text-white text-2xl font-bold mb-4">{brand.name}</div>
            {brand.tagline && (
              <p className="mb-4 max-w-sm">{brand.tagline}</p>
            )}
            {socialLinks.length > 0 && (
              <div className="flex space-x-4">
                {socialLinks.map((link, index) => (
                  <a
                    key={index}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white transition-colors p-2 rounded-full hover:bg-gray-800"
                  >
                    <SocialIcon platform={link.platform} />
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Link Columns */}
          {columns.map((column, index) => (
            <div key={index}>
              <h3 className="text-white font-semibold mb-4">{column.title}</h3>
              <ul className="space-y-2">
                {column.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <Link
                      href={link.href}
                      className="text-sm hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Copyright */}
        <div className="mt-12 pt-8 border-t border-gray-800 text-center text-sm">
          {copyright || `© ${new Date().getFullYear()} ${brand.name}. All rights reserved.`}
        </div>
      </div>
    </footer>
  );
}

/**
 * Newsletter Footer Variant
 * Focus on newsletter signup with minimal links
 */
export function NewsletterFooter({
  brand = { name: 'rausachcore' },
  socialLinks = [],
  copyright,
  backgroundColor = 'bg-gradient-to-r from-blue-600 to-purple-600',
  textColor = 'text-white',
  newsletterTitle = 'Stay in the loop',
  newsletterDescription = 'Subscribe to get our latest content by email.',
}: FooterProps) {
  return (
    <footer className={cn('w-full', backgroundColor, textColor)}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h2 className="text-3xl font-bold mb-4">{newsletterTitle}</h2>
        <p className="text-lg mb-8 opacity-90">{newsletterDescription}</p>
        
        <div className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto mb-8">
          <Input
            type="email"
            placeholder="Enter your email"
            className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
          />
          <Button variant="secondary" className="sm:w-auto">
            Subscribe
          </Button>
        </div>

        {socialLinks.length > 0 && (
          <div className="flex justify-center space-x-6 mb-8">
            {socialLinks.map((link, index) => (
              <a
                key={index}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:opacity-80 transition-opacity"
              >
                <SocialIcon platform={link.platform} />
              </a>
            ))}
          </div>
        )}

        <div className="text-sm opacity-75">
          {copyright || `© ${new Date().getFullYear()} ${brand.name}. All rights reserved.`}
        </div>
      </div>
    </footer>
  );
}
