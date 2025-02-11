# 8055169966:AAEbq0i3_uMFsMR0fTDorQ6Fo_OnJEvjGPk

import telebot
from telebot import types

TOKEN = '8055169966:AAEbq0i3_uMFsMR0fTDorQ6Fo_OnJEvjGPk'
bot=telebot.TeleBot(TOKEN)


@bot.message_handler(commands=['start'])
def start(message):
    keyboard = types.InlineKeyboardMarkup()
    web_app_info = types.WebAppInfo(url="https://abilka.vercel.app/")
    button = types.InlineKeyboardButton(text="Открыть интерфейс", web_app=web_app_info)
    keyboard.add(button)

    bot.send_message(message.chat.id, "Нажмите кнопку для работы с приложением:", reply_markup=keyboard)


bot.infinity_polling()