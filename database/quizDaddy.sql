drop database if exists heap2;
create database heap2;
use heap2;   

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

CREATE TABLE Schedule (
	ScheduleID INT PRIMARY KEY,
    StartDate DATE NOT NULL,
    EndDate DATE NOT NULL,
    ExamName VARCHAR(100)
);

CREATE TABLE RevisionDates (
	ScheduleID INT NOT NULL,
    RevisionDate DATE NOT NULL,
    PRIMARY KEY (ScheduleID, RevisionDate),
    FOREIGN KEY (ScheduleID) REFERENCES Schedule(ScheduleID) ON DELETE CASCADE
);

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
    
CREATE TABLE Quiz (
	TestID INT PRIMARY KEY,
	Difficulty VARCHAR(20),
    IsDone BOOLEAN DEFAULT false,
    FOREIGN KEY (TestID) REFERENCES Test(TestID) ON DELETE CASCADE
);
							   
CREATE TABLE Question (
    TestID INT NOT NULL,
    QuestionNo INT NOT NULL,
    QuestionText VARCHAR(255) NOT NULL,
    Elaboration VARCHAR(255),
    PRIMARY KEY (TestID, QuestionNo),
    FOREIGN KEY (TestID) REFERENCES Test(TestID) ON DELETE CASCADE
);

CREATE TABLE `Option` (
    TestID INT NOT NULL,
    QuestionNo INT NOT NULL,
    OptionLetter CHAR(1) NOT NULL,
    OptionText TEXT NOT NULL,
    IsCorrect BOOLEAN NOT NULL,
    PRIMARY KEY (TestID, QuestionNo, OptionLetter),
    FOREIGN KEY (TestID, QuestionNo) REFERENCES Question(TestID, QuestionNo) ON DELETE CASCADE
);

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
    NumOfCorrectQuestions INT NOT NULL,
    AttemptNo INT NOT NULL,
    DateTime DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
    PRIMARY KEY (TestID, AttemptNo),
    FOREIGN KEY (TestID) REFERENCES Quiz(TestID) ON DELETE CASCADE
);

# STORED PROCEDURES
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

# SAMPLE DATA TO TEST USER AUTHENTICATION
insert into user (Email, HashedPassword, FirstName, LastName, Gender) values ('alice@gmail.com', 'alice1', 'Alice', 'Tan', 'F');
insert into user (Email, HashedPassword, FirstName, LastName, Gender) values ('bob@hotmail.com', 'bob1', 'Bob', 'Lim', 'M');