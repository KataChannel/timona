/**
 * Template Thumbnail Generator
 * Generates SVG thumbnails for block templates
 */

export const generateThumbnailSVG = (templateId: string): string => {
  const thumbnails: Record<string, string> = {
    'hero-centered': `
      <svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
        <rect width="400" height="300" fill="#f8fafc"/>
        <rect x="50" y="80" width="300" height="40" rx="4" fill="#1e293b" opacity="0.8"/>
        <rect x="100" y="140" width="200" height="20" rx="4" fill="#64748b" opacity="0.6"/>
        <rect x="150" y="180" width="100" height="35" rx="6" fill="#3b82f6"/>
        <text x="200" y="203" font-family="Arial" font-size="14" fill="white" text-anchor="middle">CTA</text>
      </svg>
    `,
    'features-3col': `
      <svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
        <rect width="400" height="300" fill="#ffffff"/>
        <rect x="20" y="20" width="110" height="260" rx="8" fill="#f1f5f9" stroke="#e2e8f0" stroke-width="2"/>
        <circle cx="75" cy="60" r="20" fill="#3b82f6" opacity="0.2"/>
        <rect x="40" y="100" width="70" height="8" rx="4" fill="#1e293b"/>
        <rect x="30" y="120" width="90" height="6" rx="3" fill="#64748b" opacity="0.5"/>
        
        <rect x="145" y="20" width="110" height="260" rx="8" fill="#f1f5f9" stroke="#e2e8f0" stroke-width="2"/>
        <circle cx="200" cy="60" r="20" fill="#10b981" opacity="0.2"/>
        <rect x="165" y="100" width="70" height="8" rx="4" fill="#1e293b"/>
        <rect x="155" y="120" width="90" height="6" rx="3" fill="#64748b" opacity="0.5"/>
        
        <rect x="270" y="20" width="110" height="260" rx="8" fill="#f1f5f9" stroke="#e2e8f0" stroke-width="2"/>
        <circle cx="325" cy="60" r="20" fill="#f59e0b" opacity="0.2"/>
        <rect x="290" y="100" width="70" height="8" rx="4" fill="#1e293b"/>
        <rect x="280" y="120" width="90" height="6" rx="3" fill="#64748b" opacity="0.5"/>
      </svg>
    `,
    'pricing-3tier': `
      <svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
        <rect width="400" height="300" fill="#ffffff"/>
        <!-- Basic Plan -->
        <rect x="20" y="40" width="110" height="220" rx="8" fill="#ffffff" stroke="#e2e8f0" stroke-width="2"/>
        <rect x="30" y="50" width="90" height="30" rx="4" fill="#f1f5f9"/>
        <text x="75" y="70" font-family="Arial" font-size="12" fill="#64748b" text-anchor="middle">Basic</text>
        <text x="75" y="110" font-family="Arial" font-size="24" fill="#1e293b" text-anchor="middle" font-weight="bold">$9</text>
        <rect x="35" y="130" width="80" height="4" rx="2" fill="#e2e8f0"/>
        <rect x="35" y="145" width="80" height="4" rx="2" fill="#e2e8f0"/>
        <rect x="35" y="160" width="80" height="4" rx="2" fill="#e2e8f0"/>
        
        <!-- Pro Plan (Highlighted) -->
        <rect x="145" y="30" width="110" height="240" rx="8" fill="#3b82f6" stroke="#2563eb" stroke-width="2"/>
        <rect x="155" y="40" width="90" height="30" rx="4" fill="rgba(255,255,255,0.2)"/>
        <text x="200" y="60" font-family="Arial" font-size="12" fill="white" text-anchor="middle" font-weight="bold">Pro</text>
        <text x="200" y="100" font-family="Arial" font-size="24" fill="white" text-anchor="middle" font-weight="bold">$29</text>
        <rect x="160" y="120" width="80" height="4" rx="2" fill="rgba(255,255,255,0.5)"/>
        <rect x="160" y="135" width="80" height="4" rx="2" fill="rgba(255,255,255,0.5)"/>
        <rect x="160" y="150" width="80" height="4" rx="2" fill="rgba(255,255,255,0.5)"/>
        
        <!-- Enterprise Plan -->
        <rect x="270" y="40" width="110" height="220" rx="8" fill="#ffffff" stroke="#e2e8f0" stroke-width="2"/>
        <rect x="280" y="50" width="90" height="30" rx="4" fill="#f1f5f9"/>
        <text x="325" y="70" font-family="Arial" font-size="12" fill="#64748b" text-anchor="middle">Enterprise</text>
        <text x="325" y="110" font-family="Arial" font-size="24" fill="#1e293b" text-anchor="middle" font-weight="bold">$99</text>
        <rect x="285" y="130" width="80" height="4" rx="2" fill="#e2e8f0"/>
        <rect x="285" y="145" width="80" height="4" rx="2" fill="#e2e8f0"/>
        <rect x="285" y="160" width="80" height="4" rx="2" fill="#e2e8f0"/>
      </svg>
    `,
    'cta-centered': `
      <svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
        <rect width="400" height="300" fill="#1e293b"/>
        <rect x="60" y="80" width="280" height="30" rx="4" fill="rgba(255,255,255,0.9)"/>
        <rect x="80" y="130" width="240" height="15" rx="4" fill="rgba(255,255,255,0.6)"/>
        <rect x="100" y="155" width="200" height="15" rx="4" fill="rgba(255,255,255,0.6)"/>
        <rect x="120" y="190" width="160" height="40" rx="8" fill="#3b82f6"/>
        <text x="200" y="216" font-family="Arial" font-size="14" fill="white" text-anchor="middle" font-weight="bold">Get Started</text>
      </svg>
    `,
    'team-3members': `
      <svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
        <rect width="400" height="300" fill="#ffffff"/>
        <!-- Member 1 -->
        <circle cx="75" cy="80" r="30" fill="#3b82f6" opacity="0.2"/>
        <circle cx="75" cy="75" r="15" fill="#3b82f6"/>
        <rect x="40" y="120" width="70" height="10" rx="4" fill="#1e293b"/>
        <rect x="30" y="140" width="90" height="6" rx="3" fill="#64748b" opacity="0.5"/>
        
        <!-- Member 2 -->
        <circle cx="200" cy="80" r="30" fill="#10b981" opacity="0.2"/>
        <circle cx="200" cy="75" r="15" fill="#10b981"/>
        <rect x="165" y="120" width="70" height="10" rx="4" fill="#1e293b"/>
        <rect x="155" y="140" width="90" height="6" rx="3" fill="#64748b" opacity="0.5"/>
        
        <!-- Member 3 -->
        <circle cx="325" cy="80" r="30" fill="#f59e0b" opacity="0.2"/>
        <circle cx="325" cy="75" r="15" fill="#f59e0b"/>
        <rect x="290" y="120" width="70" height="10" rx="4" fill="#1e293b"/>
        <rect x="280" y="140" width="90" height="6" rx="3" fill="#64748b" opacity="0.5"/>
      </svg>
    `,
    'contact-form': `
      <svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
        <rect width="400" height="300" fill="#ffffff"/>
        <!-- Form Section -->
        <rect x="30" y="30" width="200" height="240" rx="8" fill="#f8fafc" stroke="#e2e8f0" stroke-width="2"/>
        <rect x="45" y="50" width="170" height="30" rx="4" fill="white" stroke="#cbd5e1" stroke-width="1"/>
        <rect x="45" y="90" width="170" height="30" rx="4" fill="white" stroke="#cbd5e1" stroke-width="1"/>
        <rect x="45" y="130" width="170" height="60" rx="4" fill="white" stroke="#cbd5e1" stroke-width="1"/>
        <rect x="45" y="200" width="170" height="35" rx="6" fill="#3b82f6"/>
        <text x="130" y="222" font-family="Arial" font-size="12" fill="white" text-anchor="middle">Send</text>
        
        <!-- Contact Info -->
        <rect x="250" y="70" width="120" height="100" rx="6" fill="#f1f5f9"/>
        <circle cx="280" cy="95" r="8" fill="#3b82f6"/>
        <rect x="295" y="90" width="60" height="4" rx="2" fill="#64748b"/>
        <circle cx="280" cy="125" r="8" fill="#10b981"/>
        <rect x="295" y="120" width="60" height="4" rx="2" fill="#64748b"/>
        <circle cx="280" cy="155" r="8" fill="#f59e0b"/>
        <rect x="295" y="150" width="60" height="4" rx="2" fill="#64748b"/>
      </svg>
    `,
    'testimonials-3col': `
      <svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
        <rect width="400" height="300" fill="#ffffff"/>
        <!-- Testimonial 1 -->
        <rect x="20" y="60" width="110" height="180" rx="8" fill="#ffffff" stroke="#e2e8f0" stroke-width="2"/>
        <text x="75" y="85" font-family="Arial" font-size="24" fill="#f59e0b" text-anchor="middle">"</text>
        <rect x="30" y="100" width="90" height="4" rx="2" fill="#e2e8f0"/>
        <rect x="35" y="110" width="80" height="4" rx="2" fill="#e2e8f0"/>
        <rect x="30" y="120" width="90" height="4" rx="2" fill="#e2e8f0"/>
        <circle cx="75" cy="170" r="20" fill="#3b82f6" opacity="0.2"/>
        <rect x="50" y="200" width="50" height="6" rx="3" fill="#1e293b"/>
        <path d="M 50 215 L 55 220 L 50 225 M 55 215 L 60 220 L 55 225 M 60 215 L 65 220 L 60 225 M 65 215 L 70 220 L 65 225 M 70 215 L 75 220 L 70 225" stroke="#f59e0b" stroke-width="2" fill="none"/>
        
        <!-- Testimonial 2 -->
        <rect x="145" y="60" width="110" height="180" rx="8" fill="#ffffff" stroke="#e2e8f0" stroke-width="2"/>
        <text x="200" y="85" font-family="Arial" font-size="24" fill="#f59e0b" text-anchor="middle">"</text>
        <rect x="155" y="100" width="90" height="4" rx="2" fill="#e2e8f0"/>
        <rect x="160" y="110" width="80" height="4" rx="2" fill="#e2e8f0"/>
        <rect x="155" y="120" width="90" height="4" rx="2" fill="#e2e8f0"/>
        <circle cx="200" cy="170" r="20" fill="#10b981" opacity="0.2"/>
        <rect x="175" y="200" width="50" height="6" rx="3" fill="#1e293b"/>
        <path d="M 175 215 L 180 220 L 175 225 M 180 215 L 185 220 L 180 225 M 185 215 L 190 220 L 185 225 M 190 215 L 195 220 L 190 225 M 195 215 L 200 220 L 195 225" stroke="#f59e0b" stroke-width="2" fill="none"/>
        
        <!-- Testimonial 3 -->
        <rect x="270" y="60" width="110" height="180" rx="8" fill="#ffffff" stroke="#e2e8f0" stroke-width="2"/>
        <text x="325" y="85" font-family="Arial" font-size="24" fill="#f59e0b" text-anchor="middle">"</text>
        <rect x="280" y="100" width="90" height="4" rx="2" fill="#e2e8f0"/>
        <rect x="285" y="110" width="80" height="4" rx="2" fill="#e2e8f0"/>
        <rect x="280" y="120" width="90" height="4" rx="2" fill="#e2e8f0"/>
        <circle cx="325" cy="170" r="20" fill="#f59e0b" opacity="0.2"/>
        <rect x="300" y="200" width="50" height="6" rx="3" fill="#1e293b"/>
        <path d="M 300 215 L 305 220 L 300 225 M 305 215 L 310 220 L 305 225 M 310 215 L 315 220 L 310 225 M 315 215 L 320 220 L 315 225 M 320 215 L 325 220 L 320 225" stroke="#f59e0b" stroke-width="2" fill="none"/>
      </svg>
    `,
    'carousel-featured-products': `
      <svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
        <rect width="400" height="300" fill="#ffffff"/>
        <!-- Title -->
        <rect x="100" y="20" width="200" height="12" rx="4" fill="#1e293b"/>
        <rect x="120" y="40" width="160" height="8" rx="4" fill="#64748b" opacity="0.5"/>
        
        <!-- Carousel Container -->
        <rect x="20" y="70" width="360" height="200" rx="8" fill="#f8fafc" stroke="#e2e8f0" stroke-width="2"/>
        
        <!-- Product Cards -->
        <rect x="35" y="85" width="100" height="170" rx="6" fill="white" stroke="#cbd5e1" stroke-width="1"/>
        <rect x="40" y="90" width="90" height="90" rx="4" fill="#e0e7ff"/>
        <rect x="50" y="100" width="70" height="70" rx="4" fill="#818cf8" opacity="0.3"/>
        <rect x="45" y="190" width="80" height="8" rx="4" fill="#1e293b"/>
        <rect x="45" y="205" width="60" height="6" rx="3" fill="#64748b" opacity="0.5"/>
        <rect x="45" y="220" width="50" height="20" rx="4" fill="#3b82f6"/>
        <text x="70" y="233" font-family="Arial" font-size="10" fill="white" text-anchor="middle">View</text>
        
        <rect x="150" y="85" width="100" height="170" rx="6" fill="white" stroke="#cbd5e1" stroke-width="1"/>
        <rect x="155" y="90" width="90" height="90" rx="4" fill="#dbeafe"/>
        <rect x="165" y="100" width="70" height="70" rx="4" fill="#60a5fa" opacity="0.3"/>
        <rect x="160" y="190" width="80" height="8" rx="4" fill="#1e293b"/>
        <rect x="160" y="205" width="60" height="6" rx="3" fill="#64748b" opacity="0.5"/>
        <rect x="160" y="220" width="50" height="20" rx="4" fill="#3b82f6"/>
        <text x="185" y="233" font-family="Arial" font-size="10" fill="white" text-anchor="middle">View</text>
        
        <rect x="265" y="85" width="100" height="170" rx="6" fill="white" stroke="#cbd5e1" stroke-width="1"/>
        <rect x="270" y="90" width="90" height="90" rx="4" fill="#fef3c7"/>
        <rect x="280" y="100" width="70" height="70" rx="4" fill="#fbbf24" opacity="0.3"/>
        <rect x="275" y="190" width="80" height="8" rx="4" fill="#1e293b"/>
        <rect x="275" y="205" width="60" height="6" rx="3" fill="#64748b" opacity="0.5"/>
        <rect x="275" y="220" width="50" height="20" rx="4" fill="#3b82f6"/>
        <text x="300" y="233" font-family="Arial" font-size="10" fill="white" text-anchor="middle">View</text>
        
        <!-- Navigation Arrows -->
        <circle cx="15" cy="170" r="8" fill="#3b82f6" opacity="0.8"/>
        <path d="M 17 170 L 14 167 L 14 173 Z" fill="white"/>
        <circle cx="385" cy="170" r="8" fill="#3b82f6" opacity="0.8"/>
        <path d="M 383 170 L 386 167 L 386 173 Z" fill="white"/>
        
        <!-- Indicators -->
        <circle cx="180" cy="285" r="4" fill="#3b82f6"/>
        <circle cx="195" cy="285" r="4" fill="#cbd5e1"/>
        <circle cx="210" cy="285" r="4" fill="#cbd5e1"/>
        <circle cx="225" cy="285" r="4" fill="#cbd5e1"/>
      </svg>
    `,
  };

  return thumbnails[templateId] || generateDefaultThumbnail();
};

const generateDefaultThumbnail = (): string => {
  return `
    <svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
      <rect width="400" height="300" fill="#f8fafc"/>
      <rect x="100" y="100" width="200" height="100" rx="8" fill="#e2e8f0" stroke="#cbd5e1" stroke-width="2"/>
      <text x="200" y="155" font-family="Arial" font-size="16" fill="#64748b" text-anchor="middle">Template</text>
    </svg>
  `;
};

export const getThumbnailDataURL = (templateId: string): string => {
  const svg = generateThumbnailSVG(templateId);
  const encodedSvg = encodeURIComponent(svg);
  return `data:image/svg+xml;charset=utf-8,${encodedSvg}`;
};
