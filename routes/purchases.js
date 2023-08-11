var express = require('express');
var router = express.Router();


module.exports = (pool) => {

    router.get('/', function (req, res, next) {

        pool.query("select * from purchases", (err, data) => {
            if (err) {
                console.error(err);
            }
            res.render('purchases/index', {
                data: data.rows,
                user: req.session.user,
                error: req.flash("error"),
            });
        });
    });


    router.get('/add', (req, res, next) => {

        res.render('purchases/add', {
            title: 'Add Data',
            current: 'user',
            user: req.session.user
        })
    })


    router.post('/add', async (req, res, next) => {
        try {
            const { invoice, time, totalsum, phone } = req.body
            let sql = `INSERT INTO purchases(invoice,time,totalsum, phone) VALUES ($1,$2,$3,$4)`
            const data = await pool.query(sql, [invoice, time, totalsum, phone])
            console.log('Data User Added')

            res.redirect('/purchases')
        } catch (error) {
            console.log(error)
            res.status(500).json({ error: "Error Creating Data User" })
        }
    })

    return router;
}