// Validate environment variables
const validateEnvVariables = () => {
  const requiredVars = [
    'VITE_GROQ_API_KEY_1',
    'VITE_GROQ_API_KEY_2',
    'VITE_GROQ_API_KEY_3'
  ];

  for (const varName of requiredVars) {
    if (!import.meta.env[varName]) {
      console.error(`Missing environment variable: ${varName}`);
    }
  }
};

// Initialize and validate environment
validateEnvVariables();

// Export environment configuration
export const env = {
  groqApiKeys: [
    import.meta.env.VITE_GROQ_API_KEY_1,
    import.meta.env.VITE_GROQ_API_KEY_2,
    import.meta.env.VITE_GROQ_API_KEY_3
  ].filter(key => key && typeof key === 'string' && key.trim().startsWith('gsk_'))
};

// Log available keys (for debugging)
console.log('Available API keys:', env.groqApiKeys.length); 