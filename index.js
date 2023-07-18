const express = require("express");
const Telegram = require('node-telegram-bot-api');
const { Configuration, OpenAIApi } = require("openai");
require('dotenv').config();
const port = process.env.PORT || 8080;
const app = express();


const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

const bot = new Telegram(process.env.TELEGRAM_API_KEY, { polling: true });

// Create an object to store user message count
const userMessageCount = {};

// Set the maximum allowed messages per day
const maxMessagesPerDay = 10;

bot.on('message', async (msg) => {
    try {
        const chatId = msg.chat.id;
        const text = msg.text;

        // Initialize message count for the user if it doesn't exist
        if (!userMessageCount[chatId]) {
            userMessageCount[chatId] = {
                count: 0,
                lastUpdate: new Date().getUTCDate(),
            };
        }

        // Check if it's a new day, reset message count if it is
        const currentDate = new Date().getUTCDate();
        if (currentDate !== userMessageCount[chatId].lastUpdate) {
            userMessageCount[chatId].count = 0;
            userMessageCount[chatId].lastUpdate = currentDate;
        }

        // Check if the user has reached the maximum allowed messages for the day
        if (userMessageCount[chatId].count >= maxMessagesPerDay) {
            bot.sendMessage(chatId, `Sorry, you have reached the maximum allowed messages per day (${maxMessagesPerDay}).`);
            return;
        }

        // Increment the message count for the user
        userMessageCount[chatId].count++;

        // Process the user's message
        const reply = await openai.createCompletion({
            model: "text-davinci-003",
            prompt: `${text}.`,
            max_tokens: 100,
            temperature: 0,
        })

        bot.sendMessage(chatId, reply.data.choices[0].text);
        // console.log(reply.data.choices[0].text);
    } catch (error) {
        console.log(error);
    }
})


const configuration2 = new Configuration({
    apiKey: process.env.OPENAI2_API_KEY,
});

const openai2 = new OpenAIApi(configuration2);

const bot2 = new Telegram(process.env.TELEGRAM2_API_KEY, { polling: true });

bot2.on('message', async (msg) => {
    try {
        const chatId = msg.chat.id;
        const text = msg.text;

        const reply = await openai2.createImage({
            prompt: `${text}`,
            n: 1,
            size: "1024x1024",
        });

        // Extract the generated image URL from the API response
        const imageUrl = reply.data.data[0].url;
        // console.log(reply);

        // Send the image to the user
        bot2.sendPhoto(chatId, imageUrl);
    } catch (error) {
        console.log(error.message);
    }
})




// Start the server
app.listen(port, () => console.log(`Server started on port ${port}`));