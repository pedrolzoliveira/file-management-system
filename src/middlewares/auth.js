const Token = require('../models/Token');

async function auth(req, res, next) {
    const token = req.cookies['user_session']
    req.IsAuth = false;

    if (!token)
        return next();

    const token_blacklist = await Token.findByPk(token, {attributes: ['token']});
    if (token_blacklist)
        return next();

    const solved = Token.solveToken(token);

    if (!solved.ok)
        return next();

    req.user = solved.decoded;
    req.IsAuth = solved.ok;
    return next();
}

module.exports = auth;