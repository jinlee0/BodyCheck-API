const Sequelize = require('sequelize');

// 모델 임포트
const DateRecord = require('./dateRecord');
const Domain = require('./domain');
const Exercise = require('./exercise');
const Record = require('./record');
const Variable = require('./variable');
const VariableType = require('./variableType');
const User = require('./user');

const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.json')[env];
const db = {};

const sequelize = new Sequelize(config.database, config.username, config.password, config);

db.sequelize = sequelize;

db.DateRecord = DateRecord;
db.Domain = Domain;
db.Exercise = Exercise;
db.Record = Record;
db.Variable = Variable;
db.VariableType = VariableType;
db.User = User;

// 모델 생성
DateRecord.init(sequelize);
Domain.init(sequelize);
Exercise.init(sequelize);
Record.init(sequelize);
Variable.init(sequelize);
VariableType.init(sequelize);
User.init(sequelize);

// 모델 관계 설정
DateRecord.associate(db);
Domain.associate(db);
Exercise.associate(db);
Record.associate(db);
Variable.associate(db);
VariableType.associate(db);
User.associate(db);

module.exports = db;
