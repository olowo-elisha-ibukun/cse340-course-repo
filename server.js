import express from 'express';
import session from 'express-session';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

dotenv.config();

import pool from './database/db.js';
import categoriesRouter from './src/routes/categories.js';

const { getAllProjects } = await import('./src/models/projects.js');
const { getAllCategories, getCategoriesByProjectId } = await import('./src/models/categories.js');
const { showCategoryDetailsPage } = await import('./src/controllers/categories.js');

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(session({
    secret: process.env.SESSION_SECRET || 'change-this-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false
    }
}));

// Middleware
app.use(express.static(join(__dirname, 'public')));
app.use('/images', express.static(join(__dirname, 'images')));
app.use(express.urlencoded({ extended: false }));
app.set('views', join(__dirname, 'src', 'views'));
app.set('view engine', 'ejs');

// Make session user available in all views
app.use((req, res, next) => {
    res.locals.user = req.session && req.session.user;
    next();
});

app.use('/', categoriesRouter);

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

app.get('/project/:id', showProjectDetailsPage);

// Route to serve the Categories page
app.get('/categories', async (req, res) => {
    const categories = await getAllCategories();
    res.render('categories', { 
        title: 'Service Project Categories',
        year: new Date().getFullYear(),
        categories
    });
});

app.get('/category/:id', showCategoryDetailsPage);

export async function showProjectDetailsPage(req, res, next) {
    const projectId = req.params.id;

    try {
        const allProjects = await getAllProjects();
        const project = allProjects.find(projectItem => String(projectItem.project_id) === String(projectId));

        if (!project) {
            const err = new Error('Project Not Found');
            err.status = 404;
            return next(err);
        }

        const categories = await getCategoriesByProjectId(projectId);
        res.render('project', {
            title: 'Project Details',
            year: new Date().getFullYear(),
            project,
            categories
        });
    } catch (error) {
        next(error);
    }
}

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

export async function createCategory(name) {
    const result = await pool.query(
        'INSERT INTO public.category (name) VALUES ($1) RETURNING *;', 
        [name]
    );
    return result.rows[0];
}

export async function updateCategory(id, name) {
    const result = await pool.query(
        'UPDATE public.category SET name = $2 WHERE category_id = $1 RETURNING *;', 
        [id, name]
    );
    return result.rows[0];
}

