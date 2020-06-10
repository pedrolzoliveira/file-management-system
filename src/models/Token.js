const { Model, DataTypes } = require('sequelize');
const jwt = require('jsonwebtoken');
const authConfig = require('../config/auth.json');

class Token extends Model {

    // Modelo para Blacklist de Tokens e atividades com o mesmo - Para adicionar o token a lista negra basta apenas dar um Token.create()

    static init(sequelize) {
        super.init({
            token: {
                type: DataTypes.STRING,
                allowNull: false,
                primaryKey: true,
              },
              due_date: {
                type: DataTypes.DATE,
                allowNull: true,
              }
        }, {
            sequelize,
            tableName: 'token_blacklist',
        })
    }

    static generateToken(params) {
        return jwt.sign( { id: params.id, name: params.name, email: params.email}, authConfig.secret, {expiresIn: 86400});
    }

    static solveToken(token) {
        return jwt.verify(token, authConfig.secret, (err, decoded) => {
            if (err) return {ok: false, error: err.message};
            return {ok: true, decoded};
        });
    }
}

module.exports = Token;