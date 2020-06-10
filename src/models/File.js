const { Model, DataTypes } = require('sequelize');
const Folder = require('./Folder');
const connection = require('../database/index');
const fs = require('fs');
const path = require('path');

class File extends Model {

    static init(sequelize) {
        super.init({
            id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
            },
            folder_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: 'folders',
                    key: 'id',
                    OnUpdate: 'CASCADE',
                    OnDelete: 'CASCADE',
                },
            },
            name: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            file_extension: {
                type: DataTypes.STRING,
            },
            owner: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: 'users',
                    key: 'id',
                    OnUpdate: 'CASCADE',
                    OnDelete: 'CASCADE',
                },
            }
        }, {
            sequelize,
        })
    }

    static async createFile({file_path, name, folder_id, owner}, transaction = null) {
        const folder_path = await Folder.get_path(folder_id);
        const new_path = path.join(folder_path, name);
        try {
            const file = await this.create({
                folder_id,
                name,
                file_extension: path.extname(new_path),
                owner
            }, {transaction});
            fs.renameSync(file_path, new_path);
            return file;
        } catch(err) {
            console.log(err.message);
            if (fs.existsSync(new_path))
              fs.unlinkSync(new_path);
            return null;
        }
    }

    async get_path() {
        const folder_path = await Folder.get_path(this.folder_id);
        const file_path = path.join(folder_path, this.name);
        return file_path;
    }
}

module.exports = File;