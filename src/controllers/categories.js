import { body, validationResult } from 'express-validator';
import { createCategory, getCategoryDetails, getProjectsByCategoryId, updateCategory } from '../models/categories.js';

export const categoryValidationRules = [
    body('categoryName')
        .trim()
        .notEmpty().withMessage('Category name is required.')
        .isLength({ min: 3 }).withMessage('Category name must be at least 3 characters long.')
        .isLength({ max: 100 }).withMessage('Category name cannot exceed 100 characters.')
];

export function validateCategory(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const formErrors = errors.array();
        const categoryName = req.body.categoryName || '';

        if (req.params.id) {
            return getCategoryDetails(req.params.id)
                .then((categoryDetails) => {
                    if (!categoryDetails) {
                        return res.status(404).render('404', {
                            title: 'Page Not Found',
                            year: new Date().getFullYear()
                        });
                    }

                    return res.status(400).render('edit-category', {
                        title: 'Edit Category',
                        year: new Date().getFullYear(),
                        errors: formErrors,
                        category: {
                            ...categoryDetails,
                            name: categoryName
                        }
                    });
                })
                .catch(next);
        }

        return res.status(400).render('new-category', {
            title: 'Add New Category',
            year: new Date().getFullYear(),
            errors: formErrors,
            categoryName
        });
    }

    next();
}

export async function showCategoryDetailsPage(req, res, next) {
    const categoryId = req.params.id;

    try {
        const categoryDetails = await getCategoryDetails(categoryId);
        if (!categoryDetails) {
            const err = new Error('Category Not Found');
            err.status = 404;
            return next(err);
        }

        const projects = await getProjectsByCategoryId(categoryId);

        res.render('category', {
            title: `${categoryDetails.name} Projects`,
            year: new Date().getFullYear(),
            categoryDetails,
            projects
        });
    } catch (error) {
        next(error);
    }
}

export async function showCreateCategoryPage(req, res) {
    res.render('new-category', {
        title: 'Add New Category',
        year: new Date().getFullYear(),
        errors: null,
        categoryName: ''
    });
}

export async function handleCreateCategory(req, res, next) {
    try {
        const { categoryName } = req.body;
        await createCategory(categoryName);
        res.redirect('/categories');
    } catch (error) {
        next(error);
    }
}

export async function showEditCategoryPage(req, res, next) {
    const id = req.params.id;

    try {
        const categoryDetails = await getCategoryDetails(id);
        if (!categoryDetails) {
            return res.status(404).render('404', {
                title: 'Page Not Found',
                year: new Date().getFullYear()
            });
        }

        res.render('edit-category', {
            title: 'Edit Category',
            year: new Date().getFullYear(),
            errors: null,
            category: categoryDetails
        });
    } catch (error) {
        next(error);
    }
}

export async function handleEditCategory(req, res, next) {
    try {
        const id = req.params.id;
        const { categoryName } = req.body;
        await updateCategory(id, categoryName);
        res.redirect('/categories');
    } catch (error) {
        next(error);
    }
}
