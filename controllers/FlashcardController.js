const query = require('../utils/PromisifyQuery');

export async function getFlashcardsWithoutSchedule(email){
    try {
        const sqlQuery = 'Select ';
        const insertOk = await query(sqlQuery, [testID, difficulty]);

        if (insertOk) {
            console.log('Quiz has been added into database!');
        }
    }
    catch (error) {
        const msg = `Error adding quiz into database`
        console.error(`${msg}: ${error.message}`);
        throw new Error(`${msg}`);
    }
}