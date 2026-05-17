import db from '../database/db.js';

/**
 * Get all categories from the database
 * @returns {Promise<Array>} Array of category objects with category_id and name
 */
export async function getAllCategories() {
    try {
        const result = await db.query(
            'SELECT category_id, name FROM public.category'
        );
        return result.rows;
    } catch (error) {
        console.error('Database query error:', error);
        throw error;
    }
}
