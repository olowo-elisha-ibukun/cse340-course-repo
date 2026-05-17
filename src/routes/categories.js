import express from 'express';
import { getCategoryDetails } from '../controllers/categories.js';
import { getProjectDetails } from '../controllers/projects.js';

const router = express.Router();

router.get('/category/:id', getCategoryDetails);
router.get('/project/:id', getProjectDetails);

export default router;
