interface AppConfig {
  nodeEnv: 'development' | 'production' | 'test';
  host: string;
  port: number;
  secretKey: string;
  mongoUri: string;
  mongoDbName: string;
  openaiKey: string;
  openaiKey2: string;
  googleClientId: string;
  lemonSqueezyApiKey: string;
  lemonSqueezySignSecret: string;
  sendGridApiKey: string;
  docStorageLocation: string;
  textractServiceUrl: string;
}

const config = (): AppConfig => ({
  nodeEnv: (process.env.NODE_ENV as any) || 'development',
  host: process.env.HOST || '127.0.0.1',
  port: parseInt(process.env.PORT as string, 10) || 8000,
  secretKey: process.env.SECRET_KEY || 'secret',
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017',
  mongoDbName: process.env.MONGO_DBNAME || 'sitemine',
  openaiKey: process.env.OPENAI_KEY || '',
  openaiKey2: process.env.OPENAI_KEY_2 || '',
  googleClientId: process.env.GOOGLE_CLIENT_ID || '',
  lemonSqueezyApiKey: process.env.LEMON_SQUEEZY_API_KEY || '',
  lemonSqueezySignSecret: process.env.LEMON_SQUEEZY_SIGN_SECRET || '',
  sendGridApiKey: process.env.SENDGRID_API_KEY || '',
  docStorageLocation: process.env.DOC_STORAGE_LOCATION || '../storage',
  textractServiceUrl:
    process.env.TEXTRACT_URL || 'http://localhost:8080/textract',
});

export { AppConfig };
export default config;
