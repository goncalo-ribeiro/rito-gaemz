import { response } from "express";

const axios = require('axios');
const { EUW,  NA, KR, AMERICAS, ASIA, EUROPE } = require('../config');
const { key } = require('../secretconfig');

module.exports  = {
    getUnits,
    getProfile,
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

const totalPlayers: number = 5;//5
const totalMatches: number = 3;//3
const topPlayers: number = 4;

async function getUnits(serverNumber: number) {
    const server = getServer(serverNumber);
    const region = getRegion(serverNumber);
    let unitsMatrix: any = {};
    let units:any = {}
    try{
        // const totalPlayers = 1;
        // let totalMatches = 1;
        // const topPlayers = 4;

        //Retrieve the best challenger players
        let response = await axios.get('https://' + server + '/tft/league/v1/challenger?api_key=' + key);
        console.log('https://' + server + '/tft/league/v1/challenger?api_key=' + key)

        const challengers = response.data.entries;
        challengers.sort((a: any,b: any) => {
            return b.leaguePoints - a.leaguePoints;
        });
    
        //Analize top players matches asynchronous
        let topChallengers =  [...Array(totalPlayers)];
        await Promise.all(
            topChallengers.map((o, i) => getPlayerStatistics(topChallengers[i], challengers[i].summonerId, server, region))
        ).then(unitsUsed => {
            // all values from all the statistics
            units = mergeUnitsMatrix(unitsUsed);
        });

        let allTotalMatches:number = totalMatches*totalPlayers;

        const unitsArray: any = [];

        for(let key in units) {
            const items:Object[] = [];
            for(let itemKey in units[key].items) {
                items.push({id: itemKey, count: units[key].items[itemKey], percent: (units[key].items[itemKey]/units[key].top*100).toFixed(0) + '%'});
            }
            items.sort((a: any,b: any) => {
                return b.count - a.count;
            });
            units[key].items = items.slice(0, 3);
            units[key].win = (units[key].win/allTotalMatches*100).toFixed(2) + '%';
            units[key].top = (units[key].top/allTotalMatches*100).toFixed(2) + '%';
            units[key].unit = key;
            unitsArray.push(units[key]);
        }

        return {
            code: 202,
            data: {units: unitsArray, totalMatches},
        }
    } catch (error) {
        if(error.response.data.status.status_code === 403) {
            return {
                code: 403,
                data: 'Error',
            }
        }
        return {
            code: 400,
            data: 'Error',
        }
    }
}


async function getPlayerStatistics(topChallengers:Object, summonerId:String, server:String, region:String){
    return new Promise(async (resolve, reject) => {
            //Get summoner details
            let response = await axios.get('https://' + server + '/tft/summoner/v1/summoners/' + summonerId + '?api_key=' + key);
            //const summoner = {...challengers[0], ...response.data};
            const summoner = {...response.data};

            //Get summoner matches
            response = await axios.get('https://' + region + '/tft/match/v1/matches/by-puuid/' + summoner.puuid + '/ids?api_key=' + key);
            const matches = response.data;

            //Analize top players matches asynchronous
            let matchesPlayed =  [...Array(totalMatches)];
            await Promise.all(
                matchesPlayed.map((o, i) => getMatchesStatistics(matchesPlayed[i], matches[i], server, region))
            ).then(units => {   
                let newUnits = mergeUnitsMatrix(units)

                return resolve(newUnits);
            });
        });
}

async function getMatchesStatistics(match:any, matchId:String, server:String, region:String){
    return new Promise(async (resolve, reject) => {
        //Retrieve the info of all the players in the match
        let response = await axios.get('https://' + region + '/tft/match/v1/matches/' + matchId + '?api_key=' + key);
        const players = response.data.info.participants;

        players.sort((a: any,b: any) => {
            return a.placement - b.placement;
        });

        const matchTopUnits: string[] = [];
        const units: any = {};

        //Retrieve the info of the top players
        for(let j = 0; j < topPlayers; j++) {
            for(let k = 0; k < players[j].units.length; k++) {
                //if(players[j].units[k].items.length >= 2 && (players[j].units[k].tier === 3 || (players[j].units[k].tier === 2 && players[j].units[k].rarity >= 2))) { 
                const unit: string = players[j].units[k].character_id.split('TFT4_')[1];
                if(!units[unit]) {
                    units[unit] = {win: 0, top: 0, items: {}};
                }
                if(j === 0) {
                    units[unit].win++;
                }
                if(!matchTopUnits.includes(unit)) {
                    units[unit].top++;
                    matchTopUnits.push(unit);
                    for(let a = 0; a < players[j].units[k].items.length; a++) {
                        if(players[j].units[k].items[a] !== 999) {
                            units[unit].items[players[j].units[k].items[a]] = units[unit].items[players[j].units[k].items[a]] ? units[unit].items[players[j].units[k].items[a]] + 1 : 1;
                        }
                    }
                }
                //}
            }
        }
        return resolve(units);
    });
}

//Given a multi dimensional matrix of units, converts it into 1-D
function mergeUnitsMatrix(units){
    let newUnits = Object.assign({}, units[0]);
                
    for (let i=1; i<units.length; i++){
        for (var prop in newUnits) {
            //Checking if the champion already appeard in another match and combine results
            if (Object.prototype.hasOwnProperty.call(units[i], prop)) {
                let obj1 = newUnits[prop];
                let obj2 = (<Object>units[i])[prop];
                
                obj1.win = obj1.win + obj2.win;
                obj1.top = obj1.top + obj2.top;
                obj1.items = Object.assign(obj1.items, obj2.items);
            }
        }
        //Adding all the other champions that weren't found
        newUnits = Object.assign(units[i], newUnits)
    }

    return newUnits;
}

async function getProfile(serverNumber: number, summonerId: string) {
    const server = getServer(serverNumber);
    try{
        let response = await axios.get('https://' + server + '/tft/league/v1/entries/by-summoner/' + summonerId + '?api_key=' + key);
        return {
            code: 202,
            data: response.data.length > 0 ? response.data[0] : {tier: 'Unranked'},
        }
    } catch (error) {
        console.log(error);
        if(error.response.data.status.status_code === 403) {
            return {
                code: 403,
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