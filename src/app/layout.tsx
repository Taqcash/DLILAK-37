import { ClerkProvider } from '@clerk/nextjs';
import { Cairo } from 'next/font/google';
import './globals.css';

const cairo = Cairo({ subsets: ['arabic'], variable: '--font-cairo' });

export const metadata = {
  title: 'دليل خدمتك',
  description: 'المنصة الذكية المتكاملة لخدمات بورتسودان',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="ar" dir="rtl">
        <body className={`${cairo.variable} font-sans bg-white text-gray-900`}>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
