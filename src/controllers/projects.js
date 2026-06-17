import { body, validationResult } from 'express-validator';
import { getAllProjects, getProjectsByOrgId, getProjectById, insertProject, updateProject, isUserVolunteering } from '../models/projects.js';
import { getAllOrganizations } from '../models/organizations.js';
import { getCategoriesByProjectId } from '../models/categories.js';

export const projectValidationRules = [
    body('title')
        .trim()
        .notEmpty().withMessage('Project title is required.')
        .isLength({ min: 3 }).withMessage('Project title must be at least 3 characters long.')
        .isLength({ max: 100 }).withMessage('Project title cannot exceed 100 characters.')
];

export function validateProject(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const formErrors = errors.array();
        const project = {
            title: req.body.title || '',
            description: req.body.description || '',
            location: req.body.location || '',
            date: req.body.date || '',
            organization_id: req.body.organization_id || ''
        };

        if (req.params.id) {
            return getProjectById(req.params.id)
                .then((existingProject) => {
                    if (!existingProject) {
                        return res.status(404).render('404', {
                            title: 'Page Not Found',
                            year: new Date().getFullYear()
                        });
                    }

                    return getAllOrganizations()
                        .then((organizations) => {
                            return res.status(400).render('edit-project', {
                                title: 'Edit Project',
                                year: new Date().getFullYear(),
                                errors: formErrors,
                                project: {
                                    ...existingProject,
                                    ...project
                                },
                                organizations
                            });
                        });
                })
                .catch(next);
        }

        return getAllOrganizations()
            .then((organizations) => {
                res.status(400).render('add-project', {
                    title: 'Add New Project',
                    year: new Date().getFullYear(),
                    errors: formErrors,
                    project,
                    organizations
                });
            })
            .catch(next);
    }

    next();
}

export async function showProjectsPage(req, res, next) {
    try {
        let projects;
        let selectedOrgName = null;
        const orgId = parseInt(req.query.orgId, 10);

        if (Number.isInteger(orgId) && orgId > 0) {
            projects = await getProjectsByOrgId(orgId);
            const orgs = await getAllOrganizations();
            const selectedOrg = orgs.find(o => o.organization_id === orgId);
            if (selectedOrg) {
                selectedOrgName = selectedOrg.name;
            }
        } else {
            projects = await getAllProjects();
        }

        if (!projects) {
            projects = [];
        }

        res.render('projects', {
            title: 'Available Service Projects',
            year: new Date().getFullYear(),
            projects,
            selectedOrgName
        });
    } catch (error) {
        next(error);
    }
}

export async function showCreateProjectPage(req, res, next) {
    try {
        const organizations = await getAllOrganizations();
        res.render('add-project', {
            title: 'Add New Project',
            year: new Date().getFullYear(),
            errors: null,
            project: {
                title: '',
                description: '',
                location: '',
                date: '',
                organization_id: ''
            },
            organizations
        });
    } catch (error) {
        next(error);
    }
}

export async function handleCreateProject(req, res, next) {
    try {
        const { title, description, location, date, organization_id } = req.body;
        await insertProject({ title, description, location, date, organization_id });
        res.redirect('/projects');
    } catch (error) {
        next(error);
    }
}

export async function showEditProjectPage(req, res, next) {
    try {
        const [project, organizations] = await Promise.all([
            getProjectById(req.params.id),
            getAllOrganizations()
        ]);

        if (!project) {
            return res.status(404).render('404', {
                title: 'Page Not Found',
                year: new Date().getFullYear()
            });
        }

        res.render('edit-project', {
            title: 'Edit Project',
            year: new Date().getFullYear(),
            errors: null,
            project,
            organizations
        });
    } catch (error) {
        next(error);
    }
}

export async function handleEditProject(req, res, next) {
    try {
        const projectId = req.params.id;
        const { title, description, location, date, organization_id } = req.body;
        await updateProject({ projectId, title, description, location, date, organization_id });
        res.redirect('/projects');
    } catch (error) {
        next(error);
    }
}

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
        let isVolunteering = false;

        // Prefer session.accountData.account_id (set after login), fall back to legacy req.session.user.user_id
        const accountId = req.session?.accountData?.account_id || req.session?.user?.user_id;
        if (accountId) {
            isVolunteering = await isUserVolunteering(projectId, accountId);
        }

        res.render('project', {
            title: project.title,
            year: new Date().getFullYear(),
            project,
            categories,
            isVolunteering
        });
    } catch (error) {
        next(error);
    }
}
