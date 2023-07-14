var express = require('express');
var router = express.Router();
const bcrypt = require('bcrypt')
const { isLoggedIn, isAdmin } = require('../helpers/util')
const saltRounds = 10

module.exports = (pool) => {
  /* GET users listing. */
  router.get('/', function (req, res, next) {
    pool.query('SELECT * FROM units', (err, result) => {
      if (err) {
        console.error('Error executing query', err);
        res.render('error', { message: 'Error retrieving units' });
      } else {
        res.render('goodsutil/units', { title: 'Express', users: result.rows });
      }
    });
  });

  router.get('/add', (req, res, next) => {
    res.render('goodsutil/add', { title: 'Add Data', current: 'user', user: req.session.user })
  });

  router.post('/add', async (req, res, next) => {
    try {
      const { unit, name, note } = req.body
      let sql = `INSERT INTO units(unit, name, note) VALUES ($1, $2, $3)`
      await pool.query(sql, [unit, name, note])
      console.log('Data Unit Added')
      res.redirect('/units')
    } catch (error) {
      console.log(error)
      res.status(500).json({ error: "Error Creating Data Unit" })
    }
  });

  router.get('/edit/:unit', async (req, res, next) => {
    try {
      const { unit } = req.params;
      const sql = 'SELECT * FROM units WHERE unit = $1';
      const data = await pool.query(sql, [unit]);
      res.render('goodsutil/edit', { title: 'Edit Data', current: 'user', user: req.session.user, data: data.rows[0] });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: 'Error Getting Data Unit' });
    }
  });
  
  router.post('/edit/:unit', async (req, res, next) => {
    try {
      const { unit } = req.params;
      const { name, note } = req.body;
      const sql = 'UPDATE units SET name = $1, note = $2 WHERE unit = $3';
      await pool.query(sql, [name, note, unit]);
      console.log('Data Unit Edited');
      res.redirect('/units');
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: 'Error Updating Data Unit' });
    }
  });
  

  router.get('/delete/:unit', function (req, res, next) {
    var unit = req.params.unit;

    pool.query('DELETE FROM units WHERE unit = $1', [unit], (err, result) => {
      if (err) {
        console.error('Error executing query', err);
        res.render('error', { message: 'Error deleting unit' });
      } else {
        res.redirect('/units');
      }
    });
  });

  return router;
}
