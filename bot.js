const TelegramBot = require('node-telegram-bot-api');

// Замените 'YOUR_BOT_TOKEN' на токен вашего бота
const token = '6310974899:AAF8PNb3wRcx-chBCPu63SHcdakPLaGefZI';

const bot = new TelegramBot(token, { polling: true });

// Обработчик команды /start
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const username = msg.from.username; // Получаем username клиента (если он указан)


  // Создаем уникальный идентификатор для чата с клиентом
  const chatKey = `${userId}_${chatId}`;

  // Проверяем, если чат уже начат
  if (chatState[chatKey]) {
    bot.sendMessage(chatId, `Вы уже начали чат. Менеджер свяжется с вами в ближайшее время.`);
  } else {
    // Начинаем чат с клиентом
    chatState[chatKey] = { userId, chatId, username };
    const userIdentifier = username ? `@${username}` : `ID ${userId}`;
    bot.sendMessage(chatId, `Вы начали чат. Менеджер свяжется с вами в ближайшее время.`);

    // Уведомляем менеджера о начале чата с клиентом
    const managerChatId = '486319246'; // Замените на ID менеджера
    bot.sendMessage(managerChatId, `Начат чат с клиентом ${userIdentifier}.`);
  }
});

// Обработчик всех остальных сообщений
bot.on('text', (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const chatKey = `${userId}_${chatId}`;

  if (chatState[chatKey] && chatState[chatKey].userId === userId) {
    // Отправляем сообщение от клиента менеджеру
    const managerChatId = '486319246'; // Замените на ID менеджера
    const userIdentifier = chatState[chatKey].username || `ID ${userId}`;
    bot.sendMessage(managerChatId, `Сообщение от клиента ${userIdentifier}:\n${msg.text}`);
    
    // Отвечаем клиенту от имени бота
    bot.sendMessage(chatId, 'Спасибо за ваше сообщение! Менеджер свяжется с вами в ближайшее время.');
  }
});

// Хранилище данных о текущем состоянии чатов
const chatState = {};

console.log('Бот запущен');
