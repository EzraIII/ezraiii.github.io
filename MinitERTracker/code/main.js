// Games will be shown in the settings in order
let ordered_games = [
    minit
];

let DEBUG = {
    ENABLED: false,
    WARP_TO_SELF:     false,
    PRINT_KEY:        false,
    IMAGE_DIMENSIONS: true,
    NETWORK: true
}

const AUTOTRACKER_DEVELOPMENT = false;

const LINKTYPE_WARP = "warp";
const LINKTYPE_MARK = "mark";

const CACHE = {
    GAME_LOADED:       "last-game-loaded",
    SMOOTH_IMAGES:     "smooth-images-v2",
    FIT_TO_SCREEN:     "fit-to-screen",
    DEBUG_LOCATION:    "debug-location",
    LAST_VERSION:      "last-version",
    LINE_COLOR:        "line-color",
    TOOLTIPS_DISABLED: "tooltips-disabled-v2",
}
const CURRENT_VERSION = 5;

let game;
let games = {};
function init() {
    DEBUG.ENABLED = document.URL.endsWith("?debug");

    // Retrieve line color
    let cached_line_color = localStorage.getItem(CACHE.LINE_COLOR);
    if (cached_line_color) { line_color = cached_line_color; }

    // Create map of games
    for (let g of ordered_games) {
        if (!g.debug || (g.debug && DEBUG.ENABLED)) {
            games[g.name] = g;
        }
    }
    
    InitTrackerToUnknowns();
    InitRendering();
    RetrieveAllHTMLElements();
    if (DEBUG.ENABLED) { RunTests(); }

    // Get last loaded game and load it
    let last_game = localStorage.getItem(CACHE.GAME_LOADED);
    game = minit;
    if (last_game && games[last_game]) {
        game = games[last_game];
    }
    game.button.disabled = true;
    current_location = game.start_location;
    if (DEBUG.ENABLED) {
        let last_location = localStorage.getItem(CACHE.DEBUG_LOCATION);
        if (last_location && game.locations[last_location]) current_location = last_location;

    }
    for (let key_game in games) {
        games[key_game].ready = false;
        games[key_game].obtained = new Set();
    }
    LoadImages();
    RegisterInputEvents();
    document.fonts.onloadingdone = FontReady;

    // Create reader to load files (just in case)
    loadfile_selector = document.createElement("input");
    loadfile_selector.type = "file";
    loadfile_selector.multiple = false;
    loadfile_selector.onchange = function(e) { FileUploaded(e); };

    // Start tracker
    requestAnimationFrame(GameLoop);

    // Autotracker stuff for debugging
    if (DEBUG.ENABLED && AUTOTRACKER_DEVELOPMENT) {
        AT_Start();
    }
}

let html = {};
const HTML_ID = {
    config: {
        window: "config_window",
        smooth_checkbox: "checkbox_smooth",
        tooltipsdisabled: "checkbox_tooltips",
        fit_to_screen: "checkbox_fittoscreen",
        loading_text: "loading_game_text",
        game_buttons: "game_buttons",
        line_color: "line_color",
        network: {
            toggle: "config_networktoggle",
            div: "config_network",
            input_name:    "networkinput_name",
            input_connect: "networkinput_connect",
            name: "network_name",
            id: "network_id",
            connectto: "network_connectto",
            connections: "network_connections",
            warning: "network_warning",
        }
    },
    help: {
        window: "help_window",
    },
    canvas: "canvas", // + context
};
// Finds and creates all HTML elements
function RetrieveAllHTMLElements() {
    // Init html class
    html.config         = {};
    html.config.network = {};
    html.help           = {};

    // Retrieve canvas and create auxiliar canvases
    html.canvas  = document.getElementById(HTML_ID.canvas);
    html.context = html.canvas.getContext("2d");
    html.context.imageSmoothingEnabled = false;

    // Retrieve config elements
    let config  = html.config;
    config.window           = document.getElementById(HTML_ID.config.window);
    config.loading_text     = document.getElementById(HTML_ID.config.loading_text);
    config.line_color       = document.getElementById(HTML_ID.config.line_color);
    config.loading_text.innerHTML = "";
    config.line_color.value = line_color;
    
    // Retrieve networking elements
    let network = html.config.network;
    network.input_name    = document.getElementById(HTML_ID.config.network.input_name);
    network.input_connect = document.getElementById(HTML_ID.config.network.input_connect);
    network.id            = document.getElementById(HTML_ID.config.network.id);
    network.input_name.value    = "";
    network.input_connect.value = "";
    network.id.value            = "---";
    network.connectto   = document.getElementById(HTML_ID.config.network.connectto);
    network.connections = document.getElementById(HTML_ID.config.network.connections);
    network.name        = document.getElementById(HTML_ID.config.network.name);
    network.warning     = document.getElementById(HTML_ID.config.network.warning);
    network.div         = document.getElementById(HTML_ID.config.network.div);
    network.toggle      = document.getElementById(HTML_ID.config.network.toggle);

    // Retrieve help window elements
    let help    = html.help;
    help.window    = document.getElementById(HTML_ID.help.window);

    // Create config buttons
    config.game_buttons = document.getElementById("game_buttons");
    for (let g of ordered_games) {
        if (!games[g.name]) continue;

        let div = document.createElement("div");

            g.button = document.createElement("button");
                g.button.className = "load_button";
                g.button.id = g.name + "_button";
                g.button.onclick = function() { ChangeGame(g); };
                g.button.innerHTML = "Load";
            div.appendChild(g.button);

            let text = document.createElement("div");
                text.innerHTML = g.config_name;
                
                if (g.config_randomizer_author) {
                    text.innerHTML += " for "
                    if (g.config_randomizer_link) {
                        let link = document.createElement("a");
                            link.href = g.config_randomizer_link;
                            link.innerHTML = g.config_randomizer_author;
                        text.appendChild(link);
                    }
                    else {
                        text.innerHTML += g.config_randomizer_author;
                    }
                    text.innerHTML += "'s randomizer"
                }

                if (g.config_tracker_author) {
                    text.innerHTML += " by "
                    if (g.config_tracker_link) {
                        let link = document.createElement("a");
                            link.href = g.config_tracker_link;
                            link.innerHTML = g.config_tracker_author;
                        text.appendChild(link);
                    }
                    else {
                        text.innerHTML += g.config_tracker_author;
                    }
                }
                g.unknownCount = g.marks[0][0][1];
                text.innerHTML += " (" + g.marks[0][0][1] + " warps)";

            div.appendChild(text);
        game_buttons.appendChild(div);
    }
}

let delta_time = 0;
let last_time = 0;
function GameLoop() {
    let current_time = GetCurrentMilliseconds();
    delta_time = current_time - last_time;
    last_time = current_time;

    if (game.ready) { Render(); }
    requestAnimationFrame(GameLoop);

    if (DEBUG.ENABLED && AUTOTRACKER_DEVELOPMENT) {
        if (socket.readyState == SOCKET_READYSTATE.OPEN) {
            let current_time = new Date().getTime();
            if (current_time - autotracker_last_poll > SECONDS_BETWEEN_POLLS*1000) {
                AT_SendReadRequest();
                autotracker_last_poll = current_time;
            }
        }
    }
}

function FontReady() { RerenderLayer(LAYER_LOCATION); }
function GetCurrentMilliseconds() { return (new Date()).getTime(); }