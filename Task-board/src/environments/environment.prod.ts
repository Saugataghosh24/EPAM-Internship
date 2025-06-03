 // src/environments/environment.prod.ts
 export const environment = {
    production: true,
    dialApi: {
      apiKey: '', // Will be set from environment variables in production
      endpoint: 'https://ai-proxy.lab.epam.com',
      apiVersion: '2023-12-01-preview',
      deployment: 'gpt-4o'
    }
  };