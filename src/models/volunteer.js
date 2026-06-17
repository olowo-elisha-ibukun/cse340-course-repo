import db from '../../database/db.js';

const addVolunteer = async (accountId, projectId) => {
  try {
    const query = `
      INSERT INTO public.project_volunteer (account_id, project_id)
      VALUES ($1, $2)
      ON CONFLICT DO NOTHING;
    `;
    await db.query(query, [accountId, projectId]);
  } catch (error) {
    console.error('Error adding volunteer:', error);
    throw error;
  }
};

const removeVolunteer = async (accountId, projectId) => {
  try {
    const query = `
      DELETE FROM public.project_volunteer
      WHERE account_id = $1 AND project_id = $2;
    `;
    await db.query(query, [accountId, projectId]);
  } catch (error) {
    console.error('Error removing volunteer:', error);
    throw error;
  }
};

const getVolunteeredProjectsByAccount = async (accountId) => {
  try {
    const query = `
      SELECT p.project_id, p.title, p.location, p.date
      FROM public.project_volunteer pv
      INNER JOIN public.service_project p ON pv.project_id = p.project_id
      WHERE pv.account_id = $1
      ORDER BY p.date ASC;
    `;

    const result = await db.query(query, [accountId]);
    return result.rows;
  } catch (error) {
    console.error('Error fetching volunteered projects for account:', error);
    throw error;
  }
};

export { addVolunteer, removeVolunteer, getVolunteeredProjectsByAccount };