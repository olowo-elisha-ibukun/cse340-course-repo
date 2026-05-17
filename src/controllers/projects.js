import { getProjectById } from '../models/projects.js';
import { getCategoriesByProjectId } from '../models/categories.js';

export async function getProjectDetails(req, res, next) {
    const projectId = req.params.id;

    try {
        const project = await getProjectById(projectId);
        
        if (!project) {
            const err = new Error('Project Not Found');
            err.status = 404;
            return next(err);
        }

        const categories = await getCategoriesByProjectId(projectId);

        res.render('project', {
            title: project.title,
            year: new Date().getFullYear(),
            project,
            categories
        });
    } catch (error) {
        next(error);
    }
}
