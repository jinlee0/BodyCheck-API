const Sequelize = require('sequelize');

module.exports = class Record extends Sequelize.Model {
    static init(sequelize) {
        return super.init({
            // id 컬럼은 자동 생성
            record: {
                type: Sequelize.STRING(45),
            },
        }, {
            sequelize,
            timestamps: false,
            underscored: false,
            modelName: 'Record',
            tableName: 'records',
            // paranoid: true, // 레코드 삭제 시간 기록 컬럼 자동 생성
            charset: 'utf8',
            collate: 'utf8_general_ci',
        });
    }

    static associate(db) {
        // 관계
        db.Record.belongsTo(db.Variable);
        db.Record.belongsTo(db.DateRecord);
    }
};
