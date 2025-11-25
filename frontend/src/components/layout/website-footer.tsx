'use client';

import Link from 'next/link';
import { useState, useEffect, useMemo } from 'react';
import { BarChart3, ChevronDown } from 'lucide-react';
import { useFooterSettings, useContactSettings, useSocialSettings, settingsToMap } from '@/hooks/useWebsiteSettings';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

interface VisitorStats {
  Hientai?: number;
  Ngay?: number;
  Thang?: number;
  Tong?: number;
}

interface WebsiteFooterProps {
  visitors?: VisitorStats;
  currentYear?: number;
}

export function WebsiteFooter({ visitors, currentYear = new Date().getFullYear() }: WebsiteFooterProps) {
  // ✅ Load Footer Settings
  const { data: footerSettingsRaw = [] } = useFooterSettings();
  const footerSettings = useMemo(() => settingsToMap(footerSettingsRaw), [footerSettingsRaw]);

  // ✅ Load Contact Settings
  const { data: contactSettingsRaw = [] } = useContactSettings();
  const contactSettings = useMemo(() => settingsToMap(contactSettingsRaw), [contactSettingsRaw]);

  // ✅ Load Social Settings
  const { data: socialSettingsRaw = [] } = useSocialSettings();
  const socialSettings = useMemo(() => settingsToMap(socialSettingsRaw), [socialSettingsRaw]);

  // Hàm để định dạng số
  const formatNumber = (num?: number): string => num ? num.toLocaleString('en-US') : '0';

  return (
    <footer 
      className="pt-8 lg:pt-12 text-white"
      style={{ backgroundColor: footerSettings['footer.background_color'] || '#000000' }}
    >
      {/* Container chính */}
      <div className="container mx-auto px-4">
        {/* =============== MOBILE LAYOUT (< lg) =============== */}
        <div className="lg:hidden pb-8">
          <Accordion type="single" collapsible className="w-full space-y-2">
            {/* CỘT 1: THÔNG TIN LIÊN HỆ */}
            <AccordionItem value="contact" className="border border-white/20 rounded-lg px-4">
              <AccordionTrigger className="text-lg font-bold hover:no-underline">
                THÔNG TIN LIÊN HỆ
              </AccordionTrigger>
              <AccordionContent>
                <div className="flex flex-col space-y-3 pt-2">
                  <span className="text-base text-[#65b009]">
                    <strong>{contactSettings['contact.company_name'] || 'CTY TNHH NÔNG SẢN THỰC PHẨM TRẦN GIA'}</strong>
                  </span>
                  <span className="text-sm">
                    <strong>Địa chỉ:</strong> {contactSettings['contact.address'] || 'Tầng 3, An Phú Plaza, 117-119 Lý Chính Thắng P. Võ Thị Sáu, Q.3, TPHCM'}
                  </span>
                  <span className="text-sm">
                    <strong>Hotline:</strong> {contactSettings['contact.phone_display'] || '0865.77.0009'}
                  </span>
                  <span className="text-sm">
                    <strong>Email:</strong>{' '}
                    <a href={`mailto:${contactSettings['contact.email'] || 'mart.rausachtrangia@gmail.com'}`}>
                      {contactSettings['contact.email'] || 'mart.rausachtrangia@gmail.com'}
                    </a>
                  </span>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* CỘT 2: VỀ CHÚNG TÔI */}
            <AccordionItem value="about" className="border border-white/20 rounded-lg px-4">
              <AccordionTrigger className="text-lg font-bold hover:no-underline">
                VỀ CHÚNG TÔI
              </AccordionTrigger>
              <AccordionContent>
                <div className="flex flex-col space-y-2 pt-2">
                  <Link href="/blog/gioi-thieu/ve-chung-toi" className="text-sm hover:text-[#65b009] transition-colors">
                    GIỚI THIỆU
                  </Link>
                  <Link href="#" className="text-sm hover:text-[#65b009] transition-colors">
                    KHUYẾN MÃI
                  </Link>
                  <Link href="#" className="text-sm hover:text-[#65b009] transition-colors">
                    MÓN NGON MỖI NGÀY
                  </Link>
                  <Link href="#" className="text-sm hover:text-[#65b009] transition-colors">
                    TIN TỨC
                  </Link>
                  <Link href="#" className="text-sm hover:text-[#65b009] transition-colors">
                    LIÊN HỆ
                  </Link>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* CỘT 3: CHÍNH SÁCH QUY ĐỊNH */}
            <AccordionItem value="policy" className="border border-white/20 rounded-lg px-4">
              <AccordionTrigger className="text-lg font-bold hover:no-underline">
                CHÍNH SÁCH QUY ĐỊNH
              </AccordionTrigger>
              <AccordionContent>
                <div className="flex flex-col space-y-2 pt-2">
                  <Link href="/blog/chinh-sach-quy-dinh/chinh-sach-bao-mat" target="_blank" rel="noopener noreferrer" className="text-sm hover:text-[#65b009] transition-colors">
                    Chính sách bảo mật
                  </Link>
                  <Link href="/blog/chinh-sach-quy-dinh/chinh-sach-thanh-toan" target="_blank" rel="noopener noreferrer" className="text-sm hover:text-[#65b009] transition-colors">
                    Chính sách thanh toán
                  </Link>
                  <Link href="/blog/chinh-sach-quy-dinh/chinh-sach-giao-hang" target="_blank" rel="noopener noreferrer" className="text-sm hover:text-[#65b009] transition-colors">
                    Chính sách giao hàng
                  </Link>
                  <Link href="/blog/chinh-sach-quy-dinh/chinh-sach-doi-tra" className="text-sm hover:text-[#65b009] transition-colors">
                    Chính sách đổi trả
                  </Link>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* THỐNG KÊ TRUY CẬP */}
            {footerSettings['footer.show_visitor_stats'] && (
              <AccordionItem value="stats" className="border border-white/20 rounded-lg px-4">
                <AccordionTrigger className="text-lg font-bold hover:no-underline">
                  THỐNG KÊ TRUY CẬP
                </AccordionTrigger>
                <AccordionContent>
                  <div className="flex flex-col space-y-3 pt-2">
                    <div className="flex flex-row space-x-2 items-center text-sm">
                      <BarChart3 className="w-4 h-4 text-[#65b009]" />
                      <span>Đang truy cập:</span>
                      <span className="font-semibold">{formatNumber(visitors?.Hientai)}</span>
                    </div>
                    <div className="flex flex-row space-x-2 items-center text-sm">
                      <BarChart3 className="w-4 h-4 text-[#65b009]" />
                      <span>Hôm nay:</span>
                      <span className="font-semibold">{formatNumber(visitors?.Ngay)}</span>
                    </div>
                    <div className="flex flex-row space-x-2 items-center text-sm">
                      <BarChart3 className="w-4 h-4 text-[#65b009]" />
                      <span>Trong tháng:</span>
                      <span className="font-semibold">{formatNumber(visitors?.Thang)}</span>
                    </div>
                    <div className="flex flex-row space-x-2 items-center text-sm">
                      <BarChart3 className="w-4 h-4 text-[#65b009]" />
                      <span>Tổng truy cập:</span>
                      <span className="font-semibold">{formatNumber(visitors?.Tong)}</span>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            )}
          </Accordion>

          {/* Icon Mạng xã hội - Mobile */}
          {footerSettings['footer.show_social_links'] && (
            <div className="flex flex-row justify-center space-x-3 p-4 mt-4 bg-white rounded-lg">
              {socialSettings['social.facebook_enabled'] && socialSettings['social.facebook'] && (
                <a href={socialSettings['social.facebook']} target="_blank" rel="noopener noreferrer">
                  <img className="w-10 h-10" src="/assets/images/facebook.png" alt="Facebook" />
                </a>
              )}
              {socialSettings['social.tiktok_enabled'] && socialSettings['social.tiktok'] && (
                <a title="Tiktok" href={socialSettings['social.tiktok']} target="_blank" rel="noopener noreferrer">
                  <img className="w-10 h-10" src="/assets/images/tiktok.png" alt="Tiktok" />
                </a>
              )}
              {socialSettings['social.youtube_enabled'] && socialSettings['social.youtube'] && (
                <a title="Youtube Channel" href={socialSettings['social.youtube']} target="_blank" rel="noopener noreferrer">
                  <img className="w-10 h-10" src="/assets/images/youtube.png" alt="Youtube" />
                </a>
              )}
            </div>
          )}
        </div>

        {/* =============== DESKTOP LAYOUT (>= lg) =============== */}
        <div className="hidden lg:grid lg:grid-cols-10 gap-8 pb-12">
          {/* CỘT 1: THÔNG TIN LIÊN HỆ */}
          <div className="lg:col-span-4 flex flex-col space-y-3">
            <div className="font-bold text-xl mb-2">THÔNG TIN LIÊN HỆ</div>
            <span className="text-lg text-[#65b009]">
              <strong>{contactSettings['contact.company_name'] || 'CTY TNHH NÔNG SẢN THỰC PHẨM TRẦN GIA'}</strong>
            </span>
            <span>
              <strong>Địa chỉ:</strong> {contactSettings['contact.address'] || 'Tầng 3, An Phú Plaza, 117-119 Lý Chính Thắng P. Võ Thị Sáu, Q.3, TPHCM'}
            </span>
            <span>
              <strong>Hotline:</strong> {contactSettings['contact.phone_display'] || '0865.77.0009'}
            </span>
            <span>
              <strong>Email:</strong>{' '}
              <a href={`mailto:${contactSettings['contact.email'] || 'mart.rausachtrangia@gmail.com'}`} className="hover:text-[#65b009] transition-colors">
                {contactSettings['contact.email'] || 'mart.rausachtrangia@gmail.com'}
              </a>
            </span>
          </div>
          
          {/* CỘT 2: VỀ CHÚNG TÔI & Mạng xã hội */}
          <div className="lg:col-span-2 flex flex-col space-y-3">
            <div className="font-bold text-xl mb-2">VỀ CHÚNG TÔI</div>
            <Link href="/blog/gioi-thieu/ve-chung-toi" className="hover:text-[#65b009] transition-colors">
              GIỚI THIỆU
            </Link>
            <Link href="#" className="hover:text-[#65b009] transition-colors">
              KHUYẾN MÃI
            </Link>
            <Link href="#" className="hover:text-[#65b009] transition-colors">
              MÓN NGON MỖI NGÀY
            </Link>
            <Link href="#" className="hover:text-[#65b009] transition-colors">
              TIN TỨC
            </Link>
            <Link href="#" className="hover:text-[#65b009] transition-colors">
              LIÊN HỆ
            </Link>
            
            {/* Icon Mạng xã hội - Desktop */}
            {footerSettings['footer.show_social_links'] && (
              <div className="flex flex-row space-x-2 p-2 bg-white rounded-lg w-fit mt-4">
                {socialSettings['social.facebook_enabled'] && socialSettings['social.facebook'] && (
                  <a href={socialSettings['social.facebook']} target="_blank" rel="noopener noreferrer">
                    <img className="w-10" src="/assets/images/facebook.png" alt="Facebook" width="40" height="40" />
                  </a>
                )}
                {socialSettings['social.tiktok_enabled'] && socialSettings['social.tiktok'] && (
                  <a title="Tiktok" href={socialSettings['social.tiktok']} target="_blank" rel="noopener noreferrer">
                    <img className="w-10" src="/assets/images/tiktok.png" alt="Tiktok" width="40" height="40" />
                  </a>
                )}
                {socialSettings['social.youtube_enabled'] && socialSettings['social.youtube'] && (
                  <a title="Youtube Channel" href={socialSettings['social.youtube']} target="_blank" rel="noopener noreferrer">
                    <img className="w-10" src="/assets/images/youtube.png" alt="Youtube" width="40" height="40" />
                  </a>
                )}
              </div>
            )}
          </div>
          
          {/* CỘT 3: CHÍNH SÁCH QUY ĐỊNH */}
          <div className="lg:col-span-2 flex flex-col space-y-3">
            <div className="font-bold text-xl mb-2">CHÍNH SÁCH QUY ĐỊNH</div>
            <Link href="/blog/chinh-sach-quy-dinh/chinh-sach-bao-mat" target="_blank" rel="noopener noreferrer" className="hover:text-[#65b009] transition-colors">
              Chính sách bảo mật
            </Link>
            <Link href="/blog/chinh-sach-quy-dinh/chinh-sach-thanh-toan" target="_blank" rel="noopener noreferrer" className="hover:text-[#65b009] transition-colors">
              Chính sách thanh toán
            </Link>
            <Link href="/blog/chinh-sach-quy-dinh/chinh-sach-giao-hang" target="_blank" rel="noopener noreferrer" className="hover:text-[#65b009] transition-colors">
              Chính sách giao hàng
            </Link>
            <Link href="/blog/chinh-sach-quy-dinh/chinh-sach-doi-tra" className="hover:text-[#65b009] transition-colors">
              Chính sách đổi trả
            </Link>
          </div>
          
          {/* CỘT 4: THỐNG KÊ TRUY CẬP */}
          {footerSettings['footer.show_visitor_stats'] && (
            <div className="lg:col-span-2">
              <div className="font-bold text-xl mb-5">THỐNG KÊ TRUY CẬP</div>
              <div className="flex flex-col space-y-3">
                <div className="flex flex-row space-x-2 items-center">
                  <BarChart3 className="w-5 h-5 text-[#65b009]" />
                  <span>Đang truy cập:</span>
                  <span className="font-semibold">{formatNumber(visitors?.Hientai)}</span>
                </div>
                <div className="flex flex-row space-x-2 items-center">
                  <BarChart3 className="w-5 h-5 text-[#65b009]" />
                  <span>Hôm nay:</span>
                  <span className="font-semibold">{formatNumber(visitors?.Ngay)}</span>
                </div>
                <div className="flex flex-row space-x-2 items-center">
                  <BarChart3 className="w-5 h-5 text-[#65b009]" />
                  <span>Trong tháng:</span>
                  <span className="font-semibold">{formatNumber(visitors?.Thang)}</span>
                </div>
                <div className="flex flex-row space-x-2 items-center">
                  <BarChart3 className="w-5 h-5 text-[#65b009]" />
                  <span>Tổng truy cập:</span>
                  <span className="font-semibold">{formatNumber(visitors?.Tong)}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Footer Bottom (Copyright) */}
      <div className="py-4 bg-[#d7d7d7]">
        <div className="flex justify-center items-center container mx-auto px-4">
          <div className="text-sm text-center text-black">
            <span>
              &copy; Copyright {currentYear}{' '}
              <Link href="/" className="hover:text-[#65b009] transition-colors">
                {contactSettings['contact.company_name'] || 'CÔNG TY TNHH NÔNG SẢN THỰC PHẨM TRẦN GIA'}
              </Link>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}