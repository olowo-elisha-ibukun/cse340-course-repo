export function requireRole(role) {
    return function (req, res, next) {
        const sessionUser = req.session && req.session.user;

        if (!sessionUser) {
            const msg = 'You must be logged in to access that page.';
            if (typeof req.flash === 'function') {
                req.flash('error', msg);
            } else if (req.session) {
                req.session.flash = req.session.flash || {};
                req.session.flash.error = msg;
            }
            return res.redirect('/login');
        }

        if (sessionUser.role_name !== role) {
            const msg = 'You do not have permission to access that page.';
            if (typeof req.flash === 'function') {
                req.flash('error', msg);
            } else if (req.session) {
                req.session.flash = req.session.flash || {};
                req.session.flash.error = msg;
            }
            return res.redirect('/dashboard');
        }

        return next();
    };
}

export function requireLogin(req, res, next) {
    const sessionUser = req.session && req.session.user;
    if (!sessionUser) {
        const msg = 'You must be logged in to access that page.';
        if (typeof req.flash === 'function') {
            req.flash('error', msg);
        } else if (req.session) {
            req.session.flash = req.session.flash || {};
            req.session.flash.error = msg;
        }
        return res.redirect('/login');
    }

    return next();
}
