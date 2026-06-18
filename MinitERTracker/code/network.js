const RESET_MESSAGE = "-RESET-";
const USERNAME_MESSAGE = "###";

let current_peer;
let connected_to;
let current_id;
let username;
let connections = [];
function ShowConfigNetwork() {
    if (!current_peer) {
        let current_date_time = new Date();
        current_id = Math.trunc(current_date_time.valueOf() / ((Math.abs(current_date_time.getTimezoneOffset())/10 % 10) + 1) * (Math.random() % 10)).toString();

        let options = {};
        options = {
            debug: (DEBUG.ENABLED && DEBUG.NETWORK) ? 3 : 0,
            config: {
                iceServers: [
                    { urls : "stun:stun.l.google.com:19302" },
                    { urls : "turn:0.peerjs.com:3478",   username : "peerjs", credential : "peerjsp" },
                    { urls : "turn:65.21.186.209:3478",  username : "test",   credential : "1234"    },
                ],
                sdpSemantics: 'unified-plan'
            }
        }
        current_peer = new Peer(current_id, options);
        current_peer.on("open", function(id) {
            html.config.network.id.innerHTML = id;
            if (DEBUG.ENABLED && DEBUG.NETWORK) { console.log(current_peer); }
        });

        current_peer.on("connection", function(connection) {
            if (connected_to !== null) {
                connected_to = null;
                let network = html.config.network;
                network.name       .classList.add("config_hidden");
                network.connectto  .classList.add("config_hidden");
                network.warning    .classList.add("config_hidden");
                network.connections.classList.remove("config_hidden");
            }
            
            connection.on("data", function(data) {
                if (data.startsWith(USERNAME_MESSAGE)) {
                    let name = data.slice(3);
                    for (let c of connections) {
                        if (this.peer == c.connection.peer) {
                            c.username = name;
                            break;
                        }
                    }
                    UpdateUsernames();
                }
                else {
                    // Send to everyone else
                    for (let c of connections) {
                        if (this.peer != c.connection.peer) {
                            c.connection.send(data);
                        }
                    }
                    
                    //Handle data
                    if (data == RESET_MESSAGE) {
                        ResetTracker();
                    } else {
                        LinesToWarps(data.split("\n"));
                    }
                }
            });

            connection.on("open", function(A) {
                let text = "";
                for (let key_game in games) {
                    text += WarpsToText(games[key_game]);
                }
                connection.send(text);
            });

            connections.push({ connection: connection, username: connection.peer });
            UpdateUsernames();
        });
    }

    html.config.network.div   .classList.remove("config_hidden");
    html.config.network.toggle.classList.add   ("config_hidden");
}
function HideConfigNetwork() {
    html.config.network.div   .classList.add   ("config_hidden");
    html.config.network.toggle.classList.remove("config_hidden");
}

function UpdateUsernames() {
    let htmltext_usernames = "<u>Users connected</u> <br>";
    for (let c of connections) {
        htmltext_usernames += c.username + "<br>";
    }
    html.config.network.connections.innerHTML = htmltext_usernames;
}

function ConnectButton() {
    let connect_id = html.config.network.input_connect.value.trim();
    html.config.network.input_connect.value = connect_id;
    if (connect_id && connect_id !== html.config.network.id.innerHTML) {
        connected_to = current_peer.connect(connect_id);
        connected_to.on("open", function(_) {
            let network = html.config.network;
            network.connectto  .classList.add("config_hidden");
            network.warning    .classList.add("config_hidden");
            network.connections.classList.remove("config_hidden");
            network.connections.innerHTML = "Connected to host: " + connect_id;

            if (username) { connected_to.send(USERNAME_MESSAGE + username); }
        });
        
        connected_to.on("data", function(data) {
            // Handle data
            if (data == RESET_MESSAGE) {
                //console.log("Received data: Reset Tracker");
                ResetTracker();
            }
            else {
                //console.log("-Received data: " + data);
                LinesToWarps(data.split("\n"));
            }
        });
    }
}

function ChangeUsername(data) {
    if (username != data) {
        username = data;
        if (connected_to) {
            connected_to.send(USERNAME_MESSAGE + username);
        }
    }
}

function PressedEnter(key) {
    if (key.keyCode == 13) { // if pressed enter
        ChangeUsername(html.config.network.input_name.value);
    }
}