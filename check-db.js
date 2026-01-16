const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');

async function listAll() {
    console.log('\n--- 🔍 DATABASE USER CHECK 🔍 ---');
    try {
        const users = await prisma.user.findMany();

        if (users.length === 0) {
            console.log('❌ No users found in PostgreSQL database.');
        } else {
            console.log(`✅ Found ${users.length} users in PostgreSQL:\n`);

            for (const user of users) {
                console.log(`👤 User: ${user.email}`);
                console.log(`   ID:   ${user.id}`);

                // Test common passwords
                const pass1 = 'Test123456';
                const pass2 = 'password123';
                const pass3 = 'David12345';

                const isMatch1 = await bcrypt.compare(pass1, user.password || '');
                const isMatch2 = await bcrypt.compare(pass2, user.password || '');
                const isMatch3 = await bcrypt.compare(pass3, user.password || '');

                if (isMatch1) console.log(`   🔑 Password matches: '${pass1}'`);
                else if (isMatch2) console.log(`   🔑 Password matches: '${pass2}'`);
                else if (isMatch3) console.log(`   🔑 Password matches: '${pass3}'`);
                else console.log(`   🔒 Password is set (secure hash)`);

                console.log('-----------------------------------');
            }
        }
    } catch (e) {
        console.error('❌ Connection Error:', e);
    } finally {
        await prisma.$disconnect();
    }
}

listAll();

