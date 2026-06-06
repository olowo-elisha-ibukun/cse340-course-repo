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
 * Fetches all service projects for a specific organization by organization ID.
 */
const getProjectsByOrgId = async (orgId) => {
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
        WHERE p.organization_id = $1
        ORDER BY p.date ASC;
    `;

    const result = await db.query(query, [orgId]);
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

async function insertProject({ title, description, location, date, organization_id, status = 'Active' }) {
    const query = `
        INSERT INTO public.service_project
            (organization_id, name, title, description, date, location, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *;
    `;
    const values = [organization_id, title, title, description, date || null, location, status];
    const result = await db.query(query, values);
    return result.rows[0];
}

async function updateProject({ projectId, title, description, location, date, organization_id, status = 'Active' }) {
    const query = `
        UPDATE public.service_project
        SET organization_id = $2,
            name = $3,
            title = $4,
            description = $5,
            date = $6,
            location = $7,
            status = $8
        WHERE project_id = $1
        RETURNING *;
    `;
    const values = [projectId, organization_id, title, title, description, date || null, location, status];
    const result = await db.query(query, values);
    return result.rows[0];
}

export { getAllProjects, getProjectsByOrgId, getProjectById, insertProject, updateProject };
