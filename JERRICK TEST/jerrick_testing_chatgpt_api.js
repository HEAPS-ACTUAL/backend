// FILE FOR ME TO TEST THE CHATGPT API

async function getCurrentDateTime() {
  const response = await fetch(
    "http://worldtimeapi.org/api/timezone/Asia/Singapore"
  ); // API to get the current time
  console.log(response);

  const data = await response.json();
  const currentDateTime = data.datetime;

  const currentDate = currentDateTime.slice(0, 10);
  const currentTime = currentDateTime.slice(11, 19);
  console.log(`Today's date: ${currentDate}`);
  console.log(`The time now is ${currentTime}`);
}

getCurrentDateTime();

const openAI = require("openai");
require("dotenv").config({ path: "../.env" });

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
};

const chatgpt = new openAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function chatRequest() {
  try {
    const message = "What is 2 + 2?";
    const response = await chatgpt.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: message }],
      temperature: 0,
      max_tokens: 1000,
    });

    console.log(response.choices);
  } catch (error) {
    console.log(`ERROR: ${error}`);
  }
}

chatRequest();
