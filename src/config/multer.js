const multer = require('multer');
const path = require('path');
const {temp} = require('./paths.json');

module.exports = {
    dest: path.join(temp)
}