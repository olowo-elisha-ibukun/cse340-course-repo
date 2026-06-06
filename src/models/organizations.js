import db from '../../database/db.js';

async function getAllOrganizations() {
    try {
        const result = await db.query('SELECT * FROM public.organization ORDER BY name ASC;');
        return result.rows;
    } catch (error) {
        console.error('Error fetching organizations:', error);
        throw error;
    }
}

async function getOrganizationById(organizationId) {
    try {
        const result = await db.query(
            'SELECT * FROM public.organization WHERE organization_id = $1;', 
            [organizationId]
        );
        return result.rows[0] || null;
    } catch (error) {
        console.error('Error fetching organization details:', error);
        throw error;
    }
}

async function insertOrganization({ name, description, contact_email, phone_number, logo_filename }) {
    try {
        const result = await db.query(
            `INSERT INTO public.organization
                (name, description, contact_email, phone_number, logo_filename)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING *;`,
            [name, description, contact_email, phone_number, logo_filename]
        );
        return result.rows[0];
    } catch (error) {
        console.error('Error inserting organization:', error);
        throw error;
    }
}

async function updateOrganization({ organizationId, name, description, contact_email, phone_number, logo_filename }) {
    try {
        const result = await db.query(
            `UPDATE public.organization
             SET name = $2,
                 description = $3,
                 contact_email = $4,
                 phone_number = $5,
                 logo_filename = $6
             WHERE organization_id = $1
             RETURNING *;`,
            [organizationId, name, description, contact_email, phone_number, logo_filename]
        );
        return result.rows[0];
    } catch (error) {
        console.error('Error updating organization:', error);
        throw error;
    }
}

export { getAllOrganizations, getOrganizationById, insertOrganization, updateOrganization };