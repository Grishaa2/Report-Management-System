#!/usr/bin/env node

/**
 * OAuth Debug Script - UPDATED with NEW Vercel URL
 */

console.log('\n🔍 OAuth Configuration Diagnostic Tool (UPDATED)\n');
console.log('='.repeat(70));

// Your NEW Vercel deployment URL
const vercelUrl = 'report-management-system-doni-nj0kawkfk.vercel.app';
const correctUrl = `https://${vercelUrl}`;

console.log(`\n⚠️  IMPORTANT: NEW DEPLOYMENT = NEW URL!\n`);
console.log(`   OLD URL: report-management-system-doni-2uqb6kpom.vercel.app (NO LONGER WORKS)`);
console.log(`   NEW URL: ${vercelUrl}\n`);

console.log(`🎯 NEXTAUTH_URL must be: ${correctUrl}`);
console.log(`\n📝 Required Redirect URIs:\n`);
console.log(`   Google OAuth:`);
console.log(`   ${correctUrl}/api/auth/callback/google`);
console.log(`\n   GitHub OAuth:`);
console.log(`   ${correctUrl}/api/auth/callback/github`);

console.log('\n' + '='.repeat(70));
console.log('\n🔧 URGENT: UPDATE THESE SETTINGS:\n');

console.log('STEP 1: Update Vercel Environment Variable');
console.log('   1. Go to: https://vercel.com/grishaa2/report-management-system-doni/settings/environment-variables');
console.log('   2. Find NEXTAUTH_URL');
console.log(`   3. Change TO: ${correctUrl}`);
console.log('   4. Click Save');

console.log('\nSTEP 2: Update Google OAuth Redirect URI');
console.log('   1. Go to: https://console.cloud.google.com/apis/credentials');
console.log('   2. Click on your OAuth 2.0 Client ID');
console.log('   3. Add to "Authorized redirect URIs":');
console.log(`      ${correctUrl}/api/auth/callback/google`);
console.log('   4. Click Save');
console.log('   5. Wait 5-10 minutes');

console.log('\nSTEP 3: Update GitHub OAuth Callback URL');
console.log('   1. Go to: https://github.com/settings/developers');
console.log('   2. Click on your OAuth App');
console.log('   3. Update "Callback URL":');
console.log(`      ${correctUrl}/api/auth/callback/github`);
console.log('   4. Click Save');

console.log('\nSTEP 4: REDEPLOY ON VERCEL');
console.log('   1. Go to: https://vercel.com/grishaa2/report-management-system-doni/deployments');
console.log('   2. Click "Redeploy" (three dots menu)');
console.log('   3. Wait for deployment to complete');

console.log('\nSTEP 5: Test OAuth Login');
console.log(`   Visit: ${correctUrl}`);
console.log('   Try signing in with Google or GitHub');

console.log('\n' + '='.repeat(70));
console.log('\n✅ After updating ALL settings, OAuth will work!\n');
