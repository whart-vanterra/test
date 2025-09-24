import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { AuthProvider } from '@/components/AuthProvider';
import { ToasterProvider } from '@/components/ToasterProvider';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Vanterra Reviews - Customer Feedback Management',
  description: 'Comprehensive customer feedback management system for businesses',
  keywords: 'reviews, feedback, customer service, business management',
  authors: [{ name: 'Vanterra Reviews' }],
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body className={inter.className} suppressHydrationWarning={true}>
        <AuthProvider>
          <ToasterProvider>
            {children}
          </ToasterProvider>
        </AuthProvider>
      </body>
    </html>
  );
}