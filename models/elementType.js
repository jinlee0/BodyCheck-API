const Sequelize = require('sequelize');

module.exports = class ElementType extends Sequelize.Model {
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
            // timestamps: true, // 레코드 생성, 수정 시간 기록 컬럼 자동 생성
            underscored: false, // 뭐더라
            modelName: 'ElementType',
            tableName: 'elementTypes',
            // paranoid: true, // 레코드 삭제 시간 기록 컬럼 자동 생성
            charset: 'utf8',
            collate: 'utf8_general_ci',
        });
    }

    static associate(db) {
        // 관계
        db.ElementType.hasMany(db.Element);
    }
};
