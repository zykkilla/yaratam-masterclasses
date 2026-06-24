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
      { name: 'Рисование', image: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=600&h=400&fit=crop' },
      { name: 'Музыка', image: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=600&h=400&fit=crop' },
      { name: 'Танцы', image: 'https://images.unsplash.com/photo-1508700929628-666bc8bd84ea?w=600&h=400&fit=crop' },
      { name: 'Программирование', image: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600&h=400&fit=crop' },
      { name: 'Фотография', image: 'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=600&h=400&fit=crop' },
      { name: 'Кулинария', image: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=600&h=400&fit=crop' },
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
        image: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=600&h=400&fit=crop',
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
        image: 'https://images.unsplash.com/photo-1547153760-18fc86c3be8e?w=600&h=400&fit=crop',
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
        image: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=600&h=400&fit=crop',
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
    const imageMap = {
      'Рисование': 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=600&h=400&fit=crop',
      'Музыка': 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=600&h=400&fit=crop',
      'Танцы': 'https://images.unsplash.com/photo-1508700929628-666bc8bd84ea?w=600&h=400&fit=crop',
      'Программирование': 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600&h=400&fit=crop',
      'Фотография': 'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=600&h=400&fit=crop',
      'Кулинария': 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=600&h=400&fit=crop',
    };
    const mcImageMap = {
      'Акварельный пейзаж': 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=600&h=400&fit=crop',
      'Гитара для начинающих': 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=600&h=400&fit=crop',
      'Хип-хоп для начинающих': 'https://images.unsplash.com/photo-1547153760-18fc86c3be8e?w=600&h=400&fit=crop',
      'Хип-хоп基础': 'https://images.unsplash.com/photo-1547153760-18fc86c3be8e?w=600&h=400&fit=crop',
      'Python с нуля': 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=600&h=400&fit=crop',
      'Портрет на телефон': 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&h=400&fit=crop',
      'Татарская кухня': 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=600&h=400&fit=crop',
    };

    const categories = await db.categories.find({});
    for (const cat of categories) {
      if (imageMap[cat.name] && !cat.image) {
        await db.categories.update({ _id: cat._id }, { $set: { image: imageMap[cat.name] } });
      }
    }

    const masterclasses = await db.masterclasses.find({});
    for (const mc of masterclasses) {
      const newImage = mcImageMap[mc.title];
      const newTitle = mc.title === 'Хип-хоп基础' ? 'Хип-хоп для начинающих' : null;
      const updates = {};
      if (newImage && (!mc.image || mc.image.startsWith('/img/'))) updates.image = newImage;
      if (newTitle) updates.title = newTitle;
      if (Object.keys(updates).length > 0) {
        await db.masterclasses.update({ _id: mc._id }, { $set: updates });
      }
    }

    console.log('БД обновлена: добавлены изображения');
  }
}

module.exports = { db, seed };
