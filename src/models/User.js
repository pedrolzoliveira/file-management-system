const { Model, DataTypes } = require('sequelize');


class User extends Model {
    static init(sequelize) {
        super.init({
            id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
            },
            name: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            email: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true,
            },
            password: {
                type: DataTypes.STRING,
                allowNull: false,
            }
        }, {
            sequelize
        });
    }

    
    static associate(models) {
        this.hasOne(models.Salt, {foreignKey: 'user_id', as: 'salt'});
        this.hasMany(models.Folder, {foreignKey: 'owner', as: 'folder'});
    }
}

module.exports = User;