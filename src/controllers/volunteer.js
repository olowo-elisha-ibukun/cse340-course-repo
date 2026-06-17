import { addVolunteer, removeVolunteer } from '../models/volunteer.js';

export const volunteerProject = async (req, res, next) => {
  try {
    const accountId = req.session?.accountData?.account_id;
    const projectId = req.params.projectId || req.params.id;

    if (!accountId) {
      return res.status(401).redirect('/login');
    }

    await addVolunteer(accountId, projectId);
    if (typeof req.flash === 'function') {
      req.flash('notice', 'Thank you for volunteering!');
    }
    res.redirect(`/project/${projectId}`);
  } catch (error) {
    next(error);
  }
};

export const unvolunteerProject = async (req, res, next) => {
  try {
    const accountId = req.session?.accountData?.account_id;
    const projectId = req.params.projectId || req.params.id;

    if (!accountId) {
      return res.status(401).redirect('/login');
    }

    await removeVolunteer(accountId, projectId);
    if (typeof req.flash === 'function') {
      req.flash('notice', 'Your volunteer commitment has been cancelled.');
    }

    if (req.query.redirect === 'dashboard') {
      return res.redirect('/dashboard');
    }

    res.redirect(`/project/${projectId}`);
  } catch (error) {
    next(error);
  }
};