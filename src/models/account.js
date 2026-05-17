import db from '../../database/db.js';

async function createAccountTable() {
    try {
        const result = await db.query(`
            CREATE TABLE IF NOT EXISTS account (
                account_id SERIAL PRIMARY KEY,
                account_firstname VARCHAR(100) NOT NULL,
                account_lastname VARCHAR(100) NOT NULL,
                account_email VARCHAR(255) NOT NULL UNIQUE,
                account_password VARCHAR(255) NOT NULL,
                account_type VARCHAR(50) DEFAULT 'Client',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('Account table created or already exists.');
        return result;
    } catch (error) {
        console.error('Error creating account table:', error);
        throw error;
    }
}

async function registerUser(firstname, lastname, email, hashedPassword, accountType = 'Client') {
    try {
        const result = await db.query(
            'INSERT INTO account (account_firstname, account_lastname, account_email, account_password, account_type) VALUES ($1, $2, $3, $4, $5) RETURNING *;',
            [firstname, lastname, email, hashedPassword, accountType]
        );
        return result.rows[0];
    } catch (error) {
        console.error('Error registering user:', error);
        throw error;
    }
}

async function getUserByEmail(email) {
    try {
        const result = await db.query(
            'SELECT * FROM account WHERE account_email = $1;',
            [email]
        );
        return result.rows[0] || null;
    } catch (error) {
        console.error('Error fetching user by email:', error);
        throw error;
    }
}

async function getAllUsers() {
    try {
        const result = await db.query('SELECT account_id, account_firstname, account_lastname, account_email, account_type FROM account ORDER BY account_lastname ASC;');
        return result.rows;
    } catch (error) {
        console.error('Error fetching all users:', error);
        throw error;
    }
}

export {
    createAccountTable,
    registerUser,
    getUserByEmail,
    getAllUsers
};
