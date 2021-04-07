import constants from '/shared/constants.js';
/**
 * @type {null|WebSocket}
 */
let ws = null,
    reconnectAttempts = 0,
    maxReconnectAttempts = 20,
    receiveSocketID = (e) => {
        e.data.arrayBuffer().then(async (arrayBuffer) => {
            let eventData = new Uint8Array(arrayBuffer);
            if (eventData[0] === constants.MSG_TYPES.SOCKET_ID) {
                ws.id = '';
                for (let i = 1; i < 37; i++) ws.id += String.fromCharCode(eventData[i]);
                /*let token = getCookie('token');
                if (token) {
                    let req = await fetch(`${window.location.href}api/v1/games/usaeast1/login`, {
                        method: 'POST',
                        headers: {
                            'content-type': 'text/plain',
                            Authorization: 'Basic ' + token,
                        },
                        body: ws.id,
                    });
                }*/
                //console.log(ws.id);
                ws.removeEventListener('message', receiveSocketID);
            }
        });
    };
const connect = (reconnectAttempt) =>
    new Promise((resolve, reject) => {
        let resolved = false;
        ws = new WebSocket(`wss://${window.location.host}/games/usaeast1`);
        ws.addEventListener('open', (event) => {
            resolve(true);
            resolved = true;
        });
        ws.onopen = () => {
            //ws.addEventListener('message', receiveSocketID);
            //resolve(true);
            //resolved = true;
        };
        ws.onclose = async () => {
            if (reconnectAttempt) return;
            let successfulConnection = await connect(true);
            while (!successfulConnection && reconnectAttempts < maxReconnectAttempts) {
                successfulConnection = await connect(true);
                reconnectAttempts++;
            }
            reconnectAttempts = 0;
            if (successfulConnection) {
                if (!resolved) resolve(true);
                resolved = true;
            } else alert('Failed to Reconnect.');
            //ws.removeEventListener('message', receiveSocketID);
            //ws.removeEventListener('message', handleMessage);
            //console.log('Error disconnected from server');
        };
        ws.onerror = async (e) => {
            if (!resolved) resolve(false);
            return;
        };
    });
connect();
export default null;
