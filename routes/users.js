var express = require('express');
var router = express.Router();
const bcrypt = require('bcrypt');


module.exports = (pool) => {
/* GET users listing. */
router.get('/', function (req, res, next) {
  
  pool.query('SELECT * FROM users', (err, result) => {
    if (err) {
      console.error('Error executing query', err);
      res.render('error', { message: 'Error retrieving users' });
    } else {
      res.render('user', { title: 'Express', users: result.rows });
    }
  });
});


router.get('/add', (req, res, next) => {

  pool.query('SELECT * FROM users', (err, result) => {
    if (err) {
      console.error('Error executing query', err);
      res.render('error', { message: 'Error retrieving users' });
    } else {
      res.render('adduser', { title: 'Express', 
      data: result.rows, 
   renderFrom : "add" });
    }
  });
});

router.post('/add', function (req, res, next) {
  var email = req.body.email;
  var name = req.body.name;
  var password = req.body.password;
  var role = req.body.role;

  pool.query('INSERT INTO users (email, name, password, role) VALUES ($1, $2, $3, $4)', [email, name, password, role], (err, result) => {
    if (err) {
      console.error('Error executing query', err);
      res.render('error', { message: 'Error adding user' });
    } else {
      res.redirect('/users'); 
    }
  });
});

router.get('/edit/:userid', function (req, res, next) {
  const userid = req.params.userid;
  const name = req.session.user?.name;

  pool.query('SELECT * FROM users WHERE userid = $1', [userid], (error, result) => {
    if (error) {
      console.error('Error retrieving user data:', error);
    } else {
      const user = result.rows[0];
      res.render('adduser', { title: 'Edit User', data: user, name: name, renderFrom : "edit"});
    }
  });
});

router.post('/edit/:userid', (req, res, next) => {
  const userId = req.params.userid
  const { email, name, password, role } = req.body

  pool.query(
    'UPDATE users SET email = $1, name = $2, password = $3, role = $4 WHERE userid = $5',
    [email, name, password, role, userId],
    (error, result) => {
      if (error) {
        console.error('Error updating user data:', error);
      } else {
        res.redirect('/users');
      }
    }
  )
})


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