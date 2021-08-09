const Sequelize = require('sequelize');

module.exports = class User extends Sequelize.Model {
    static init(sequelize) {
        return super.init({
            // id 컬럼은 자동 생성
            email: {
                type: Sequelize.STRING(45),
                allowNull: false,
                unique: true,
            },
            password: {
                // bcrypt로 암호화하여 저장
                type: Sequelize.STRING(100),
                allowNull: false,
            },
        }, {
            sequelize,
            timestamps: true, // 레코드 생성, 수정 시간 기록 컬럼 자동 생성
            underscored: false, 
            modelName: 'User',
            tableName: 'users',
            paranoid: true, // 레코드 삭제 시간 기록 컬럼 자동 생성
            charset: 'utf8',
            collate: 'utf8_general_ci',
        });
    }

    static associate(db) {
        // 관계
        db.User.hasMany(db.UserProfile);
        db.User.hasMany(db.Domain);
        db.User.hasMany(db.Exercise);
    }
};
