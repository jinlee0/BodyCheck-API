const express = require("express");
const session = require('express-session');
const path = require('path');
const morgan = require('morgan');
const nunjucks = require('nunjucks');
const dotenv = require('dotenv');

dotenv.config();
const indexRouter = require('./routes');
const authRouter = require('./routes/auth');
const exerciseRouter = require('./routes/exercises');
const variableRouter = require('./routes/variables');
const userRouter = require('./routes/users');
const userProfileRouter = require('./routes/userProfiles');
const fileRouter = require('./routes/files');

const { sequelize } = require('./models');

const app = express();
app.set('port', process.env.PORT || 5001);
app.set('view engine', 'html');
nunjucks.configure('views', {
    express: app,
    watch: true,
});
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE');
    res.header('Access-Control-Allow-Headers', 'content-type, bodycheck-access-token'); // JWT 로그인
    next();
});
app.use(express.static(path.join(__dirname, 'public')));
sequelize.sync({ force: false })
    .then(() => {
        console.log('Database 연결 성공');
    })
    .catch((err) => {
        console.error(err);
    });

app.use(session({
    resave: false,
    saveUninitialized: false,
    secret: process.env.COOKIE_SECRET,
    cookie: {
        httpOnly: true,
        secure: false,
    },
}));

app.use('/', indexRouter);
app.use('/auth', authRouter);
app.use('/exercises', exerciseRouter);
app.use('/variables', variableRouter);
app.use('/users', userRouter);
app.use('/userProfiles', userProfileRouter);
app.use('/files', fileRouter);

app.listen(app.get('port'), () => {
    console.log(app.get('port'), '번 포트 활성화');
});