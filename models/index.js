const Sequelize = require('sequelize');

// 모델 임포트
const Domain = require('./domain');
const Element = require('./element');
const ElementInt = require('./elementInt');
const ElementString = require('./elementString');
const ElementText = require('./elementText');
const ElementTime = require('./elementTime');
const ElementType = require('./elementType');
const Exercise = require('./exercise');
const User = require('./user');
/*
const Member = require('./member');
const Team = require('./team');
const Project = require('./project');
*/

const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.json')[env];
const db = {};

const sequelize = new Sequelize(config.database, config.username, config.password, config);

db.sequelize = sequelize;

db.Domain = Domain;
db.Element = Element;
db.ElementInt = ElementInt;
db.ElementString = ElementString;
db.ElementText = ElementText;
db.ElementTime = ElementTime;
db.ElementType = ElementType;
db.Exercise = Exercise;
db.User = User;

// 모델 생성
Domain.init(sequelize);
Element.init(sequelize);
ElementInt.init(sequelize);
ElementString.init(sequelize);
ElementText.init(sequelize);
ElementTime.init(sequelize);
ElementType.init(sequelize);
Exercise.init(sequelize);
User.init(sequelize);

// 모델 관계 설정
Domain.associate(db);
Element.associate(db);
ElementInt.associate(db);
ElementString.associate(db);
ElementText.associate(db);
ElementTime.associate(db);
ElementType.associate(db);
Exercise.associate(db);
User.associate(db);

module.exports = db;
