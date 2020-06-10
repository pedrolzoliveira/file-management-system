const Folder = require('../models/Folder');
const File = require('../models/File');
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
        if (!name || name == false || !father_folder_id || father_folder_id == false || !owner || owner == false)
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
            const {folder_id} = req.body;
            
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