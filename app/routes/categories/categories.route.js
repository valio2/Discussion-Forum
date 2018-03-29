const {
    Router,
} = require('express');


const CategoriesController = require('./categories.controller');

const init = (app, data) => {
    const controller = new CategoriesController(data);

    const router = new Router();
    app.use('', router);

    router
        .get('/Category/createCategory', async (req, res) => {
            const viewName = '../../views/forum/createCategory';
            res.render(viewName);
        })
        .post('/Category/createCategory', async (req, res) => {
            await controller.create(req.body);
            res.redirect('/');
        })
        .get('/Category/:cat', async (req, res) => {
            const {
                cat,
            } = req.params;
            const viewName = '../../views/forum/category';

            const threads = await controller.getAllThreadsByCatName(cat);
            const posts = await controller.getAllPostsbyId(threads);

            res.locals.search = {
                in: 'threads',
                catName: cat,
            };
            const model = {
                threads,
                posts,
            };
            res.render(viewName, model);
        })
        .post('/Category/:cat', async (req, res) => {
            const {
                cat,
            } = req.params;

            const {
                threadTitle,
                post,
                content,
            } = req.body;

            const threads = await controller.getAllThreadsByCatName(cat);
            // console.log(t[0].dataValues.id);

            const all = await controller
                .createThread({
                    title: threadTitle,
                    CategoryId: threads[0].dataValues.id,
                    UserId: 2,
                });

            await controller
                .createPost({
                    title: post,
                    content: content,
                    ThreadId: all[0].dataValues.id,
                    UserId: 2,
                });

            res.redirect('/Category/' + cat);
        });
};

module.exports = {
    init,
};