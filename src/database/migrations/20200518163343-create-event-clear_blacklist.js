'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query(`CREATE EVENT clear_blacklist
                            ON SCHEDULE EVERY 1 DAY DO
                            DELETE FROM token_blacklist
                            WHERE due_date < NOW();`);
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query("DROP EVENT clear_blacklist;");
  }
};
