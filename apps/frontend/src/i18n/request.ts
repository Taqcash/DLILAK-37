import { getRequestConfig } from 'next-intl/server';

/**
 * i18n Request Configuration
 * (Encapsulation)
 * يقوم بتجهيز إعدادات اللغة لكل طلب بشكل مستقل
 */
export default getRequestConfig(async () => {
  // حالياً ندعم اللغة العربية فقط كخيار وحيد
  const locale = 'ar';

  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default
  };
});
