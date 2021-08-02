const Sequelize = require('sequelize');

module.exports = class ElementString extends Sequelize.Model {
    static init(sequelize) {
        return super.init({
            // id 컬럼은 자동 생성
            record: {
                type: Sequelize.STRING(45),
                allowNull: false,
            },
        }, {
            sequelize,
            timestamps: false,
            // timestamps: true, // 레코드 생성, 수정 시간 기록 컬럼 자동 생성
            underscored: false,
            modelName: 'ElementString',
            tableName: 'elementStrings',
            // paranoid: true, // 레코드 삭제 시간 기록 컬럼 자동 생성
            charset: 'utf8',
            collate: 'utf8_general_ci',
        });
    }

    static associate(db) {
        // 관계
        db.ElementString.belongsTo(db.Element);
    }
};
