import bcrypt from 'bcryptjs';
import { registerUser, getUserByEmail, getAllUsers } from '../models/account.js';

export function renderLoginPage(req, res) {
    res.render('login', {
        title: 'Login',
        year: new Date().getFullYear()
    });
}

export function renderRegisterPage(req, res) {
    res.render('register', {
        title: 'Register',
        year: new Date().getFullYear()
    });
}

export async function handleRegister(req, res, next) {
    try {
        const { account_firstname, account_lastname, account_email, account_password, account_password_confirm } = req.body;

        // Basic validation
        if (!account_firstname || !account_lastname || !account_email || !account_password || !account_password_confirm) {
            req.flash('notice', 'All fields are required.');
            return res.render('register', {
                title: 'Register',
                year: new Date().getFullYear(),
                account_firstname,
                account_lastname,
                account_email
            });
        }

        if (account_password !== account_password_confirm) {
            req.flash('notice', 'Passwords do not match.');
            return res.render('register', {
                title: 'Register',
                year: new Date().getFullYear(),
                account_firstname,
                account_lastname,
                account_email
            });
        }

        // Check if email already exists
        const existingUser = await getUserByEmail(account_email);
        if (existingUser) {
            req.flash('notice', 'Email already in use.');
            return res.render('register', {
                title: 'Register',
                year: new Date().getFullYear(),
                account_firstname,
                account_lastname,
                account_email
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(account_password, 10);

        // Create user
        await registerUser(account_firstname, account_lastname, account_email, hashedPassword, 'Client');

        req.flash('notice', 'Registration successful! Please log in.');
        res.redirect('/login');
    } catch (error) {
        next(error);
    }
}

export async function handleLogin(req, res, next) {
    try {
        const { account_email, account_password } = req.body;

        if (!account_email || !account_password) {
            req.flash('notice', 'Email and password are required.');
            return res.render('login', {
                title: 'Login',
                year: new Date().getFullYear()
            });
        }

        // Get user by email
        const user = await getUserByEmail(account_email);
        if (!user) {
            req.flash('notice', 'Invalid email or password.');
            return res.render('login', {
                title: 'Login',
                year: new Date().getFullYear(),
                account_email
            });
        }

        // Compare passwords
        const passwordMatch = await bcrypt.compare(account_password, user.account_password);
        if (!passwordMatch) {
            req.flash('notice', 'Invalid email or password.');
            return res.render('login', {
                title: 'Login',
                year: new Date().getFullYear(),
                account_email
            });
        }

        // Store user in session
        req.session.accountData = {
            account_id: user.account_id,
            account_firstname: user.account_firstname,
            account_lastname: user.account_lastname,
            account_email: user.account_email,
            account_type: user.account_type
        };

        req.flash('notice', `Welcome ${user.account_firstname}!`);
        res.redirect('/dashboard');
    } catch (error) {
        next(error);
    }
}

export function handleLogout(req, res) {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error destroying session:', err);
            return res.redirect('/');
        }
        res.redirect('/');
    });
}

export async function buildUsersPage(req, res, next) {
    try {
        const users = await getAllUsers();
        res.render('users', {
            title: 'Users',
            year: new Date().getFullYear(),
            users
        });
    } catch (error) {
        next(error);
    }
}
