import pool from '../../database/db.js';

async function getAllCategories() {
    try {
        const result = await pool.query('SELECT * FROM category ORDER BY name ASC;');
        return result.rows;
    } catch (error) {
        console.error('Error fetching categories:', error);
        throw error;
    }
}

async function getCategoryDetails(categoryId) {
    try {
        const result = await pool.query(
            'SELECT * FROM category WHERE category_id = $1;', 
            [categoryId]
        );
        return result.rows[0] || null;
    } catch (error) {
        console.error('Error fetching category details:', error);
        throw error;
    }
}

async function getCategoriesByProjectId(projectId) {
    try {
        const result = await pool.query(
            `SELECT c.*
             FROM category c
             JOIN project_category pc ON c.category_id = pc.category_id
             WHERE pc.project_id = $1
             ORDER BY c.name ASC;`,
            [projectId]
        );
        return result.rows;
    } catch (error) {
        console.error('Error fetching categories by project ID:', error);
        throw error;
    }
}

async function getProjectsByCategoryId(categoryId) {
    try {
        const result = await pool.query(
            `SELECT sp.*
             FROM service_project sp
             JOIN project_category pc ON sp.project_id = pc.project_id
             WHERE pc.category_id = $1
             ORDER BY sp.date ASC;`,
            [categoryId]
        );
        return result.rows;
    } catch (error) {
        console.error('Error fetching projects by category ID:', error);
        throw error;
    }
}

export {
    getAllCategories,
    getCategoryDetails,
    getCategoriesByProjectId,
    getProjectsByCategoryId
};
