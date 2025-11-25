/**
 * EXAMPLE: Website Footer Component
 * Sử dụng refactored menu system
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { MenuRenderer, useFooterMenu } from '@/features/menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Facebook, Twitter, Instagram, Youtube, Mail } from 'lucide-react';

/**
 * Modern website footer với menu integration
 */
export function WebsiteFooterExample() {
  const { tree, loading } = useFooterMenu();
  const [email, setEmail] = React.useState('');

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Newsletter signup:', email);
    setEmail('');
  };

  if (loading) {
    return <FooterSkeleton />;
  }

  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* Newsletter Section */}
      <div className="border-b border-gray-800">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto text-center">
            <h3 className="text-2xl font-bold text-white mb-2">
              Đăng Ký Nhận Tin
            </h3>
            <p className="text-gray-400 mb-6">
              Nhận thông tin về sản phẩm mới và ưu đãi đặc biệt
            </p>
            <form onSubmit={handleNewsletterSubmit} className="flex gap-2 max-w-md mx-auto">
              <Input
                type="email"
                placeholder="Email của bạn..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                required
              />
              <Button type="submit" className="flex-shrink-0">
                <Mail className="h-4 w-4 mr-2" />
                Đăng Ký
              </Button>
            </form>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center space-x-2 mb-4">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600" />
              <span className="font-bold text-xl text-white">Your Brand</span>
            </Link>
            <p className="text-gray-400 mb-6 max-w-sm">
              Mang đến những sản phẩm chất lượng cao và dịch vụ tốt nhất 
              cho khách hàng của chúng tôi.
            </p>
            
            {/* Social Links */}
            <div className="flex items-center space-x-3">
              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white hover:bg-gray-800">
                <Facebook className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white hover:bg-gray-800">
                <Twitter className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white hover:bg-gray-800">
                <Instagram className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white hover:bg-gray-800">
                <Youtube className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Footer Menu Columns */}
          <div className="lg:col-span-3">
            <MenuRenderer 
              items={tree} 
              variant="footer"
              onItemClick={(item) => {
                console.log('Footer link clicked:', item.title);
              }}
            />
          </div>
        </div>
      </div>

      <Separator className="bg-gray-800" />

      {/* Bottom Bar */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} Your Brand. All rights reserved.
          </p>
          
          <div className="flex items-center space-x-6 text-sm">
            <Link href="/privacy" className="text-gray-500 hover:text-white transition-colors">
              Chính Sách Bảo Mật
            </Link>
            <Link href="/terms" className="text-gray-500 hover:text-white transition-colors">
              Điều Khoản Sử Dụng
            </Link>
            <Link href="/contact" className="text-gray-500 hover:text-white transition-colors">
              Liên Hệ
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

/**
 * Loading skeleton for footer
 */
function FooterSkeleton() {
  return (
    <footer className="bg-gray-900">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="space-y-4">
              <div className="h-6 w-24 bg-gray-800 rounded animate-pulse" />
              <div className="space-y-2">
                <div className="h-4 w-32 bg-gray-800 rounded animate-pulse" />
                <div className="h-4 w-28 bg-gray-800 rounded animate-pulse" />
                <div className="h-4 w-36 bg-gray-800 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </footer>
  );
}
