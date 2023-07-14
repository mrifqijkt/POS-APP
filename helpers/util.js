module.exports = {
    isLoggedIn: (req, res, next) => {
        if (req.session.user) {
            next()
        } else {
            res.redirect('/login')
        }
    },
    isAdmin: (req, res, next) => {
        if(req.session.user && req.session.user.role == 'admin'){
            next()
        }else{
            res.redirect('/login')
        }
    }
}