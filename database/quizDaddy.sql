drop database if exists heap;
create database heap;
use heap;
DROP TABLE IF EXISTS History;
DROP TABLE IF EXISTS `Option`;
DROP TABLE IF EXISTS Question;
DROP TABLE IF EXISTS Quiz;
DROP TABLE IF EXISTS User;
DROP TABLE IF EXISTS File;

-- Creating the User table
CREATE TABLE User (
    Email VARCHAR(100) PRIMARY KEY,
    HashedPassword VARCHAR(100) NOT NULL,
    FirstName VARCHAR(100),
    LastName VARCHAR(100),
    Gender CHAR(1),
    DateJoined DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE File (
    URL VARCHAR(100) PRIMARY KEY,
    FileName VARCHAR(100),
    UserEmail VARCHAR(100) NOT NULL,
    FOREIGN KEY (UserEmail) REFERENCES User(Email) ON DELETE CASCADE
);

-- Creating the Quiz table
CREATE TABLE Quiz (
    UserEmail VARCHAR(100) NOT NULL,
    QuizID INT,
    Difficulty CHAR(1), 
    DateCreated DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (UserEmail, QuizID),
    FOREIGN KEY (UserEmail) REFERENCES User(Email) ON DELETE CASCADE
);


CREATE TABLE Question (
	UserEmail VARCHAR(100) NOT NULL,
    QuizID INT NOT NULL,
    QuestionNo INT NOT NULL,
    QuestionText VARCHAR(255) NOT NULL,
    Elaboration VARCHAR(255),
    PRIMARY KEY (UserEmail, QuizID, QuestionNo),
    FOREIGN KEY (UserEmail, QuizID) REFERENCES Quiz(UserEmail, QuizID) ON DELETE CASCADE
);

CREATE TABLE `Option` (
    UserEmail VARCHAR(100) NOT NULL,
    QuizID INT NOT NULL,
    QuestionNo INT NOT NULL,
    OptionLetter CHAR(1) NOT NULL,
    OptionText TEXT NOT NULL,
    IsCorrect BOOLEAN NOT NULL,
    PRIMARY KEY (UserEmail, QuizID, QuestionNo, OptionLetter),
    FOREIGN KEY (UserEmail, QuizID, QuestionNo) REFERENCES Question(UserEmail, QuizID, QuestionNo) ON DELETE CASCADE
);

CREATE TABLE History (
    Email VARCHAR(100) NOT NULL,
    DateTime DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
    QuizID INT NOT NULL,
    QuestionNo INT NOT NULL,
    UserChoice CHAR(1),
    IsCorrect BOOLEAN,
    PRIMARY KEY (Email, DateTime)
);

# SAMPLE DATA TO TEST USER AUTHENTICATION
insert into user (Email, HashedPassword, FirstName, LastName, Gender) values ('alice@gmail.com', 'alice1', 'Alice', 'Tan', 'F');
insert into user (Email, HashedPassword, FirstName, LastName, Gender) values ('bob@hotmail.com', 'bob1', 'Bob', 'Lim', 'M');