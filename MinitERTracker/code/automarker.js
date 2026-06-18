let socket;
let autotracker_last_poll = 0;
const SECONDS_BETWEEN_POLLS = 3;

const SOCKET_STOP = "{\"action\": \"stop\"}";
const SOCKET_READ = "{\"action\": \"read\"}";
const SOCKET_READYSTATE = { CONNECTING: 0, OPEN: 1, CLOSING: 2, CLOSED: 3 }

function AT_Start() {
    socket = new WebSocket('ws://localhost:9002');

    socket.addEventListener('open', function (event) {
        autotracker_last_poll = new Date().getTime();
    });

    socket.addEventListener('message', function (event) {
        let result = JSON.parse(event.data);
        console.log(result);
        console.log(result["WARPS"]);
        //socket.close();
    });
}

function AT_SendReadRequest() {
    socket.send(SOCKET_READ);
}