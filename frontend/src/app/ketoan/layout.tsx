import { ReactNode } from 'react';

interface websiteLayoutProps {
  children: ReactNode;
}

export default function websiteLayout({ children }: websiteLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
