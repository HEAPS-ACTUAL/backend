function hello(x){
    try{    
        if(x == 6){
            throw new Error('x cannot be 6')
        }
        console.log(x);
        return x;
    }
    catch(error){
        // console.error(error.message);
        throw error;
    }
}

function byebye(y){
    try{
        if(y == 10){
            throw new Error('y cannot be 10');
        }

        const result = hello(6) + y;
        console.log(result);
    }
    catch(error){
        console.error(error.message);
    }
}

byebye(9);