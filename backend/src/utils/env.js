// Environment variable validation
// Throw error on startup if required env vars are missing

const requiredEnvVars = [
  'DATABASE_URL',
  'JWT_SECRET'
];

const optionalEnvVars = {
  'CORS_ORIGIN': 'http://localhost:3000',
  'PORT': '4000',
  'NODE_ENV': 'development'
};

export function validateEnv() {
  const missing = requiredEnvVars.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}\n` +
      'Please check your .env file or environment configuration.'
    );
  }

  // Set defaults for optional vars
  Object.entries(optionalEnvVars).forEach(([key, defaultValue]) => {
    if (!process.env[key]) {
      process.env[key] = defaultValue;
    }
  });

  // Validate JWT_SECRET strength in production
  if (process.env.NODE_ENV === 'production' && process.env.JWT_SECRET) {
    if (process.env.JWT_SECRET.length < 32) {
      throw new Error(
        'JWT_SECRET must be at least 32 characters long in production. ' +
        'Generate a strong secret using: openssl rand -base64 32'
      );
    }
  }
}

// Call validation on import
validateEnv();

