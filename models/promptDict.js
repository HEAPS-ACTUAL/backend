const promptDict = {
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

module.exports = promptDict;
