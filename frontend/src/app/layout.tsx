import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';
import { Navigation } from '@/components/Navigation';
import { PWAProvider } from '@/components/pwa';
import SupportChatWidgetWrapper from '@/components/support-chat/SupportChatWidgetWrapper';
import { Toaster } from '@/components/ui/sonner';
import { generateMetadata as getMetadata } from '@/lib/metadata';
import { ApiConfigDebug } from '@/components/ApiConfigDebug';

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

// Generate dynamic metadata from database
export async function generateMetadata() {
  return await getMetadata();
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.variable} h-full font-sans`}>
        <ApiConfigDebug />
        <Providers>
          <PWAProvider
            enableAutoPrompt={true}
            enableOfflineStatus={true}
            installPromptDelay={15000}
            offlineStatusPosition="top"
          >
            <div className="min-h-full flex flex-col">
              <main className="flex-1">
                {children}
              </main>
            </div>
            <SupportChatWidgetWrapper />
            <Toaster />
          </PWAProvider>
        </Providers>
      </body>
    </html>
  );
}
