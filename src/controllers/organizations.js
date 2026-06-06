import { body, validationResult } from 'express-validator';
import { getAllOrganizations, getOrganizationById, insertOrganization, updateOrganization } from '../models/organizations.js';
import { getProjectsByOrgId } from '../models/projects.js';

export const organizationValidationRules = [
    body('name')
        .trim()
        .notEmpty().withMessage('Organization name is required.')
        .isLength({ min: 3 }).withMessage('Organization name must be at least 3 characters long.')
        .isLength({ max: 100 }).withMessage('Organization name cannot exceed 100 characters.')
];

export function validateOrganization(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const formErrors = errors.array();
        const organization = {
            name: req.body.name || '',
            description: req.body.description || '',
            contact_email: req.body.contact_email || '',
            phone_number: req.body.phone_number || '',
            logo_filename: req.body.logo_filename || ''
        };

        if (req.params.id) {
            return getOrganizationById(req.params.id)
                .then((existingOrganization) => {
                    if (!existingOrganization) {
                        return res.status(404).render('404', {
                            title: 'Page Not Found',
                            year: new Date().getFullYear()
                        });
                    }

                    return res.status(400).render('edit-organization', {
                        title: 'Edit Organization',
                        year: new Date().getFullYear(),
                        errors: formErrors,
                        organization: {
                            ...existingOrganization,
                            ...organization
                        }
                    });
                })
                .catch(next);
        }

        return res.status(400).render('add-organization', {
            title: 'Add New Organization',
            year: new Date().getFullYear(),
            errors: formErrors,
            organization
        });
    }

    next();
}

export async function showOrganizationsPage(req, res, next) {
    try {
        const organizations = await getAllOrganizations();
        res.render('organizations', {
            title: 'Partner Organizations',
            year: new Date().getFullYear(),
            organizations
        });
    } catch (error) {
        next(error);
    }
}
export async function showOrganizationDetailsPage(req, res, next) {
    try {
        const organizationId = req.params.id;
        const organization = await getOrganizationById(organizationId);
        if (!organization) {
            return res.status(404).render('404', {
                title: 'Page Not Found',
                year: new Date().getFullYear()
            });
        }

        const projects = await getProjectsByOrgId(organizationId);

        res.render('organization', {
            title: `${organization.name} Projects`,
            year: new Date().getFullYear(),
            organization,
            projects
        });
    } catch (error) {
        next(error);
    }
}
export async function showCreateOrganizationPage(req, res) {
    res.render('add-organization', {
        title: 'Add New Organization',
        year: new Date().getFullYear(),
        errors: null,
        organization: {
            name: '',
            description: '',
            contact_email: '',
            phone_number: '',
            logo_filename: ''
        }
    });
}

export async function handleCreateOrganization(req, res, next) {
    try {
        const { name, description, contact_email, phone_number, logo_filename } = req.body;
        await insertOrganization({ name, description, contact_email, phone_number, logo_filename });
        res.redirect('/organizations');
    } catch (error) {
        next(error);
    }
}

export async function showEditOrganizationPage(req, res, next) {
    try {
        const organization = await getOrganizationById(req.params.id);
        if (!organization) {
            return res.status(404).render('404', {
                title: 'Page Not Found',
                year: new Date().getFullYear()
            });
        }

        res.render('edit-organization', {
            title: 'Edit Organization',
            year: new Date().getFullYear(),
            errors: null,
            organization
        });
    } catch (error) {
        next(error);
    }
}

export async function handleEditOrganization(req, res, next) {
    try {
        const organizationId = req.params.id;
        const { name, description, contact_email, phone_number, logo_filename } = req.body;

        await updateOrganization({
            organizationId,
            name,
            description,
            contact_email,
            phone_number,
            logo_filename
        });

        res.redirect('/organizations');
    } catch (error) {
        next(error);
    }
}
