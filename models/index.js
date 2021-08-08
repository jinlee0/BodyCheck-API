const Sequelize = require('sequelize');

// 모델 임포트
const DateRecord = require('./dateRecord');
const Domain = require('./domain');
const Exercise = require('./exercise');
const Record = require('./record');
const User = require('./user');
const UserProfile = require('./userProfile');
const Variable = require('./variable');
const VariableType = require('./variableType');

const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.json')[env];
const db = {};

const sequelize = new Sequelize(config.database, config.username, config.password, config);

db.sequelize = sequelize;

db.DateRecord = DateRecord;
db.Domain = Domain;
db.Exercise = Exercise;
db.Record = Record;
db.User = User;
db.UserProfile = UserProfile;
db.Variable = Variable;
db.VariableType = VariableType;

// 모델 생성
DateRecord.init(sequelize);
Domain.init(sequelize);
Exercise.init(sequelize);
Record.init(sequelize);
User.init(sequelize);
UserProfile.init(sequelize);
Variable.init(sequelize);
VariableType.init(sequelize);

// 모델 관계 설정
DateRecord.associate(db);
Domain.associate(db);
Exercise.associate(db);
Record.associate(db);
User.associate(db);
UserProfile.associate(db);
Variable.associate(db);
VariableType.associate(db);

module.exports = db;
