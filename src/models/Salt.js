const { Model, DataTypes } = require('sequelize');

class Salt extends Model {

    static init(sequelize) {
        super.init({
            user_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                primaryKey: true,
                references: {
                  model: 'users',
                  key: 'id',
                  OnUpdate: 'CASCADE',
                  OnDelte: 'CASCADE',
                }
              },
              salt: {
                type: DataTypes.STRING,
                allowNull: false,
              } 
        }, {
            sequelize,
            tableName: 'salt',
        })
    }

    static associate(models) {
        this.belongsTo(models.User, {foreignKey: 'id', as: 'user'});
    }

    static async GenerateSalt(length) {
        const caracteres = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ.';
        let salt = '';
        for (let i = 0; i < length; i++) {
            salt = salt + caracteres[Math.floor(Math.random() * caracteres.length)];
        }
        return salt;
    }
}

module.exports = Salt;