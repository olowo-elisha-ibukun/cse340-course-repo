import express from 'express';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

dotenv.config();

const { getAllProjects } = await import('./src/models/projects.js');

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.static(join(__dirname, 'public')));
app.use('/images', express.static(join(__dirname, 'images')));
app.set('views', join(__dirname, 'src', 'views'));
app.set('view engine', 'ejs');

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
    res.render('categories', { 
        title: 'Service Project Categories',
        year: new Date().getFullYear()
    });
});

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
