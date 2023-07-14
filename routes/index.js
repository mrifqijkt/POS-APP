var express = require('express');
var router = express.Router();
const bcrypt = require('bcrypt');
const { isLoggedIn } = require('../helpers/util');
const saltRounds = 10;

module.exports = function (db) {

  /* GET home page. */
  router.get('/', function (req, res, next) {
    res.render('login', { errorMessage: req.flash('errorMessage') });
  });

  router.get('/logout', function (req, res, next) {
    req.session.destroy(function (err) {
      if (err) {
        console.log(err);
      }
      res.redirect('/');
    });
  });

  router.post('/', function (req, res, next) {
    db.query('select * from users where email = $1', [req.body.email], (err, data) => {
      if (data.rows.length == 0) {
        req.flash('errorMessage', "email doesn't exist")
        return res.redirect('/')
      };
      bcrypt.compare(req.body.password, data.rows[0].password, function (err, result) {
        if (!result) {
          req.flash('errorMessage', "password is wrong")
          return res.redirect('/')
        }
        req.session.user = data.rows[0]
        res.redirect('/dashboard')
      });
    });
  });

  router.get('/register', function (req, res, next) {
    res.render('register');
  });

  router.post('/register', function (req, res, next) {
    if (req.body.retypepassword !== req.body.password)
      return res.send("password doesn't match")

    db.query('select * from users where email = $1', [req.body.email], (err, data) => {
      if (data.rows.length > 0) {
        return res.send("email is exist")
      };
      const password = req.body.password;
      bcrypt.hash(password, saltRounds, function (err, hash) {
        if (err) throw err
        db.query("insert into users(email, password,role) values ($1, $2, 'user')", [req.body.email, hash], (err, data) => {
          if (err) {
            return console.log(err);
          }
          res.redirect("/");
        });
      });
    })
  });

  router.get('/dashboard', isLoggedIn, function (req, res, next) {
    res.render('dashboard');
  });

  return router;
}