const axios = require('axios');
const { EUW,  NA, KR, AMERICAS, ASIA, EUROPE } = require('../config');
const { key } = require('../secretconfig');

module.exports  = {
    getSummoners,
}

function getServer(serverNumber: number) {
    switch(serverNumber) {
        case 0:
            return EUW;
        case 1:
            return NA;
        case 2:
            return KR;
        default:
            return null;
    }
}

function getRegion(serverNumber: number) {
    switch(serverNumber) {
        case 0:
            return EUROPE;
        case 1:
            return AMERICAS;
        case 2:
            return ASIA;
        default:
            return null;
    }
}

async function getSummoners(serverNumber: number, name:string) {
    const server = getServer(serverNumber);
    const region = getRegion(serverNumber);
    try{
        let rift = await axios.get('https://' + server + '/lol/summoner/v4/summoners/by-name/' + name + '?api_key=' + key);
        let tft = await axios.get('https://' + server + '/tft/summoner/v1/summoners/by-name/' + name + '?api_key=' + key);
        let lor = null;
        if((rift && rift.data && rift.data.puuid) || (tft && tft.data && tft.data.puuid)) {
            let riftRankeds = await axios.get('https://' + server + '/lol/league/v4/entries/by-summoner/' + rift.data.id + '?api_key=' + key);
            rift.data.rankeds = riftRankeds.data;
            lor = await axios.get('https://' + region + '/riot/account/v1/accounts/by-puuid/' + (rift.data.puuid ? rift.data.puuid : tft.data.puuid) + '?api_key=' + key);
        }
        return {
            code: 202,
            data: {rift: rift ? rift.data : null, tft: tft ? tft.data : null, lor: lor ? lor.data : null},
        }
    } catch (error) {
        console.log(error);
        if(error.response.data.status.status_code === 403) {
            return {
                code: 403,
                data: 'Error',
            }
        }
        if(error.response.data.status.status_code === 404) {
            return {
                code: 404,
                data: 'Error',
            }
        }
        return {
            code: 400,
            data: 'Error',
        }
    }
}

export {};