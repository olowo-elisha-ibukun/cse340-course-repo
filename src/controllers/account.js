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

        console.log('Register request received for:', account_email);

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

        // Check if email already exists (before hashing password)
        console.log('Checking if email already exists:', account_email);
        let existingUser;
        try {
            existingUser = await getUserByEmail(account_email);
        } catch (err) {
            console.error('Error during email check:', err);
            req.flash('notice', 'Registration failed: could not verify email. Try again.');
            return res.render('register', {
                title: 'Register',
                year: new Date().getFullYear(),
                account_firstname,
                account_lastname,
                account_email
            });
        }
        console.log('Email check result:', !!existingUser);
        if (existingUser) {
            req.flash('notice', 'This email is already registered. Please log in.');
            return res.render('register', {
                title: 'Register',
                year: new Date().getFullYear(),
                account_firstname,
                account_lastname,
                account_email
            });
        }

        // Hash password
        console.log('Starting password hash for:', account_email);
        const hashedPassword = await new Promise((resolve, reject) => {
            bcrypt.hash(account_password, 10, (err, hash) => {
                if (err) return reject(err);
                resolve(hash);
            });
        });
        console.log('Password hashed for:', account_email);

        // Create user
        try {
            console.log('Inserting new user into database for:', account_email);
            const newUser = await registerUser(account_firstname, account_lastname, account_email, hashedPassword, 'Client');
            if (!newUser) {
                req.flash('notice', 'Registration failed. Please try again.');
                return res.render('register', {
                    title: 'Register',
                    year: new Date().getFullYear(),
                    account_firstname,
                    account_lastname,
                    account_email
                });
            }

            console.log('New user created with id:', newUser.account_id);
            req.flash('notice', 'Registration successful! Please log in.');
            return res.redirect('/login');
        } catch (dbErr) {
            console.error('Database error during registration:', dbErr);
            req.flash('notice', 'Registration failed due to a server error. Please try again later.');
            return res.render('register', {
                title: 'Register',
                year: new Date().getFullYear(),
                account_firstname,
                account_lastname,
                account_email
            });
        }
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

        // Ensure password hash exists
        if (!user.account_password) {
            console.error('User has no password hash stored:', user.account_email);
            req.flash('notice', 'Account is not configured correctly. Please contact support.');
            return res.render('login', {
                title: 'Login',
                year: new Date().getFullYear(),
                account_email
            });
        }

        // Compare passwords
        let passwordMatch = false;
        try {
            passwordMatch = await bcrypt.compare(account_password, user.account_password);
        } catch (err) {
            console.error('Error comparing passwords for', account_email, err);
            req.flash('notice', 'Login failed due to an internal error.');
            return res.render('login', {
                title: 'Login',
                year: new Date().getFullYear(),
                account_email
            });
        }

        if (!passwordMatch) {
            req.flash('notice', 'Invalid email or password.');
            return res.render('login', {
                title: 'Login',
                year: new Date().getFullYear(),
                account_email
            });
        }

        // Store user in session (both accountData and legacy `user` for compatibility)
        req.session.accountData = {
            account_id: user.account_id,
            account_firstname: user.account_firstname,
            account_lastname: user.account_lastname,
            account_email: user.account_email,
            account_type: user.account_type
        };

        // Provide a lightweight legacy `user` object for code expecting `req.session.user.user_id`
        req.session.user = {
            user_id: user.account_id,
            name: `${user.account_firstname} ${user.account_lastname}`,
            email: user.account_email
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
