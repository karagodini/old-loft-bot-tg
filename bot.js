const TelegramBot = require('node-telegram-bot-api');
///////////////////////////////////////////////////////////

const axios = require('axios');

// Замените на ваши данные из AmoCRM
const secretKey = 'akjqdu3yhgeEKPfbfyobgNjOow0yMmjZr5raSq3olAdWFXEXQyAteVTxvtnJlUS0';
const integrationId = 'de261286-e480-45aa-901f-362d3ca9f2e9';
const authCode = 'def5020057a78839c32f7dab294a17fedd8c4306593e1f3a09a54605af72bcc4124ab05904a0a6c74abe6b4ae132ad7b3d4058219d682d7dad88e2797d6ab9340562368a3b6fe9a8262f1565cf191ac0451b2e260e9d556e4e25900733193a854cee384c95fc4b73ac4d774df3b561e7c0e2a7c6bf6ffca1ffd71589849fba3cbaccd92f4a699b7a664038cdcad355e82a9b0e734eb0f28e01b4f11bf0975ee7169bc0c4a4114f65e539140b0f013d61c0df44be5d0d0b1f0fcc3f5cd5d83ce1d0bf97187aad9fa72ea4b4de18ba8ef82fd98526185ef2ebe890c8c6de6dccb917eac361bce7f4f82c2f523ee3bc25dfdd2c5dd64f5849151ea0e451035864622596f9d0d9772d4ff0d61b657a9e3b5610d7da539f7bd43f0af8db688ed12f4098db5d1d11336960e33bda515e9e5ecffd3e13fbaeeda73d84a0dc6f2546e29122d6107a5c503aec7ee61408fe74a984ef731747bbf3c1023f66f3bdd8f564271513304425befb9d7aea8bf8206db88e20eba48a9db7c93e928cee912fe0b826ffabf97fcca4ab78b926472885992de16804d83960450a85cb93f548538e0034d113add9ad5529300510e32a0e4292f1c4736eecf8fc9b30b385d120f44f04c67eae21268a3c35052043d8f008c748ce8869361102cb1fbffaf88981bc6cb23c41cc7472822c';

const apiUrl = 'https://oldloft1.amocrm.ru/api/v4/leads';

// Функция для создания сделки
async function createDeal() {
  try {
    // Аутентификация и получение токена доступа
    const authResponse = await axios.post('https://oldloft1.amocrm.ru/oauth2/access_token', {
      client_id: integrationId,
      client_secret: secretKey,
      grant_type: '',
      code: authCode,
      redirect_uri: 'https://old-loft.com/', // Замените на ваш redirect_uri
    });

    const accessToken = authResponse.data.access_token;

    // Проверка существования сделки с таким заголовком
    const existingDealsResponse = await axios.get(apiUrl, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
      params: {
        filter: {
          title: dealTitle, // Заголовок сделки
        },
      },
    });

    if (existingDealsResponse.data.total === 0) {
      // Сделки с таким заголовком нет, создаем новую
      const dealData = {
        title: 'Новая сделка', // Замените на нужный заголовок
      };

      const createDealResponse = await axios.post(apiUrl, dealData, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      console.log('Создана новая сделка (ID):', createDealResponse.data.id);
    } else {
      // Сделка с таким заголовком уже существует
      console.log('Сделка с таким заголовком уже существует.');
    }
  } catch (error) {
    console.error('Ошибка при создании сделки:', error.response ? error.response.data : error.message);
  }
}

// Вызываем функцию создания сделки после нажатия кнопки /start
createDeal();
////////////////////////////////////////////////////////////////////////

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

