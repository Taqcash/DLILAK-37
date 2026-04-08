import Providers from './providers';
import { Cairo } from 'next/font/google';
import './globals.css';

const cairo = Cairo({ subsets: ['arabic'], variable: '--font-cairo' });

export const metadata = {
  title: 'دليل خدمتك - بورتسودان',
  description: 'المنصة الذكية المتكاملة لخدمات بورتسودان. ابحث عن أفضل المهنيين والأسر المنتجة.',
  keywords: 'بورتسودان, خدمات, مهنيين, سباك, كهربائي, السودان, أسر منتجة',
  openGraph: {
    title: 'دليل خدمتك - بورتسودان',
    description: 'المنصة الذكية المتكاملة لخدمات بورتسودان',
    url: 'https://dlilak.sd',
    siteName: 'دليل خدمتك',
    locale: 'ar_SD',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body className={`${cairo.variable} font-sans bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
