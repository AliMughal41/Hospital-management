module.exports = {
  extends: [
    'react-app',
    'react-app/jest'
  ],
  rules: {
    // Disable some rules for development
    'no-unused-vars': 'warn',
    'react-hooks/exhaustive-deps': 'warn',
    'no-use-before-define': 'warn',
    
    // Keep important rules as errors
    'react-hooks/rules-of-hooks': 'error'
  }
};