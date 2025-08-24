#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Setting up MediSyncX Application...\n');

// Create environment file for backend
const envContent = `PORT=5000
JWT_SECRET=medisyncx_secret_key_2023
NODE_ENV=development`;

const envPath = path.join(__dirname, 'backend', '.env');

try {
  if (!fs.existsSync(envPath)) {
    fs.writeFileSync(envPath, envContent);
    console.log('✅ Created backend/.env file');
  } else {
    console.log('ℹ️  Backend/.env file already exists');
  }
} catch (error) {
  console.log('⚠️  Could not create .env file. You can create it manually in the backend directory.');
  console.log('   Content should be:');
  console.log('   PORT=5000');
  console.log('   JWT_SECRET=medisyncx_secret_key_2023');
  console.log('   NODE_ENV=development\n');
}

// Install dependencies
console.log('📦 Installing dependencies...\n');

try {
  console.log('Installing root dependencies...');
  execSync('npm install', { stdio: 'inherit' });
  
  console.log('Installing backend dependencies...');
  execSync('cd backend && npm install', { stdio: 'inherit' });
  
  console.log('Installing frontend dependencies...');
  execSync('cd frontend && npm install', { stdio: 'inherit' });
  
  console.log('\n✅ Setup completed successfully!');
  console.log('\n🎯 To start the application, run:');
  console.log('   npm run dev');
  console.log('\n🔐 Demo credentials:');
  console.log('   Email: admin@medisyncx.com');
  console.log('   Password: password');
  console.log('\n🌐 The application will be available at:');
  console.log('   Frontend: http://localhost:3000');
  console.log('   Backend:  http://localhost:5000');
  
} catch (error) {
  console.error('\n❌ Error during setup:', error.message);
  console.log('\n📖 Please refer to README.md for manual setup instructions.');
}
