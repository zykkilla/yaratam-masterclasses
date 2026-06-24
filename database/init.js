const Datastore = require('nedb-promises');
const bcrypt = require('bcryptjs');
const path = require('path');

const dataDir = path.join(__dirname, '..', 'data');

const db = {
  masterclasses: Datastore.create({ filename: path.join(dataDir, 'masterclasses.db'), autoload: true }),
  categories: Datastore.create({ filename: path.join(dataDir, 'categories.db'), autoload: true }),
  registrations: Datastore.create({ filename: path.join(dataDir, 'registrations.db'), autoload: true }),
  users: Datastore.create({ filename: path.join(dataDir, 'users.db'), autoload: true }),
};

async function seed() {
  const catCount = await db.categories.count({});
  if (catCount > 0) return;

  const categories = [
    { name: 'Рисование' },
    { name: 'Музыка' },
    { name: 'Танцы' },
    { name: 'Программирование' },
    { name: 'Фотография' },
    { name: 'Кулинария' },
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
      image: '/img/painting.jpg',
      createdAt: new Date(),
    },
    {
      title: 'Гитара для начинающих',
      description: 'Базовый курс игры на гитаре. Разучим 3 песни за одно занятие.',
      category: savedCats[1]._id,
      date: '2026-07-07',
      time: '16:00',
      maxParticipants: 10,
      image: '/img/guitar.jpg',
      createdAt: new Date(),
    },
    {
      title: 'Хип-хоп基礎',
      description: 'Введение в культуру хип-хопа. Изучим базовые движения.',
      category: savedCats[2]._id,
      date: '2026-07-10',
      time: '18:00',
      maxParticipants: 20,
      image: '/img/dance.jpg',
      createdAt: new Date(),
    },
    {
      title: 'Python с нуля',
      description: 'Первая программа на Python. Научимся писать простые скрипты.',
      category: savedCats[3]._id,
      date: '2026-07-12',
      time: '12:00',
      maxParticipants: 12,
      image: '/img/python.jpg',
      createdAt: new Date(),
    },
    {
      title: 'Портрет на телефон',
      description: 'Секреты мобильной фотографии. Как делать профессиональные портреты.',
      category: savedCats[4]._id,
      date: '2026-07-15',
      time: '15:00',
      maxParticipants: 18,
      image: '/img/photo.jpg',
      createdAt: new Date(),
    },
    {
      title: 'Татарская кухня',
      description: 'Готовим эчпочмак и кыстыбый. Традиционные рецепты.',
      category: savedCats[5]._id,
      date: '2026-07-18',
      time: '11:00',
      maxParticipants: 8,
      image: '/img/cooking.jpg',
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
}

module.exports = { db, seed };
