'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('folders', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      father_folder_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'folders',
          key: 'id',
          OnUpdate: 'CASCADE',
          OnDelete: 'CASCADE',
        }
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
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
    return queryInterface.dropTable('folders');
  }
};
