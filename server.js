import express from 'express';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.static('public'));
app.set('view engine', 'ejs');

// Routes
app.get('/', async (req, res) => {
    res.render('index', { title: 'Home' });
});

app.get('/organizations', async (req, res) => {
    res.render('organizations', { title: 'Partner Organizations' });
});

app.get('/service-projects', async (req, res) => {
    res.render('service-projects', { title: 'Current Projects' });
});

// Route to serve the Categories page
app.get('/categories', async (req, res) => {
    res.render('categories', { 
        title: 'Service Categories' 
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).render('404', { title: 'Page Not Found' });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
