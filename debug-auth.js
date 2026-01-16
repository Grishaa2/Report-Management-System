const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function debugAuth(email, password) {
    console.log(`\n--- Debugging Auth for ${email} ---`);

    try {
        const user = await prisma.user.findUnique({
            where: { email: email }
        });

        if (!user) {
            console.log('User NOT FOUND in database.');
            return;
        }

        console.log('User FOUND:', { id: user.id, email: user.email, hasPassword: !!user.password });
        console.log('Stored Hash:', user.password);

        if (!user.password) {
            console.log('Error: User has no password set.');
            return;
        }

        console.log('Testing password comparison...');
        const isMatch = await bcrypt.compare(password, user.password);
        console.log(`bcrypt.compare('${password}', hash) === ${isMatch}`);

        if (isMatch) {
            console.log('✅ PASSWORD MATCHES! The issue is likely in NextAuth config or environment.');
        } else {
            console.log('❌ PASSWORD DOES NOT MATCH. Verify the password you use.');

            // Double check hashing a new password
            const newHash = await bcrypt.hash(password, 10);
            console.log(`If you were to hash '${password}' again, it would look like: ${newHash.substring(0, 20)}...`);
        }

    } catch (error) {
        console.error('Debug Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

// Run for the user likely used
debugAuth('testuser@example.com', 'Test123456');
debugAuth('david@test.com', 'Test123456');
