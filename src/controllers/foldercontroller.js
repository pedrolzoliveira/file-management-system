const Folder = require('../models/Folder');
const File = require('../models/File');
const fs = require('fs');
const path = require('path');
const connection = require('../database/index');


module.exports = {
    async createFolder(req, res) {
        if (!req.IsAuth)
            return res.status(403).send({
                error: {
                    message: 'permission danied',
                }
            });
        const {user} = req;
        const {name, father_folder_id} = req.body;
        if (!name || name == false || !father_folder_id || father_folder_id == false)
            return res.status(400).send({
                error: {
                    message: 'missing information'
                }
            });
        const father_folder = await Folder.findByPk(father_folder_id);
        if (!father_folder)
            return res.status(400).send({
                error: {
                    message: 'father folder not found',
                }
            });
        if (father_folder.owner != user.id)
            return res.status(403).send({
                error: {
                    message: 'permission denied'
                }
            });
        if (await Folder.findOne({where: {father_folder_id: father_folder_id, name: name}}))
            return res.status(400).send({
                error: {
                    message: 'there is already a folder with that name'
                }
            });
        const t = await connection.transaction();
        try {
            let folder = await Folder.createFolder({
                name,
                father_folder_id,
                owner: user.id
            }, t);
            await t.commit();
            return res.status(201).send({folder});
        } catch(err) {
            try {
                await t.rollback();
            }
            finally {
                return res.status(500).send({
                    error: {
                        message: err.message
                    }
                });
            }
        }
    },

    async listFolder(req, res) {
        if (!req.IsAuth)
            return res.status(403).send({
                error: {
                    message: 'permission danied'
                }
            });
        try {
            const {user} = req;
            const {folder_id} = req.params;
            if (!folder_id || folder_id == false)
                return res.status(400).send({
                    error: {
                        message: 'missing information'
                    }
                });
            const folder = await Folder.findByPk(folder_id);
            if (!folder)
                return res.status(400).send({
                    error: {
                        message: 'folder not found'
                    }
                });
            if (folder.owner != user.id)
                return res.status(403).send({
                    error: {
                        message: 'permission danied'
                    }
                });
            const retorno = await Promise.all([
                Folder.findAll({where: {
                    father_folder_id: folder.id
                }}),
                File.findAll({where: {
                    folder_id: folder.id
                }})   
            ]);
            return res.status(200).send({
                folder: folder,
                folders: retorno[0],
                files: retorno[1]
            });
        } catch(err) {
            return res.status(500).send({
                error: {
                    message: 'unhandled error'
                }
            });
        }
    },

    async moveFolder(req, res) {
        try {
            if (!req.IsAuth)
                return res.status(403).send({
                    error: {
                        message: 'permission danied'
                    }
                });
            const {user} = req;
            const {folder_id, new_father_folder_id} = req.body;
            if (!folder_id || folder_id == false || !new_father_folder_id || new_father_folder_id == false)
              return res.status(400).send({
                  error: {
                      message: 'missing information'
                  }
              });
            const [folder, new_father_folder] = await Promise.all([
                Folder.findByPk(folder_id),
                Folder.findByPk(new_father_folder_id)
            ]); 
            if (!folder || !new_father_folder)
              return res.status(404).send({
                  error: {
                      message: 'folder not found'
                  }
              });
            if (await Folder.findOne({where: {father_folder_id: new_father_folder_id, name: folder.name}}))
              return res.status(400).send({
                  error: {
                      message: 'there is already a folder with that name'
                  }
              });
            if (folder.owner != user.id || new_father_folder.owner != user.id)
              return res.status(403).send({
                  error: {
                      message: 'permission danied'
                  }
              });
            if (!folder.father_folder_id)
              return res.status(400).send({
                  error: {
                      message: 'this folder can not be moved'
                  }
              });
            const [folder_path, new_father_folder_path] = await Promise.all([
                folder.get_path(),
                new_father_folder.get_path()
            ]);
            if (fs.existsSync(folder_path) && fs.existsSync(new_father_folder_path)) {
                let new_path = path.join(new_father_folder_path, folder.name);
                fs.renameSync(folder_path, new_path);
                await folder.update({
                    father_folder_id: new_father_folder_id
                });
                return res.status(200).send();
            } else {
                return res.status(401).send({
                    error: {
                        message: 'folder not found'
                    }
                });
            }
        } catch(err) {
            return res.status(500).send({
                error: {
                    message: err.message
                }
            });
        }
    },

    async deleteFolder(req, res) {
        try {
            if (!req.IsAuth)
                return res.status(403).send({
                    error: {
                        message: 'permission danied'
                    }
                });
            const {user} = req;
            const {folder_id} = req.params;
            if (!folder_id || folder_id == false)
                return res.status(400).send({
                    error: {
                        message: 'missing information'
                    }
                });
            const folder = await Folder.findByPk(folder_id);
            if (!folder)
                return res.status(401).send({
                    error: {
                        message: 'folder not found'
                    }
                });
            if (folder.owner != user.id)
                return res.status(403).send({
                    error: {
                        message: 'permission danied'
                    }
                });
            if (!folder.father_folder_id)
                return res.status(403).send({
                    error: {
                        message: 'this folder can not be deleted'
                    }
                });
            const folder_path = await folder.get_path();
            if (fs.existsSync(folder_path)) {
                fs.rmdirSync(folder_path, {recursive: true});
                await folder.delete_folder();
                return res.status(200).send();
            } else {
                return res.status(401).send({
                    error: {
                        message: 'folder not found'
                    }
                });
            }
        } catch(err) {
            return res.status(500).send({
                error: {
                    message: err.message
                }
            });
        }
    },

    async renameFolder(req, res) {
        try {
            if (!req.IsAuth)
                return res.status(403).send({
                    error: {
                        message: 'permission danied'
                    }
                });
            const {user} = req;
            const {folder_id, new_name} = req.body;
            if (!folder_id || folder_id == false || !new_name || new_name == false)
                return res.status(400).send({
                    error: {
                        message: 'missing information'
                    }
                });
            const folder = await Folder.findByPk(folder_id);
            if (!folder)
                return res.status(400).send({
                    error: {
                        message: 'folder not found'
                    }
                });
            if (folder.owner != user.id)
                return res.status(403).send({
                    error: {
                        message: 'permission danied'
                    }
                });
            if (!folder.father_folder_id)
                return res.status(400).send({
                    error: {
                        message: 'this folder can not be renamed'
                    }
                });
            const [folder_path, new_path, same_name_folder] = await Promise.all([
                folder.get_path(),
                (async () => {
                    const folder_father = await Folder.findByPk(folder.father_folder_id);
                    const father_path = await folder_father.get_path();
                    return path.join(father_path, new_name);
                })(),
                Folder.findOne({where: {
                    father_folder_id: folder.father_folder_id,
                    name: new_name
                }})
            ]);
            if (same_name_folder)
                return res.status(400).send({
                    error: {
                        message: 'there is already a folder with that name'
                    }
                });
            if (fs.existsSync(folder_path)) {
                fs.renameSync(folder_path, new_path);
                await folder.update({
                    name: new_name
                });
                return res.status(200).send({folder});
            } else {
                return res.status(400).send({
                    error: {
                        message: 'folder not found'
                    }
                });
            }
        } catch(err) {
            return res.status(500).send({
                error: {
                    message: err.message
                }
            });
        }
    },

    async root(req, res) {
        try {
            if (!req.IsAuth)
            return res.status(403).send({
                error: {
                    message: 'permission danied'
                }
            });
            const {user} = req;
            const root_folder = await Folder.findOne({
                where: {
                    owner: user.id
                }
            });
            if (!root_folder)
                return res.status(400).send({
                    error: {
                        message: 'users root folder not found'
                    }
                });
            return res.status(200).send({
                folder: root_folder
            });
        } catch(err) {
            return res.status(500).send({
                error: {
                    message: 'unhandled'
                }
            });
        }
    }
};