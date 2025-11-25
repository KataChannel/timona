/**
 * Sample Templates for Dynamic Blocks
 * 
 * Pre-configured templates with example data that are automatically set up
 * when users add a Dynamic Block to their page
 */

export interface SampleTemplate {
  id: string;
  name: string;
  description: string;
  template: string;
  dataSource: {
    type: 'static' | 'graphql' | 'api';
    data?: any;
    staticData?: any;
    query?: string;
    variables?: any;
    endpoint?: string;
  };
  variables: Record<string, any>;
  preview?: string;
}

/**
 * Product Grid Template
 * Perfect for showcasing featured products
 */
export const productGridTemplate: SampleTemplate = {
  id: 'product-grid',
  name: 'Product Grid',
  description: 'Display products in a responsive grid with images, prices, and descriptions',
  template: `
<div class="product-grid-container p-8 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg">
  <h2 class="text-3xl font-bold mb-2">{{title}}</h2>
  <p class="text-gray-600 mb-6">{{subtitle}}</p>
  
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {{#each products}}
    <div class="product-card bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden">
      <img src="{{this.image}}" alt="{{this.name}}" class="w-full h-48 object-cover" />
      <div class="p-4">
        <h3 class="font-semibold text-lg mb-2">{{this.name}}</h3>
        <p class="text-gray-600 text-sm mb-3">{{this.description}}</p>
        <div class="flex justify-between items-center">
          <span class="text-xl font-bold text-blue-600">{{this.price}}</span>
          <button class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors">
            View Details
          </button>
        </div>
      </div>
    </div>
    {{/each}}
  </div>
</div>
  `,
  dataSource: {
    type: 'static',
    staticData: {
      title: 'Featured Products',
      subtitle: 'Discover our best-selling products with premium quality and affordable prices',
      products: [
        {
          id: 1,
          name: 'MacBook Pro M3',
          price: '$1,999',
          description: 'Powerful laptop for professionals with M3 chip and stunning display',
          image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=300&fit=crop',
        },
        {
          id: 2,
          name: 'iPhone 15 Pro',
          price: '$1,099',
          description: 'Latest smartphone with advanced camera system and A17 Pro chip',
          image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=300&fit=crop',
        },
        {
          id: 3,
          name: 'AirPods Pro',
          price: '$249',
          description: 'Premium wireless earbuds with noise cancellation and spatial audio',
          image: 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=400&h=300&fit=crop',
        },
      ],
    },
  },
  variables: {},
};

/**
 * Task Dashboard Template
 * Great for project management and task organization
 */
export const taskDashboardTemplate: SampleTemplate = {
  id: 'task-dashboard',
  name: 'Task Dashboard',
  description: 'Organize tasks in a Kanban-style dashboard with status columns',
  template: `
<div class="task-dashboard-container p-8 bg-gray-50 rounded-lg">
  <h2 class="text-3xl font-bold mb-2">{{projectName}}</h2>
  <p class="text-gray-600 mb-6">Track your project progress across different stages</p>
  
  <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
    <!-- Todo Column -->
    <div class="column bg-white rounded-lg shadow-md p-4">
      <h3 class="font-bold text-lg mb-4 text-red-600">📋 To Do ({{todoCount}})</h3>
      <div class="space-y-3">
        {{#each todoTasks}}
        <div class="task-card bg-red-50 p-3 rounded-lg border-l-4 border-red-500">
          <h4 class="font-semibold">{{this.title}}</h4>
          <p class="text-sm text-gray-600">{{this.description}}</p>
          <div class="mt-2 flex justify-between items-center text-xs">
            <span class="text-red-600 font-semibold">{{this.priority}}</span>
            <span class="text-gray-500">{{this.dueDate}}</span>
          </div>
        </div>
        {{/each}}
      </div>
    </div>
    
    <!-- In Progress Column -->
    <div class="column bg-white rounded-lg shadow-md p-4">
      <h3 class="font-bold text-lg mb-4 text-yellow-600">⚙️ In Progress ({{inProgressCount}})</h3>
      <div class="space-y-3">
        {{#each inProgressTasks}}
        <div class="task-card bg-yellow-50 p-3 rounded-lg border-l-4 border-yellow-500">
          <h4 class="font-semibold">{{this.title}}</h4>
          <p class="text-sm text-gray-600">{{this.description}}</p>
          <div class="mt-2 flex justify-between items-center text-xs">
            <span class="text-yellow-600 font-semibold">{{this.priority}}</span>
            <span class="text-gray-500">Assigned to: {{this.assignee}}</span>
          </div>
        </div>
        {{/each}}
      </div>
    </div>
    
    <!-- Done Column -->
    <div class="column bg-white rounded-lg shadow-md p-4">
      <h3 class="font-bold text-lg mb-4 text-green-600">✅ Done ({{doneCount}})</h3>
      <div class="space-y-3">
        {{#each doneTasks}}
        <div class="task-card bg-green-50 p-3 rounded-lg border-l-4 border-green-500">
          <h4 class="font-semibold line-through text-gray-600">{{this.title}}</h4>
          <p class="text-sm text-gray-500">{{this.description}}</p>
        </div>
        {{/each}}
      </div>
    </div>
  </div>
</div>
  `,
  dataSource: {
    type: 'static',
    staticData: {
      projectName: 'Website Redesign',
      todoCount: 2,
      inProgressCount: 2,
      doneCount: 2,
      todoTasks: [
        {
          id: 1,
          title: 'Design mockups',
          description: 'Create wireframes and prototypes for new features',
          priority: 'HIGH',
          dueDate: '2025-10-20',
        },
        {
          id: 2,
          title: 'Write specifications',
          description: 'Document technical requirements',
          priority: 'MEDIUM',
          dueDate: '2025-10-22',
        },
      ],
      inProgressTasks: [
        {
          id: 3,
          title: 'Frontend development',
          description: 'Implement React components and styling',
          priority: 'HIGH',
          assignee: 'John Doe',
        },
        {
          id: 4,
          title: 'API integration',
          description: 'Connect frontend to backend services',
          priority: 'HIGH',
          assignee: 'Jane Smith',
        },
      ],
      doneTasks: [
        {
          id: 5,
          title: 'Research phase',
          description: 'Completed market analysis and competitor review',
          priority: 'MEDIUM',
        },
        {
          id: 6,
          title: 'Project kickoff',
          description: 'Team meeting and project planning complete',
          priority: 'HIGH',
        },
      ],
    },
  },
  variables: {},
};

/**
 * Category Showcase Template
 * Display product or content categories with icons and links
 */
export const categoryShowcaseTemplate: SampleTemplate = {
  id: 'category-showcase',
  name: 'Category Showcase',
  description: 'Display categories with images and product counts in a hero-style layout',
  template: `
<div class="category-showcase-container py-12 px-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
  <h2 class="text-3xl font-bold mb-2 text-center">{{title}}</h2>
  <p class="text-gray-600 mb-8 text-center">Browse our collections</p>
  
  <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
    {{#each categories}}
    <div class="category-card group cursor-pointer transform hover:scale-105 transition-transform duration-300">
      <div class="relative overflow-hidden rounded-lg shadow-lg h-64">
        <img src="{{this.image}}" alt="{{this.name}}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
        <div class="absolute inset-0 bg-black bg-opacity-40 group-hover:bg-opacity-50 transition-all duration-300 flex flex-col justify-end p-4">
          <h3 class="text-white font-bold text-2xl">{{this.name}}</h3>
          <p class="text-white text-sm">{{this.productCount}} products</p>
        </div>
      </div>
    </div>
    {{/each}}
  </div>
</div>
  `,
  dataSource: {
    type: 'static',
    staticData: {
      title: 'Shop by Category',
      categories: [
        {
          id: 1,
          name: 'Electronics',
          image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&h=300&fit=crop',
          productCount: 150,
        },
        {
          id: 2,
          name: 'Fashion',
          image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=300&fit=crop',
          productCount: 89,
        },
        {
          id: 3,
          name: 'Home & Garden',
          image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop',
          productCount: 67,
        },
      ],
    },
  },
  variables: {},
};

/**
 * Hero Section Template
 * Large banner section with title, subtitle and CTA button
 */
export const heroSectionTemplate: SampleTemplate = {
  id: 'hero-section',
  name: 'Hero Section',
  description: 'Large banner section with background image, headline and CTA button',
  template: `
<div class="hero-section relative overflow-hidden rounded-lg h-96 md:h-[500px]">
  <img src="{{backgroundImage}}" alt="Hero" class="absolute inset-0 w-full h-full object-cover" />
  <div class="absolute inset-0 bg-black bg-opacity-40"></div>
  
  <div class="absolute inset-0 flex flex-col justify-center items-center text-center p-4">
    <h1 class="text-4xl md:text-5xl font-bold text-white mb-4 max-w-3xl">{{title}}</h1>
    <p class="text-lg md:text-xl text-white mb-8 max-w-2xl">{{subtitle}}</p>
    <button class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg text-lg transition-colors">
      {{ctaText}}
    </button>
  </div>
</div>
  `,
  dataSource: {
    type: 'static',
    staticData: {
      title: 'Turn Ideas Into Reality',
      subtitle: 'Build professional websites with cutting-edge technology. No coding required.',
      ctaText: 'Start Building Now',
      backgroundImage: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1920&h=1080&fit=crop',
    },
  },
  variables: {},
};

/**
 * Testimonials Template
 * Display customer testimonials with avatars and ratings
 */
export const testimonialsTemplate: SampleTemplate = {
  id: 'testimonials',
  name: 'Testimonials',
  description: 'Showcase customer testimonials with avatars, names, and star ratings',
  template: `
<div class="testimonials-container py-12 px-6 bg-gray-50 rounded-lg">
  <h2 class="text-3xl font-bold mb-2 text-center">{{title}}</h2>
  <p class="text-gray-600 mb-8 text-center">Read what our happy customers have to say</p>
  
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {{#each testimonials}}
    <div class="testimonial-card bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
      <div class="flex items-center mb-4">
        <img src="{{this.avatar}}" alt="{{this.name}}" class="w-12 h-12 rounded-full object-cover mr-4" />
        <div>
          <h3 class="font-bold">{{this.name}}</h3>
          <p class="text-sm text-gray-600">{{this.position}}</p>
        </div>
      </div>
      
      <div class="flex mb-3 text-yellow-400">
        {{#range this.rating}}⭐{{/range}}
      </div>
      
      <p class="text-gray-700 italic">"{{this.content}}"</p>
    </div>
    {{/each}}
  </div>
</div>
  `,
  dataSource: {
    type: 'static',
    staticData: {
      title: 'What Our Customers Say',
      testimonials: [
        {
          id: 1,
          name: 'Nguyễn Văn A',
          position: 'CEO, Tech Startup',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face',
          content: 'Excellent service! The team is very professional and supportive. Our website traffic increased by 300%.',
          rating: 5,
        },
        {
          id: 2,
          name: 'Trần Thị B',
          position: 'Marketing Manager, Fashion Brand',
          avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=80&h=80&fit=crop&crop=face',
          content: 'Beautiful design, complete features, and fast loading speed. Definitely worth the investment!',
          rating: 5,
        },
        {
          id: 3,
          name: 'Lê Minh C',
          position: 'Founder, E-commerce Store',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face',
          content: 'Since using this platform, our online sales have doubled. Highly recommended to everyone!',
          rating: 5,
        },
      ],
    },
  },
  variables: {},
};

/**
 * Contact Form Template
 * Display contact information and form
 */
export const contactFormTemplate: SampleTemplate = {
  id: 'contact-form',
  name: 'Contact Form',
  description: 'Display contact information and a contact form',
  template: `
<div class="contact-container p-8 bg-white rounded-lg">
  <div class="max-w-2xl mx-auto">
    <h2 class="text-3xl font-bold mb-2">{{title}}</h2>
    <p class="text-gray-600 mb-8">{{description}}</p>
    
    <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
      <div class="space-y-4">
        <div class="flex items-start">
          <span class="text-blue-600 text-2xl mr-4">✉️</span>
          <div>
            <h3 class="font-bold">Email</h3>
            <p class="text-gray-600">{{email}}</p>
          </div>
        </div>
        <div class="flex items-start">
          <span class="text-blue-600 text-2xl mr-4">📞</span>
          <div>
            <h3 class="font-bold">Phone</h3>
            <p class="text-gray-600">{{phone}}</p>
          </div>
        </div>
        <div class="flex items-start">
          <span class="text-blue-600 text-2xl mr-4">📍</span>
          <div>
            <h3 class="font-bold">Address</h3>
            <p class="text-gray-600">{{address}}</p>
          </div>
        </div>
      </div>
      
      <form class="space-y-4">
        <input type="text" placeholder="Your Name" class="w-full px-4 py-2 border border-gray-300 rounded-lg" />
        <input type="email" placeholder="Your Email" class="w-full px-4 py-2 border border-gray-300 rounded-lg" />
        <textarea placeholder="Your Message" class="w-full px-4 py-2 border border-gray-300 rounded-lg h-24"></textarea>
        <button type="submit" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">
          Send Message
        </button>
      </form>
    </div>
  </div>
</div>
  `,
  dataSource: {
    type: 'static',
    staticData: {
      title: 'Get in Touch',
      description: 'We are always ready to help. Leave your information and we will respond within 24 hours.',
      email: 'hello@rausachcore.com',
      phone: '+84 (0) 123 456 789',
      address: 'Floor 10, ABC Building, 123 DEF Street, District 1, Ho Chi Minh City',
    },
  },
  variables: {},
};

/**
 * FAQ Section Template
 * Display frequently asked questions
 */
export const faqTemplate: SampleTemplate = {
  id: 'faq-section',
  name: 'FAQ Section',
  description: 'Collapsible FAQ section with common questions and answers',
  template: `
<div class="faq-container py-12 px-6 bg-gray-50 rounded-lg">
  <h2 class="text-3xl font-bold mb-2 text-center">{{title}}</h2>
  <p class="text-gray-600 mb-8 text-center">Find answers to common questions</p>
  
  <div class="max-w-2xl mx-auto space-y-4">
    {{#each faqs}}
    <div class="faq-item bg-white p-4 rounded-lg shadow-md">
      <button class="w-full flex justify-between items-center font-bold text-lg hover:text-blue-600 transition-colors">
        <span>{{this.question}}</span>
        <span class="text-blue-600">+</span>
      </button>
      <p class="hidden text-gray-600 mt-3 pt-3 border-t">{{this.answer}}</p>
    </div>
    {{/each}}
  </div>
  
  <p class="text-center text-gray-600 mt-8">Still have questions? Contact our support team!</p>
</div>
  `,
  dataSource: {
    type: 'static',
    staticData: {
      title: 'Frequently Asked Questions',
      faqs: [
        {
          id: 1,
          question: 'Do I need coding knowledge to design a website?',
          answer: 'Not at all! Our platform is designed with an intuitive drag-and-drop interface. You just drag components and customize them to your needs without writing any code.',
        },
        {
          id: 2,
          question: 'How many templates are available?',
          answer: 'We provide 100+ professional templates for different industries: e-commerce, business, portfolio, blog, landing pages, and more. New templates are added regularly.',
        },
        {
          id: 3,
          question: 'Are websites responsive on mobile devices?',
          answer: 'Yes! All templates and components are fully responsive and optimized for all devices - desktop, tablet, and mobile phones.',
        },
        {
          id: 4,
          question: 'Do you support SEO?',
          answer: 'Absolutely! We include complete SEO features: meta tags, sitemap generation, structured data, image optimization, and page speed optimization.',
        },
        {
          id: 5,
          question: 'Can I integrate custom code?',
          answer: 'Yes! While our platform is no-code friendly, you can also add custom HTML, CSS, and JavaScript for advanced customizations.',
        },
      ],
    },
  },
  variables: {},
};

/**
 * Product Carousel Template
 * Display products in an auto-scrolling carousel with data from database
 */
export const productCarouselTemplate: SampleTemplate = {
  id: 'product-carousel',
  name: 'Product Carousel',
  description: 'Auto-scrolling carousel showcasing featured products from your database',
  template: `
<div class="product-carousel-container py-12 px-4 md:px-8 bg-gradient-to-b from-white to-gray-50 rounded-lg overflow-hidden">
  <div class="max-w-7xl mx-auto">
    <!-- Header -->
    <div class="text-center mb-8">
      <h2 class="text-3xl md:text-4xl font-bold mb-3 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
        {{title}}
      </h2>
      <p class="text-gray-600 text-lg">{{subtitle}}</p>
    </div>

    <!-- Carousel Container -->
    <div class="relative group">
      <!-- Navigation Buttons -->
      <button class="carousel-prev absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 -ml-4">
        <svg class="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
        </svg>
      </button>
      <button class="carousel-next absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 -mr-4">
        <svg class="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
        </svg>
      </button>

      <!-- Carousel Track -->
      <div class="overflow-hidden">
        <div class="carousel-track flex gap-6 transition-transform duration-500 ease-out">
          {{#each products}}
          <div class="carousel-item flex-shrink-0 w-full sm:w-1/2 lg:w-1/3 xl:w-1/4">
            <div class="product-card bg-white rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden group/card h-full flex flex-col">
              <!-- Product Image -->
              <div class="relative overflow-hidden aspect-square bg-gray-100">
                {{#if this.thumbnail}}
                  <img src="{{this.thumbnail}}" alt="{{this.name}}" class="w-full h-full object-cover group-hover/card:scale-110 transition-transform duration-500" />
                {{else}}
                  <div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300">
                    <svg class="w-20 h-20 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                    </svg>
                  </div>
                {{/if}}
                
                <!-- Badges -->
                <div class="absolute top-3 left-3 flex flex-col gap-2">
                  {{#if this.isFeatured}}
                    <span class="bg-yellow-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">⭐ Featured</span>
                  {{/if}}
                  {{#if this.isOnSale}}
                    <span class="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">🔥 Sale</span>
                  {{/if}}
                  {{#if this.isNewArrival}}
                    <span class="bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">✨ New</span>
                  {{/if}}
                </div>

                <!-- Discount Badge -->
                {{#if this.discountPercentage}}
                  <div class="absolute top-3 right-3">
                    <span class="bg-gradient-to-r from-red-500 to-pink-500 text-white text-sm font-bold px-3 py-2 rounded-lg shadow-lg">
                      -{{this.discountPercentage}}%
                    </span>
                  </div>
                {{/if}}
              </div>

              <!-- Product Info -->
              <div class="p-4 flex-grow flex flex-col">
                <!-- Category -->
                {{#if this.category}}
                  <p class="text-xs text-blue-600 font-semibold uppercase tracking-wide mb-2">
                    {{this.category.name}}
                  </p>
                {{/if}}

                <!-- Product Name -->
                <h3 class="font-bold text-lg mb-2 line-clamp-2 group-hover/card:text-blue-600 transition-colors">
                  {{this.name}}
                </h3>

                <!-- Description -->
                {{#if this.shortDesc}}
                  <p class="text-sm text-gray-600 mb-3 line-clamp-2">{{this.shortDesc}}</p>
                {{/if}}

                <!-- SKU & Stock -->
                <div class="flex items-center gap-3 mb-3 text-xs text-gray-500">
                  {{#if this.sku}}
                    <span class="flex items-center gap-1">
                      <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"/>
                      </svg>
                      {{this.sku}}
                    </span>
                  {{/if}}
                  <span class="flex items-center gap-1 {{#if this.stock}}{{#if (gt this.stock 0)}}text-green-600{{else}}text-red-600{{/if}}{{/if}}">
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
                    </svg>
                    {{#if this.stock}}
                      {{#if (gt this.stock 0)}}
                        Còn {{this.stock}} {{this.unit}}
                      {{else}}
                        Hết hàng
                      {{/if}}
                    {{else}}
                      Liên hệ
                    {{/if}}
                  </span>
                </div>

                <!-- Pricing -->
                <div class="mt-auto">
                  <div class="flex items-baseline gap-2 mb-3">
                    <span class="text-2xl font-bold text-blue-600">
                      {{this.price}}đ
                    </span>
                    {{#if this.originalPrice}}
                      {{#if (gt this.originalPrice this.price)}}
                        <span class="text-sm text-gray-400 line-through">
                          {{this.originalPrice}}đ
                        </span>
                      {{/if}}
                    {{/if}}
                  </div>

                  <!-- Action Buttons -->
                  <div class="flex gap-2">
                    <button class="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-2.5 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg">
                      <span class="flex items-center justify-center gap-2">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
                        </svg>
                        Thêm giỏ
                      </span>
                    </button>
                    <button class="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2.5 px-3 rounded-lg transition-colors">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {{/each}}
        </div>
      </div>

      <!-- Carousel Indicators -->
      <div class="flex justify-center gap-2 mt-6">
        {{#each products}}
          <button class="carousel-indicator w-2 h-2 rounded-full bg-gray-300 hover:bg-gray-400 transition-colors" data-index="{{@index}}"></button>
        {{/each}}
      </div>
    </div>

    <!-- View All Button -->
    <div class="text-center mt-8">
      <button class="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 px-8 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
        Xem tất cả sản phẩm →
      </button>
    </div>
  </div>
</div>

<!-- Carousel Auto-scroll Script -->
<script>
(function() {
  const track = document.querySelector('.carousel-track');
  const prevBtn = document.querySelector('.carousel-prev');
  const nextBtn = document.querySelector('.carousel-next');
  const indicators = document.querySelectorAll('.carousel-indicator');
  const items = document.querySelectorAll('.carousel-item');
  
  if (!track || items.length === 0) return;
  
  let currentIndex = 0;
  const itemsPerView = window.innerWidth >= 1280 ? 4 : window.innerWidth >= 1024 ? 3 : window.innerWidth >= 640 ? 2 : 1;
  const maxIndex = Math.max(0, items.length - itemsPerView);
  let autoScrollInterval;
  
  function updateCarousel() {
    const itemWidth = items[0].offsetWidth;
    const gap = 24; // 1.5rem = 24px
    const offset = -(currentIndex * (itemWidth + gap));
    track.style.transform = \`translateX(\${offset}px)\`;
    
    indicators.forEach((indicator, i) => {
      indicator.classList.toggle('bg-blue-600', i === currentIndex);
      indicator.classList.toggle('bg-gray-300', i !== currentIndex);
    });
  }
  
  function nextSlide() {
    currentIndex = currentIndex >= maxIndex ? 0 : currentIndex + 1;
    updateCarousel();
  }
  
  function prevSlide() {
    currentIndex = currentIndex <= 0 ? maxIndex : currentIndex - 1;
    updateCarousel();
  }
  
  // Auto-scroll every 5 seconds
  function startAutoScroll() {
    autoScrollInterval = setInterval(nextSlide, 5000);
  }
  
  function stopAutoScroll() {
    clearInterval(autoScrollInterval);
  }
  
  // Event Listeners
  prevBtn?.addEventListener('click', () => {
    prevSlide();
    stopAutoScroll();
    startAutoScroll();
  });
  
  nextBtn?.addEventListener('click', () => {
    nextSlide();
    stopAutoScroll();
    startAutoScroll();
  });
  
  indicators.forEach((indicator, index) => {
    indicator.addEventListener('click', () => {
      currentIndex = index;
      updateCarousel();
      stopAutoScroll();
      startAutoScroll();
    });
  });
  
  // Pause on hover
  track.parentElement.addEventListener('mouseenter', stopAutoScroll);
  track.parentElement.addEventListener('mouseleave', startAutoScroll);
  
  // Initialize
  updateCarousel();
  startAutoScroll();
  
  // Handle resize
  window.addEventListener('resize', updateCarousel);
})();
</script>
  `,
  dataSource: {
    type: 'static',
    staticData: {
      title: 'Sản Phẩm Nổi Bật',
      subtitle: 'Khám phá những sản phẩm được yêu thích nhất',
      products: [
        {
          id: '1',
          name: 'Serum Vitamin C Dưỡng Trắng Da',
          slug: 'serum-vitamin-c-duong-trang-da',
          shortDesc: 'Làm sáng da, mờ thâm nám, tăng cường collagen tự nhiên',
          description: 'Serum Vitamin C cao cấp giúp dưỡng trắng da hiệu quả',
          sku: 'SER-VIT-C-001',
          price: 299000,
          originalPrice: 450000,
          unit: 'Chai',
          stock: 150,
          status: 'ACTIVE',
          thumbnail: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&h=400&fit=crop',
          isFeatured: true,
          isNewArrival: false,
          isBestSeller: true,
          isOnSale: true,
          category: {
            id: 'cat-1',
            name: 'Chăm Sóc Da',
            slug: 'cham-soc-da',
          },
        },
        {
          id: '2',
          name: 'Bộ Dụng Cụ Nối Mi Chuyên Nghiệp',
          slug: 'bo-dung-cu-noi-mi-chuyen-nghiep',
          shortDesc: 'Bộ full dụng cụ nối mi cao cấp cho thợ chuyên nghiệp',
          description: 'Bộ dụng cụ nối mi chuyên nghiệp đầy đủ nhất',
          sku: 'NOI-MI-SET-001',
          price: 1250000,
          originalPrice: 1800000,
          unit: 'Bộ',
          stock: 45,
          status: 'ACTIVE',
          thumbnail: 'https://images.unsplash.com/photo-1631730486572-226d1f595b68?w=400&h=400&fit=crop',
          isFeatured: true,
          isNewArrival: true,
          isBestSeller: false,
          isOnSale: true,
          category: {
            id: 'cat-2',
            name: 'Nối Mi',
            slug: 'noi-mi',
          },
        },
        {
          id: '3',
          name: 'Kem Dưỡng Ẩm Hyaluronic Acid',
          slug: 'kem-duong-am-hyaluronic-acid',
          shortDesc: 'Cấp ẩm sâu, làm mềm mịn da, chống lão hóa hiệu quả',
          description: 'Kem dưỡng ẩm chuyên sâu với Hyaluronic Acid',
          sku: 'CREAM-HYA-001',
          price: 380000,
          originalPrice: 520000,
          unit: 'Hộp',
          stock: 200,
          status: 'ACTIVE',
          thumbnail: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400&h=400&fit=crop',
          isFeatured: true,
          isNewArrival: false,
          isBestSeller: true,
          isOnSale: false,
          category: {
            id: 'cat-1',
            name: 'Chăm Sóc Da',
            slug: 'cham-soc-da',
          },
        },
        {
          id: '4',
          name: 'Keo Nối Mi Hàn Quốc Premium',
          slug: 'keo-noi-mi-han-quoc-premium',
          shortDesc: 'Keo nối mi siêu dính, giữ lâu, không gây kích ứng',
          description: 'Keo nối mi nhập khẩu Hàn Quốc chất lượng cao',
          sku: 'GLUE-KR-PREM-001',
          price: 450000,
          originalPrice: null,
          unit: 'Chai',
          stock: 89,
          status: 'ACTIVE',
          thumbnail: 'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=400&h=400&fit=crop',
          isFeatured: true,
          isNewArrival: true,
          isBestSeller: false,
          isOnSale: false,
          category: {
            id: 'cat-2',
            name: 'Nối Mi',
            slug: 'noi-mi',
          },
        },
        {
          id: '5',
          name: 'Mực Phun Xăm Môi Organic',
          slug: 'muc-phun-xam-moi-organic',
          shortDesc: 'Mực phun xăm môi an toàn, màu chuẩn, lên màu đẹp tự nhiên',
          description: 'Mực phun xăm môi organic cao cấp',
          sku: 'INK-LIP-ORG-001',
          price: 890000,
          originalPrice: 1200000,
          unit: 'Lọ',
          stock: 67,
          status: 'ACTIVE',
          thumbnail: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=400&h=400&fit=crop',
          isFeatured: true,
          isNewArrival: false,
          isBestSeller: true,
          isOnSale: true,
          category: {
            id: 'cat-3',
            name: 'Phun Xăm',
            slug: 'phun-xam',
          },
        },
        {
          id: '6',
          name: 'Sữa Rửa Mặt Tạo Bọt Nhẹ Nhàng',
          slug: 'sua-rua-mat-tao-bot-nhe-nhang',
          shortDesc: 'Làm sạch sâu, không làm khô da, phù hợp mọi loại da',
          description: 'Sữa rửa mặt tạo bọt nhẹ nhàng cho mọi loại da',
          sku: 'CLEAN-FOAM-001',
          price: 180000,
          originalPrice: 250000,
          unit: 'Chai',
          stock: 320,
          status: 'ACTIVE',
          thumbnail: 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=400&h=400&fit=crop',
          isFeatured: true,
          isNewArrival: false,
          isBestSeller: false,
          isOnSale: true,
          category: {
            id: 'cat-1',
            name: 'Chăm Sóc Da',
            slug: 'cham-soc-da',
          },
        },
        {
          id: '7',
          name: 'Mi Giả 3D Cao Cấp',
          slug: 'mi-gia-3d-cao-cap',
          shortDesc: 'Mi giả 3D siêu mềm, tự nhiên như mi thật',
          description: 'Mi giả 3D chất lượng cao nhập khẩu',
          sku: 'LASH-3D-001',
          price: 120000,
          originalPrice: 180000,
          unit: 'Cặp',
          stock: 250,
          status: 'ACTIVE',
          thumbnail: 'https://images.unsplash.com/photo-1583001809350-0b9c723cad97?w=400&h=400&fit=crop',
          isFeatured: false,
          isNewArrival: true,
          isBestSeller: false,
          isOnSale: true,
          category: {
            id: 'cat-2',
            name: 'Nối Mi',
            slug: 'noi-mi',
          },
        },
        {
          id: '8',
          name: 'Máy Phun Xăm Chuyên Nghiệp',
          slug: 'may-phun-xam-chuyen-nghiep',
          shortDesc: 'Máy phun xăm hiện đại, êm ái, chính xác cao',
          description: 'Máy phun xăm chuyên nghiệp cho thợ chuyên nghiệp',
          sku: 'MACHINE-PMU-001',
          price: 5500000,
          originalPrice: 7200000,
          unit: 'Máy',
          stock: 12,
          status: 'ACTIVE',
          thumbnail: 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=400&h=400&fit=crop',
          isFeatured: true,
          isNewArrival: true,
          isBestSeller: false,
          isOnSale: true,
          category: {
            id: 'cat-3',
            name: 'Phun Xăm',
            slug: 'phun-xam',
          },
        },
        {
          id: '9',
          name: 'Toner Cân Bằng Da pH5.5',
          slug: 'toner-can-bang-da-ph55',
          shortDesc: 'Cân bằng độ pH, se khít lỗ chân lông, làm mịn da',
          description: 'Toner cân bằng da với độ pH lý tưởng',
          sku: 'TONER-PH55-001',
          price: 220000,
          originalPrice: null,
          unit: 'Chai',
          stock: 180,
          status: 'ACTIVE',
          thumbnail: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=400&h=400&fit=crop',
          isFeatured: false,
          isNewArrival: false,
          isBestSeller: true,
          isOnSale: false,
          category: {
            id: 'cat-1',
            name: 'Chăm Sóc Da',
            slug: 'cham-soc-da',
          },
        },
        {
          id: '10',
          name: 'Kim Phun Xăm Nano 1 Đầu',
          slug: 'kim-phun-xam-nano-1-dau',
          shortDesc: 'Kim phun nano siêu mỏng, không đau, lên màu chuẩn',
          description: 'Kim phun xăm nano 1 đầu chuyên dụng',
          sku: 'NEEDLE-NANO-001',
          price: 35000,
          originalPrice: 50000,
          unit: 'Cái',
          stock: 500,
          status: 'ACTIVE',
          thumbnail: 'https://images.unsplash.com/photo-1519494140681-8b17d830a3ec?w=400&h=400&fit=crop',
          isFeatured: false,
          isNewArrival: false,
          isBestSeller: true,
          isOnSale: true,
          category: {
            id: 'cat-3',
            name: 'Phun Xăm',
            slug: 'phun-xam',
          },
        },
        {
          id: '11',
          name: 'Chổi Đánh Mi Mascara Dùng 1 Lần',
          slug: 'choi-danh-mi-mascara-dung-1-lan',
          shortDesc: 'Chổi đánh mi dùng 1 lần, vệ sinh, an toàn cho khách',
          description: 'Chổi đánh mi mascara dùng 1 lần (50 cái/hộp)',
          sku: 'BRUSH-MASC-DISP-001',
          price: 45000,
          originalPrice: null,
          unit: 'Hộp',
          stock: 400,
          status: 'ACTIVE',
          thumbnail: 'https://images.unsplash.com/photo-1512207736890-6ffed8a84e8d?w=400&h=400&fit=crop',
          isFeatured: false,
          isNewArrival: false,
          isBestSeller: false,
          isOnSale: false,
          category: {
            id: 'cat-2',
            name: 'Nối Mi',
            slug: 'noi-mi',
          },
        },
        {
          id: '12',
          name: 'Kem Chống Nắng SPF50+ PA+++',
          slug: 'kem-chong-nang-spf50-pa',
          shortDesc: 'Bảo vệ da khỏi tia UV, không gây nhờn rít',
          description: 'Kem chống nắng phổ rộng SPF50+ PA+++',
          sku: 'SUN-SPF50-001',
          price: 350000,
          originalPrice: 480000,
          unit: 'Tuýp',
          stock: 156,
          status: 'ACTIVE',
          thumbnail: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400&h=400&fit=crop',
          isFeatured: true,
          isNewArrival: false,
          isBestSeller: true,
          isOnSale: true,
          category: {
            id: 'cat-1',
            name: 'Chăm Sóc Da',
            slug: 'cham-soc-da',
          },
        },
      ],
    },
  },
  variables: {},
};

/**
 * Get all available sample templates
 */
export const getAllSampleTemplates = (): SampleTemplate[] => {
  return [
    productGridTemplate,
    taskDashboardTemplate,
    categoryShowcaseTemplate,
    heroSectionTemplate,
    testimonialsTemplate,
    contactFormTemplate,
    faqTemplate,
    productCarouselTemplate,
  ];
};

export const getSampleTemplateById = (id: string): SampleTemplate | undefined => {
  const templates = getAllSampleTemplates();
  return templates.find(t => t.id === id);
};
