// FILE FOR ME TO TEST THE CHATGPT API

async function getCurrentDateTime(){
    const response = await fetch("http://worldtimeapi.org/api/timezone/Asia/Singapore"); // API to get the current time
    // console.log(response);

    const data = await response.json();
    const currentDateTime = data.datetime;
    
    const currentDate = currentDateTime.slice(0,10);
    const currentTime = currentDateTime.slice(11, 19);
    console.log(`Today's date: ${currentDate}`);
    console.log(`The time now is ${currentTime}`);
}

getCurrentDateTime();