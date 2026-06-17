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

const isUserVolunteering = async (projectId, accountId) => {
    try {
        const query = `
            SELECT 1
            FROM public.project_volunteer
            WHERE project_id = $1 AND account_id = $2;
        `;
        const result = await db.query(query, [projectId, accountId]);
        return result.rowCount > 0;
    } catch (error) {
        console.error('Error checking volunteer status:', error);
        throw error;
    }
};

const addVolunteer = async (projectId, accountId) => {
    try {
        const query = `
            INSERT INTO public.project_volunteer (project_id, account_id)
            VALUES ($1, $2)
            ON CONFLICT DO NOTHING;
        `;
        await db.query(query, [projectId, accountId]);
    } catch (error) {
        console.error('Error adding volunteer:', error);
        throw error;
    }
};

const removeVolunteer = async (projectId, accountId) => {
    try {
        const query = `
            DELETE FROM public.project_volunteer
            WHERE project_id = $1 AND account_id = $2;
        `;
        await db.query(query, [projectId, accountId]);
    } catch (error) {
        console.error('Error removing volunteer:', error);
        throw error;
    }
};

const getProjectsByUserVolunteer = async (accountId) => {
    try {
        const query = `
            SELECT p.project_id, p.title, p.name, p.location, p.date
            FROM public.service_project p
            JOIN public.project_volunteer pv ON p.project_id = pv.project_id
            WHERE pv.account_id = $1
            ORDER BY p.date ASC;
        `;
        const result = await db.query(query, [accountId]);
        return result.rows;
    } catch (error) {
        console.error('Error fetching user volunteer projects:', error);
        throw error;
    }
};

export { getAllProjects, getProjectsByOrgId, getProjectById, insertProject, updateProject, isUserVolunteering, addVolunteer, removeVolunteer, getProjectsByUserVolunteer };
