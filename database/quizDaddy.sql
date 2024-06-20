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
    FOREIGN KEY (TestID) REFERENCES Test(TestID)
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

CREATE TABLE History (
    Email VARCHAR(100) NOT NULL,
    DateTime DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
    TestID INT NOT NULL,
    QuestionNo INT NOT NULL,
    UserChoice CHAR(1),
    IsCorrect BOOLEAN,
    PRIMARY KEY (Email, DateTime)
);

# SAMPLE DATA TO TEST USER AUTHENTICATION
insert into user (Email, HashedPassword, FirstName, LastName, Gender) values ('alice@gmail.com', 'alice1', 'Alice', 'Tan', 'F');
insert into user (Email, HashedPassword, FirstName, LastName, Gender) values ('bob@hotmail.com', 'bob1', 'Bob', 'Lim', 'M');