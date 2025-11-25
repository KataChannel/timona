import { BlockType } from '@/types/page-builder';
import { 
  saveCustomTemplateToDB, 
  getCustomTemplatesFromDB 
} from './customTemplates';

/**
 * Initialize sample custom templates if they don't exist
 * This will create 3 sample saved templates for users
 * 
 * @param client - Apollo Client instance
 * @param userId - Current user ID
 */
export async function initSampleTemplates(client: any, userId: string) {
  try {
    const existing = await getCustomTemplatesFromDB(client, userId);
    
    // Check if sample templates already exist
    if (existing.some(t => t.id.startsWith('sample-'))) {
      console.log('Sample templates already exist, skipping initialization');
      return;
    }
  } catch (error) {
    console.error('Error checking existing templates:', error);
    return;
  }

  console.log('Initializing sample custom templates...');

  // Sample 1: Product Showcase
  try {
    await saveCustomTemplateToDB(client, {
      name: 'Product Showcase',
      description: 'Mẫu giới thiệu sản phẩm với hình ảnh, mô tả và nút mua hàng',
      category: 'custom',
      blocks: [
        {
          type: BlockType.SECTION,
          order: 0,
          depth: 0,
          content: {
            backgroundColor: '#ffffff',
            padding: { top: 60, bottom: 60 },
          },
        },
        {
          type: BlockType.GRID,
          order: 1,
          depth: 0,
          content: {
            columns: 2,
            gap: '32px',
          },
        },
        {
          type: BlockType.IMAGE,
          order: 2,
          depth: 1,
          parentId: 'temp-grid-1',
          content: {
            src: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=400&fit=crop',
            alt: 'Product Image',
          },
        },
        {
          type: BlockType.FLEX_COLUMN,
          order: 3,
          depth: 1,
          parentId: 'temp-grid-1',
          content: {
            gap: '16px',
          },
        },
        {
          type: BlockType.TEXT,
          order: 4,
          depth: 2,
          content: {
            content: '<h2 style="font-size: 2rem; font-weight: bold; margin: 0;">Sản phẩm chất lượng cao</h2>',
          },
        },
        {
          type: BlockType.TEXT,
          order: 5,
          depth: 2,
          content: {
            content: '<p style="color: #64748b; line-height: 1.6;">Khám phá sản phẩm tuyệt vời của chúng tôi với chất lượng đảm bảo và giá cả phải chăng. Đặt hàng ngay hôm nay!</p>',
          },
        },
        {
          type: BlockType.BUTTON,
          order: 6,
          depth: 2,
          content: {
            text: 'Mua ngay',
            href: '#',
            variant: 'primary',
            style: {
              backgroundColor: '#3b82f6',
              color: 'white',
            },
          },
        },
      ],
    }, userId);
    console.log('✅ Created: Product Showcase');
  } catch (error) {
    console.error('Failed to create Product Showcase template:', error);
  }

  // Sample 2: Team Introduction
  try {
    await saveCustomTemplateToDB(client, {
      name: 'Team Introduction',
      description: 'Mẫu giới thiệu đội ngũ với ảnh và thông tin thành viên',
      category: 'team',
      blocks: [
        {
          type: BlockType.SECTION,
          order: 0,
          depth: 0,
          content: {
            backgroundColor: '#f8fafc',
            padding: { top: 80, bottom: 80 },
          },
        },
        {
          type: BlockType.TEXT,
          order: 1,
          depth: 0,
          content: {
            content: '<h2 style="text-align: center; font-size: 2.5rem; font-weight: bold; margin-bottom: 1rem;">Đội ngũ của chúng tôi</h2>',
          },
        },
        {
          type: BlockType.TEXT,
          order: 2,
          depth: 0,
          content: {
            content: '<p style="text-align: center; color: #64748b; font-size: 1.125rem; margin-bottom: 3rem;">Gặp gỡ những người làm nên sự khác biệt</p>',
          },
        },
        {
          type: BlockType.GRID,
          order: 3,
          depth: 0,
          content: {
            columns: 3,
            gap: '24px',
          },
        },
        {
          type: BlockType.FLEX_COLUMN,
          order: 4,
          depth: 1,
          parentId: 'temp-grid-2',
          content: {
            gap: '12px',
            style: {
              backgroundColor: 'white',
              padding: '24px',
              borderRadius: '12px',
            },
          },
        },
        {
          type: BlockType.IMAGE,
          order: 5,
          depth: 2,
          content: {
            src: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&h=300&fit=crop',
            alt: 'Team Member 1',
            style: {
              borderRadius: '50%',
              width: '120px',
              height: '120px',
              margin: '0 auto',
            },
          },
        },
        {
          type: BlockType.TEXT,
          order: 6,
          depth: 2,
          content: {
            content: '<h3 style="text-align: center; font-size: 1.25rem; font-weight: 600;">Nguyễn Văn A</h3>',
          },
        },
        {
          type: BlockType.TEXT,
          order: 7,
          depth: 2,
          content: {
            content: '<p style="text-align: center; color: #64748b;">CEO & Founder</p>',
          },
        },
      ],
    }, userId);
    console.log('✅ Created: Team Introduction');
  } catch (error) {
    console.error('Failed to create Team Introduction template:', error);
  }

  // Sample 3: Call to Action
  try {
    await saveCustomTemplateToDB(client, {
      name: 'Call to Action',
      description: 'Mẫu kêu gọi hành động với tiêu đề nổi bật và nút CTA',
      category: 'cta',
      blocks: [
        {
          type: BlockType.SECTION,
          order: 0,
          depth: 0,
          content: {
            backgroundColor: '#3b82f6',
            padding: { top: 100, bottom: 100 },
          },
        },
        {
          type: BlockType.CONTAINER,
          order: 1,
          depth: 0,
          content: {
            maxWidth: '800px',
            alignment: 'center',
          },
        },
        {
          type: BlockType.TEXT,
          order: 2,
          depth: 1,
          content: {
            content: '<h2 style="text-align: center; font-size: 3rem; font-weight: bold; color: white; margin-bottom: 1.5rem;">Sẵn sàng bắt đầu?</h2>',
          },
        },
        {
          type: BlockType.TEXT,
          order: 3,
          depth: 1,
          content: {
            content: '<p style="text-align: center; font-size: 1.25rem; color: rgba(255,255,255,0.9); margin-bottom: 2rem;">Tham gia cùng hàng ngàn khách hàng hài lòng đang sử dụng dịch vụ của chúng tôi</p>',
          },
        },
        {
          type: BlockType.FLEX_ROW,
          order: 4,
          depth: 1,
          content: {
            justifyContent: 'center',
            gap: '16px',
          },
        },
        {
          type: BlockType.BUTTON,
          order: 5,
          depth: 2,
          content: {
            text: 'Dùng thử miễn phí',
            href: '#',
            variant: 'primary',
            style: {
              backgroundColor: 'white',
              color: '#3b82f6',
              padding: '16px 32px',
              fontSize: '1.125rem',
              borderRadius: '8px',
              fontWeight: '600',
            },
          },
        },
        {
          type: BlockType.BUTTON,
          order: 6,
          depth: 2,
          content: {
            text: 'Xem demo',
            href: '#',
            variant: 'outline',
            style: {
              backgroundColor: 'transparent',
              color: 'white',
              padding: '16px 32px',
              fontSize: '1.125rem',
              borderRadius: '8px',
              border: '2px solid white',
              fontWeight: '600',
            },
          },
        },
        {
          type: BlockType.SPACER,
          order: 7,
          depth: 1,
          content: {
            height: 24,
          },
        },
        {
          type: BlockType.STATS,
          order: 8,
          depth: 1,
          content: {
            stats: [
              {
                id: '1',
                value: '10K+',
                label: 'Khách hàng',
                icon: 'users',
              },
              {
                id: '2',
                value: '99%',
                label: 'Hài lòng',
                icon: 'star',
              },
              {
                id: '3',
                value: '24/7',
                label: 'Hỗ trợ',
                icon: 'headphones',
              },
            ],
            style: {
              color: 'white',
            },
          },
        },
      ],
    }, userId);
    console.log('✅ Created: Call to Action');
  } catch (error) {
    console.error('Failed to create Call to Action template:', error);
  }

  console.log('✨ Sample templates initialized successfully!');
}
