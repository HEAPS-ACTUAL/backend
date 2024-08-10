DROP PROCEDURE IF EXISTS getAllQuestionsAndOptionsForATest;
DROP PROCEDURE IF EXISTS getTestInfo;
DROP PROCEDURE IF EXISTS reviewQuiz;

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
