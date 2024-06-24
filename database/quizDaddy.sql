DROP DATABASE IF EXISTS heap2;
CREATE DATABASE heap2;
USE heap2;

DROP TABLE IF EXISTS User;
DROP TABLE IF EXISTS Schedule;
DROP TABLE IF EXISTS RevisionDates;
DROP TABLE IF EXISTS Test;
DROP TABLE IF EXISTS Quiz;
DROP TABLE IF EXISTS Question;
DROP TABLE IF EXISTS `Option`;
DROP TABLE IF EXISTS History;

-- Creating the User table
CREATE TABLE User (
    Email VARCHAR(100) PRIMARY KEY,
    HashedPassword VARCHAR(100) NOT NULL,
    FirstName VARCHAR(100),
    LastName VARCHAR(100),
    Gender CHAR(1),
    DateTimeJoined DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Creating the Schedule table with auto-increment ScheduleID
CREATE TABLE Schedule (
    ScheduleID INT AUTO_INCREMENT PRIMARY KEY,
    StartDate DATE NOT NULL,
    EndDate DATE NOT NULL,
    ExamName VARCHAR(100)
);

-- Creating the RevisionDates table
CREATE TABLE RevisionDates (
    ScheduleID INT NOT NULL,
    RevisionDate DATE NOT NULL,
    PRIMARY KEY (ScheduleID, RevisionDate),
    FOREIGN KEY (ScheduleID) REFERENCES Schedule(ScheduleID) ON DELETE CASCADE
);

-- Creating the Test table
CREATE TABLE Test (
    Email VARCHAR(100) NOT NULL,
    TestID INT PRIMARY KEY,
    TestName VARCHAR(100),
    DateTimeCreated DATETIME DEFAULT CURRENT_TIMESTAMP,
    TestType CHAR(1),
    ScheduleID INT,
    FOREIGN KEY (Email) REFERENCES User(Email) ON DELETE CASCADE,
    FOREIGN KEY (ScheduleID) REFERENCES Schedule(ScheduleID)
);

-- Creating the Quiz table
CREATE TABLE Quiz (
    TestID INT PRIMARY KEY,
    Difficulty VARCHAR(20),
    IsDone BOOLEAN DEFAULT false,
    FOREIGN KEY (TestID) REFERENCES Test(TestID) ON DELETE CASCADE
);

-- Creating the Question table
CREATE TABLE Question (
    TestID INT NOT NULL,
    QuestionNo INT NOT NULL,
    QuestionText VARCHAR(255) NOT NULL,
    Elaboration VARCHAR(255),
    PRIMARY KEY (TestID, QuestionNo),
    FOREIGN KEY (TestID) REFERENCES Test(TestID) ON DELETE CASCADE
);

-- Creating the Option table
CREATE TABLE `Option` (
    TestID INT NOT NULL,
    QuestionNo INT NOT NULL,
    OptionLetter CHAR(1) NOT NULL,
    OptionText TEXT NOT NULL,
    IsCorrect BOOLEAN NOT NULL,
    PRIMARY KEY (TestID, QuestionNo, OptionLetter),
    FOREIGN KEY (TestID, QuestionNo) REFERENCES Question(TestID, QuestionNo) ON DELETE CASCADE
);

-- Creating the UserQuizAnswers table
CREATE TABLE UserQuizAnswers (
    TestID INT NOT NULL,
    QuestionNo INT NOT NULL,
    UserChoice CHAR(1),
    AttemptNo INT NOT NULL,
    PRIMARY KEY (TestID, QuestionNo, AttemptNo),
    FOREIGN KEY (TestID) REFERENCES Question(TestID) ON DELETE CASCADE
);

CREATE TABLE UserQuizScores (
    TestID INT NOT NULL,
    NumOfCorrectAnswers INT NOT NULL,
    AttemptNo INT NOT NULL,
    DateTime DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
    PRIMARY KEY (TestID, AttemptNo),
    FOREIGN KEY (TestID) REFERENCES Quiz(TestID) ON DELETE CASCADE
);


# STORED PROCEDURES
/* 
-----------------------------------------------------------------------------------------------------------------------
TO DISPLAY THE TEST CARDS IN THE HOME PAGE
-----------------------------------------------------------------------------------------------------------------------
*/
delimiter $$
create procedure getTestInfo(in input_email varchar(100), in input_test_type char(1), in input_test_status boolean)
begin
	if input_test_type = 'Q' then
		select t.TestID, t.TestName, t.DateTimeCreated, q.Difficulty, count(*) as numOfQuestions from test t, quiz q, question qn where (t.TestID = q.TestID) and (t.testID = qn.TestID) and (Email = input_email) and (IsDone = input_test_status) group by t.TestID;
    elseif input_test_type = 'F' then
		select t.TestID, t.TestName, t.DateTimeCreated, count(*) as numOfQuestions from test t, question qn where (t.TestID = qn.TestID) and (Email = input_email) and (TestType = input_test_type) group by t.TestID;
    end if;
end $$
delimiter ;


/* 
-----------------------------------------------------------------------------------------------------------------------
TO GET ALL QUESTIONS FOR A FLASHCARD OR ALL QUESTIONS AND OPTIONS FOR A QUIZ 
-----------------------------------------------------------------------------------------------------------------------
*/
delimiter $$
create procedure getAllQuestionsAndOptionsForATest(in input_test_id int)
begin
	declare test_type char(1);
    
    select TestType into test_type from test where TestID = input_test_id;

    if test_type = 'Q' then
		select qn.QuestionNo, qn.QuestionText, qn.Elaboration, json_arrayagg(json_object('OptionLetter', OptionLetter, 'OptionText', o.OptionText, 'IsCorrect', o.IsCorrect)) as 'Options' from question qn, `option` o where (qn.TestID = o.TestID) and (qn.QuestionNo = o.QuestionNo) and (qn.TestID = input_test_id) group by qn.QuestionNo;
	elseif test_type = 'F' then
		select QuestionNo, QuestionText, Elaboration from question where testID = input_test_id;
    end if;
end $$
delimiter ;


/* 
-----------------------------------------------------------------------------------------------------------------------
TO STORE USER'S QUIZ ANSWERS IN THE DATABASE
-----------------------------------------------------------------------------------------------------------------------
*/
delimiter $$
create procedure storeUserQuizAnswers(in input_test_id int, in user_answers json)
begin
	declare attempt_no int;
	declare length_of_array int;
    declare counter int;
    declare current_question_no int;
    declare current_user_choice char(1);
    
    set attempt_no = (select count(*) from UserQuizScores where testID = input_test_id) + 1;
    
    set counter = 0;
    set length_of_array = (select json_length(user_answers));
    
    while counter < length_of_array do
		set current_question_no = json_extract(user_answers, concat('$[', counter, '].QuestionNo'));
        set current_user_choice = json_unquote(json_extract(user_answers, concat('$[', counter, '].UserChoice')));
		
        insert into UserQuizAnswers values (input_test_id, current_question_no, current_user_choice, attempt_no);
        
        set counter = counter + 1;
    end while;
end $$
delimiter ;


# TRIGGERS
/* 
-----------------------------------------------------------------------------------------------------------------------
INSERT USER'S QUIZ SCORE AFTER USER SUBMITS QUIZ
-----------------------------------------------------------------------------------------------------------------------
*/
delimiter $$
create trigger after_insert_UserQuizAnswers after insert on UserQuizAnswers for each row
begin 
    declare total_num_of_questions_in_quiz int;
    declare num_rows_added int;
    declare num_of_correct_ans int;
    
	set total_num_of_questions_in_quiz = (select count(*) from question where TestID = new.TestID);
    set num_rows_added = (select count(*) from UserQuizAnswers where TestID = new.TestID and AttemptNo = new.AttemptNo);
    
    if total_num_of_questions_in_quiz = num_rows_added then
		set num_of_correct_ans = (select count(*) from UserQuizAnswers ua, `option` o where (ua.AttemptNo = new.AttemptNo) and (ua.TestID = o.TestID) and (ua.QuestionNo = o.QuestionNo) and (ua.UserChoice = o.OptionLetter) and (o.IsCorrect = true));
        
        insert into UserQuizScores (TestID, NumOfCorrectAnswers, AttemptNo) values (new.TestID, num_of_correct_ans, new.AttemptNo);
    end if;
end $$
delimiter ;


# SAMPLE DATA TO TEST USER AUTHENTICATION
insert into user (Email, HashedPassword, FirstName, LastName, Gender) values ('alice@gmail.com', 'alice1', 'Alice', 'Tan', 'F');
insert into user (Email, HashedPassword, FirstName, LastName, Gender) values ('bob@hotmail.com', 'bob1', 'Bob', 'Lim', 'M');