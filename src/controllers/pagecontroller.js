module.exports = {
    async login(req, res) {
        return res.render('login.ejs');
    },

    async signup(req, res) {
        return res.render('signup.ejs');
    },
};


