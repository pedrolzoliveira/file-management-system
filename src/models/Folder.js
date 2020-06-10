const { Model, DataTypes } = require('sequelize');
const { content } = require('../config/paths.json');
const fs = require('fs');
const path = require('path');

class Folder extends Model {

    static init(sequelize) {
        super.init({
            id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
            },
            father_folder_id: {
                type: DataTypes.INTEGER,
                allowNull: true,
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

    static associate(models) {
        this.belongsTo(models.User, {foreignKey: 'id', as: 'user'});
    }

    static async createRootFolder(user, transaction = null) {
        const dir = path.join(content, user.id.toString());
        try {
            const [folder, created] = await Folder.findOrCreate({
                where: {
                    father_folder_id: null,
                    name: user.id,
                    owner: user.id
                },
                defaults: {
                    father_folder_id: null,
                    name: user.id,
                    owner: user.id
                },
                transaction
            });
            if (created) {
                fs.mkdirSync(dir);
            }
            return folder;
        } catch(err) {
            if (fs.existsSync(dir))
                fs.rmdirSync(dir);
            return null
        }
    }

    static async createFolder({name, father_folder_id, owner}, transaction = null) {
        let dir = await this.get_path(father_folder_id);
        try {
            dir = path.join(dir, name);
            const folder = await Folder.create({
                name,
                father_folder_id,
                owner
            }, {transaction});
            fs.mkdirSync(dir);
            return folder;
        } catch(err) {
            if (fs.existsSync(dir))
              fs.rmdirSync(dir);
            return null;
        }
    }

    static async get_path(folder_id) {
        let path_list = [];
        let dir = content;
        while (folder_id) {
            let folder = await this.findByPk(folder_id);
            folder_id = folder.father_folder_id;
            path_list.push(folder.name);
        }
        path_list.reverse();
        path_list.forEach(e => {
            dir = path.join(dir, e);
        });
        return dir;
    }

   async get_path() {
       return await Folder.get_path(this.id);
   }

}

module.exports = Folder;