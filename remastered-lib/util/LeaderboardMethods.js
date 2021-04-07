import { Game } from '../Game.js';
import bindings from 'bindings';
import { binaryWriter } from '../../shared/binary.js';
import constants from '../../shared/constants.js';
const { sortPlayers } = bindings('leaderboardMethods');
export default {
    /**
     *
     * @param {ArrayBuffer} leaderboard
     * @param {Number} playerID
     * @param {Game} game
     */
    addPlayer: (leaderboard, playerID, game) => {
        let leaderboardUint8 = new Uint8Array(leaderboard);
        let foundZero = game.Players[0] === undefined;
        for (let i = 0; i < leaderboardUint8.byteLength; i++) {
            if (playerID === 0 && leaderboardUint8[i] === 0) break;
            else if (!foundZero && playerID !== 0 && leaderboardUint8[i] === 0) {
                foundZero = true;
                continue;
            } else if (playerID !== 0 && leaderboardUint8[i] === 0) {
                leaderboardUint8[i] = playerID;
                break;
            }
        }
    },
    /**
     *
     * @param {ArrayBuffer} leaderboard
     * @param {Game} game
     */
    sortPlayers: (leaderboard, game) => {
        let leaderboardUint8 = new Uint8Array(leaderboard);
        let leaderboardSize = 0;
        let foundZero = game.Players[0] === undefined;
        for (let i = 0; i < leaderboardUint8.byteLength; i++) {
            if (leaderboardUint8[i] === 0 && foundZero) break;
            if (leaderboardUint8[i] === 0) foundZero = true;
            leaderboardSize++;
        }
        const leaderboardEx = new ArrayBuffer(leaderboardSize * 5);
        const leaderboardExUint8 = new Uint8Array(leaderboardEx);
        let writerIdx = 0;
        for (let i = 0; i < leaderboardSize; i++, writerIdx += 5) {
            if (!game.Players[leaderboardUint8[i]]) console.log(game.Players, leaderboardUint8[i]);
            let score = game.Players[leaderboardUint8[i]].score;
            leaderboardExUint8[writerIdx] = leaderboardUint8[i];
            leaderboardExUint8[writerIdx + 1] = 0xff & score;
            leaderboardExUint8[writerIdx + 2] = (0xff00 & score) >> 8;
            leaderboardExUint8[writerIdx + 3] = (0xff0000 & score) >> 16;
            leaderboardExUint8[writerIdx + 4] = (0xff000000 & score) >> 24;
        }
        sortPlayers(leaderboardEx);
        for (let i = 0, ExI = 0; i < leaderboardExUint8.byteLength; i++, ExI += 5) {
            leaderboardUint8[i] = leaderboardExUint8[ExI];
        }
    },
    /**
     *
     * @param {ArrayBuffer} leaderboard
     * @param {Number} playerID
     * @param {Game} game
     */
    removePlayer: (leaderboard, playerID, game) => {
        let leaderboardUint8 = new Uint8Array(leaderboard);
        if (game.Players[playerID] === undefined) return;
        for (let i = 0; i < leaderboardUint8.byteLength; i++) {
            if (leaderboardUint8[i] === playerID) {
                let nextIdx = i + 1;
                let foundZero = game.Players[0] === undefined;
                leaderboardUint8[i] = leaderboardUint8[nextIdx];
                leaderboardUint8[nextIdx] = 0;
                nextIdx++;
                while ((leaderboardUint8[nextIdx] !== 0 || !foundZero) && leaderboardUint8[nextIdx] !== undefined) {
                    if (leaderboardUint8[nextIdx] === 0) foundZero = true;
                    leaderboardUint8[nextIdx - 1] = leaderboardUint8[nextIdx];
                    leaderboardUint8[nextIdx] = 0;
                    nextIdx++;
                }
                break;
            }
        }
    },
    /**
     *
     * @param {ArrayBuffer} leaderboard
     * @param {Game} game
     */
    getTopTen: (leaderboard, game) => {
        let leaderboardUint8 = new Uint8Array(leaderboard);
        const output = new Array(10);
        let foundZero = game.Players[0] === undefined;
        let topTenWriter = new binaryWriter(2 + 10 * (1 + 4 + 16));
        topTenWriter.packInt8(constants.MSG_TYPES.LEADERBOARD);
        let l;
        for (let i = 0; i < 10; i++) {
            if (leaderboardUint8[i] === undefined || (leaderboardUint8[i] === 0 && foundZero)) {
                l = i;
                break;
            }

            if (leaderboardUint8[i] === 0) foundZero = true;
        }
        if (!l) l = 10;
        topTenWriter.packInt8(l);
        for (let i = 0; i < l; i++) {
            let player = game.Players[leaderboardUint8[i]];
            if (player === undefined) continue;
            topTenWriter.packInt8(player.id);
            topTenWriter.packInt32(player.score);
            topTenWriter.packString(player.usr, 16);
        }
        return topTenWriter.arrayBuffer;
    },
};
