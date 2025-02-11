import telebot
from telebot import types

from tgbaza import user_exists, get_user_by_telegram_id, user_with_auto_id_exists, register_user

TOKEN = '8055169966:AAEbq0i3_uMFsMR0fTDorQ6Fo_OnJEvjGPk'
bot = telebot.TeleBot(TOKEN)

@bot.message_handler(commands=['start'])
def start(message):
    telegram_id = message.from_user.id
    args = message.text.split()
    ref = None
    if len(args) > 1:
        param = args[1]
        if param.startswith("ref"):
            try:
                potential_ref = int(param[3:])
                if user_with_auto_id_exists(potential_ref):
                    ref = potential_ref
                else:
                    bot.send_message(message.chat.id, "Неверный реферальный код.")
            except ValueError:
                bot.send_message(message.chat.id, "Неверный формат реферального кода.")

    if not user_exists(telegram_id):
        new_id = register_user(telegram_id, ref)
        if ref:
            greeting = f"Добро пожаловать! Вы зарегистрированы как пользователь #{new_id}.\nВас пригласил пользователь #{ref}."
        else:
            greeting = f"Добро пожаловать! Вы зарегистрированы как пользователь #{new_id}."
    else:
        user = get_user_by_telegram_id(telegram_id)
        greeting = f"Добро пожаловать обратно! Ваш номер: #{user['id']}."

    keyboard = types.InlineKeyboardMarkup(row_width=1)
    web_app_info = types.WebAppInfo(url="https://abilka-nwfowqn9v-aleksandrs-projects-0b23b564.vercel.app")
    start_button = types.InlineKeyboardButton(text="Открыть сайт", web_app=web_app_info)
    ref_button = types.InlineKeyboardButton(text="Реферальная ссылка", callback_data="ref")
    keyboard.add(start_button, ref_button)

    bot.send_message(message.chat.id, greeting + "\nВыберите действие:", reply_markup=keyboard)

@bot.callback_query_handler(func=lambda call: call.data == "ref")
def send_referral_link(call):
    user = get_user_by_telegram_id(call.from_user.id)
    if user:
        my_id = user['id']
        bot_username = bot.get_me().username
        referral_url = f"https://t.me/{bot_username}?start=ref{my_id}"
        bot.send_message(call.message.chat.id,
                         f"Ваша реферальная ссылка (нажмите и удерживайте для копирования):\n{referral_url}")
    else:
        bot.send_message(call.message.chat.id, "Ошибка: Пользователь не зарегистрирован.")

bot.infinity_polling()
