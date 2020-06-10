'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('files', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
        },
      folder_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'folders',
          key: 'id',
          OnUpdate: 'CASCADE',
          OnDelte: 'CASCADE',
        },
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
        },
      file_extension: {
        type: Sequelize.STRING,
        },
      owner: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
          OnUpdate: 'CASCADE',
          OnDelete: 'CASCADE'
          }
        },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        },  
      });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('files');
  }
};
