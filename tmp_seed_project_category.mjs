import dotenv from 'dotenv';
dotenv.config();
import pkg from 'pg';
const { Pool } = pkg;
const pool = new Pool({ connectionString: process.env.DB_URL, ssl: false });

(async () => {
  try {
    const assigns = [
      [1, 1],
      [2, 2],
      [3, 3],
      [4, 4],
      [5, 5],
      [6, 1],
      [7, 2],
      [8, 3],
      [9, 4],
      [10, 5],
      [11, 1],
      [12, 4],
      [13, 5],
      [14, 2],
      [15, 3]
    ];

    for (const [project_id, category_id] of assigns) {
      const sql = 'INSERT INTO project_category (project_id, category_id) VALUES ($1, $2) ON CONFLICT DO NOTHING';
      await pool.query(sql, [project_id, category_id]);
    }
    const count = await pool.query('SELECT COUNT(*) FROM project_category');
    console.log('project_category count:', count.rows[0].count);
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
})();
