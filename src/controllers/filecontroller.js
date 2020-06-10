const File = require('../models/File');
const Folder = require('../models/Folder');
const fs = require('fs');
const path = require('path');
const connection = require('../database/index'); 

module.exports = {
    async UploadFile(req, res) {
        if (!req.IsAuth)
            return res.status(403).send({
                error: {
                    message: 'permission danied'
                }
            });
        const {folder_id} = req.body; 
        if (!folder_id || folder_id == false)
            return res.status(400).send({
                error: {
                    message: 'missing information'
                },
            });
        const {file, user} = req;
        const folder = await Folder.findByPk(folder_id);
        if (!folder)
            return res.status(400).send({
                error: {
                    message: 'folder not found',
                }
            });
        if (folder.owner != user.id)
            return res.status(403).send({
                error: {
                    message: 'permission denied'
              }
            });
        const t = await connection.transaction();
        try {
            const file_ = await File.createFile({
                file_path: file.path,
                name: file.originalname,
                folder_id,
                owner: user.id
            }, t);
            await t.commit();
            return res.status(201).send({
                file: file_
            });
        } catch(err) {
            try {
                await t.rollback();
            }
            finally {
                return res.status(500).send({
                    error: {
                        message: err.message,
                    }
                });
            }
        }
    },

    async moveFile(req, res) {
        try {
            if (!req.IsAuth)
                return res.status(403).send({
                    error: {
                        message: 'permission danied'
                    }
                });
            const {user} = req;
            const {file_id, folder_id} = req.body;
            const [file, folder] = await Promise.all([
                File.findByPk(file_id),
                Folder.findByPk(folder_id)
            ]);
            if (!file || !folder)
                return res.status(400).send({
                    error: {
                        message: 'file or folder not found'
                    }
                });
            if (file.owner != user.id || folder.owner != user.id)
                return res.status(403).send({
                    error: {
                        message: 'permission danied'
                    }
                });
            let [old_path_file, new_path_file] = await Promise.all([
                file.get_path(),
                folder.get_path()
            ]);
            new_path_file = path.join(new_path_file, file.name);
            if (fs.existsSync(old_path_file)) {
                fs.renameSync(old_path_file, new_path_file);
                await file.update({
                    folder_id: folder.id
                });
                return res.status(200).send();
            } else {
                return res.status(400).send({
                    error: {
                        message: 'file not in the system'
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

    async getFile(req, res) {
        try {
            if (!req.IsAuth)
                return res.status(403).send({
                    error: {
                        message: 'permission danied'
                    }
                });
            const {file_id} = req.params;
            const {user} = req;
            const file = await File.findByPk(file_id);
            if (file.owner != user.id)
                return res.status(403).send({
                    error: {
                        message: 'permission danied'
                    }
                });    
            const file_path = await file.get_path();
            return res.download(file_path);
        } catch(err) {
            return res.status(500).send({
                error: {
                    message: err.message
                }
            });
        }
    },

    async deleteFile(req, res) {
        try {
            if (!req.IsAuth)
                return res.status(403).send({
                    error: {
                        message: 'permission danied'
                    }
                });
            const {user} = req;
            const {file_id} = req.body;
            if (!file_id || file_id == false)
                return res.status(400).send({
                    error: {
                        message: 'missing information'
                    }
                });
            const file = await File.findByPk(file_id);
            if (!file)
                return res.status(400).send({
                    error: {
                        message: 'file not found'
                    }
                });
            if (file.owner != user.id)
                return res.status(403).send({
                    error: {
                        message: 'permission danied'
                    }
                });
            const file_path = await file.get_path();
            if (fs.existsSync(file_path)) {
                fs.unlinkSync(file_path);
                await file.destroy();
                return res.status(200).send();
            } else {
                return res.status(401).send({
                    error: {
                        message: 'file not in the system'
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
    }
}