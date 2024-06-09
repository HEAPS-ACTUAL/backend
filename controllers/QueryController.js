const OpenAI = require("openai");
const textStore = require("../models/TextStore");
require("dotenv").config("../.env");

class QueryController {
    constructor() {
        this.openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });
    }

    async handleQuery(req, res) {
        const { id, numberOfQuestions } = req.body; // Assume 'id' is the filename used to save the text and number of questions to generate
        const text = textStore.getText(id);

        if (!text) {
            return res.status(404).json({ message: "Text not found." });
        }

        try {
            const response = await this.openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [
                    {
                        role: "system",
                        content:
                            "You are a helpful assistant that generates questions from a given text.",
                    },
                    {
                        role: "user",
                        content: `Generate ${numberOfQuestions} questions based on the following text:\n\n${text}`,
                    },
                ],
                max_tokens: 500,
            });

            res.json({ questions: response.choices[0].message.content });
        }
        catch (error) {
            console.error(`ERROR: ${error}`);
            res.status(500).send(`Failed to generate questions: ${error.message}`);
        }
    }
}

module.exports = new QueryController();
