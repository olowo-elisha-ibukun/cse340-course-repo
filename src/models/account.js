import db from '../../database/db.js';

async function createAccountTable() {
    const sql = `
            CREATE TABLE IF NOT EXISTS account (
                account_id SERIAL PRIMARY KEY,
                account_firstname VARCHAR(100) NOT NULL,
                account_lastname VARCHAR(100) NOT NULL,
                account_email VARCHAR(255) NOT NULL UNIQUE,
                account_password VARCHAR(255) NOT NULL,
                account_type VARCHAR(50) DEFAULT 'Client',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `;

    // Retry logic for transient connection errors
    const maxRetries = 5;
    let attempt = 0;
    let delay = 2000; // start with 2s

    while (attempt < maxRetries) {
        try {
            const result = await db.query(sql);
            console.log('Account table created or already exists.');
            return result;
        } catch (error) {
            attempt += 1;
            console.error(`Attempt ${attempt} - Error creating account table:`, error.code || error.message || error);
            if (attempt >= maxRetries) {
                console.error('Max retries reached for createAccountTable. Giving up.');
                throw error;
            }
            // Wait before retrying
            await new Promise(res => setTimeout(res, delay));
            delay *= 2; // exponential backoff
        }
    }
}

async function registerUser(firstname, lastname, email, hashedPassword, accountType = 'Client') {
    try {
        console.log('registerUser: inserting', { email, accountType: accountType || 'Client' });
        const result = await db.query(
            'INSERT INTO account (account_firstname, account_lastname, account_email, account_password, account_type) VALUES ($1, $2, $3, $4, $5) RETURNING *;',
            [firstname, lastname, email, hashedPassword, accountType || 'Client']
        );

        if (!result || !result.rows || result.rows.length === 0) {
            throw new Error('Failed to insert new account');
        }

        return result.rows[0];
    } catch (error) {
        console.error('Error registering user:', error);
        throw error;
    }
}

async function getUserByEmail(email) {
    try {
        console.log('getUserByEmail: querying for', email);
        const result = await db.query(
            'SELECT * FROM account WHERE account_email = $1;',
            [email]
        );
        console.log('getUserByEmail: query complete, rows found:', result.rows.length);
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
