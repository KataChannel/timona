import { BlockType, CreatePageBlockInput } from '@/types/page-builder';
import { getThumbnailDataURL } from '@/utils/templateThumbnails';

/**
 * Template Category Type
 */
export type TemplateCategory = 'hero' | 'features' | 'pricing' | 'team' | 'contact' | 'testimonials' | 'cta' | 'faq' | 'footer' | 'newsletter' | 'custom';

/**
 * Block Template Interface
 */
export interface BlockTemplate {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  thumbnail?: string;
  blocks: TemplateBlockDefinition[];
}

export interface TemplateBlockDefinition {
  type: BlockType;
  content: any;
  style?: any;
  order: number;
  depth: number;
  parentId?: string; // Relative ID for template structure
  children?: TemplateBlockDefinition[];
}

/**
 * Pre-defined Block Templates
 */
export const BLOCK_TEMPLATES: BlockTemplate[] = [
  // Hero Section Template
  {
    id: 'hero-centered',
    name: 'Centered Hero',
    description: 'Hero section với tiêu đề, mô tả và CTA button ở giữa',
    category: 'hero',
    thumbnail: getThumbnailDataURL('hero-centered'),
    blocks: [
      {
        type: BlockType.SECTION,
        order: 0,
        depth: 0,
        content: {
          fullWidth: true,
          containerWidth: 'lg',
          backgroundColor: '#f8fafc',
          padding: { top: 120, bottom: 120 },
          style: {}
        },
        children: [
          {
            type: BlockType.CONTAINER,
            order: 0,
            depth: 1,
            content: {
              layout: 'stack',
              gap: 24,
              padding: 32,
              backgroundColor: 'transparent',
              maxWidth: '800px',
              alignment: 'center',
              style: {}
            },
            children: [
              {
                type: BlockType.TEXT,
                order: 0,
                depth: 2,
                content: {
                  content: '<h1 style="text-align: center; font-size: 3rem; font-weight: bold; margin: 0;">Chào mừng đến với trang của chúng tôi</h1>',
                  style: {}
                }
              },
              {
                type: BlockType.TEXT,
                order: 1,
                depth: 2,
                content: {
                  content: '<p style="text-align: center; font-size: 1.25rem; color: #64748b;">Giải pháp tốt nhất cho doanh nghiệp của bạn. Bắt đầu ngay hôm nay và trải nghiệm sự khác biệt.</p>',
                  style: {}
                }
              },
              {
                type: BlockType.BUTTON,
                order: 2,
                depth: 2,
                content: {
                  text: 'Bắt đầu ngay',
                  href: '#',
                  variant: 'primary',
                  style: {
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    padding: '16px 32px',
                    fontSize: '1.125rem',
                    borderRadius: '8px'
                  }
                }
              }
            ]
          }
        ]
      }
    ]
  },

  // Features Grid Template
  {
    id: 'features-3col',
    name: 'Features 3 Columns',
    description: '3 tính năng nổi bật với icon, tiêu đề và mô tả',
    category: 'features',
    thumbnail: getThumbnailDataURL('features-3col'),
    blocks: [
      {
        type: BlockType.SECTION,
        order: 0,
        depth: 0,
        content: {
          fullWidth: false,
          containerWidth: 'lg',
          backgroundColor: 'white',
          padding: { top: 80, bottom: 80 },
          style: {}
        },
        children: [
          {
            type: BlockType.CONTAINER,
            order: 0,
            depth: 1,
            content: {
              layout: 'stack',
              gap: 48,
              padding: 0,
              backgroundColor: 'transparent',
              maxWidth: '100%',
              alignment: 'center',
              style: {}
            },
            children: [
              {
                type: BlockType.TEXT,
                order: 0,
                depth: 2,
                content: {
                  content: '<h2 style="text-align: center; font-size: 2.5rem; font-weight: bold;">Tính năng nổi bật</h2>',
                  style: {}
                }
              },
              {
                type: BlockType.GRID,
                order: 1,
                depth: 2,
                content: {
                  columns: 3,
                  gap: 32,
                  responsive: { sm: 1, md: 2, lg: 3 },
                  style: {}
                },
                children: [
                  {
                    type: BlockType.CONTAINER,
                    order: 0,
                    depth: 3,
                    content: {
                      layout: 'stack',
                      gap: 16,
                      padding: 24,
                      backgroundColor: '#f8fafc',
                      maxWidth: '100%',
                      alignment: 'left',
                      style: { borderRadius: '12px' }
                    },
                    children: [
                      {
                        type: BlockType.TEXT,
                        order: 0,
                        depth: 4,
                        content: {
                          content: '<div style="width: 48px; height: 48px; background: #3b82f6; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: white; font-size: 24px;">🚀</div>',
                          style: {}
                        }
                      },
                      {
                        type: BlockType.TEXT,
                        order: 1,
                        depth: 4,
                        content: {
                          content: '<h3 style="font-size: 1.5rem; font-weight: bold; margin: 0;">Nhanh chóng</h3>',
                          style: {}
                        }
                      },
                      {
                        type: BlockType.TEXT,
                        order: 2,
                        depth: 4,
                        content: {
                          content: '<p style="color: #64748b; line-height: 1.6;">Tốc độ xử lý siêu nhanh, tối ưu hiệu suất tối đa.</p>',
                          style: {}
                        }
                      }
                    ]
                  },
                  {
                    type: BlockType.CONTAINER,
                    order: 1,
                    depth: 3,
                    content: {
                      layout: 'stack',
                      gap: 16,
                      padding: 24,
                      backgroundColor: '#f8fafc',
                      maxWidth: '100%',
                      alignment: 'left',
                      style: { borderRadius: '12px' }
                    },
                    children: [
                      {
                        type: BlockType.TEXT,
                        order: 0,
                        depth: 4,
                        content: {
                          content: '<div style="width: 48px; height: 48px; background: #10b981; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: white; font-size: 24px;">🔒</div>',
                          style: {}
                        }
                      },
                      {
                        type: BlockType.TEXT,
                        order: 1,
                        depth: 4,
                        content: {
                          content: '<h3 style="font-size: 1.5rem; font-weight: bold; margin: 0;">Bảo mật</h3>',
                          style: {}
                        }
                      },
                      {
                        type: BlockType.TEXT,
                        order: 2,
                        depth: 4,
                        content: {
                          content: '<p style="color: #64748b; line-height: 1.6;">Bảo vệ dữ liệu với công nghệ mã hóa hiện đại.</p>',
                          style: {}
                        }
                      }
                    ]
                  },
                  {
                    type: BlockType.CONTAINER,
                    order: 2,
                    depth: 3,
                    content: {
                      layout: 'stack',
                      gap: 16,
                      padding: 24,
                      backgroundColor: '#f8fafc',
                      maxWidth: '100%',
                      alignment: 'left',
                      style: { borderRadius: '12px' }
                    },
                    children: [
                      {
                        type: BlockType.TEXT,
                        order: 0,
                        depth: 4,
                        content: {
                          content: '<div style="width: 48px; height: 48px; background: #f59e0b; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: white; font-size: 24px;">⚡</div>',
                          style: {}
                        }
                      },
                      {
                        type: BlockType.TEXT,
                        order: 1,
                        depth: 4,
                        content: {
                          content: '<h3 style="font-size: 1.5rem; font-weight: bold; margin: 0;">Dễ sử dụng</h3>',
                          style: {}
                        }
                      },
                      {
                        type: BlockType.TEXT,
                        order: 2,
                        depth: 4,
                        content: {
                          content: '<p style="color: #64748b; line-height: 1.6;">Giao diện trực quan, dễ dàng sử dụng cho mọi người.</p>',
                          style: {}
                        }
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  },

  // Pricing Table Template
  {
    id: 'pricing-3tier',
    name: 'Pricing 3 Tiers',
    description: 'Bảng giá 3 gói với highlight gói phổ biến',
    category: 'pricing',
    thumbnail: getThumbnailDataURL('pricing-3tier'),
    blocks: [
      {
        type: BlockType.SECTION,
        order: 0,
        depth: 0,
        content: {
          fullWidth: false,
          containerWidth: 'lg',
          backgroundColor: '#f8fafc',
          padding: { top: 80, bottom: 80 },
          style: {}
        },
        children: [
          {
            type: BlockType.CONTAINER,
            order: 0,
            depth: 1,
            content: {
              layout: 'stack',
              gap: 48,
              padding: 0,
              backgroundColor: 'transparent',
              maxWidth: '100%',
              alignment: 'center',
              style: {}
            },
            children: [
              {
                type: BlockType.TEXT,
                order: 0,
                depth: 2,
                content: {
                  content: '<h2 style="text-align: center; font-size: 2.5rem; font-weight: bold;">Chọn gói phù hợp</h2>',
                  style: {}
                }
              },
              {
                type: BlockType.GRID,
                order: 1,
                depth: 2,
                content: {
                  columns: 3,
                  gap: 24,
                  responsive: { sm: 1, md: 2, lg: 3 },
                  style: {}
                },
                children: [
                  // Starter Plan
                  {
                    type: BlockType.CONTAINER,
                    order: 0,
                    depth: 3,
                    content: {
                      layout: 'stack',
                      gap: 24,
                      padding: 32,
                      backgroundColor: 'white',
                      maxWidth: '100%',
                      alignment: 'left',
                      style: { borderRadius: '12px', border: '2px solid #e2e8f0' }
                    },
                    children: [
                      {
                        type: BlockType.TEXT,
                        order: 0,
                        depth: 4,
                        content: {
                          content: '<h3 style="font-size: 1.5rem; font-weight: bold;">Starter</h3><p style="color: #64748b;">Cho cá nhân</p>',
                          style: {}
                        }
                      },
                      {
                        type: BlockType.TEXT,
                        order: 1,
                        depth: 4,
                        content: {
                          content: '<div style="font-size: 3rem; font-weight: bold;">$9<span style="font-size: 1rem; color: #64748b;">/tháng</span></div>',
                          style: {}
                        }
                      },
                      {
                        type: BlockType.TEXT,
                        order: 2,
                        depth: 4,
                        content: {
                          content: '<ul style="list-style: none; padding: 0;"><li style="padding: 8px 0;">✓ 10 projects</li><li style="padding: 8px 0;">✓ 5GB storage</li><li style="padding: 8px 0;">✓ Email support</li></ul>',
                          style: {}
                        }
                      },
                      {
                        type: BlockType.BUTTON,
                        order: 3,
                        depth: 4,
                        content: {
                          text: 'Bắt đầu',
                          href: '#',
                          variant: 'primary',
                          style: {
                            width: '100%',
                            padding: '12px 24px',
                            backgroundColor: '#3b82f6',
                            color: 'white',
                            borderRadius: '8px'
                          }
                        }
                      }
                    ]
                  },
                  // Pro Plan (Popular)
                  {
                    type: BlockType.CONTAINER,
                    order: 1,
                    depth: 3,
                    content: {
                      layout: 'stack',
                      gap: 24,
                      padding: 32,
                      backgroundColor: 'white',
                      maxWidth: '100%',
                      alignment: 'left',
                      style: { borderRadius: '12px', border: '3px solid #3b82f6', position: 'relative' }
                    },
                    children: [
                      {
                        type: BlockType.TEXT,
                        order: 0,
                        depth: 4,
                        content: {
                          content: '<div style="position: absolute; top: -12px; right: 20px; background: #3b82f6; color: white; padding: 4px 12px; border-radius: 999px; font-size: 0.875rem; font-weight: bold;">PHỔ BIẾN</div>',
                          style: {}
                        }
                      },
                      {
                        type: BlockType.TEXT,
                        order: 1,
                        depth: 4,
                        content: {
                          content: '<h3 style="font-size: 1.5rem; font-weight: bold;">Pro</h3><p style="color: #64748b;">Cho doanh nghiệp nhỏ</p>',
                          style: {}
                        }
                      },
                      {
                        type: BlockType.TEXT,
                        order: 2,
                        depth: 4,
                        content: {
                          content: '<div style="font-size: 3rem; font-weight: bold;">$29<span style="font-size: 1rem; color: #64748b;">/tháng</span></div>',
                          style: {}
                        }
                      },
                      {
                        type: BlockType.TEXT,
                        order: 3,
                        depth: 4,
                        content: {
                          content: '<ul style="list-style: none; padding: 0;"><li style="padding: 8px 0;">✓ Unlimited projects</li><li style="padding: 8px 0;">✓ 50GB storage</li><li style="padding: 8px 0;">✓ Priority support</li><li style="padding: 8px 0;">✓ Advanced analytics</li></ul>',
                          style: {}
                        }
                      },
                      {
                        type: BlockType.BUTTON,
                        order: 4,
                        depth: 4,
                        content: {
                          text: 'Bắt đầu',
                          href: '#',
                          variant: 'primary',
                          style: {
                            width: '100%',
                            padding: '12px 24px',
                            backgroundColor: '#3b82f6',
                            color: 'white',
                            borderRadius: '8px'
                          }
                        }
                      }
                    ]
                  },
                  // Enterprise Plan
                  {
                    type: BlockType.CONTAINER,
                    order: 2,
                    depth: 3,
                    content: {
                      layout: 'stack',
                      gap: 24,
                      padding: 32,
                      backgroundColor: 'white',
                      maxWidth: '100%',
                      alignment: 'left',
                      style: { borderRadius: '12px', border: '2px solid #e2e8f0' }
                    },
                    children: [
                      {
                        type: BlockType.TEXT,
                        order: 0,
                        depth: 4,
                        content: {
                          content: '<h3 style="font-size: 1.5rem; font-weight: bold;">Enterprise</h3><p style="color: #64748b;">Cho tổ chức lớn</p>',
                          style: {}
                        }
                      },
                      {
                        type: BlockType.TEXT,
                        order: 1,
                        depth: 4,
                        content: {
                          content: '<div style="font-size: 3rem; font-weight: bold;">$99<span style="font-size: 1rem; color: #64748b;">/tháng</span></div>',
                          style: {}
                        }
                      },
                      {
                        type: BlockType.TEXT,
                        order: 2,
                        depth: 4,
                        content: {
                          content: '<ul style="list-style: none; padding: 0;"><li style="padding: 8px 0;">✓ Unlimited everything</li><li style="padding: 8px 0;">✓ 500GB storage</li><li style="padding: 8px 0;">✓ 24/7 phone support</li><li style="padding: 8px 0;">✓ Custom integrations</li><li style="padding: 8px 0;">✓ Dedicated account manager</li></ul>',
                          style: {}
                        }
                      },
                      {
                        type: BlockType.BUTTON,
                        order: 3,
                        depth: 4,
                        content: {
                          text: 'Liên hệ',
                          href: '#',
                          variant: 'primary',
                          style: {
                            width: '100%',
                            padding: '12px 24px',
                            backgroundColor: '#3b82f6',
                            color: 'white',
                            borderRadius: '8px'
                          }
                        }
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  },

  // Call-to-Action Template
  {
    id: 'cta-centered',
    name: 'Centered CTA',
    description: 'Call-to-action section với background màu và buttons',
    category: 'custom',
    thumbnail: getThumbnailDataURL('cta-centered'),
    blocks: [
      {
        type: BlockType.SECTION,
        order: 0,
        depth: 0,
        content: {
          fullWidth: true,
          containerWidth: 'lg',
          backgroundColor: '#3b82f6',
          padding: { top: 80, bottom: 80 },
          style: {}
        },
        children: [
          {
            type: BlockType.CONTAINER,
            order: 0,
            depth: 1,
            content: {
              layout: 'stack',
              gap: 24,
              padding: 32,
              backgroundColor: 'transparent',
              maxWidth: '800px',
              alignment: 'center',
              style: {}
            },
            children: [
              {
                type: BlockType.TEXT,
                order: 0,
                depth: 2,
                content: {
                  content: '<h2 style="text-align: center; font-size: 2.5rem; font-weight: bold; color: white; margin: 0;">Sẵn sàng bắt đầu?</h2>',
                  style: {}
                }
              },
              {
                type: BlockType.TEXT,
                order: 1,
                depth: 2,
                content: {
                  content: '<p style="text-align: center; font-size: 1.25rem; color: rgba(255,255,255,0.9);">Tham gia cùng hàng nghìn khách hàng đang sử dụng sản phẩm của chúng tôi.</p>',
                  style: {}
                }
              },
              {
                type: BlockType.FLEX_ROW,
                order: 2,
                depth: 2,
                content: {
                  direction: 'row',
                  justifyContent: 'center',
                  alignItems: 'center',
                  wrap: true,
                  gap: 16,
                  style: {}
                },
                children: [
                  {
                    type: BlockType.BUTTON,
                    order: 0,
                    depth: 3,
                    content: {
                      text: 'Dùng thử miễn phí',
                      href: '#',
                      variant: 'primary',
                      style: {
                        padding: '16px 32px',
                        backgroundColor: 'white',
                        color: '#3b82f6',
                        borderRadius: '8px',
                        fontSize: '1.125rem',
                        fontWeight: 'bold'
                      }
                    }
                  },
                  {
                    type: BlockType.BUTTON,
                    order: 1,
                    depth: 3,
                    content: {
                      text: 'Tìm hiểu thêm',
                      href: '#',
                      variant: 'secondary',
                      style: {
                        padding: '16px 32px',
                        backgroundColor: 'transparent',
                        color: 'white',
                        border: '2px solid white',
                        borderRadius: '8px',
                        fontSize: '1.125rem'
                      }
                    }
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  },
  
  // Template 5: Team Section
  {
    id: 'team-3members',
    name: 'Team 3 Members',
    description: 'Giới thiệu đội ngũ với 3 thành viên, ảnh đại diện và thông tin liên hệ',
    category: 'team',
    thumbnail: getThumbnailDataURL('team-3members'),
    blocks: [
      {
        type: BlockType.SECTION,
        order: 0,
        depth: 0,
        content: {
          fullWidth: false,
          containerWidth: 'lg',
          backgroundColor: 'white',
          padding: { top: 80, bottom: 80 }
        },
        children: [
          {
            type: BlockType.CONTAINER,
            order: 0,
            depth: 1,
            content: {
              alignment: 'center',
              maxWidth: '1200px',
              style: {}
            },
            children: [
              {
                type: BlockType.TEXT,
                order: 0,
                depth: 2,
                content: {
                  content: '<h2 style="font-size: 2.5rem; font-weight: bold; text-align: center; margin-bottom: 1rem;">Đội Ngũ Của Chúng Tôi</h2><p style="text-align: center; color: #64748b; font-size: 1.125rem; max-width: 600px; margin: 0 auto;">Gặp gỡ những con người tài năng đằng sau thành công của chúng tôi</p>',
                  style: {}
                }
              },
              {
                type: BlockType.GRID,
                order: 1,
                depth: 2,
                content: {
                  columns: 3,
                  gap: 32,
                  responsive: { sm: 1, md: 2, lg: 3 },
                  style: { marginTop: '48px' }
                },
                children: [
                  // Member 1
                  {
                    type: BlockType.CONTAINER,
                    order: 0,
                    depth: 3,
                    content: {
                      layout: 'stack',
                      gap: 16,
                      padding: 24,
                      backgroundColor: '#f9fafb',
                      alignment: 'center',
                      style: { borderRadius: '12px' }
                    },
                    children: [
                      {
                        type: BlockType.IMAGE,
                        order: 0,
                        depth: 4,
                        content: {
                          src: 'https://via.placeholder.com/200x200',
                          alt: 'Team Member 1',
                          style: { 
                            width: '150px', 
                            height: '150px', 
                            borderRadius: '50%',
                            objectFit: 'cover',
                            margin: '0 auto'
                          }
                        }
                      },
                      {
                        type: BlockType.TEXT,
                        order: 1,
                        depth: 4,
                        content: {
                          content: '<h3 style="font-size: 1.5rem; font-weight: bold; text-align: center; margin-bottom: 0.5rem;">Nguyễn Văn A</h3><p style="text-align: center; color: #3b82f6; font-weight: 600; margin-bottom: 1rem;">CEO & Founder</p><p style="text-align: center; color: #64748b; font-size: 0.875rem;">Chuyên gia với hơn 10 năm kinh nghiệm trong lĩnh vực công nghệ và quản lý.</p>',
                          style: {}
                        }
                      }
                    ]
                  },
                  // Member 2
                  {
                    type: BlockType.CONTAINER,
                    order: 1,
                    depth: 3,
                    content: {
                      layout: 'stack',
                      gap: 16,
                      padding: 24,
                      backgroundColor: '#f9fafb',
                      alignment: 'center',
                      style: { borderRadius: '12px' }
                    },
                    children: [
                      {
                        type: BlockType.IMAGE,
                        order: 0,
                        depth: 4,
                        content: {
                          src: 'https://via.placeholder.com/200x200',
                          alt: 'Team Member 2',
                          style: { 
                            width: '150px', 
                            height: '150px', 
                            borderRadius: '50%',
                            objectFit: 'cover',
                            margin: '0 auto'
                          }
                        }
                      },
                      {
                        type: BlockType.TEXT,
                        order: 1,
                        depth: 4,
                        content: {
                          content: '<h3 style="font-size: 1.5rem; font-weight: bold; text-align: center; margin-bottom: 0.5rem;">Trần Thị B</h3><p style="text-align: center; color: #3b82f6; font-weight: 600; margin-bottom: 1rem;">CTO</p><p style="text-align: center; color: #64748b; font-size: 0.875rem;">Kiến trúc sư phần mềm hàng đầu với đam mê xây dựng sản phẩm chất lượng.</p>',
                          style: {}
                        }
                      }
                    ]
                  },
                  // Member 3
                  {
                    type: BlockType.CONTAINER,
                    order: 2,
                    depth: 3,
                    content: {
                      layout: 'stack',
                      gap: 16,
                      padding: 24,
                      backgroundColor: '#f9fafb',
                      alignment: 'center',
                      style: { borderRadius: '12px' }
                    },
                    children: [
                      {
                        type: BlockType.IMAGE,
                        order: 0,
                        depth: 4,
                        content: {
                          src: 'https://via.placeholder.com/200x200',
                          alt: 'Team Member 3',
                          style: { 
                            width: '150px', 
                            height: '150px', 
                            borderRadius: '50%',
                            objectFit: 'cover',
                            margin: '0 auto'
                          }
                        }
                      },
                      {
                        type: BlockType.TEXT,
                        order: 1,
                        depth: 4,
                        content: {
                          content: '<h3 style="font-size: 1.5rem; font-weight: bold; text-align: center; margin-bottom: 0.5rem;">Lê Văn C</h3><p style="text-align: center; color: #3b82f6; font-weight: 600; margin-bottom: 1rem;">Head of Design</p><p style="text-align: center; color: #64748b; font-size: 0.875rem;">Nhà thiết kế sáng tạo với tầm nhìn thẩm mỹ độc đáo và tinh tế.</p>',
                          style: {}
                        }
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  },
  
  // Template 6: Contact Section
  {
    id: 'contact-form',
    name: 'Contact Form & Info',
    description: 'Form liên hệ kết hợp với thông tin liên lạc và bản đồ',
    category: 'contact',
    thumbnail: getThumbnailDataURL('contact-form'),
    blocks: [
      {
        type: BlockType.SECTION,
        order: 0,
        depth: 0,
        content: {
          fullWidth: false,
          containerWidth: 'lg',
          backgroundColor: '#f9fafb',
          padding: { top: 80, bottom: 80 }
        },
        children: [
          {
            type: BlockType.CONTAINER,
            order: 0,
            depth: 1,
            content: {
              alignment: 'center',
              maxWidth: '1200px',
              style: {}
            },
            children: [
              {
                type: BlockType.TEXT,
                order: 0,
                depth: 2,
                content: {
                  content: '<h2 style="font-size: 2.5rem; font-weight: bold; text-align: center; margin-bottom: 1rem;">Liên Hệ Với Chúng Tôi</h2><p style="text-align: center; color: #64748b; font-size: 1.125rem; max-width: 600px; margin: 0 auto;">Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ bạn</p>',
                  style: {}
                }
              },
              {
                type: BlockType.GRID,
                order: 1,
                depth: 2,
                content: {
                  columns: 2,
                  gap: 48,
                  responsive: { sm: 1, md: 2, lg: 2 },
                  style: { marginTop: '48px' }
                },
                children: [
                  // Contact Info
                  {
                    type: BlockType.CONTAINER,
                    order: 0,
                    depth: 3,
                    content: {
                      layout: 'stack',
                      gap: 32,
                      padding: 32,
                      backgroundColor: 'white',
                      style: { borderRadius: '12px' }
                    },
                    children: [
                      {
                        type: BlockType.TEXT,
                        order: 0,
                        depth: 4,
                        content: {
                          content: '<h3 style="font-size: 1.5rem; font-weight: bold; margin-bottom: 1.5rem;">Thông Tin Liên Hệ</h3>',
                          style: {}
                        }
                      },
                      {
                        type: BlockType.TEXT,
                        order: 1,
                        depth: 4,
                        content: {
                          content: '<div style="display: flex; align-items: start; gap: 16px; margin-bottom: 20px;"><div style="width: 40px; height: 40px; background: #3b82f6; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: white; font-size: 20px;">📍</div><div><strong style="display: block; margin-bottom: 4px;">Địa chỉ</strong><span style="color: #64748b;">123 Đường ABC, Quận 1, TP.HCM</span></div></div>',
                          style: {}
                        }
                      },
                      {
                        type: BlockType.TEXT,
                        order: 2,
                        depth: 4,
                        content: {
                          content: '<div style="display: flex; align-items: start; gap: 16px; margin-bottom: 20px;"><div style="width: 40px; height: 40px; background: #3b82f6; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: white; font-size: 20px;">📞</div><div><strong style="display: block; margin-bottom: 4px;">Điện thoại</strong><span style="color: #64748b;">+84 123 456 789</span></div></div>',
                          style: {}
                        }
                      },
                      {
                        type: BlockType.TEXT,
                        order: 3,
                        depth: 4,
                        content: {
                          content: '<div style="display: flex; align-items: start; gap: 16px;"><div style="width: 40px; height: 40px; background: #3b82f6; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: white; font-size: 20px;">✉️</div><div><strong style="display: block; margin-bottom: 4px;">Email</strong><span style="color: #64748b;">contact@example.com</span></div></div>',
                          style: {}
                        }
                      }
                    ]
                  },
                  // Contact Form Placeholder
                  {
                    type: BlockType.CONTAINER,
                    order: 1,
                    depth: 3,
                    content: {
                      layout: 'stack',
                      gap: 20,
                      padding: 32,
                      backgroundColor: 'white',
                      style: { borderRadius: '12px' }
                    },
                    children: [
                      {
                        type: BlockType.TEXT,
                        order: 0,
                        depth: 4,
                        content: {
                          content: '<h3 style="font-size: 1.5rem; font-weight: bold; margin-bottom: 1rem;">Gửi Tin Nhắn</h3><p style="color: #64748b; margin-bottom: 1.5rem;">Điền thông tin bên dưới để gửi tin nhắn cho chúng tôi</p>',
                          style: {}
                        }
                      },
                      {
                        type: BlockType.TEXT,
                        order: 1,
                        depth: 4,
                        content: {
                          content: '<div style="margin-bottom: 16px;"><label style="display: block; margin-bottom: 8px; font-weight: 600;">Họ và tên</label><input type="text" placeholder="Nhập họ và tên" style="width: 100%; padding: 12px; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 1rem;" /></div>',
                          style: {}
                        }
                      },
                      {
                        type: BlockType.TEXT,
                        order: 2,
                        depth: 4,
                        content: {
                          content: '<div style="margin-bottom: 16px;"><label style="display: block; margin-bottom: 8px; font-weight: 600;">Email</label><input type="email" placeholder="Nhập email" style="width: 100%; padding: 12px; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 1rem;" /></div>',
                          style: {}
                        }
                      },
                      {
                        type: BlockType.TEXT,
                        order: 3,
                        depth: 4,
                        content: {
                          content: '<div style="margin-bottom: 16px;"><label style="display: block; margin-bottom: 8px; font-weight: 600;">Tin nhắn</label><textarea placeholder="Nhập tin nhắn của bạn" rows="4" style="width: 100%; padding: 12px; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 1rem; resize: vertical;"></textarea></div>',
                          style: {}
                        }
                      },
                      {
                        type: BlockType.BUTTON,
                        order: 4,
                        depth: 4,
                        content: {
                          text: 'Gửi tin nhắn',
                          href: '#',
                          variant: 'primary',
                          style: {
                            width: '100%',
                            padding: '14px 24px',
                            backgroundColor: '#3b82f6',
                            color: 'white',
                            borderRadius: '8px',
                            fontSize: '1rem',
                            fontWeight: 'bold'
                          }
                        }
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  },
  
  // Template 7: Testimonials
  {
    id: 'testimonials-3col',
    name: 'Testimonials 3 Reviews',
    description: 'Phần đánh giá của khách hàng với 3 reviews và rating',
    category: 'custom',
    thumbnail: getThumbnailDataURL('testimonials-3col'),
    blocks: [
      {
        type: BlockType.SECTION,
        order: 0,
        depth: 0,
        content: {
          fullWidth: false,
          containerWidth: 'lg',
          backgroundColor: 'white',
          padding: { top: 80, bottom: 80 }
        },
        children: [
          {
            type: BlockType.CONTAINER,
            order: 0,
            depth: 1,
            content: {
              alignment: 'center',
              maxWidth: '1200px',
              style: {}
            },
            children: [
              {
                type: BlockType.TEXT,
                order: 0,
                depth: 2,
                content: {
                  content: '<h2 style="font-size: 2.5rem; font-weight: bold; text-align: center; margin-bottom: 1rem;">Khách Hàng Nói Gì Về Chúng Tôi</h2><p style="text-align: center; color: #64748b; font-size: 1.125rem; max-width: 600px; margin: 0 auto;">Hàng ngàn khách hàng hài lòng đã tin tưởng và sử dụng dịch vụ của chúng tôi</p>',
                  style: {}
                }
              },
              {
                type: BlockType.GRID,
                order: 1,
                depth: 2,
                content: {
                  columns: 3,
                  gap: 32,
                  responsive: { sm: 1, md: 2, lg: 3 },
                  style: { marginTop: '48px' }
                },
                children: [
                  // Review 1
                  {
                    type: BlockType.CONTAINER,
                    order: 0,
                    depth: 3,
                    content: {
                      layout: 'stack',
                      gap: 20,
                      padding: 32,
                      backgroundColor: '#f9fafb',
                      style: { borderRadius: '12px' }
                    },
                    children: [
                      {
                        type: BlockType.TEXT,
                        order: 0,
                        depth: 4,
                        content: {
                          content: '<div style="color: #fbbf24; font-size: 1.5rem; margin-bottom: 16px;">⭐⭐⭐⭐⭐</div>',
                          style: {}
                        }
                      },
                      {
                        type: BlockType.TEXT,
                        order: 1,
                        depth: 4,
                        content: {
                          content: '<p style="color: #334155; font-size: 1rem; line-height: 1.7; margin-bottom: 20px;">"Sản phẩm tuyệt vời! Giúp công việc của tôi hiệu quả hơn rất nhiều. Đội ngũ hỗ trợ cũng rất tận tình."</p>',
                          style: {}
                        }
                      },
                      {
                        type: BlockType.FLEX_ROW,
                        order: 2,
                        depth: 4,
                        content: {
                          direction: 'row',
                          justifyContent: 'start',
                          alignItems: 'center',
                          gap: 12,
                          style: {}
                        },
                        children: [
                          {
                            type: BlockType.IMAGE,
                            order: 0,
                            depth: 5,
                            content: {
                              src: 'https://via.placeholder.com/50x50',
                              alt: 'Customer 1',
                              style: { 
                                width: '50px', 
                                height: '50px', 
                                borderRadius: '50%',
                                objectFit: 'cover'
                              }
                            }
                          },
                          {
                            type: BlockType.TEXT,
                            order: 1,
                            depth: 5,
                            content: {
                              content: '<div><strong style="display: block; font-size: 1rem;">Nguyễn Minh A</strong><span style="color: #64748b; font-size: 0.875rem;">CEO tại ABC Corp</span></div>',
                              style: {}
                            }
                          }
                        ]
                      }
                    ]
                  },
                  // Review 2
                  {
                    type: BlockType.CONTAINER,
                    order: 1,
                    depth: 3,
                    content: {
                      layout: 'stack',
                      gap: 20,
                      padding: 32,
                      backgroundColor: '#f9fafb',
                      style: { borderRadius: '12px' }
                    },
                    children: [
                      {
                        type: BlockType.TEXT,
                        order: 0,
                        depth: 4,
                        content: {
                          content: '<div style="color: #fbbf24; font-size: 1.5rem; margin-bottom: 16px;">⭐⭐⭐⭐⭐</div>',
                          style: {}
                        }
                      },
                      {
                        type: BlockType.TEXT,
                        order: 1,
                        depth: 4,
                        content: {
                          content: '<p style="color: #334155; font-size: 1rem; line-height: 1.7; margin-bottom: 20px;">"Giao diện đẹp, dễ sử dụng và tính năng đầy đủ. Tôi đã giới thiệu cho nhiều đồng nghiệp."</p>',
                          style: {}
                        }
                      },
                      {
                        type: BlockType.FLEX_ROW,
                        order: 2,
                        depth: 4,
                        content: {
                          direction: 'row',
                          justifyContent: 'start',
                          alignItems: 'center',
                          gap: 12,
                          style: {}
                        },
                        children: [
                          {
                            type: BlockType.IMAGE,
                            order: 0,
                            depth: 5,
                            content: {
                              src: 'https://via.placeholder.com/50x50',
                              alt: 'Customer 2',
                              style: { 
                                width: '50px', 
                                height: '50px', 
                                borderRadius: '50%',
                                objectFit: 'cover'
                              }
                            }
                          },
                          {
                            type: BlockType.TEXT,
                            order: 1,
                            depth: 5,
                            content: {
                              content: '<div><strong style="display: block; font-size: 1rem;">Trần Thị B</strong><span style="color: #64748b; font-size: 0.875rem;">Marketing Manager</span></div>',
                              style: {}
                            }
                          }
                        ]
                      }
                    ]
                  },
                  // Review 3
                  {
                    type: BlockType.CONTAINER,
                    order: 2,
                    depth: 3,
                    content: {
                      layout: 'stack',
                      gap: 20,
                      padding: 32,
                      backgroundColor: '#f9fafb',
                      style: { borderRadius: '12px' }
                    },
                    children: [
                      {
                        type: BlockType.TEXT,
                        order: 0,
                        depth: 4,
                        content: {
                          content: '<div style="color: #fbbf24; font-size: 1.5rem; margin-bottom: 16px;">⭐⭐⭐⭐⭐</div>',
                          style: {}
                        }
                      },
                      {
                        type: BlockType.TEXT,
                        order: 1,
                        depth: 4,
                        content: {
                          content: '<p style="color: #334155; font-size: 1rem; line-height: 1.7; margin-bottom: 20px;">"ROI tuyệt vời! Chỉ sau 2 tháng sử dụng, doanh thu của chúng tôi đã tăng 30%."</p>',
                          style: {}
                        }
                      },
                      {
                        type: BlockType.FLEX_ROW,
                        order: 2,
                        depth: 4,
                        content: {
                          direction: 'row',
                          justifyContent: 'start',
                          alignItems: 'center',
                          gap: 12,
                          style: {}
                        },
                        children: [
                          {
                            type: BlockType.IMAGE,
                            order: 0,
                            depth: 5,
                            content: {
                              src: 'https://via.placeholder.com/50x50',
                              alt: 'Customer 3',
                              style: { 
                                width: '50px', 
                                height: '50px', 
                                borderRadius: '50%',
                                objectFit: 'cover'
                              }
                            }
                          },
                          {
                            type: BlockType.TEXT,
                            order: 1,
                            depth: 5,
                            content: {
                              content: '<div><strong style="display: block; font-size: 1rem;">Lê Văn C</strong><span style="color: #64748b; font-size: 0.875rem;">Founder tại XYZ Startup</span></div>',
                              style: {}
                            }
                          }
                        ]
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  },

  // Carousel Template
  {
    id: 'carousel-hero',
    name: 'Hero Carousel',
    description: 'Carousel với 3 slides hero section, tự động chuyển slide',
    category: 'hero',
    thumbnail: getThumbnailDataURL('carousel-hero'),
    blocks: [
      {
        type: BlockType.CAROUSEL,
        order: 0,
        depth: 0,
        content: {
          slides: [
            {
              id: '1',
              title: 'Khuyến Mãi Đặc Biệt',
              subtitle: 'Giảm giá lên đến 50% cho tất cả sản phẩm',
              description: 'Ưu đãi có thời hạn - Nhanh tay đặt hàng ngay hôm nay!',
              image: 'https://images.unsplash.com/photo-1557821552-17105176677c?w=800&h=400&fit=crop',
              cta: { 
                text: 'Mua Ngay', 
                link: '#products' 
              },
              badge: 'HOT',
              bgColor: 'bg-gradient-to-r from-red-500 to-pink-600'
            },
            {
              id: '2',
              title: 'Sản Phẩm Mới 2024',
              subtitle: 'Bộ sưu tập mới nhất',
              description: 'Khám phá những sản phẩm chất lượng cao với thiết kế hiện đại',
              image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=400&fit=crop',
              cta: { 
                text: 'Khám Phá', 
                link: '#new-arrivals' 
              },
              badge: 'NEW',
              bgColor: 'bg-gradient-to-r from-blue-500 to-cyan-600'
            },
            {
              id: '3',
              title: 'Chất Lượng Đảm Bảo',
              subtitle: 'Cam kết 100% chính hãng',
              description: 'Tất cả sản phẩm đều được kiểm định chất lượng nghiêm ngặt',
              image: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=400&fit=crop',
              cta: { 
                text: 'Tìm Hiểu Thêm', 
                link: '#quality' 
              },
              badge: 'QUALITY',
              bgColor: 'bg-gradient-to-r from-green-500 to-emerald-600'
            }
          ],
          autoPlay: true,
          autoPlayInterval: 5000,
          showIndicators: true,
          showArrows: true,
          loop: true,
          style: {}
        }
      }
    ]
  },

  // Featured Products Carousel Template
  {
    id: 'carousel-featured-products',
    name: 'Featured Products Carousel',
    description: 'Carousel tự động hiển thị sản phẩm nổi bật từ database',
    category: 'custom',
    thumbnail: getThumbnailDataURL('carousel-featured-products'),
    blocks: [
      {
        type: BlockType.SECTION,
        order: 0,
        depth: 0,
        content: {
          fullWidth: true,
          containerWidth: 'xl',
          backgroundColor: '#ffffff',
          padding: { top: 80, bottom: 80 },
          style: {}
        },
        children: [
          {
            type: BlockType.CONTAINER,
            order: 0,
            depth: 1,
            content: {
              layout: 'stack',
              gap: 32,
              padding: 0,
              backgroundColor: 'transparent',
              style: {}
            },
            children: [
              {
                type: BlockType.TEXT,
                order: 0,
                depth: 2,
                content: {
                  content: '<h2 style="text-align: center; font-size: 2.5rem; font-weight: bold; margin: 0 0 16px 0;">Sản Phẩm Nổi Bật</h2>',
                  style: {}
                }
              },
              {
                type: BlockType.TEXT,
                order: 1,
                depth: 2,
                content: {
                  content: '<p style="text-align: center; font-size: 1.125rem; color: #64748b; margin: 0 0 32px 0;">Khám phá những sản phẩm được yêu thích nhất</p>',
                  style: {}
                }
              },
              {
                type: BlockType.CAROUSEL,
                order: 2,
                depth: 2,
                content: {
                  slides: [], // Empty - will be loaded from database
                  dataSource: {
                    type: 'database',
                    queryType: 'featured',
                    limit: 12,
                    titleField: 'name',
                    descriptionField: 'shortDesc',
                    imageField: 'thumbnail',
                    badgeField: 'isFeatured'
                  },
                  autoPlay: true,
                  autoPlayInterval: 4000,
                  showIndicators: true,
                  showArrows: true,
                  loop: true,
                  height: 'lg',
                  transition: 'slide',
                  indicatorStyle: 'dots',
                  arrowStyle: 'circle',
                  slidesPerView: 3,
                  animationType: 'fade',
                  animationDuration: 600,
                  style: {}
                }
              }
            ]
          }
        ]
      }
    ]
  }
];

/**
 * Get templates by category
 */
export const getTemplatesByCategory = (category: string) => {
  return BLOCK_TEMPLATES.filter(t => t.category === category);
};

/**
 * Get template by ID
 */
export const getTemplateById = (id: string) => {
  return BLOCK_TEMPLATES.find(t => t.id === id);
};
