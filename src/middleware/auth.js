export function requireLogin(req, res, next) {
    if (!req.session || !req.session.accountData) {
        return res.redirect('/login');
    }
    next();
}

export function requireRole(role) {
    return (req, res, next) => {
        if (!req.session || !req.session.accountData) {
            return res.redirect('/login');
        }
        
        if (req.session.accountData.account_type !== role) {
            req.flash('notice', `You do not have permission to access this page. Required role: ${role}`);
            return res.redirect('/dashboard');
        }
        
        next();
    };
}

