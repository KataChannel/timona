/**
 * PageBuilder Template System - Default Templates
 * Phase 5.1: Template Data Layer
 * 
 * Pre-made templates for quick page creation
 */

import { PageTemplate, PageElement } from '@/types/template';

// ============================================================================
// Template 1: Blank Page
// ============================================================================

const blankPageTemplate: PageTemplate = {
  id: 'template_default_blank',
  name: 'Blank Page',
  description: 'Start with a clean slate. Perfect for building custom designs from scratch.',
  category: 'custom',
  isDefault: true,
  createdAt: '2025-10-15T00:00:00.000Z',
  updatedAt: '2025-10-15T00:00:00.000Z',
  author: 'PageBuilder Team',
  tags: ['minimal', 'starter', 'blank'],
  structure: [
    {
      id: 'elem_blank_container',
      type: 'container',
      styles: {
        spacing: {
          padding: {
            desktop: { top: 40, right: 20, bottom: 40, left: 20 },
          },
        },
        background: {
          type: { desktop: 'color' },
          color: { desktop: '#ffffff' },
        },
      },
      children: [
        {
          id: 'elem_blank_text',
          type: 'paragraph',
          content: 'Start building your page here...',
          styles: {
            typography: {
              fontSize: { desktop: 16 },
              lineHeight: { desktop: 1.5 },
              textAlign: { desktop: 'center' },
            },
            color: {
              textColor: { desktop: '#666666' },
            },
          },
        },
      ],
    },
  ],
  styles: {
    fontFamily: 'Inter, sans-serif',
    fontSize: 16,
    lineHeight: 1.5,
    textColor: '#333333',
    backgroundColor: '#ffffff',
    maxWidth: 1200,
    padding: { top: 0, right: 0, bottom: 0, left: 0 },
  },
};

// ============================================================================
// Template 2: Hero Landing Page
// ============================================================================

const heroLandingTemplate: PageTemplate = {
  id: 'template_default_hero',
  name: 'Hero Landing Page',
  description: 'Modern landing page with hero section, features, and call-to-action.',
  category: 'landing',
  isDefault: true,
  createdAt: '2025-10-15T00:00:00.000Z',
  updatedAt: '2025-10-15T00:00:00.000Z',
  author: 'PageBuilder Team',
  tags: ['hero', 'landing', 'cta', 'modern'],
  structure: [
    // Hero Section
    {
      id: 'elem_hero_section',
      type: 'container',
      styles: {
        spacing: {
          padding: {
            desktop: { top: 80, right: 20, bottom: 80, left: 20 },
            tablet: { top: 60, right: 16, bottom: 60, left: 16 },
            mobile: { top: 40, right: 12, bottom: 40, left: 12 },
          },
        },
        background: {
          type: { desktop: 'gradient' },
          gradient: {
            desktop: {
              type: 'linear',
              colors: ['#667eea', '#764ba2'],
              angle: 135,
            },
          },
        },
      },
      children: [
        {
          id: 'elem_hero_title',
          type: 'heading',
          content: 'Build Amazing Pages',
          styles: {
            typography: {
              fontSize: { desktop: 56, tablet: 42, mobile: 32 },
              fontWeight: { desktop: 700 },
              lineHeight: { desktop: 1.2 },
              textAlign: { desktop: 'center' },
            },
            color: {
              textColor: { desktop: '#ffffff' },
            },
            spacing: {
              margin: {
                desktop: { top: 0, right: 0, bottom: 24, left: 0 },
              },
            },
          },
        },
        {
          id: 'elem_hero_subtitle',
          type: 'paragraph',
          content: 'Create stunning, responsive websites with our intuitive page builder. No coding required.',
          styles: {
            typography: {
              fontSize: { desktop: 20, tablet: 18, mobile: 16 },
              lineHeight: { desktop: 1.6 },
              textAlign: { desktop: 'center' },
            },
            color: {
              textColor: { desktop: '#f0f0f0' },
            },
            spacing: {
              margin: {
                desktop: { top: 0, right: 0, bottom: 40, left: 0 },
              },
            },
          },
        },
        {
          id: 'elem_hero_cta',
          type: 'button',
          content: 'Get Started Free',
          styles: {
            typography: {
              fontSize: { desktop: 18 },
              fontWeight: { desktop: 600 },
            },
            color: {
              textColor: { desktop: '#667eea' },
              backgroundColor: { desktop: '#ffffff' },
            },
            spacing: {
              padding: {
                desktop: { top: 16, right: 32, bottom: 16, left: 32 },
              },
            },
            border: {
              radius: {
                desktop: { topLeft: 8, topRight: 8, bottomRight: 8, bottomLeft: 8 },
              },
            },
            shadow: {
              boxShadow: {
                desktop: {
                  x: 0,
                  y: 4,
                  blur: 12,
                  spread: 0,
                  color: '#00000020',
                  inset: false,
                },
              },
            },
          },
        },
      ],
    },

    // Features Section
    {
      id: 'elem_features_section',
      type: 'container',
      styles: {
        spacing: {
          padding: {
            desktop: { top: 80, right: 20, bottom: 80, left: 20 },
          },
        },
        background: {
          type: { desktop: 'color' },
          color: { desktop: '#f9fafb' },
        },
      },
      children: [
        {
          id: 'elem_features_title',
          type: 'heading',
          content: 'Features',
          styles: {
            typography: {
              fontSize: { desktop: 36, tablet: 28, mobile: 24 },
              fontWeight: { desktop: 700 },
              textAlign: { desktop: 'center' },
            },
            spacing: {
              margin: {
                desktop: { top: 0, right: 0, bottom: 48, left: 0 },
              },
            },
          },
        },
        {
          id: 'elem_features_grid',
          type: 'container',
          styles: {
            spacing: {
              gap: { desktop: 24 },
            },
          },
          children: [
            {
              id: 'elem_feature_1',
              type: 'container',
              styles: {
                spacing: {
                  padding: {
                    desktop: { top: 32, right: 24, bottom: 32, left: 24 },
                  },
                },
                background: {
                  type: { desktop: 'color' },
                  color: { desktop: '#ffffff' },
                },
                border: {
                  radius: {
                    desktop: { topLeft: 8, topRight: 8, bottomRight: 8, bottomLeft: 8 },
                  },
                },
                shadow: {
                  boxShadow: {
                    desktop: {
                      x: 0,
                      y: 2,
                      blur: 8,
                      spread: 0,
                      color: '#00000010',
                      inset: false,
                    },
                  },
                },
              },
              children: [
                {
                  id: 'elem_feature_1_title',
                  type: 'heading',
                  content: 'Easy to Use',
                  styles: {
                    typography: {
                      fontSize: { desktop: 20 },
                      fontWeight: { desktop: 600 },
                    },
                    spacing: {
                      margin: {
                        desktop: { top: 0, right: 0, bottom: 12, left: 0 },
                      },
                    },
                  },
                },
                {
                  id: 'elem_feature_1_desc',
                  type: 'paragraph',
                  content: 'Intuitive drag-and-drop interface makes page building a breeze.',
                  styles: {
                    typography: {
                      fontSize: { desktop: 16 },
                      lineHeight: { desktop: 1.5 },
                    },
                    color: {
                      textColor: { desktop: '#666666' },
                    },
                  },
                },
              ],
            },
            {
              id: 'elem_feature_2',
              type: 'container',
              styles: {
                spacing: {
                  padding: {
                    desktop: { top: 32, right: 24, bottom: 32, left: 24 },
                  },
                },
                background: {
                  type: { desktop: 'color' },
                  color: { desktop: '#ffffff' },
                },
                border: {
                  radius: {
                    desktop: { topLeft: 8, topRight: 8, bottomRight: 8, bottomLeft: 8 },
                  },
                },
                shadow: {
                  boxShadow: {
                    desktop: {
                      x: 0,
                      y: 2,
                      blur: 8,
                      spread: 0,
                      color: '#00000010',
                      inset: false,
                    },
                  },
                },
              },
              children: [
                {
                  id: 'elem_feature_2_title',
                  type: 'heading',
                  content: 'Fully Responsive',
                  styles: {
                    typography: {
                      fontSize: { desktop: 20 },
                      fontWeight: { desktop: 600 },
                    },
                    spacing: {
                      margin: {
                        desktop: { top: 0, right: 0, bottom: 12, left: 0 },
                      },
                    },
                  },
                },
                {
                  id: 'elem_feature_2_desc',
                  type: 'paragraph',
                  content: 'Design once, looks perfect on all devices automatically.',
                  styles: {
                    typography: {
                      fontSize: { desktop: 16 },
                      lineHeight: { desktop: 1.5 },
                    },
                    color: {
                      textColor: { desktop: '#666666' },
                    },
                  },
                },
              ],
            },
            {
              id: 'elem_feature_3',
              type: 'container',
              styles: {
                spacing: {
                  padding: {
                    desktop: { top: 32, right: 24, bottom: 32, left: 24 },
                  },
                },
                background: {
                  type: { desktop: 'color' },
                  color: { desktop: '#ffffff' },
                },
                border: {
                  radius: {
                    desktop: { topLeft: 8, topRight: 8, bottomRight: 8, bottomLeft: 8 },
                  },
                },
                shadow: {
                  boxShadow: {
                    desktop: {
                      x: 0,
                      y: 2,
                      blur: 8,
                      spread: 0,
                      color: '#00000010',
                      inset: false,
                    },
                  },
                },
              },
              children: [
                {
                  id: 'elem_feature_3_title',
                  type: 'heading',
                  content: 'Customizable',
                  styles: {
                    typography: {
                      fontSize: { desktop: 20 },
                      fontWeight: { desktop: 600 },
                    },
                    spacing: {
                      margin: {
                        desktop: { top: 0, right: 0, bottom: 12, left: 0 },
                      },
                    },
                  },
                },
                {
                  id: 'elem_feature_3_desc',
                  type: 'paragraph',
                  content: 'Full control over every aspect of your design with advanced styling options.',
                  styles: {
                    typography: {
                      fontSize: { desktop: 16 },
                      lineHeight: { desktop: 1.5 },
                    },
                    color: {
                      textColor: { desktop: '#666666' },
                    },
                  },
                },
              ],
            },
          ],
        },
      ],
    },
  ],
  styles: {
    fontFamily: 'Inter, sans-serif',
    fontSize: 16,
    lineHeight: 1.5,
    textColor: '#333333',
    backgroundColor: '#ffffff',
    maxWidth: 1200,
    padding: { top: 0, right: 0, bottom: 0, left: 0 },
  },
};

// ============================================================================
// Template 3: Simple Blog Post
// ============================================================================

const blogPostTemplate: PageTemplate = {
  id: 'template_default_blog',
  name: 'Blog Post',
  description: 'Clean blog post layout with article header, content sections, and author info.',
  category: 'blog',
  isDefault: true,
  createdAt: '2025-10-15T00:00:00.000Z',
  updatedAt: '2025-10-15T00:00:00.000Z',
  author: 'PageBuilder Team',
  tags: ['blog', 'article', 'content'],
  structure: [
    // Article Header
    {
      id: 'elem_blog_header',
      type: 'container',
      styles: {
        spacing: {
          padding: {
            desktop: { top: 60, right: 20, bottom: 40, left: 20 },
          },
          margin: {
            desktop: { top: 0, right: 0, bottom: 40, left: 0 },
          },
        },
        border: {
          width: { desktop: 0 },
          style: { desktop: 'solid' },
          color: { desktop: '#e5e7eb' },
        },
      },
      children: [
        {
          id: 'elem_blog_title',
          type: 'heading',
          content: 'How to Build Beautiful Web Pages',
          styles: {
            typography: {
              fontSize: { desktop: 40, tablet: 32, mobile: 28 },
              fontWeight: { desktop: 700 },
              lineHeight: { desktop: 1.3 },
            },
            spacing: {
              margin: {
                desktop: { top: 0, right: 0, bottom: 16, left: 0 },
              },
            },
          },
        },
        {
          id: 'elem_blog_meta',
          type: 'paragraph',
          content: 'By John Doe • October 15, 2025 • 5 min read',
          styles: {
            typography: {
              fontSize: { desktop: 14 },
            },
            color: {
              textColor: { desktop: '#6b7280' },
            },
          },
        },
      ],
    },

    // Article Content
    {
      id: 'elem_blog_content',
      type: 'container',
      styles: {
        spacing: {
          padding: {
            desktop: { top: 0, right: 20, bottom: 60, left: 20 },
          },
        },
      },
      children: [
        {
          id: 'elem_blog_intro',
          type: 'paragraph',
          content: 'Creating beautiful web pages has never been easier. With modern page builders, you can design professional-looking websites without writing a single line of code.',
          styles: {
            typography: {
              fontSize: { desktop: 18 },
              lineHeight: { desktop: 1.7 },
            },
            color: {
              textColor: { desktop: '#4b5563' },
            },
            spacing: {
              margin: {
                desktop: { top: 0, right: 0, bottom: 32, left: 0 },
              },
            },
          },
        },
        {
          id: 'elem_blog_section_1',
          type: 'heading',
          content: 'Getting Started',
          styles: {
            typography: {
              fontSize: { desktop: 28 },
              fontWeight: { desktop: 600 },
              lineHeight: { desktop: 1.3 },
            },
            spacing: {
              margin: {
                desktop: { top: 0, right: 0, bottom: 16, left: 0 },
              },
            },
          },
        },
        {
          id: 'elem_blog_section_1_content',
          type: 'paragraph',
          content: 'Start by choosing a template that matches your vision. Our library includes designs for landing pages, blogs, portfolios, and more. Each template is fully customizable, so you can make it your own.',
          styles: {
            typography: {
              fontSize: { desktop: 16 },
              lineHeight: { desktop: 1.7 },
            },
            spacing: {
              margin: {
                desktop: { top: 0, right: 0, bottom: 32, left: 0 },
              },
            },
          },
        },
        {
          id: 'elem_blog_section_2',
          type: 'heading',
          content: 'Design with Confidence',
          styles: {
            typography: {
              fontSize: { desktop: 28 },
              fontWeight: { desktop: 600 },
              lineHeight: { desktop: 1.3 },
            },
            spacing: {
              margin: {
                desktop: { top: 0, right: 0, bottom: 16, left: 0 },
              },
            },
          },
        },
        {
          id: 'elem_blog_section_2_content',
          type: 'paragraph',
          content: 'Our responsive design system ensures your pages look perfect on all devices. Edit once, and your design automatically adapts to desktop, tablet, and mobile screens.',
          styles: {
            typography: {
              fontSize: { desktop: 16 },
              lineHeight: { desktop: 1.7 },
            },
            spacing: {
              margin: {
                desktop: { top: 0, right: 0, bottom: 32, left: 0 },
              },
            },
          },
        },
      ],
    },
  ],
  styles: {
    fontFamily: 'Inter, sans-serif',
    fontSize: 16,
    lineHeight: 1.7,
    textColor: '#1f2937',
    backgroundColor: '#ffffff',
    maxWidth: 800,
    padding: { top: 0, right: 0, bottom: 0, left: 0 },
  },
};

// ============================================================================
// Export All Default Templates
// ============================================================================

export const DEFAULT_TEMPLATES: PageTemplate[] = [
  blankPageTemplate,
  heroLandingTemplate,
  blogPostTemplate,
];

export default DEFAULT_TEMPLATES;
