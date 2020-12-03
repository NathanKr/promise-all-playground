console.log('app is loading ...');
const chalk = require('chalk');
const axios = require('axios');
const month = 11 , year = 2010;
const baseUrl = `https://api.ratesapi.io/api/${year}-${month}-`;

let startDt,endDt;
const days = 28;

function getCurrentTime(){
    return new Date();
}

function getRateGDB(response){
    const status = response.status;
    if(status == 200){
        const rates = response.data.rates
        const rateGDB =  rates['GBP'];
        return rateGDB;
    }
    else{
        throw `Error : unexpected status : ${status}`;
    }
}

async function computeSumRegular(){
    let sum = 0;
    for (let day = 1; day <= days; day++) {
        const response = await getPromiseResponse(day);
        // --- todo nath why is the following needed, is it like fetch ??
        const rateGDB = await getRateGDB(response);
        sum += rateGDB;
    }
    return sum;
}

function getPromiseResponse(day) {
    return axios.get(`${baseUrl}${day}`);
}

async function computeSumPromiseAll(){
    let promiseArray = [] , sum = 0;

    for (let day = 1; day <= days; day++) {
        promiseArray.push(getPromiseResponse(day))
    }

    let responses = await Promise.all(promiseArray);

    for (let index = 0; index < responses.length; index++) {
        const response = responses[index];
        const rateGDB = await getRateGDB(response);
        sum += rateGDB;
    }

    return sum;
}

async function runEngine(isRegular){
    try {
        startDt = getCurrentTime();
        sum = isRegular ? await computeSumRegular() : await computeSumPromiseAll()
        endDt = getCurrentTime();
        const diffMs = endDt.getTime() - startDt.getTime();
        console.log(`avarage GDB : ${(sum/days).toFixed(2)} , total compute time : ${diffMs} [ms]`);
        return diffMs;
    } catch (error) {
        console.error(error);
    }
    
}


async function run() {
    console.log(chalk.red('promise.all'));
    const diff2 = await runEngine(false);
    console.log(chalk.red('promise per call'));
    const diff1 = await runEngine(true);
    console.log(`promise.all is  ${Math.round(diff1/diff2)} faster than promise per call`);
}

run();