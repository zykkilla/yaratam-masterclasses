const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { db } = require('../database/init');

router.get('/register', (req, res) => {
  if (req.session.user) return res.redirect('/');
  res.render('auth/register', { errors: null });
});

router.post('/register', async (req, res) => {
  try {
    const { username, email, password, password2 } = req.body;
    const errors = [];

    if (!username || username.trim().length < 3) errors.push('Имя пользователя: минимум 3 символа');
    if (!email || !email.includes('@')) errors.push('Введите корректный email');
    if (!password || password.length < 4) errors.push('Пароль: минимум 4 символа');
    if (password !== password2) errors.push('Пароли не совпадают');

    const existingUser = await db.users.findOne({ username });
    if (existingUser) errors.push('Пользователь с таким именем уже существует');

    const existingEmail = await db.users.findOne({ email });
    if (existingEmail) errors.push('Пользователь с таким email уже существует');

    if (errors.length > 0) {
      return res.render('auth/register', { errors });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    await db.users.insert({
      username: username.trim(),
      email: email.trim(),
      password: passwordHash,
      role: 'user',
      createdAt: new Date(),
    });

    req.session.message = { type: 'success', text: 'Регистрация успешна! Войдите в аккаунт.' };
    res.redirect('/auth/login');
  } catch (err) {
    res.status(500).render('error', { error: err.message });
  }
});

router.get('/login', (req, res) => {
  if (req.session.user) return res.redirect('/');
  res.render('auth/login', { error: null });
});

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await db.users.findOne({ username });

    if (!user) {
      return res.render('auth/login', { error: 'Неверный логин или пароль' });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.render('auth/login', { error: 'Неверный логин или пароль' });
    }

    req.session.user = { _id: user._id, username: user.username, role: user.role, email: user.email };
    req.session.message = { type: 'success', text: 'Добро пожаловать, ' + user.username + '!' };
    res.redirect('/');
  } catch (err) {
    res.status(500).render('error', { error: err.message });
  }
});

router.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

module.exports = router;
