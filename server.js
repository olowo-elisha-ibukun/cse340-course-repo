import express from 'express';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import session from 'express-session';
import flash from 'connect-flash';

dotenv.config();

const { getAllProjects } = await import('./src/models/projects.js');
const { getAllCategories, createCategory } = await import('./src/models/categories.js');
const { createAccountTable } = await import('./src/models/account.js');
const { renderLoginPage, renderRegisterPage, handleRegister, handleLogin, handleLogout, buildUsersPage } = await import('./src/controllers/account.js');
const { default: categoriesRouter } = await import('./src/routes/categories.js');
const { requireLogin, requireRole } = await import('./src/middleware/auth.js');

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.static(join(__dirname, 'public')));
app.use('/images', express.static(join(__dirname, 'images')));
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: process.env.SESSION_SECRET || 'dev-secret-key-change-in-production',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 1000 * 60 * 60 * 24 }
}));
app.use(flash());
app.use((req, res, next) => {
    res.locals.accountData = req.session.accountData || null;
    next();
});
app.set('views', join(__dirname, 'src', 'views'));
app.set('view engine', 'ejs');

// Initialize account table on startup
createAccountTable().catch(err => console.error('Failed to create account table:', err));

// Routes
app.get('/', async (req, res) => {
    res.render('index', { title: 'Home', year: new Date().getFullYear() });
});

app.get('/organizations', async (req, res) => {
    const organizations = [
        {
            name: 'Community Health Clinic',
            description: 'Providing healthcare services to underserved communities.',
            image: '/images/Hunger-Food-Security.jpg'
        },
        {
            name: 'Youth Education Initiative',
            description: 'Empowering youth through quality education and mentorship programs.',
            image: '/images/Education-Mentorship.jpg'
        },
        {
            name: 'Environmental Conservation Society',
            description: 'Dedicated to protecting and preserving our natural environment.',
            image: '/images/Environmental-Cleanup.jpg'
        }
    ];
    res.render('organizations', { title: 'Partner Organizations', year: new Date().getFullYear(), organizations });
});

app.get('/service-projects', async (req, res) => {
    res.render('service-projects', { title: 'Current Projects', year: new Date().getFullYear() });
});

app.get('/projects', async (req, res) => {
    const projects = await getAllProjects();
    res.render('projects', { title: 'Available Service Projects', year: new Date().getFullYear(), projects });
});

// Route to serve the Categories page
app.get('/categories', async (req, res) => {
    const categories = await getAllCategories();
    res.render('categories', { 
        title: 'Service Project Categories',
        year: new Date().getFullYear(),
        categories
    });
});

app.get('/categories/add', (req, res) => {
    res.render('add-category', {
        title: 'Add New Category',
        year: new Date().getFullYear()
    });
});

app.post('/categories/add', async (req, res, next) => {
    try {
        const { name, description } = req.body;
        await createCategory(name, description);
        res.redirect('/categories');
    } catch (error) {
        next(error);
    }
});

// Auth Routes
app.get('/login', renderLoginPage);
app.post('/login', handleLogin);
app.get('/register', renderRegisterPage);
app.post('/register', handleRegister);
app.get('/logout', handleLogout);
app.get('/dashboard', requireLogin, (req, res) => {
    const accountData = req.session.accountData || null;
    const user = accountData ? {
        name: `${accountData.account_firstname} ${accountData.account_lastname}`,
        role_name: accountData.account_type
    } : null;

    res.render('dashboard', {
        title: 'Dashboard',
        year: new Date().getFullYear(),
        user
    });
});

app.get('/users', requireLogin, requireRole('Admin'), buildUsersPage);

// Mount category and related route definitions from the router file
app.use('/', categoriesRouter);

// 404 handler
app.use((req, res) => {
    res.status(404).render('404', { title: 'Page Not Found', year: new Date().getFullYear() });
});

// Start server
const server = app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use. Please stop the running server or set PORT to a different value.`);
    } else {
        console.error('Server failed to start:', error);
    }
    process.exit(1);
});
