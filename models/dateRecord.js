const Sequelize = require('sequelize');

module.exports = class DateRecord extends Sequelize.Model {
    static init(sequelize) {
        return super.init({
            // id 컬럼은 자동 생성
            date: {
                type: Sequelize.DATE,
                allowNull: false,
            },
            startTime:{
                type: Sequelize.TIME,
            },
            endTime:{
                type: Sequelize.TIME,
            },
            memo:{
                type: Sequelize.TEXT,
            },
        }, {
            sequelize,
            timestamps: false,
            underscored: false,
            modelName: 'DateRecord',
            tableName: 'dateRecords',
            // paranoid: true, // 레코드 삭제 시간 기록 컬럼 자동 생성
            charset: 'utf8',
            collate: 'utf8_general_ci',
        });
    }

    static associate(db) {
        // 관계
        db.DateRecord.hasMany(db.Record);
    }
};
