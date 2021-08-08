const Sequelize = require('sequelize');

module.exports = class UserProfile extends Sequelize.Model {
    static init(sequelize) {
        return super.init({
            // id 컬럼은 자동 생성
            nick: {
                type: Sequelize.STRING(45),
                allowNull: false,
            },
            image: {
                type: Sequelize.STRING(45),
            },
            age: {
                type: Sequelize.INTEGER,
            },
            height: {
                type: Sequelize.INTEGER
            },
            weight: {
                type: Sequelize.INTEGER
            },
            text: {
                type: Sequelize.TEXT('tiny')
            }
        }, {
            sequelize,
            timestamps: false, // 레코드 생성, 수정 시간 기록 컬럼 자동 생성
            underscored: false, 
            modelName: 'UserProfile',
            tableName: 'userProfiles',
            paranoid: false, // 레코드 삭제 시간 기록 컬럼 자동 생성
            charset: 'utf8',
            collate: 'utf8_general_ci',
        });
    }

    static associate(db) {
        // 관계
        db.UserProfile.belongsTo(db.User);
    }
};
