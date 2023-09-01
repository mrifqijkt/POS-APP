var express = require('express');
var router = express.Router();
const bcrypt = require('bcrypt')
const { isLoggedIn, isAdmin } = require('../helpers/util')
const saltRounds = 10


module.exports = (pool) => {
/* GET users listing. */

router.get('/', function (req, res, next) {
  
  pool.query('SELECT * FROM users', (err, result) => {
    if (err) {
      console.error('Error executing query', err);
      res.render('error', { message: 'Error retrieving users' });
    } else {
      res.render('users/index', { title: 'Express', users: result.rows , current: 'user'});
    }
  });
});


router.get('/add', (req, res, next) => {
  res.render('users/add', { title: 'Add Data', current: 'user', user: req.session.user })
})

router.post('/add', async (req, res, next) => {
  try {
    const { email, name, password, role } = req.body
    const hash = bcrypt.hashSync(password, saltRounds);
    let sql = `INSERT INTO users(email,name,password,role) VALUES ($1,$2,$3,$4)`
    const data = await pool.query(sql, [email, name, hash, role])
    console.log('Data User Added')
    // res.json({
    //   succes:true,
    //   data: data
    // })
    res.redirect('/users')
    // res.status(200).json({ success: "Data User Added Successfully" });
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: "Error Creating Data User" })
  }
})



router.get('/edit/:userid', async (req, res, next) => {
  try {
    const { userid } = req.params
    const sql = 'SELECT * FROM users WHERE userid = $1';
    const data = await pool.query(sql, [userid])
    // console.log(data)
    res.render('users/edit', { title: 'Edit Data', current: 'user', user: req.session.user, data: data.rows[0] })
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: "Error Getting Data User" })
  }
})

router.post('/edit/:userid', async (req, res, next) => {
  try {
    const { userid } = req.params;
    const { email, name, role } = req.body;
    let sql = `UPDATE users SET email = $1, name = $2, role = $3 WHERE userid = $4`;
    await pool.query(sql, [email, name, role, userid]);
    console.log('Data User Edited');
    res.redirect('/users');
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error Updating Data User" });
  }
});


router.get('/delete/:id', function (req, res, next) {
  var userId = req.params.id;

  pool.query('DELETE FROM users WHERE userid = $1', [userId], (err, result) => {
    if (err) {
      console.error('Error executing query', err);
      res.render('error', { message: 'Error deleting user' });
    } else {
      res.redirect('/users'); 
    }
  });
});


return router;
}