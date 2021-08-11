const Sequelize = require("sequelize");

module.exports = class File extends Sequelize.Model {
  static init(sequelize) {
    return super.init(
      {
        file_type: { type: Sequelize.STRING(45), allowNull: true },
        size: {
          type: Sequelize.STRING(45),
          allowNull: true,
        },
        origin_url: {
          type: Sequelize.STRING(200),
          allowNull: true,
        },
        description: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
      },
      {
        sequelize,
        modelName: "File",
        tableName: "file",
        timestamp: true,
        underscored: true,
        paranoid: false,
        charset: "utf8mb4",
        collate: "utf8mb4_unicode_ci",
      }
    );
  }

  static associate(db) {
    // File - Record (n:1)
    db.File.belongsTo(db.DateRecord, {
      foreignKey: "dateRecord_id",
      targetKey: "id",
    });
  }
};
