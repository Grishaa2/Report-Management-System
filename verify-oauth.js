#!/usr/bin/env node

/**
 * OAuth Verification Script - UPDATED URL
 */

const https = require('https');

const vercelUrl = 'report-management-system-doni-nj0kawkfk.vercel.app';
const correctUrl = `https://${vercelUrl}`;

console.log('\n🧪 OAuth Verification Test\n');
console.log('='.repeat(70));
console.log(`\nTesting deployment: ${correctUrl}\n`);

// Test if the app is accessible
console.log('📡 Checking if app is accessible...');

https.get(correctUrl, (res) => {
  console.log(`✅ App accessible: ${res.statusCode}`);
  
  // Test auth endpoint
  console.log('\n📡 Testing OAuth providers endpoint...');
  const authUrl = `${correctUrl}/api/auth/providers`;
  https.get(authUrl, (authRes) => {
    let data = '';
    
    authRes.on('data', (chunk) => {
      data += chunk;
    });
    
    authRes.on('end', () => {
      try {
        const providers = JSON.parse(data);
        console.log('✅ OAuth providers endpoint accessible');
        console.log('\n📋 Available OAuth Providers:');
        
        if (providers.google) {
          console.log('   ✅ Google OAuth: Configured');
        } else {
          console.log('   ❌ Google OAuth: Not configured');
        }
        
        if (providers.github) {
          console.log('   ✅ GitHub OAuth: Configured');
        } else {
          console.log('   ❌ GitHub OAuth: Not configured');
        }
        
        console.log('\n' + '='.repeat(70));
        console.log('\n🎉 Verification Complete!');
        console.log('\n📝 Next Steps:');
        console.log(`1. Visit: ${correctUrl}`);
        console.log('2. Try signing in with Google/GitHub');
        console.log('3. If still failing, check redirect URIs match exactly:\n');
        console.log(`   Google: ${correctUrl}/api/auth/callback/google`);
        console.log(`   GitHub: ${correctUrl}/api/auth/callback/github\n');
        
      } catch (e) {
        console.log('❌ Error parsing OAuth response:', e.message);
      }
    });
  }).on('error', (e) => {
    console.log('❌ Error accessing OAuth endpoint:', e.message);
    console.log('\n⚠️  OAuth endpoint not accessible.');
    console.log('   Check: 1. Vercel Authentication is disabled');
    console.log('         2. NEXTAUTH_URL is set correctly');
  });
  
}).on('error', (e) => {
  console.log('❌ Error accessing app:', e.message);
  console.log('\n⚠️  App is not accessible.');
  console.log('   Check deployment status on Vercel.');
});
