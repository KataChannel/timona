/**
 * Site Configuration
 * Cấu hình tùy chỉnh cho ứng dụng
 */

export const siteConfig = {
  // Root redirect: Trang mặc định khi truy cập root "/"
  // Thay đổi giá trị này để chuyển root đến trang khác
  // Ví dụ:
  //   - '/website' -> Root trỏ đến trang website
  //   - '/dashboard' -> Root trỏ đến dashboard
  //   - '/admin' -> Root trỏ đến admin panel
  rootRedirect: '/website',

  // Các cấu hình khác
  name: 'Kata Office',
  description: 'E-commerce & Business Platform',
  
  // Navigation
  navigation: {
    main: [
      { label: 'Website', href: '/website' },
      { label: 'Admin', href: '/admin' },
      { label: 'LMS', href: '/lms' },
      { label: 'Kế toán', href: '/ketoan' },
    ],
  },

  // Features
  features: {
    enableWebsite: true,
    enableAdmin: true,
    enableLMS: true,
    enableKeToan: true,
  },
};

export default siteConfig;
