const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { db } = require('../database/init');

function requireAdmin(req, res, next) {
  if (req.session.user && req.session.user.role === 'admin') return next();
  res.redirect('/admin/login');
}

router.get('/login', (req, res) => {
  res.render('admin/login', { error: null });
});

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await db.users.findOne({ username });

    if (!user) {
      return res.render('admin/login', { error: 'Неверный логин или пароль' });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.render('admin/login', { error: 'Неверный логин или пароль' });
    }

    req.session.user = { username: user.username, role: user.role };
    res.redirect('/admin/dashboard');
  } catch (err) {
    res.render('admin/login', { error: err.message });
  }
});

router.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

router.get('/dashboard', requireAdmin, async (req, res) => {
  try {
    const masterclasses = await db.masterclasses.find({}).sort({ date: 1 });
    const categories = await db.categories.find({});

    for (const mc of masterclasses) {
      const regCount = await db.registrations.count({ masterclassId: mc._id });
      mc.registeredCount = regCount;
      const cat = categories.find(c => c._id === mc.category);
      mc.categoryName = cat ? cat.name : '';
    }

    const totalRegistrations = await db.registrations.count({});
    res.render('admin/dashboard', { masterclasses, totalRegistrations });
  } catch (err) {
    res.status(500).render('error', { error: err.message });
  }
});

router.get('/masterclass/new', requireAdmin, async (req, res) => {
  const categories = await db.categories.find({});
  res.render('admin/edit', { mc: null, categories, errors: null });
});

router.post('/masterclass/new', requireAdmin, async (req, res) => {
  try {
    const { title, description, category, date, time, maxParticipants } = req.body;
    const errors = [];

    if (!title || title.trim().length < 3) errors.push('Введите название');
    if (!description || description.trim().length < 10) errors.push('Введите описание');
    if (!category) errors.push('Выберите категорию');
    if (!date) errors.push('Укажите дату');
    if (!time) errors.push('Укажите время');
    if (!maxParticipants || parseInt(maxParticipants) < 1) errors.push('Укажите количество мест');

    if (errors.length > 0) {
      const categories = await db.categories.find({});
      return res.render('admin/edit', { mc: req.body, categories, errors });
    }

    await db.masterclasses.insert({
      title: title.trim(),
      description: description.trim(),
      category,
      date,
      time,
      maxParticipants: parseInt(maxParticipants),
      image: '/img/default.jpg',
      createdAt: new Date(),
    });

    req.session.message = { type: 'success', text: 'Мастер-класс создан' };
    res.redirect('/admin/dashboard');
  } catch (err) {
    res.status(500).render('error', { error: err.message });
  }
});

router.get('/masterclass/:id/edit', requireAdmin, async (req, res) => {
  try {
    const mc = await db.masterclasses.findOne({ _id: req.params.id });
    if (!mc) return res.redirect('/admin/dashboard');
    const categories = await db.categories.find({});
    res.render('admin/edit', { mc, categories, errors: null });
  } catch (err) {
    res.status(500).render('error', { error: err.message });
  }
});

router.post('/masterclass/:id/edit', requireAdmin, async (req, res) => {
  try {
    const { title, description, category, date, time, maxParticipants } = req.body;
    const errors = [];

    if (!title || title.trim().length < 3) errors.push('Введите название');
    if (!description || description.trim().length < 10) errors.push('Введите описание');
    if (!category) errors.push('Выберите категорию');
    if (!date) errors.push('Укажите дату');
    if (!time) errors.push('Укажите время');
    if (!maxParticipants || parseInt(maxParticipants) < 1) errors.push('Укажите количество мест');

    if (errors.length > 0) {
      const categories = await db.categories.find({});
      return res.render('admin/edit', { mc: { ...req.body, _id: req.params.id }, categories, errors });
    }

    await db.masterclasses.update(
      { _id: req.params.id },
      { $set: {
        title: title.trim(),
        description: description.trim(),
        category,
        date,
        time,
        maxParticipants: parseInt(maxParticipants),
      }}
    );

    req.session.message = { type: 'success', text: 'Мастер-класс обновлён' };
    res.redirect('/admin/dashboard');
  } catch (err) {
    res.status(500).render('error', { error: err.message });
  }
});

router.post('/masterclass/:id/delete', requireAdmin, async (req, res) => {
  try {
    await db.masterclasses.remove({ _id: req.params.id });
    await db.registrations.remove({ masterclassId: req.params.id }, { multi: true });
    req.session.message = { type: 'success', text: 'Мастер-класс удалён' };
    res.redirect('/admin/dashboard');
  } catch (err) {
    res.status(500).render('error', { error: err.message });
  }
});

router.get('/masterclass/:id/registrations', requireAdmin, async (req, res) => {
  try {
    const mc = await db.masterclasses.findOne({ _id: req.params.id });
    if (!mc) return res.redirect('/admin/dashboard');

    const registrations = await db.registrations.find({ masterclassId: mc._id }).sort({ createdAt: -1 });
    res.render('admin/registrations', { mc, registrations });
  } catch (err) {
    res.status(500).render('error', { error: err.message });
  }
});

module.exports = router;
