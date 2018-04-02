const {
    Router,
} = require('express');
const passport = require('passport');

const UsersController = require('./users.controller');
const init = (app, data) => {
    const router = new Router();
    app.use('', router);

    const controller = new UsersController(data);

    router
        .get('/sign-up', async (req, res) => {
            const viewName = '../../views/forum/sign-up';
            const regErrors = req.flash('error');

            res.render(viewName, {
                regErrors: regErrors,
            });
        })
        .post('/sign-up', async (req, res) => {
            const result = await controller.register(req.body);

            if (!result.success) {
                const errors = result.errors;
                req.flash('error', errors);
            }
            res.redirect('/');
        })
        .get('/login', async (req, res) => {
            req.session.redirectTo = req.headers.referer;
            const viewName = '../../views/forum/login';
            const authErrors = req.flash('error');
            res.render(viewName, {
                authErrors: authErrors,
            });
        })
        .post('/login', async (req, res) => {
            let redirectTo;
            if (req.session.redirectTo.indexOf('home') > 0 ||
                req.session.redirectTo.indexOf('sign-up') > 0) {
                redirectTo = '/success';
            } else {
                redirectTo = req.session.redirectTo;
            }
            await passport.authenticate('local', {
                successRedirect: redirectTo,
                // successRedirect: '/success',
                failureRedirect: '/login',
                failureFlash: true,
            })(req, res);
        })
        .get('/logout', (req, res) => {
            req.logout();
            res.redirect('/');
        })
        .get('/myProfile', async (req, res) => {
            const viewName = '../../views/forum/myProfile';
            if (req.user) {
                const {
                    id,
                } = req.user;

                const answers = await controller.getAllAnswersByUserId(id);
                const posts = await controller.getAllPostsByUserId(id);

                const model = {
                    posts,
                    answers,
                };
                res.render(viewName, model);
            } else {
                res.redirect('/sign-up');
            }
        });
};

module.exports = {
    init,
};