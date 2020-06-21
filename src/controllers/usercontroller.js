const User = require('../models/User');
const Salt = require('../models/Salt');
const Token = require('../models/Token');
const Folder = require('../models/Folder');
const bcrypt = require('bcryptjs');

const connection = require('../database/index');

module.exports = {
    async store(req, res) {
        try {
            let {name, email, password} = req.body;
            if (!name || !email || !password || name == false || email == false || password == false) {
                return res.status(400).send({
                    error: {
                        message: 'missing information',
                    }
                });
            }
            if (typeof(name) != 'string' || typeof(email) != 'string' || typeof(password) != 'string') {
                return res.status(400).send({
                    error: {
                        message: 'non string params passed'
                    }
                });
            }
            if (!/^\S+@\S+$/.test(email)) {
                return res.status(400).send({
                    error: {
                        message: 'invalid email'
                    }
                });
            }
            name = name.toUpperCase().split(' ').filter((val) => val).join(' ');
            email = email.trim();
            const t = await connection.transaction();
            if (await User.findOne({where: {email}})) {
                await t.rollback();
                return res.status(409).send({
                    error: {
                        message: 'email already registered'
                    }
                });
            } else {

                const salt = await Salt.GenerateSalt(15);
                password = await bcrypt.hash(password + salt, 10); 

                const user = await User.create({
                    name,
                    email,
                    password
                }, {transaction: t});

                await user.createSalt({
                    salt
                }, {transaction: t});

                user.password = undefined;

                await Folder.createRootFolder(user, t);

                const token = Token.generateToken(user);
                res.cookie('user_session', token, {
                    httpOnly: true,
                    maxAge: 1000 * 60 * 60 * 24
                });

                await t.commit();
                return res.status(201).send({
                    user
                });
            }
        } catch(err) {
            try {
                await t.rollback();
            } finally {
                return res.status(500).send({
                    error: {
                        message: err.message
                    },
                });    
            }
        }
    },

    async login(req, res) {
        try {
            const {email, password} = req.body;
            if (!email || !password || email == false || password == false) {
                return res.status(400).send({
                    error: {
                        message: 'missing information',
                    }
                });
            }
            if (typeof(email) != 'string' || typeof(password) != 'string') {
                return res.status(400).send({
                    error: {
                        message: 'non string params passed'
                    }
                });
            }
            if (!/^\S+@\S+$/.test(email)) {
                return res.status(400).send({
                    error: {
                        message: 'invalid email'
                    }
                });
            }
            if (password.length < 8)
                return res.status(400).send({
                    error: {
                        message: 'the password is too short'
                    }
                });
            const user = await User.findOne({where: {email}});
            if (!user) {
                return res.status(400).send({
                    error: {
                        message: 'email not found'
                    }
                });
            }

            const salt = await Salt.findByPk(user.id);

            if (!await bcrypt.compare(password + salt.salt, user.password)) {
                return res.status(400).send({
                    error: {
                        message: 'invalid password'
                    }
                });
            }
            user.password = undefined;
            const token = Token.generateToken(user);
            res.cookie('user_session', token, {
                httpOnly: true,
                maxAge: 1000 * 60 * 60 * 24
            });

            return res.status(200).send({
                user
            })
        } catch(err) {
            return res.status(500).send({
                error: {
                    message: err.message
                }
            });
        }
    },

    async changePassword(req, res) {
        try {
            if (!req.IsAuth)
                return res.status(403).send({
                    error: {
                        message: 'permission danied'
                    }
                });
            const {user} = req;
            let {password, new_password} = req.body;
            if (!password || password == false || !new_password || new_password == false)
                return res.status(400).send({
                    error: {
                        message: 'missing information'
                    }
                });
            if (new_password.length < 8)
                return res.status(400).send({
                    error: {
                        message: 'new password is too short'
                    }
                });
            
            const [user_db, salt] = await Promise.all([
                User.findByPk(user.id),
                Salt.findByPk(user.id)
            ]);
            if (!user_db || !salt)
                return res.status(400).send({
                    error: {
                        message: 'user not found'
                    }
                });
            if (!await bcrypt.compare(password + salt.salt, user_db.password)) 
                return res.status(400).send({
                    error: {
                        message: 'invalid password'
                    }
                });
            new_password = await bcrypt.hash(new_password + salt.salt, 10); 
            await user_db.update({
                password: new_password
            });   
            return res.status(200).send();
        } catch(err) {
            return res.status(500).send({
                error: {
                    message: err.message
                }
            });
        }
    },

    async logout(req, res) {
        try {
            const token = req.cookies['user_session'];
            if (!token) return res.status(200).send();
            
            const solved = Token.solveToken(token);
            if (!solved.ok) return res.status(200).send();
    
            await Token.findOrCreate({
                where: {
                    token: token,
                },
                defaults: {
                    token: token,
                    due_date: solved.decoded.exp * 1000
                }  
            });
            res.clearCookie('user_session');
            return res.status(200).send();
        } catch(err) {
            return res.status(500).send({
                error: {
                    message: err.message,
                }
            });
        }
    }
}