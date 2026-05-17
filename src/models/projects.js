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

/**
 * Fetches a single service project by ID, including organization name.
 */
const getProjectById = async (projectId) => {
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
        WHERE p.project_id = $1;
    `;

    const result = await db.query(query, [projectId]);
    return result.rows[0] || null;
};

export { getAllProjects, getProjectById };
