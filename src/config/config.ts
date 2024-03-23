import * as process from 'process';
const config = () => ({
  NODE_ENV: process.env.NODE_ENV || 'development',
  GLOBAL: {
    PORT: process.env.PORT,
  },
  STRIPE_CONFIG: {
    apiKey: process.env.STRIPE_API_KEY,
    webhookConfig: {
      requestBodyProperty: 'rawBody',
      stripeSecrets: {
        account: process.env.STRIPE_WEBHOOK_SECRET,
      },
    },
  },
  GOOGLE_EMAIL: process.env.GOOGLE_EMAIL,
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  GOOGLE_REFRESH_TOKEN: process.env.GOOGLE_REFRESH_TOKEN,
  NOTIFICATION_EMAIL: process.env.NOTIFICATION_EMAIL,
});
export default config;
