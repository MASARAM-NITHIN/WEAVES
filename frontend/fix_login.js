const { Client } = require('pg');
const bcrypt = require('bcryptjs');

const run = async () => {
    if (!process.env.PGHOST) {
        console.error("❌ Not running inside Replit Postgres environment. Please run this in the Replit Shell.");
        process.exit(1);
    }
    
    const client = new Client({
        host: process.env.PGHOST,
        port: process.env.PGPORT || 5432,
        user: process.env.PGUSER || 'postgres',
        password: process.env.PGPASSWORD,
        database: process.env.PGDATABASE || 'postgres',
    });

    try {
        await client.connect();
        const hash = await bcrypt.hash('padmavathi123', 10);
        await client.query(`
            UPDATE admins 
            SET admin_password = $1, failed_login_attempts = 0, lockout_until = NULL, is_active = true 
            WHERE admin_username = 'owner'
        `, [hash]);
        console.log("✅ Successfully unlocked 'owner' and reset password to 'padmavathi123' in the database!");
    } catch (e) {
        console.error("❌ Database Error:", e.message);
    } finally {
        await client.end();
    }
};

run();
