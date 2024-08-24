DROP DATABASE IF EXISTS heap;
CREATE DATABASE heap;
USE heap;

-- Creating the User table
CREATE TABLE User (
    Email VARCHAR(255) PRIMARY KEY,
    HashedPassword VARCHAR(255) NOT NULL,
    FirstName VARCHAR(255),
    LastName VARCHAR(255),
    Gender CHAR(1),
    DateTimeJoined DATETIME DEFAULT CURRENT_TIMESTAMP,
    IsVerified BOOLEAN DEFAULT FALSE,
    AccessCode VARCHAR(255)
);

-- Creating the Schedule table
CREATE TABLE Schedule (
    ScheduleID INT PRIMARY KEY,
    StartDate DATE NOT NULL,
    EndDate DATE,
    ExamName VARCHAR(255),
    ExamColour VARCHAR(255)
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
    Email VARCHAR(255) NOT NULL,
    TestID INT PRIMARY KEY,
    TestName VARCHAR(255),
    DateTimeCreated DATETIME DEFAULT CURRENT_TIMESTAMP,
    TestType CHAR(1),
    ScheduleID INT,
    FOREIGN KEY (Email) REFERENCES User(Email) ON DELETE CASCADE,
    FOREIGN KEY (ScheduleID) REFERENCES Schedule(ScheduleID)
);

-- Creating the Quiz table
CREATE TABLE Quiz (
    TestID INT PRIMARY KEY,
    Difficulty VARCHAR(255),
    IsDone BOOLEAN DEFAULT false,
    FOREIGN KEY (TestID) REFERENCES Test(TestID) ON DELETE CASCADE
);

-- Creating the Question table
CREATE TABLE Question (
    TestID INT NOT NULL,
    QuestionNo INT NOT NULL,
    QuestionText TEXT NOT NULL,
    Elaboration TEXT,
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
create procedure getTestInfo(in input_email varchar(255), in input_test_type char(1), in input_test_status boolean)
begin
	if (input_test_type = 'Q') then
		if (input_test_status = true) then
			select t1.*, json_arrayagg(json_object("AttemptNo", us.AttemptNo, "NumOfCorrectAnswers", us.NumOfCorrectAnswers)) as Attempts from 
				(select t.TestID, t.TestName, t.DateTimeCreated, q.Difficulty, count(*) as numOfQuestions 
					from Test t, Quiz q, Question qn 
					where (t.TestID = q.TestID) and (t.testID = qn.TestID) and (Email = input_email) and (IsDone = input_test_status) group by t.TestID,t.TestName, t.DateTimeCreated, q.Difficulty
				) t1,
				UserQuizScores us where (t1.TestID = us.TestID)
                group by TestID;
		elseif (input_test_status = false) then
			select t.TestID, t.TestName, t.DateTimeCreated, q.Difficulty, count(*) as numOfQuestions 
				from Test t, Quiz q, Question qn 
				where (t.TestID = q.TestID) and (t.testID = qn.TestID) and (Email = input_email) and (IsDone = input_test_status) group by t.TestID, t.TestName, t.DateTimeCreated, q.Difficulty;
        end if;
    elseif (input_test_type = 'F') then
		select t.TestID, t.TestName, t.DateTimeCreated, count(*) as numOfQuestions 
			from Test t, Question qn 
			where (t.TestID = qn.TestID) and (Email = input_email) and (TestType = input_test_type) group by t.TestID, t.TestName, t.DateTimeCreated;
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
    
    select TestType into test_type from Test where TestID = input_test_id;

    if test_type = 'Q' then
		select qn.QuestionNo, qn.QuestionText, qn.Elaboration, json_arrayagg(json_object('OptionLetter', OptionLetter, 'OptionText', o.OptionText, 'IsCorrect', o.IsCorrect)) as 'Options' from Question qn, `Option` o where (qn.TestID = o.TestID) and (qn.QuestionNo = o.QuestionNo) and (qn.TestID = input_test_id) group by qn.QuestionNo, qn.QuestionText, qn.Elaboration, 'Options';
	elseif test_type = 'F' then
		select QuestionNo, QuestionText, Elaboration from Question where testID = input_test_id;
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
    
    call storeUserQuizScore(input_test_id, attempt_no); # PROCEDURE DEFINED BELOW
end $$
delimiter ;


delimiter $$
create procedure storeUserQuizScore(in input_test_id int, in input_attempt_no int)
begin
    declare num_of_correct_ans int;
        
	set num_of_correct_ans = (select count(*) from UserQuizAnswers ua, `Option` o where (ua.TestID = input_test_id) and (ua.AttemptNo = input_attempt_no) and (ua.TestID = o.TestID) and (ua.QuestionNo = o.QuestionNo) and (ua.UserChoice = o.OptionLetter) and (o.IsCorrect = true));
        
	insert into UserQuizScores (TestID, NumOfCorrectAnswers, AttemptNo) values (input_test_id, num_of_correct_ans, input_attempt_no);
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
	select * from
		(select t4.*, json_arrayagg(json_object("QuestionNo", t5.QuestionNo, "QuestionText", t5.QuestionText, "Elaboration", t5.Elaboration, "UserChoice", t5.UserChoice, "CorrectOption", t5.CorrectOption, "Options", t5.Options)) as QuestionsAndAnswers from 
			(select us.TestID, us.NumOfCorrectAnswers, count(qn.QuestionNo) as TotalNumOfQuestions from UserQuizScores us, Question qn 
				where (us.TestID = qn.TestID) and (us.TestID = input_test_id) and (us.AttemptNo = input_attempt_no) 
				group by us.TestID, us.NumOfCorrectAnswers
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
					where (TestID = input_test_id) group by TestID, QuestionNo
				) t3
				where (t2.QuestionNo = t3.QuestionNo)
			) t5
		group by t4.TestID, t4.NumOfCorrectAnswers, t4.TotalNumOfQuestions
        ) t6,
        (select json_arrayagg(json_object("AttemptNo", AttemptNo, "NumOfCorrectAnswers", NumOfCorrectAnswers)) as Attempts from UserQuizScores where TestID = input_test_id group by TestID
        ) t7;
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
    
    set current_largest_schedule_id = (select ScheduleID from Schedule order by ScheduleID desc limit 1);
    
    if isnull(current_largest_schedule_id) then
		set next_schedule_id = 1;
	else
		set next_schedule_id = current_largest_schedule_id + 1;
    end if;
end $$
delimiter ;

delimiter $$
create procedure addRevisionSchedule(in input_start_date date, in input_end_date date, in input_exam_name varchar(255), in input_exam_colour varchar(255), in array_of_test_IDs json, in array_of_dates json)
begin
	declare next_schedule_id int;
    declare counter int;
    declare length_of_array int;
    declare currentDate date;
    declare current_test_id int;
    
	call determineNextScheduleID(next_schedule_id); # PROCEDURE DEFINE ABOVE
    insert into Schedule (ScheduleID, StartDate, EndDate, ExamName, ExamColour) values (next_schedule_id, input_start_date, input_end_date, input_exam_name, input_exam_colour);
    
    set counter = 0;
    set length_of_array = json_length(array_of_dates);
    
    while counter < length_of_array do
		set currentDate = json_unquote(json_extract(array_of_dates, concat('$[', counter, ']')));
        insert into RevisionDates (ScheduleID, RevisionDate) values (next_schedule_id, currentDate);
        
        set counter = counter + 1;
    end while;
    
    set counter = 0;
    set length_of_array = json_length(array_of_test_IDs);
    
    while counter < length_of_array do
		set current_test_id = json_unquote(json_extract(array_of_test_IDs, concat('$[', counter, ']')));
        update Test set ScheduleID = next_schedule_id where TestID = current_test_id;
        
        set counter = counter + 1;
    end while;
end $$
delimiter ;

/* 
-----------------------------------------------------------------------------------------------------------------------
RETRIEVE REVISION DATES TO SHOW IN THE CALENDAR
-----------------------------------------------------------------------------------------------------------------------
*/
delimiter $$
create procedure retrieveAllRevisionDatesByUser(in input_email varchar(255))
begin
	select * from
		(select ScheduleID, json_arrayagg(json_object("TestID", TestID, "TestName", TestName)) as Flashcards from Test where Email = input_email and not isnull(ScheduleID) group by ScheduleID
		) t1,
		(select s.ScheduleID, convert(s.EndDate, char) as EndDate, s.ExamName, s.ExamColour, json_arrayagg(r.RevisionDate) as RevisionDates from Schedule s, RevisionDates r where (s.ScheduleID = r.ScheduleID) group by ScheduleID
		) t2
	where (t1.ScheduleID = t2.ScheduleID);
end $$
delimiter ;

/* 
-----------------------------------------------------------------------------------------------------------------------
DELETE ENTIRE REVISION SCHEDULE
-----------------------------------------------------------------------------------------------------------------------
*/
delimiter $$
create procedure deleteEntireSchedule(in input_schedule_id int)
begin
	update Test set ScheduleID = null where ScheduleID = input_schedule_id;
	delete from Schedule where ScheduleID = input_schedule_id;
end $$
delimiter ;

/* 
-----------------------------------------------------------------------------------------------------------------------
DELETE ONE REVISION DATE
-----------------------------------------------------------------------------------------------------------------------
*/
delimiter $$
create procedure deleteOneRevisionDate(in input_schedule_id int, in input_date date)
begin
	declare number_of_existing_dates int;
    
    set number_of_existing_dates = (select count(*) from RevisionDates where ScheduleID = input_schedule_id);
    
    if number_of_existing_dates = 1 then
		call deleteEntireSchedule(input_schedule_id); # PROCEDURE DEFINED ABOVE
    else 
		delete from RevisionDates where ScheduleID = input_schedule_id and RevisionDate = input_date;
    end if;
end $$
delimiter ;