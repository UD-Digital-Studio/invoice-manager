import {getRequestConfig} from 'next-intl/server';

export default getRequestConfig(async ({locale}) => {
  // Validate that the incoming `locale` parameter is valid
  if (!['en', 'fr'].includes(locale)) {
    // Redirect to a default locale if the requested one is not supported
    // For example, you could redirect to 'en'
    // Note: This requires proper middleware setup to handle redirects
    return {
    messages: (await import('../messages/en.json')).default
    };
  }

  return {
    messages: (await import(`../messages/${locale}.json`)).default
  };
});
