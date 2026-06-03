import db from '../../database/db.js';

export async function getAllUsersWithRoles() {
    const query = `
        SELECT u.user_id, u.name, u.email, r.role_name
        FROM public.users u
        JOIN public.roles r ON u.role_id = r.role_id
        ORDER BY u.user_id ASC;
    `;

    const result = await db.query(query);
    return result.rows;
}

export async function getUserByEmail(email) {
    const query = `
        SELECT u.user_id, u.name, u.email, u.password_hash, r.role_name
        FROM public.users u
        JOIN public.roles r ON u.role_id = r.role_id
        WHERE u.email = $1
        LIMIT 1;
    `;

    const result = await db.query(query, [email]);
    return result.rows[0];
}

export async function createUser(name, email, passwordHash) {
    const query = `
        INSERT INTO public.users (name, email, password_hash, role_id)
        VALUES ($1, $2, $3, (SELECT role_id FROM public.roles WHERE role_name = 'user'))
        RETURNING user_id, name, email;
    `;

    const result = await db.query(query, [name, email, passwordHash]);
    return result.rows[0];
}
