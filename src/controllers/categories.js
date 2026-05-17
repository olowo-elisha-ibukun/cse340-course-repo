import { getCategoryDetails, getProjectsByCategoryId } from '../models/categories.js';

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
