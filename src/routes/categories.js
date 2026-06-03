import express from 'express';
import {
    showCreateCategoryPage,
    handleCreateCategory,
    showEditCategoryPage,
    handleEditCategory
} from '../controllers/categories.js';
import { categoryValidationRules, validateCategory } from '../middleware/validate.js';
import { showAdminUsersPage, showDashboard, showUserRegistrationForm, processUserRegistrationForm, showUserLoginForm, processUserLoginForm, processUserLogout } from '../controllers/users.js';
import { requireRole, requireLogin } from '../middleware/auth.js';

const router = express.Router();

router.get('/new-category', showCreateCategoryPage);
router.post('/new-category', categoryValidationRules(), validateCategory, handleCreateCategory);
router.get('/edit-category/:id', showEditCategoryPage);
router.post('/edit-category/:id', categoryValidationRules(), validateCategory, handleEditCategory);

// Admin users management
router.get('/users', requireRole('admin'), showAdminUsersPage);

// Dashboard
router.get('/dashboard', requireLogin, showDashboard);

// User registration
router.get('/register', showUserRegistrationForm);
router.post('/register', processUserRegistrationForm);

// User login
router.get('/login', showUserLoginForm);
router.post('/login', processUserLoginForm);

// User logout
router.get('/logout', processUserLogout);

export default router;
