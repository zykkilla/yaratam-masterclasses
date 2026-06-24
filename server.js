const express = require('express');
const session = require('express-session');
const path = require('path');
const { seed } = require('./database/init');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(session({
  secret: 'yaratam-secret-key-2026',
  resave: false,
  saveUninitialized: false,
}));

app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  res.locals.message = req.session.message || null;
  delete req.session.message;
  next();
});

const masterclassRoutes = require('./routes/masterclasses');
const adminRoutes = require('./routes/admin');

app.use('/', masterclassRoutes);
app.use('/admin', adminRoutes);

app.use((req, res) => {
  res.status(404).render('404');
});

seed().then(() => {
  app.listen(PORT, () => {
    console.log(`Сервер запущен: http://localhost:${PORT}`);
  });
}).catch(err => {
  console.error('Ошибка инициализации БД:', err);
  process.exit(1);
});
