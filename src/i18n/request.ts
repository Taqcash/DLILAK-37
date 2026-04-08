import { getRequestConfig } from 'next-intl/server';
import { notFound } from 'next/navigation';

export const locales = ['ar', 'en'];

export default getRequestConfig(async () => {
  const locale = 'ar';
  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default
  };
});
