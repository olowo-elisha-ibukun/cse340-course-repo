import { getAllUsersWithRoles, createUser, getUserByEmail } from '../models/users.js';
import { getVolunteeredProjectsByAccount } from '../models/volunteer.js';
import bcrypt from 'bcrypt';

export async function showAdminUsersPage(req, res, next) {
    try {
        const users = await getAllUsersWithRoles();
        res.render('users', {
            title: 'Registered Users Management',
            year: new Date().getFullYear(),
            users
        });
    } catch (error) {
        next(error);
    }
}

export async function showDashboard(req, res, next) {
    try {
        const accountData = req.session && req.session.accountData;
        let volunteerProjects = [];

        if (accountData) {
            try {
                volunteerProjects = await getVolunteeredProjectsByAccount(accountData.account_id) || [];
            } catch (err) {
                console.error('Error fetching volunteered projects for account:', err);
                volunteerProjects = [];
            }
        }

        const user = accountData ? {
            name: `${accountData.account_firstname} ${accountData.account_lastname}`,
            role_name: accountData.account_type
        } : null;

        res.render('dashboard', {
            title: 'Dashboard',
            year: new Date().getFullYear(),
            user,
            volunteerProjects
        });
    } catch (error) {
        next(error);
    }
}

export function showUserRegistrationForm(req, res) {
    res.render('register', {
        title: 'Register',
        year: new Date().getFullYear()
    });
}

export function showUserLoginForm(req, res) {
    res.render('login', {
        title: 'Login',
        year: new Date().getFullYear()
    });
}

export async function processUserLoginForm(req, res, next) {
    try {
        const { email, password } = req.body;
        const user = await getUserByEmail(email);

        if (!user) {
            if (typeof req.flash === 'function') {
                req.flash('error', 'Invalid email or password.');
            }
            return res.status(401).render('login', {
                title: 'Login',
                year: new Date().getFullYear()
            });
        }

        const passwordMatches = await bcrypt.compare(password, user.password_hash);
        if (!passwordMatches) {
            if (typeof req.flash === 'function') {
                req.flash('error', 'Invalid email or password.');
            }
            return res.status(401).render('login', {
                title: 'Login',
                year: new Date().getFullYear()
            });
        }

        const { password_hash, ...sessionUser } = user;
        req.session.user = sessionUser;

        if (typeof req.flash === 'function') {
            req.flash('success', 'Successfully logged in.');
        }
        res.redirect('/dashboard');
    } catch (error) {
        next(error);
    }
}

export async function processUserRegistrationForm(req, res, next) {
    try {
        const { name, email, password } = req.body;
        const passwordHash = await bcrypt.hash(password, 10);
        await createUser(name, email, passwordHash);
        
        if (typeof req.flash === 'function') {
            req.flash('success', 'Registration successful! Please log in.');
        }
        res.redirect('/login');
    } catch (error) {
        next(error);
    }
}

export function processUserLogout(req, res) {
    req.session.destroy((err) => {
        if (err) {
            console.error('Session destruction error:', err);
        }
        res.clearCookie('connect.sid');
        res.redirect('/');
    });
}
