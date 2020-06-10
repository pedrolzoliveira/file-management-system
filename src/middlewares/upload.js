const multer = require('multer');
const multerConfig = require('../config/multer');

module.exports = multer(multerConfig).single('file');

