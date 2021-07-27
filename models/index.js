const Sequelize = require('sequelize');

// 모델 임포트
const User = require('./user');
const Domain = require('./domain');
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

db.User = User;
db.Domain = Domain;
/*
db.Member = Member;
db.Team = Team;
db.Project = Project;
*/
// 모델 생성
User.init(sequelize);
Domain.init(sequelize);
/*
Member.init(sequelize);
Team.init(sequelize);
Project.init(sequelize);
*/
// 모델 관계 설정
User.associate(db);
Domain.associate(db);
/*
Member.associate(db);
Team.associate(db);
Project.associate(db);
*/

module.exports = db;
