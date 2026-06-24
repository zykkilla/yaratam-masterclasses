const express = require('express');
const router = express.Router();
const { db } = require('../database/init');

router.get('/', async (req, res) => {
  try {
    const category = req.query.category || '';
    const search = req.query.search || '';

    let masterclasses = await db.masterclasses.find({}).sort({ date: 1 });

    if (category) {
      masterclasses = masterclasses.filter(mc => mc.category === category);
    }
    if (search) {
      const s = search.toLowerCase();
      masterclasses = masterclasses.filter(mc =>
        mc.title.toLowerCase().includes(s) || mc.description.toLowerCase().includes(s)
      );
    }

    const categories = await db.categories.find({});

    for (const mc of masterclasses) {
      const regCount = await db.registrations.count({ masterclassId: mc._id });
      mc.registeredCount = regCount;
      mc.slotsLeft = mc.maxParticipants - regCount;
      const cat = categories.find(c => c._id === mc.category);
      mc.categoryName = cat ? cat.name : '';
    }

    res.render('index', { masterclasses, categories, currentCategory: category, search });
  } catch (err) {
    res.status(500).render('error', { error: err.message });
  }
});

router.get('/masterclass/:id', async (req, res) => {
  try {
    const mc = await db.masterclasses.findOne({ _id: req.params.id });
    if (!mc) return res.status(404).render('404');

    const cat = await db.categories.findOne({ _id: mc.category });
    mc.categoryName = cat ? cat.name : '';

    const regCount = await db.registrations.count({ masterclassId: mc._id });
    mc.registeredCount = regCount;
    mc.slotsLeft = mc.maxParticipants - regCount;

    res.render('masterclass', { mc });
  } catch (err) {
    res.status(500).render('error', { error: err.message });
  }
});

router.get('/register/:id', async (req, res) => {
  try {
    const mc = await db.masterclasses.findOne({ _id: req.params.id });
    if (!mc) return res.status(404).render('404');

    const regCount = await db.registrations.count({ masterclassId: mc._id });
    mc.registeredCount = regCount;
    mc.slotsLeft = mc.maxParticipants - regCount;

    res.render('register', { mc, errors: null });
  } catch (err) {
    res.status(500).render('error', { error: err.message });
  }
});

router.post('/register/:id', async (req, res) => {
  try {
    const mc = await db.masterclasses.findOne({ _id: req.params.id });
    if (!mc) return res.status(404).render('404');

    const { name, email, phone } = req.body;
    const errors = [];

    if (!name || name.trim().length < 2) errors.push('Введите имя');
    if (!email || !email.includes('@')) errors.push('Введите корректный email');
    if (!phone || phone.trim().length < 6) errors.push('Введите телефон');

    const regCount = await db.registrations.count({ masterclassId: mc._id });
    if (regCount >= mc.maxParticipants) errors.push('Места закончились');

    const existingReg = await db.registrations.findOne({ masterclassId: mc._id, email });
    if (existingReg) errors.push('Вы уже записаны на этот мастер-класс');

    if (errors.length > 0) {
      mc.registeredCount = regCount;
      mc.slotsLeft = mc.maxParticipants - regCount;
      return res.render('register', { mc, errors });
    }

    await db.registrations.insert({
      masterclassId: mc._id,
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      createdAt: new Date(),
    });

    req.session.message = { type: 'success', text: 'Вы успешно записаны на мастер-класс!' };
    res.redirect('/masterclass/' + mc._id);
  } catch (err) {
    res.status(500).render('error', { error: err.message });
  }
});

router.get('/my-registrations', async (req, res) => {
  try {
    const email = req.query.email || '';
    let registrations = [];

    if (email) {
      registrations = await db.registrations.find({ email }).sort({ createdAt: -1 });
      for (const reg of registrations) {
        const mc = await db.masterclasses.findOne({ _id: reg.masterclassId });
        reg.masterclassTitle = mc ? mc.title : 'Неизвестно';
        reg.masterclassDate = mc ? mc.date : '';
        reg.masterclassTime = mc ? mc.time : '';
      }
    }

    res.render('my-registrations', { registrations, email });
  } catch (err) {
    res.status(500).render('error', { error: err.message });
  }
});

module.exports = router;
