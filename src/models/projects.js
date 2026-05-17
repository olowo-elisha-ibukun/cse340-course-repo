import db from '../../database/db.js';

/**
 * Fetches all service projects from the database, 
 * joining with the organization table to pull the sponsor name.
 */
const getAllProjects = async () => {
    const query = `
        SELECT 
            p.project_id, 
            p.title, 
            p.description, 
            p.location,
            p.date, 
            o.name AS organization_name,
            o.logo_filename AS logo_filename
        FROM public.service_project p
        JOIN public.organization o ON p.organization_id = o.organization_id
        ORDER BY p.date ASC;
    `;

    const result = await db.query(query);
    return result.rows;
};

export async function getProjectsByCategoryId(categoryId) {
    try {
        const result = await db.query(
            `SELECT p.*
             FROM service_project p
             JOIN project_category pc ON p.project_id = pc.project_id
             WHERE pc.category_id = $1
             ORDER BY p.start_date ASC;`,
            [categoryId]
        );
        return result.rows;
    } catch (error) {
        console.error('Error fetching projects by category ID:', error);
        throw error;
    }
};

export { getAllProjects };
