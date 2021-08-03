const Sequelize = require('sequelize');

module.exports = class Exercise extends Sequelize.Model {
    static init(sequelize) {
        return super.init({
            // id 컬럼은 자동 생성
            name: {
                type: Sequelize.STRING(45),
                allowNull: false,
            },
        }, {
            sequelize,
            timestamps: false,
            underscored: false,
            modelName: 'Exercise',
            tableName: 'exercises',
            // paranoid: true, // 레코드 삭제 시간 기록 컬럼 자동 생성
            charset: 'utf8',
            collate: 'utf8_general_ci',
        });
    }

    static associate(db) {
        // 관계
        db.Exercise.belongsTo(db.User);
        db.Exercise.hasMany(db.Variable);
    }
};
