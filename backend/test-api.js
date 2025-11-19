#!/usr/bin/env node

/**
 * Quick health check script for Together backend
 * Run this after npm start to verify the server is working
 * 
 * Usage: npm start (in terminal 1)
 *        node test-api.js (in terminal 2)
 */

const http = require('http');

const API_BASE = 'http://localhost:5000';

// Helper to make HTTP requests
function makeRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, API_BASE);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data), headers: res.headers });
        } catch {
          resolve({ status: res.statusCode, data, headers: res.headers });
        }
      });
    });

    req.on('error', reject);

    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

// Color helpers
const green = (str) => `\x1b[32m${str}\x1b[0m`;
const red = (str) => `\x1b[31m${str}\x1b[0m`;
const yellow = (str) => `\x1b[33m${str}\x1b[0m`;
const blue = (str) => `\x1b[34m${str}\x1b[0m`;

async function runTests() {
  console.log(blue('\n=== Together Backend Health Check ===\n'));

  let passed = 0;
  let failed = 0;

  try {
    // Test 1: Health endpoint
    console.log(yellow('1️⃣  Testing /health endpoint...'));
    const health = await makeRequest('GET', '/health');
    if (health.status === 200 && health.data.status === 'healthy') {
      console.log(green('   ✓ Health check passed\n'));
      passed++;
    } else {
      console.log(red(`   ✗ Expected 200 & healthy status, got ${health.status}\n`));
      failed++;
    }

    // Test 2: Root endpoint
    console.log(yellow('2️⃣  Testing / endpoint...'));
    const root = await makeRequest('GET', '/');
    if (root.status === 200 || root.status === 302) {
      console.log(green('   ✓ Root endpoint responded\n'));
      passed++;
    } else {
      console.log(red(`   ✗ Expected 200 or 302, got ${root.status}\n`));
      failed++;
    }

    // Test 3: Invalid register (no data)
    console.log(yellow('3️⃣  Testing validation: POST /api/auth/register (no data)...'));
    const noData = await makeRequest('POST', '/api/auth/register', {});
    if (noData.status === 400 && noData.data.error) {
      console.log(green('   ✓ Validation working (rejects empty)\n'));
      passed++;
    } else {
      console.log(red(`   ✗ Expected 400 with error, got ${noData.status}\n`));
      failed++;
    }

    // Test 4: Invalid register (bad email)
    console.log(yellow('4️⃣  Testing validation: POST /api/auth/register (bad email)...'));
    const badEmail = await makeRequest('POST', '/api/auth/register', {
      username: 'testuser',
      email: 'not-an-email',
      password: 'password123'
    });
    if (badEmail.status === 400 && badEmail.data.error?.code === 'VALIDATION_ERROR') {
      console.log(green('   ✓ Email validation working\n'));
      passed++;
    } else {
      console.log(red(`   ✗ Expected 400 with VALIDATION_ERROR\n`));
      failed++;
    }

    // Test 5: Invalid login (no user)
    console.log(yellow('5️⃣  Testing POST /api/auth/login (no user)...'));
    const noUser = await makeRequest('POST', '/api/auth/login', {
      email: 'nonexistent@example.com',
      password: 'password123'
    });
    if (noUser.status === 400 && noUser.data.error?.code === 'AUTH_ERROR') {
      console.log(green('   ✓ Login error handling working\n'));
      passed++;
    } else {
      console.log(red(`   ✗ Expected 400 with AUTH_ERROR\n`));
      failed++;
    }

    // Summary
    console.log(blue('=== Test Summary ===\n'));
    console.log(green(`Passed: ${passed}`));
    if (failed > 0) console.log(red(`Failed: ${failed}`));
    else console.log(green('All tests passed! ✓'));

    console.log(blue('\n=== Next Steps ==='));
    console.log('1. Verify backend is running: npm start');
    console.log('2. Check Render logs: npm run dev (in Render dashboard)');
    console.log('3. Verify MongoDB connection: check .env MONGO_URI');
    console.log('4. Test frontend: npm run dev (in frontend folder)');

    process.exit(failed > 0 ? 1 : 0);
  } catch (err) {
    console.error(red(`\n❌ Connection error: ${err.message}`));
    console.error(yellow('\nMake sure the backend is running:'));
    console.error('  cd backend');
    console.error('  npm start');
    process.exit(1);
  }
}

// Run tests
runTests();
