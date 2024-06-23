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
    DateTime DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
    PRIMARY KEY (TestID, QuestionNo, AttemptNo)
);

-- Stored Procedures
DELIMITER $$

CREATE PROCEDURE getTestInfo(
    IN input_email VARCHAR(100),
    IN input_test_type CHAR(1),
    IN input_test_status BOOLEAN
)
BEGIN
    IF input_test_type = 'Q' THEN
        SELECT t.TestID, t.TestName, t.DateTimeCreated, q.Difficulty, COUNT(*) AS numOfQuestions
        FROM Test t
        JOIN Quiz q ON t.TestID = q.TestID
        JOIN Question qn ON t.TestID = qn.TestID
        WHERE Email = input_email AND IsDone = input_test_status
        GROUP BY t.TestID;
    ELSEIF input_test_type = '
