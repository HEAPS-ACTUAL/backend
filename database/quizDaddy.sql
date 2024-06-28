DROP DATABASE IF EXISTS heap2;
CREATE DATABASE heap2;
USE heap2;

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
    ScheduleID INT PRIMARY KEY,
    StartDate DATE NOT NULL,
    EndDate DATE,
    ExamName VARCHAR(100) -- does this ExamName correspond to the flashcard names?
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
	if (input_test_type = 'Q') then
		if (input_test_status = true) then
			select t1.*, json_arrayagg(json_object("AttemptNo", us.AttemptNo, "NumOfCorrectAnswers", us.NumOfCorrectAnswers)) as Attempts from 
				(select t.TestID, t.TestName, t.DateTimeCreated, q.Difficulty, count(*) as numOfQuestions 
					from test t, quiz q, question qn 
					where (t.TestID = q.TestID) and (t.testID = qn.TestID) and (Email = input_email) and (IsDone = input_test_status) group by t.TestID
				) t1,
				UserQuizScores us where (t1.TestID = us.TestID)
                group by TestID;
		elseif (input_test_status = false) then
			select t.TestID, t.TestName, t.DateTimeCreated, q.Difficulty, count(*) as numOfQuestions 
				from test t, quiz q, question qn 
				where (t.TestID = q.TestID) and (t.testID = qn.TestID) and (Email = input_email) and (IsDone = input_test_status) group by t.TestID;
        end if;
    elseif (input_test_type = 'F') then
		select t.TestID, t.TestName, t.DateTimeCreated, count(*) as numOfQuestions 
			from test t, question qn 
			where (t.TestID = qn.TestID) and (Email = input_email) and (TestType = input_test_type) group by t.TestID;
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


/* 
-----------------------------------------------------------------------------------------------------------------------
FOR THE QUIZ RESULTS PAGE
-----------------------------------------------------------------------------------------------------------------------
*/
delimiter $$
create procedure reviewQuiz(in input_test_id int, in input_attempt_no int)
begin
	select t4.*, json_arrayagg(json_object("QuestionNo", t5.QuestionNo, "QuestionText", t5.QuestionText, "Elaboration", t5.Elaboration, "UserChoice", t5.UserChoice, "CorrectOption", t5.CorrectOption, "Options", t5.Options)) as QuestionsAndAnswers from 
		(select us.TestID, us.NumOfCorrectAnswers, count(qn.QuestionNo) as TotalNumOfQuestions from UserQuizScores us, Question qn 
			where (us.TestID = qn.TestID) and (us.TestID = input_test_id) and (us.AttemptNo = input_attempt_no) 
			group by us.TestID
		) t4,
		(select t2.*, t3.Options from
			(select t1.*, o.OptionLetter as CorrectOption from 
				(select qn.*, ua.UserChoice from Question qn, UserQuizAnswers ua 
					where (qn.testID = ua.TestID) and (qn.QuestionNo = ua.QuestionNo) and (qn.TestID = input_test_id) and (ua.AttemptNo = input_attempt_no)
				) t1,
				`Option` o 
					where (t1.TestID = o.TestID) and (t1.QuestionNo = o.QuestionNo) and (o.IsCorrect = true)
			) t2,
			(select TestID, QuestionNo, json_arrayagg(json_object("OptionLetter", OptionLetter, "OptionText", OptionText)) as 'Options' from `Option` 
				where (TestID = input_test_id) group by QuestionNo
			) t3
			where (t2.QuestionNo = t3.QuestionNo)
		) t5
	group by t4.TestID;
end $$
delimiter ;

/* 
-----------------------------------------------------------------------------------------------------------------------
ADDING A REVISION SCHEDULE
-----------------------------------------------------------------------------------------------------------------------
*/
delimiter $$
create procedure determineNextScheduleID(out next_schedule_id int)
begin
	declare current_largest_schedule_id int;
    
    set current_largest_schedule_id = (select ScheduleID from schedule order by ScheduleID desc limit 1);
    
    if isnull(current_largest_schedule_id) then
		set next_schedule_id = 1;
	else
		set next_schedule_id = current_largest_schedule_id + 1;
    end if;
end $$
delimiter ;

delimiter $$
create procedure addRevisionSchedule(in input_start_date date, in input_end_date date, in input_exam_name varchar(100), in array_of_dates json)
begin
	declare next_schedule_id int;
    declare counter int;
    declare length_of_array int;
    declare currentDate date;
    
	call determineNextScheduleID(next_schedule_id); # PROCEDURE DEFINE ABOVE
    insert into Schedule (ScheduleID, StartDate, EndDate, ExamName) values (next_schedule_id, input_start_date, input_end_date, input_exam_name);
    
    set counter = 0;
    set length_of_array = json_length(array_of_dates);
    
    while counter < length_of_array do
		set currentDate = json_unquote(json_extract(array_of_dates, concat('$[', counter, ']')));
        insert into RevisionDates (ScheduleID, RevisionDate) values (next_schedule_id, currentDate);
        
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
		set num_of_correct_ans = (select count(*) from UserQuizAnswers ua, `option` o where (ua.TestID = new.TestID) and (ua.AttemptNo = new.AttemptNo) and (ua.TestID = o.TestID) and (ua.QuestionNo = o.QuestionNo) and (ua.UserChoice = o.OptionLetter) and (o.IsCorrect = true));
        
        insert into UserQuizScores (TestID, NumOfCorrectAnswers, AttemptNo) values (new.TestID, num_of_correct_ans, new.AttemptNo);
    end if;
end $$
delimiter ;