const { PrismaClient } = require('@prisma/client');

async function testConnection() {
  console.log('========================================');
  console.log('Testing Supabase Database Connection');
  console.log('========================================\n');

  const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
  });

  try {
    console.log('1. Attempting to connect to Supabase...');
    console.log(`   Host: db.pbteuczmpwknljjhaqth.supabase.co:5432`);
    console.log(`   Database: postgres`);
    console.log('');

    // Test connection
    await prisma.$connect();
    console.log('✅ [SUCCESS] Connected to Supabase!\n');

    // Test database operations
    console.log('2. Testing database operations...');

    // Check if tables exist
    const userCount = await prisma.user.count();
    console.log(`   Users in database: ${userCount}`);

    // Check sessions
    const sessionCount = await prisma.session.count();
    console.log(`   Sessions in database: ${sessionCount}`);

    // Check accounts
    const accountCount = await prisma.account.count();
    console.log(`   OAuth accounts: ${accountCount}`);

    console.log('\n========================================');
    console.log('All database operations successful!');
    console.log('========================================\n');

    console.log('Your Supabase database is ready for NextAuth.\n');

  } catch (error) {
    console.log('❌ [FAILED] Connection failed\n');
    console.log('Error details:', error.message);
    console.log('\n========================================');
    console.log('Troubleshooting Steps:');
    console.log('========================================');
    console.log('1. Check Supabase Project Status:');
    console.log('   - Go to https://supabase.com');
    console.log('   - Sign in to your account');
    console.log('   - Check if project shows "Paused" (gray dot)');
    console.log('   - If paused, click "Resume Project"');
    console.log('   - Wait 2-3 minutes for it to fully start');
    console.log('');
    console.log('2. Verify Connection String:');
    console.log('   - Go to Supabase → Settings → Database');
    console.log('   - Copy the "Connection string"');
    console.log('   - Update .env file with correct URL');
    console.log('');
    console.log('3. Check Network/Firewall:');
    console.log('   - Ensure port 5432 is not blocked');
    console.log('   - Try from a different network');
    console.log('');
    console.log('4. Regenerate Prisma Client:');
    console.log('   - Run: npx prisma generate');
    console.log('   - Run: npx prisma db push');
    console.log('========================================\n');

  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
