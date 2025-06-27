#!/usr/bin/env node

/**
 * Multimodal QA Agent Setup Script
 * 
 * This script helps set up the development environment for the Multimodal QA Agent.
 * It checks dependencies, creates necessary directories, and validates configuration.
 */

import { execSync } from 'child_process';
import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'fs';
import { join } from 'path';

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkNodeVersion() {
  log('\n📋 Checking Node.js version...', 'blue');
  
  const nodeVersion = process.version;
  const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
  
  if (majorVersion >= 18) {
    log(`✅ Node.js ${nodeVersion} is supported`, 'green');
    return true;
  } else {
    log(`❌ Node.js ${nodeVersion} is not supported. Please upgrade to Node.js 18+`, 'red');
    return false;
  }
}

function checkNpmVersion() {
  log('\n📋 Checking npm version...', 'blue');
  
  try {
    const npmVersion = execSync('npm --version', { encoding: 'utf8' }).trim();
    const majorVersion = parseInt(npmVersion.split('.')[0]);
    
    if (majorVersion >= 8) {
      log(`✅ npm ${npmVersion} is supported`, 'green');
      return true;
    } else {
      log(`❌ npm ${npmVersion} is not supported. Please upgrade to npm 8+`, 'red');
      return false;
    }
  } catch (error) {
    log('❌ npm is not installed or not accessible', 'red');
    return false;
  }
}

function createDirectories() {
  log('\n📁 Creating necessary directories...', 'blue');
  
  const directories = [
    'backend/temp',
    'assets/screenshots',
    'tests/sample-images'
  ];
  
  directories.forEach(dir => {
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
      log(`✅ Created directory: ${dir}`, 'green');
    } else {
      log(`✅ Directory exists: ${dir}`, 'green');
    }
  });
}

function checkEnvironmentFiles() {
  log('\n🔧 Checking environment files...', 'blue');
  
  const backendEnvPath = 'backend/.env';
  const frontendEnvPath = 'frontend/.env';
  
  // Check backend .env
  if (!existsSync(backendEnvPath)) {
    log('⚠️  Backend .env file not found. Creating from template...', 'yellow');
    
    if (existsSync('backend/.env.example')) {
      const envExample = readFileSync('backend/.env.example', 'utf8');
      writeFileSync(backendEnvPath, envExample);
      log('✅ Created backend/.env from template', 'green');
      log('⚠️  Please add your API keys to backend/.env', 'yellow');
    } else {
      log('❌ Backend .env.example not found', 'red');
    }
  } else {
    log('✅ Backend .env file exists', 'green');
  }
  
  // Check frontend .env
  if (!existsSync(frontendEnvPath)) {
    log('⚠️  Frontend .env file not found. Creating from template...', 'yellow');
    
    if (existsSync('frontend/.env.example')) {
      const envExample = readFileSync('frontend/.env.example', 'utf8');
      writeFileSync(frontendEnvPath, envExample);
      log('✅ Created frontend/.env from template', 'green');
    } else {
      log('❌ Frontend .env.example not found', 'red');
    }
  } else {
    log('✅ Frontend .env file exists', 'green');
  }
}

function installDependencies() {
  log('\n📦 Installing dependencies...', 'blue');
  
  try {
    // Install backend dependencies
    log('Installing backend dependencies...', 'blue');
    process.chdir('backend');
    execSync('npm install', { stdio: 'inherit' });
    process.chdir('..');
    log('✅ Backend dependencies installed', 'green');
    
    // Install frontend dependencies
    log('Installing frontend dependencies...', 'blue');
    process.chdir('frontend');
    execSync('npm install', { stdio: 'inherit' });
    process.chdir('..');
    log('✅ Frontend dependencies installed', 'green');
    
    return true;
  } catch (error) {
    log('❌ Failed to install dependencies', 'red');
    log(error.message, 'red');
    return false;
  }
}

function validateSetup() {
  log('\n🔍 Validating setup...', 'blue');
  
  const requiredFiles = [
    'backend/package.json',
    'backend/server.js',
    'frontend/package.json',
    'frontend/src/App.jsx',
    'backend/src/services/openaiService.js',
    'backend/src/services/geminiService.js',
    'backend/src/services/claudeService.js'
  ];
  
  let allValid = true;
  
  requiredFiles.forEach(file => {
    if (existsSync(file)) {
      log(`✅ ${file}`, 'green');
    } else {
      log(`❌ ${file} missing`, 'red');
      allValid = false;
    }
  });
  
  return allValid;
}

function printNextSteps() {
  log('\n🚀 Setup Complete!', 'bold');
  log('\nNext steps:', 'blue');
  log('1. Add your API keys to backend/.env:', 'yellow');
  log('   - OPENAI_API_KEY=your_openai_key_here', 'yellow');
  log('   - GOOGLE_AI_API_KEY=your_google_key_here (optional)', 'yellow');
  log('   - ANTHROPIC_API_KEY=your_anthropic_key_here (optional)', 'yellow');
  
  log('\n2. Start the development servers:', 'yellow');
  log('   Terminal 1: cd backend && npm run dev', 'yellow');
  log('   Terminal 2: cd frontend && npm run dev', 'yellow');
  
  log('\n3. Open your browser:', 'yellow');
  log('   Frontend: http://localhost:3000', 'yellow');
  log('   Backend API: http://localhost:5001/api', 'yellow');
  
  log('\n4. Test the application:', 'yellow');
  log('   - Upload an image or provide an image URL', 'yellow');
  log('   - Ask a question about the image', 'yellow');
  log('   - View the AI-generated response', 'yellow');
  
  log('\n📚 Documentation:', 'blue');
  log('   - Setup Guide: docs/setup-guide.md', 'yellow');
  log('   - API Documentation: docs/api-documentation.md', 'yellow');
  log('   - Test Cases: tests/test-cases.md', 'yellow');
}

function main() {
  log('🤖 Multimodal QA Agent Setup', 'bold');
  log('=====================================', 'blue');
  
  // Check prerequisites
  const nodeOk = checkNodeVersion();
  const npmOk = checkNpmVersion();
  
  if (!nodeOk || !npmOk) {
    log('\n❌ Prerequisites not met. Please install the required versions.', 'red');
    process.exit(1);
  }
  
  // Setup steps
  createDirectories();
  checkEnvironmentFiles();
  
  const depsInstalled = installDependencies();
  if (!depsInstalled) {
    log('\n❌ Setup failed during dependency installation.', 'red');
    process.exit(1);
  }
  
  const setupValid = validateSetup();
  if (!setupValid) {
    log('\n❌ Setup validation failed. Some files are missing.', 'red');
    process.exit(1);
  }
  
  printNextSteps();
}

// Run the setup
main();
