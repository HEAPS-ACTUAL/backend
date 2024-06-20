const query = require('../utils/PromisifyQuery');
const openAI = require('openai');
require('dotenv').config();


const extractedText = `
OFFICIAL JOSEPH PRINCE SERMON NOTES
Believe Right And Live Right
Sunday, 19 May 2024
These are notes on the sermon, Believe Right And Live Right, preached by Pastor Joseph Prince on Sunday, May 19, 2024, at The Star Performing Arts Centre, Singapore. We hope these sermon notes will be an encouragement to you!
This sermon will be available for free as a Gospel Partner episode on June 6, 2024. You can get access to this sermon now through a Gospel Partner subscription or simply purchase the sermon. Sign up here to receive exclusive access to a masterclass on sleep, Gospel Partner updates, and pastoral insights from Joseph Prince and his team.

Overview
We live under the new covenant of grace, not the old covenant of law.
What do the clauses of the new covenant of grace mean to you?
God no longer remembers your sins because Jesus bore them on the cross.
Believing in God's complete forgiveness is not a license to sin.
When you believe right, you will live right and walk out a victorious life in Christ!
We live under the new covenant of grace, not the old covenant of law
This sermon is a continuation of Pastor Prince's previous sermon, Busy Outside Restful Inside, and is part of the series on the blessings of the upper room.

Here, Pastor Prince once again pointed out how important it is for us to be established in the new covenant truths that our Lord shared in His Last Supper in the upper room. These new covenant truths will equip us to embrace and fully experience the freedom, blessings, and transformative power that our Lord's finished work can bring into our lives.

One of these new covenant truths that our Lord shared is on the gift of righteousness. In John 16:7-11, our Lord Jesus told His disciples that when He departed, He would send the Holy Spirit, and that the Holy Spirit would do 3 things:

a) He will convict those who do not believe in Jesus of their sin of unbelief.
b) He will convict us, believers, of our righteousness in Christ.
c) He will convict the devil of his judgment from God.

In this sermon, we will focus on the teaching of righteousness. Now, what does it mean for us to be righteous in Christ as believers today? First, we need to understand the differences between the old covenant of law and the new covenant of grace.

What do the clauses of the new covenant of grace mean to you?

Now that we are living under a new covenant, it is important for us to understand it well to walk in the abundant life that our Lord Jesus intended for us. So what is the new covenant and what are its clauses?

In Jeremiah 31, the prophet Jeremiah prophesied about the new covenant:

“For this is the covenant that I will make with the house of Israel after those days, declares the LORD: I will put my law within them, and I will write it on their hearts. And I will be their God, and they shall be my people. And no longer shall each one teach his neighbor and each his brother, saying, 'Know the LORD,' for they shall all know me, from the least of them to the greatest, declares the LORD. For I will forgive their iniquity, and I will remember their sin no more.” —Jeremiah 31:33-34 ESV

The new covenant, described in the scripture passage above, has three key clauses:

“I will put my law within them, and I will write it on their hearts.”
“I will be their God, and they shall be my people.”
“And no longer shall each one teach his neighbor and each his brother, saying, 'Know the LORD,' for they shall all know me, from the least of them to the greatest, declares the LORD. For I will forgive their iniquity, and I will remember their sin no more.”
God no longer remembers your sins because Jesus bore them on the cross

But Pastor Prince, if we are truly living under the new covenant, why is it that so many of us still struggle to know the Lord intimately, or receive His guidance? That is because there is one final main clause that activates all the above three clauses in the new covenant, and it behooves us to study it and be established in it.

“And the Holy Spirit also bears witness to us; for after saying, 'This is the covenant that I will make with them after those days, declares the Lord: I will put my laws on their hearts, and write them on their minds,' then he adds, 'I will remember their sins and their lawless deeds no more.'” —Hebrews 10:15-17 ESV

Many people are still struggling to walk in deep intimacy with the Lord or experience His guidance in their lives because they do not believe in the main clause of the new covenant that makes everything work—that our Father does not remember our sins anymore!

Believing in God's complete forgiveness is not a license to sin

First, we know and acknowledge that sin is evil. Pastor Prince and all of us at New Creation Church do not condone sin. A lifestyle of sin leads only to defeat and destruction, which is not God's heart for us. However, preaching the law will only strengthen our flesh (1 Cor. 15:56, Rom 6:14), causing us to live in bondage to sin.

That's why God found fault with the old covenant (Heb. 8:7), because it lacked the power to bring about true inward transformation. The law could only manage behavior modification.

When you believe right, you will live right and walk out a victorious life in Christ!

In this day and age, despite the advances in our world, people have never been more depressed, anxious, and bound by addictions of all kinds. Sadly, this includes believers still struggling to see breakthroughs in many areas of their lives and not walking out the victorious life that Christ has purchased for them.

Why is that so?

In Mark 2 where a paralytic was brought to Jesus for healing, we see our Lord first forgiving the man of his sins, and then asking him to arise, take up his bed, and go home. Notice how knowing he had been forgiven of his sins was critical to this man receiving his healing? This knowledge gave him victory over his sickness!

From this incident, we can see how important it is for us to grasp our complete forgiveness in Christ because it not only activates the new covenant, but also helps us live out our lives in Christ triumphantly. Beloved, if you are struggling in certain areas of your life and a breakthrough seems elusive... `



async function queryChatgptForTest(extractedText, testType, difficulty) {
    const chatgpt = new openAI({ apiKey: process.env.OPENAI_API_KEY });
    const numberOfQuestions = 12;
    const difficultyDict = { 'E': 'easy', 'M': 'intermediate', 'H': 'hard' };
    const difficultyString = difficultyDict[difficulty];
    promptType = {
        'F': `Based on the text above, generate a maximised number of Test questions. These questions should test how well I know the content of the given text. \n\n
        
        Use a variety of formats for the questions such as "Define this term", "Describe this process", “True or false”, “Fill in the blank”. There should also be an Elaboration. \n
        
        Generate JSON objects for the questions with fields: "QuestionNumber", "ActualQuestion", "Elaboration". \n
        
        Format your response exactly like this: \n
        {
        "QuestionNumber": ,
        "ActualQuestion": ,
        "Elaboration":
        }|||`,
        'Q': `Based on the text above, generate ${numberOfQuestions} questions. These questions should test how well I know the content of the given text. The difficulty level of the questions should be ${difficultyString}. \n\n
        
        The questions are multiple choice questions and each question should have 4 options (1 correct and 3 wrong). I also want a short elaboration on which option is correct. \n
        
        Generate JSON objects for the questions with fields: "QuestionNumber", "ActualQuestion", "Elaboration", "Options".
        "Options" is a list of JSON objects with fields: "Option", "IsCorrect?". \n
        
        Format your response exactly like this: \n
        {
        "QuestionNumber": ,
        "ActualQuestion": ,
        "Elaboration":
        "Options" : 
            [{
            "Option": , 
            "IsCorrect?": 
            }]
        }|||`
    };

    try {
        const query =
            `${extractedText} \n\n` + promptType[testType];
        

        const response = await chatgpt.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: query }],
            temperature: 0,
            max_tokens: 2000,
        })

        console.log(response.choices[0].finish_reason); // ensure that the generation of questions doesnt not stop prematurely
        const questions = response.choices[0].message.content;
        console.log(questions); // check the questions generated by chatgpt

        return questions;
    }
    catch (error) {
        const msg = `An error occurred while generating the Test questions`
        console.error(`${msg}: ${error.message}`);
        throw new Error(msg);
    }
}


async function test(){
    const result = await queryChatgptForTest(extractedText, "Q", "H");
    console.log(result);
}
test();
module.exports = extractedText;