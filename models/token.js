const Sequelize = require('sequelize');

module.exports = class Token extends Sequelize.Model {
  static init(sequelize) {
    return super.init({
      refreshToken: {
        type: Sequelize.STRING(500),
        allowNull: false,
      }
    }, {
      sequelize,
      timestamps: true,
      paranoid: true,
      modelName: 'Token',
      tableName: 'tokens',
    });
  }

  static associate(db) {
    db.Domain.belongsTo(db.User);
  }
};
