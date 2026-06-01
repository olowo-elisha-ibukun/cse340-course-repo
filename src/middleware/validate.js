import { body, validationResult } from 'express-validator';
import { getCategoryDetails } from '../models/categories.js';

const categoryValidationRulesArray = [
    body('categoryName')
        .trim()
        .notEmpty().withMessage('Category name is required.')
        .isLength({ min: 3 }).withMessage('Category name must be at least 3 characters long.')
        .isLength({ max: 100 }).withMessage('Category name cannot exceed 100 characters.')
];

export function categoryValidationRules() {
    return categoryValidationRulesArray;
}

export async function validateCategory(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const formErrors = errors.array();
        const categoryName = req.body?.categoryName || '';

        if (req.params.id) {
            try {
                const categoryDetails = await getCategoryDetails(req.params.id);

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
            } catch (error) {
                return next(error);
            }
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
