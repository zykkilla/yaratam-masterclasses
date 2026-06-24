const Datastore = require('nedb-promises');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');

const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = {
  masterclasses: Datastore.create({ filename: path.join(dataDir, 'masterclasses.db'), autoload: true }),
  categories: Datastore.create({ filename: path.join(dataDir, 'categories.db'), autoload: true }),
  registrations: Datastore.create({ filename: path.join(dataDir, 'registrations.db'), autoload: true }),
  users: Datastore.create({ filename: path.join(dataDir, 'users.db'), autoload: true }),
};

async function seed() {
  const catCount = await db.categories.count({});
  
  if (catCount === 0) {
    const categories = [
      { name: 'Рисование', image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=600&h=400&fit=crop' },
      { name: 'Музыка', image: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=600&h=400&fit=crop' },
      { name: 'Танцы', image: 'https://images.unsplash.com/photo-1547153760-18fc86c3be8e?w=600&h=400&fit=crop' },
      { name: 'Программирование', image: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600&h=400&fit=crop' },
      { name: 'Фотография', image: 'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=600&h=400&fit=crop' },
      { name: 'Кулинария', image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&h=400&fit=crop' },
    ];
    const savedCats = await db.categories.insert(categories);

    const masterclasses = [
      {
        title: 'Акварельный пейзаж',
        description: 'Научим рисовать осенний пейзаж акварелью. Все материалы предоставляются.',
        category: savedCats[0]._id,
        date: '2026-07-05',
        time: '14:00',
        maxParticipants: 15,
        image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=600&h=400&fit=crop',
        createdAt: new Date(),
      },
      {
        title: 'Гитара для начинающих',
        description: 'Базовый курс игры на гитаре. Разучим 3 песни за одно занятие.',
        category: savedCats[1]._id,
        date: '2026-07-07',
        time: '16:00',
        maxParticipants: 10,
        image: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=600&h=400&fit=crop',
        createdAt: new Date(),
      },
      {
        title: 'Хип-хоп для начинающих',
        description: 'Введение в культуру хип-хопа. Изучим базовые движения.',
        category: savedCats[2]._id,
        date: '2026-07-10',
        time: '18:00',
        maxParticipants: 20,
        image: 'https://images.unsplash.com/photo-1535525153412-5a42439a210d?w=600&h=400&fit=crop',
        createdAt: new Date(),
      },
      {
        title: 'Python с нуля',
        description: 'Первая программа на Python. Научимся писать простые скрипты.',
        category: savedCats[3]._id,
        date: '2026-07-12',
        time: '12:00',
        maxParticipants: 12,
        image: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=600&h=400&fit=crop',
        createdAt: new Date(),
      },
      {
        title: 'Портрет на телефон',
        description: 'Секреты мобильной фотографии. Как делать профессиональные портреты.',
        category: savedCats[4]._id,
        date: '2026-07-15',
        time: '15:00',
        maxParticipants: 18,
        image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&h=400&fit=crop',
        createdAt: new Date(),
      },
      {
        title: 'Татарская кухня',
        description: 'Готовим эчпочмак и кыстыбый. Традиционные рецепты.',
        category: savedCats[5]._id,
        date: '2026-07-18',
        time: '11:00',
        maxParticipants: 8,
        image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&h=400&fit=crop',
        createdAt: new Date(),
      },
    ];
    await db.masterclasses.insert(masterclasses);

    const passwordHash = await bcrypt.hash('admin123', 10);
    await db.users.insert({
      username: 'admin',
      password: passwordHash,
      role: 'admin',
    });

    console.log('БД инициализирована: 6 мастер-классов, 6 категорий, 1 админ');
  } else {
    const categoryUpdates = [
      { name: 'Рисование', image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=600&h=400&fit=crop' },
      { name: 'Музыка', image: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=600&h=400&fit=crop' },
      { name: 'Танцы', image: 'https://images.unsplash.com/photo-1547153760-18fc86c3be8e?w=600&h=400&fit=crop' },
      { name: 'Программирование', image: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600&h=400&fit=crop' },
      { name: 'Фотография', image: 'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=600&h=400&fit=crop' },
      { name: 'Кулинария', image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&h=400&fit=crop' },
    ];
    for (const u of categoryUpdates) {
      await db.categories.update({ name: u.name }, { $set: { image: u.image } });
    }

    const mcUpdates = [
      { title: 'Акварельный пейзаж', image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=600&h=400&fit=crop' },
      { title: 'Гитара для начинающих', image: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=600&h=400&fit=crop' },
      { title: 'Хип-хоп для начинающих', image: 'https://images.unsplash.com/photo-1535525153412-5a42439a210d?w=600&h=400&fit=crop' },
      { title: 'Python с нуля', image: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=600&h=400&fit=crop' },
      { title: 'Портрет на телефон', image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&h=400&fit=crop' },
      { title: 'Татарская кухня', image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&h=400&fit=crop' },
    ];
    for (const u of mcUpdates) {
      await db.masterclasses.update({ title: u.title }, { $set: { image: u.image } });
    }

    const hipHopLegacy = await db.masterclasses.findOne({ title: 'Хип-хоп基础' });
    if (hipHopLegacy) {
      await db.masterclasses.update({ _id: hipHopLegacy._id }, { $set: {
        title: 'Хип-хоп для начинающих',
        image: 'https://images.unsplash.com/photo-1535525153412-5a42439a210d?w=600&h=400&fit=crop',
      }});
    }

    console.log('БД обновлена: изображения заменены');
  }
}

module.exports = { db, seed };
