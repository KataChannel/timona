import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createAboutUsPage() {
  try {
    console.log('Creating About Us demo page...');

    // Create the About Us page
    const aboutUsPage = await prisma.page.create({
      data: {
        title: 'About Us',
        slug: 'about-us',
        description: 'Learn more about our company, team, and mission',
        status: 'PUBLISHED',
        seoTitle: 'About Us - rausachcore Enterprise Kit',
        seoDescription: 'Discover our story, meet our team, and learn what drives us to build amazing enterprise solutions.',
        seoKeywords: ['about us', 'team', 'company', 'mission', 'enterprise'],
        createdBy: 'system',
        blocks: {
          create: [
            // 1. Hero Section
            {
              type: 'HERO',
              order: 0,
              isVisible: true,
              content: {
                title: 'About rausachcore',
                subtitle: 'Building the Future of Enterprise Solutions',
                description: 'We are passionate about creating innovative, scalable, and reliable enterprise solutions that empower businesses to achieve their goals.',
                buttonText: 'Learn More',
                buttonLink: '#our-story',
                backgroundImage: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
                backgroundColor: '#1f2937',
                textAlign: 'center',
                overlay: true,
                overlayOpacity: 40
              },
              style: {}
            },
            // 2. Our Story Section (Text Block)
            {
              type: 'TEXT',
              order: 1,
              isVisible: true,
              content: {
                html: `
                  <div class="max-w-4xl mx-auto py-16 px-4">
                    <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-8 text-center">Our Story</h2>
                    <div class="prose prose-lg mx-auto">
                      <p class="text-lg text-gray-700 leading-relaxed mb-6">
                        Founded in 2020, rausachcore emerged from a simple yet powerful vision: to bridge the gap between 
                        innovative technology and practical business solutions. Our founders, experienced engineers and 
                        entrepreneurs, recognized the need for enterprise-grade applications that are not only powerful 
                        but also intuitive and scalable.
                      </p>
                      <p class="text-lg text-gray-700 leading-relaxed mb-6">
                        Today, we continue to push the boundaries of what's possible in enterprise software development, 
                        combining cutting-edge technologies like Next.js, NestJS, GraphQL, and modern cloud infrastructure 
                        to deliver solutions that drive real business value.
                      </p>
                      <p class="text-lg text-gray-700 leading-relaxed">
                        Our commitment extends beyond just building software – we're dedicated to fostering innovation, 
                        supporting our clients' growth, and contributing to the broader tech community through open-source 
                        initiatives and knowledge sharing.
                      </p>
                    </div>
                  </div>
                `,
                text: 'Our Story content...',
                fontSize: 16,
                fontWeight: 'normal',
                textAlign: 'left',
                color: 'inherit'
              },
              style: {
                backgroundColor: '#ffffff',
                padding: '0'
              }
            },
            // 3. Stats Section
            {
              type: 'STATS',
              order: 2,
              isVisible: true,
              content: {
                title: 'Our Impact',
                subtitle: 'Numbers that reflect our commitment to excellence',
                stats: [
                  {
                    value: '500+',
                    label: 'Projects Delivered',
                    description: 'Successfully completed enterprise projects',
                    icon: 'target'
                  },
                  {
                    value: '100+',
                    label: 'Happy Clients',
                    description: 'Companies trusting our solutions',
                    icon: 'users'
                  },
                  {
                    value: '50+',
                    label: 'Team Members',
                    description: 'Talented professionals worldwide',
                    icon: 'users'
                  },
                  {
                    value: '99.9%',
                    label: 'Uptime',
                    description: 'Reliable and stable infrastructure',
                    icon: 'trending'
                  }
                ],
                layout: 'grid',
                animated: true
              },
              style: {}
            },
            // 4. Team Section
            {
              type: 'TEAM',
              order: 3,
              isVisible: true,
              content: {
                title: 'Meet Our Team',
                subtitle: 'The brilliant minds behind rausachcore\'s success',
                members: [
                  {
                    name: 'Alex Johnson',
                    position: 'CEO & Co-Founder',
                    bio: 'Visionary leader with 15+ years in enterprise software development. Passionate about scaling businesses through technology.',
                    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
                    social: {
                      linkedin: 'https://linkedin.com/in/alexjohnson',
                      twitter: 'https://twitter.com/alexjohnson',
                      email: 'alex@rausachcore.com'
                    }
                  },
                  {
                    name: 'Sarah Chen',
                    position: 'CTO & Co-Founder',
                    bio: 'Technical architect with expertise in scalable systems design. Leading our engineering excellence initiatives.',
                    image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
                    social: {
                      linkedin: 'https://linkedin.com/in/sarahchen',
                      twitter: 'https://twitter.com/sarahchen',
                      email: 'sarah@rausachcore.com'
                    }
                  },
                  {
                    name: 'Michael Rodriguez',
                    position: 'Head of Product',
                    bio: 'Product strategist focused on user experience and market-driven development. Ensuring our solutions meet real business needs.',
                    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
                    social: {
                      linkedin: 'https://linkedin.com/in/michaelrodriguez',
                      email: 'michael@rausachcore.com'
                    }
                  },
                  {
                    name: 'Emily Taylor',
                    position: 'Head of Engineering',
                    bio: 'Full-stack engineer with deep expertise in modern web technologies. Leading our development teams to build robust solutions.',
                    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
                    social: {
                      linkedin: 'https://linkedin.com/in/emilytaylor',
                      twitter: 'https://twitter.com/emilytaylor',
                      email: 'emily@rausachcore.com'
                    }
                  },
                  {
                    name: 'David Kim',
                    position: 'DevOps Lead',
                    bio: 'Infrastructure specialist ensuring our applications run smoothly at scale. Expert in cloud architecture and automation.',
                    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
                    social: {
                      linkedin: 'https://linkedin.com/in/davidkim',
                      email: 'david@rausachcore.com'
                    }
                  },
                  {
                    name: 'Lisa Wang',
                    position: 'UI/UX Designer',
                    bio: 'Creative designer passionate about crafting intuitive user experiences. Making complex enterprise software accessible and beautiful.',
                    image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
                    social: {
                      linkedin: 'https://linkedin.com/in/lisawang',
                      twitter: 'https://twitter.com/lisawang',
                      email: 'lisa@rausachcore.com'
                    }
                  }
                ],
                layout: 'grid',
                columns: 3
              },
              style: {}
            },
            // 5. Contact Info Section
            {
              type: 'CONTACT_INFO',
              order: 4,
              isVisible: true,
              content: {
                title: 'Get In Touch',
                subtitle: 'Ready to start your next project? We\'d love to hear from you.',
                contacts: [
                  {
                    type: 'address',
                    label: 'Head Office',
                    value: '123 Innovation Drive, Tech Valley, CA 94043, USA',
                    icon: 'address'
                  },
                  {
                    type: 'phone',
                    label: 'Phone',
                    value: '+1 (555) 123-4567',
                    icon: 'phone'
                  },
                  {
                    type: 'email',
                    label: 'Email',
                    value: 'hello@rausachcore.com',
                    icon: 'email'
                  },
                  {
                    type: 'hours',
                    label: 'Business Hours',
                    value: 'Monday - Friday: 9:00 AM - 6:00 PM PST',
                    icon: 'hours'
                  }
                ],
                showMap: true,
                mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3168.639108571621!2d-122.08424968469252!3d37.42199997982629!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x808fba02425dad8f%3A0x6c296c66619367e0!2sGoogleplex!5e0!3m2!1sen!2sus!4v1635959492518!5m2!1sen!2sus'
              },
              style: {}
            }
          ]
        }
      },
      include: {
        blocks: {
          orderBy: { order: 'asc' }
        }
      }
    });

    console.log('✅ About Us page created successfully!');
    console.log(`Page ID: ${aboutUsPage.id}`);
    console.log(`Page URL: /about-us`);
    console.log(`Admin URL: /admin/pagebuilder?pageId=${aboutUsPage.id}`);
    console.log(`Blocks created: ${aboutUsPage.blocks.length}`);

    return aboutUsPage;
  } catch (error) {
    console.error('❌ Error creating About Us page:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
createAboutUsPage()
  .then(() => {
    console.log('🎉 Demo About Us page setup completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Failed to create demo page:', error);
    process.exit(1);
  });