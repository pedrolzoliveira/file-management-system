const express = require('express');
const path = require('path');
const routes = require('./routes');
const cookieParser = require('cookie-parser');

require('./database');

const app = express();

app.use(express.json());
app.use(cookieParser());

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use('/public', express.static(path.join(__dirname, 'public')));

app.use(routes);


app.listen(8080);