import express from 'express';
import {
    showCreateCategoryPage,
    handleCreateCategory,
    showEditCategoryPage,
    handleEditCategory
} from '../controllers/categories.js';
import { categoryValidationRules, validateCategory } from '../middleware/validate.js';

const router = express.Router();

router.get('/new-category', showCreateCategoryPage);
router.post('/new-category', categoryValidationRules(), validateCategory, handleCreateCategory);
router.get('/edit-category/:id', showEditCategoryPage);
router.post('/edit-category/:id', categoryValidationRules(), validateCategory, handleEditCategory);

export default router;
