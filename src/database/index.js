const Sequelize = require('sequelize');
const dbConfig = require('../config/database');

const User = require('../models/User');
const Salt = require('../models/Salt');
const Token = require('../models/Token');
const Folder = require('../models/Folder');
const File = require('../models/File');

const connection = new Sequelize(dbConfig);

User.init(connection);
Salt.init(connection);
Token.init(connection);
Folder.init(connection);
File.init(connection);

User.associate(connection.models);
Folder.associate(connection.models);

module.exports = connection;