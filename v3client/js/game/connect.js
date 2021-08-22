import Alert from '../Alert.js';
let reconnectAttempts = 0,
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
    },
    hover = null;
/**
 * @type {null|WebSocket}
 */
export let ws = null;
export const connect = (reconnectAttempt) =>
    new Promise((resolve, reject) => {
        let resolved = false;
        ws = new WebSocket(`wss://${window.location.host}/games/usaeast1`);
        ws.addEventListener('open', (event) => {
            resolve(true);
            resolved = true;
        });
        ws.onopen = () => {
            new Alert('Connected', 'success');
            //ws.addEventListener('message', receiveSocketID);
            //resolve(true);
            //resolved = true;
        };
        ws.onclose = async () => {
            if (reconnectAttempt) return;
            new Alert('Disconnected', 'error');
            let successfulConnection = await connect(true);
            reconnectAttempts++;
            while (!successfulConnection && reconnectAttempts < maxReconnectAttempts) {
                if (reconnectAttempts % maxReconnectAttempts == 0) new Alert('Failed to Reconnect.', 'error');
                successfulConnection = await connect(true);
                reconnectAttempts++;
            }
            reconnectAttempts = 0;
            if (!resolved) resolve(true);
            window.location.reload();
            resolved = true;
            new Alert('Reconnected successfully', 'success');
            //ws.removeEventListener('message', receiveSocketID);
            //ws.removeEventListener('message', handleMessage);
            //console.log('Error disconnected from server');
        };
        ws.onerror = async (e) => {
            if (!resolved) resolve(false);
            return;
        };
    });
