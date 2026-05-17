import pool from '../../database/db.js';

export async function getAllCategories() {
    try {
        const result = await pool.query('SELECT * FROM category ORDER BY name ASC;');
        return result.rows;
    } catch (error) {
        console.error('Error fetching categories:', error);
        throw error;
    }
}
