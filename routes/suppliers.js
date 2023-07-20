var express = require('express');
var router = express.Router();


module.exports = (pool) => {

    router.get('/', function (req, res, next) {

        pool.query("select * from suppliers", (err, data) => {
            if (err) {
                console.error(err);
            }
            res.render('suppliers/index', {
                data: data.rows,
                user: req.session.user,
                error: req.flash("error"),
            });
        });
    });


    router.get('/add', (req, res, next) => {

        res.render('suppliers/add', {
            title: 'Add Data',
            current: 'user',
            user: req.session.user
        })
    })


    router.post('/add', async (req, res, next) => {
        try {
            const { name, address, phone } = req.body
            let sql = `INSERT INTO suppliers(name,address,phone) VALUES ($1,$2,$3)`
            const data = await pool.query(sql, [name, address, phone])
            console.log('Data User Added')

            res.redirect('/suppliers')
        } catch (error) {
            console.log(error)
            res.status(500).json({ error: "Error Creating Data User" })
        }
    })


    router.get('/edit/:supplierid', async (req, res, next) => {
        try {
            const { supplierid } = req.params
            const sql = 'SELECT * FROM suppliers WHERE supplierid = $1';
            const data = await pool.query(sql, [supplierid])
            res.render('suppliers/edit', { title: 'Edit Data', current: 'user', user: req.session.user, data: data.rows[0] })
        } catch (error) {
            console.log(error)
            res.status(500).json({ error: "Error Getting Data User" })
        }
    })


    router.post('/edit/:supplierid', async (req, res, next) => {
        try {
            const { supplierid } = req.params;
            const { name, address, phone } = req.body;
            let sql = `UPDATE suppliers SET name = $1, address =$2, phone = $3 WHERE supplierid = $4`
            await pool.query(sql, [name, address, phone, supplierid]);
            console.log('Data User Edited');
            res.redirect('/suppliers');
        } catch (error) {
            console.log(error)
            res.status(500).json({ error: "Error Updating Data User" })
        }
    })


    router.get('/delete/:supplierid', async (req, res, next) => {
        try {
            const { supplierid } = req.params;
            let sql = `DELETE FROM suppliers WHERE supplierid = $1`
            await pool.query(sql, [supplierid]);
            console.log('Delete suppliers Success');

            res.redirect('/suppliers');
        } catch (error) {
            console.log(error)
            res.status(500).json({ error: "Error Deleting Data User" })
        }
    })

    router.get('/datasuppliers', async (req, res) => {
        let params = []

        if (req.query.search.value) {
            params.push(`name ilike '%${req.query.search.value}%'`)
        }
        if (req.query.search.value) {
            params.push(`address ilike '%${req.query.search.value}%'`)
        }
        if (req.query.search.value) {
            params.push(`phone ilike '%${req.query.search.value}%'`)
        }
        const limit = req.query.length
        const offset = req.query.start
        const sortBy = req.query.columns[req.query.order[0].column].data
        const sortMode = req.query.order[0].dir

        const total = await pool.query(`select count(*) as total from suppliers${params.length > 0 ? ` where ${params.join(' or ')}` : ''}`)
        const data = await pool.query(`select * from suppliers${params.length > 0 ? ` where ${params.join(' or ')}` : ''} order by ${sortBy} ${sortMode} limit ${limit} offset ${offset} `)

        const response = {
            "draw": Number(req.query.draw),
            "recordsTotal": total.rows[0].total,
            "recordsFiltered": total.rows[0].total,
            "data": data.rows
        }
        res.json(response)
    })


    return router;
}