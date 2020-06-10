const express = require('express');
const pagecontroller = require('./controllers/pagecontroller');
const usercontroller = require('./controllers/usercontroller');
const foldercontroller = require('./controllers/foldercontroller');
const filecontroller = require('./controllers/filecontroller');

const auth = require('./middlewares/auth');
const upload = require('./middlewares/upload');

routes = express.Router();


routes.get('/', auth, pagecontroller.login);
routes.get('/join', auth, pagecontroller.signup);

routes.get('/folder/:folder_id', auth, foldercontroller.listFolder);
routes.get('/root', auth, foldercontroller.root);


routes.get('/getfile/:file_id', filecontroller.getFile);

routes.post('/signup', usercontroller.store);
routes.post('/session', usercontroller.login);
routes.post('/logout', usercontroller.logout);

routes.post('/createfolder', auth, foldercontroller.createFolder);
routes.post('/upload', auth, upload, filecontroller.UploadFile);
routes.post('/deletefile', auth, filecontroller.deleteFile);
routes.post('/movefile', auth, filecontroller.moveFile);

module.exports = routes;