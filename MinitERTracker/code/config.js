let loadfile_selector;

function ShowConfig() {
    html.config.window.classList.remove("window_hidden");
    HideConfigNetwork();
}
function HideConfig() {
    html.config.window.classList.add("window_hidden");
}
function ShowHelp() {
    html.help.window.classList.remove("window_hidden");
}
function HideHelp() {
    html.help.window   .classList.add("window_hidden");
}

function LoadFile() { loadfile_selector.click(); }

function FileUploaded(event) {
    let reader = new FileReader();
    reader.onload = function() {
        let lines = reader.result.split("\n");
        while (lines[0].startsWith("#")) { // Parse all progress trackers
            let fields = lines[0].split(",");
            let current_game = games[fields[0].substring(1, fields[0].length)];
            fields.shift;
            current_game.obtained.clear();
            for (let p of fields) {
                current_game.obtained.add(p);
            }
            lines.shift();
        }

        LinesToWarps(lines);
        if (connected_to || connections.length > 0) {
            let text = lines.join("\n");
            if (connected_to) {
                connected_to.send(text);
            }
            else {
                for (let c of connections) {
                    c.connection.send(text);
                }
            }
        }

        RerenderAll();
    }
    reader.readAsText(loadfile_selector.files[0]);
}

function SaveFile() {
    let text = "";
    for (let key_game in games) {
        if (!games[key_game].ready) { continue; }
        
        text += "#" + games[key_game].name + ",";
        for (let p of games[key_game].obtained) {
            text += p + ",";
        }
        text = text.substring(0, text.length-1);
        text += "\n";
    }
    for (let key_game in games) {
        if (!games[key_game].ready) { continue; }

        text += WarpsToText(games[key_game]);
    }


    if (text.length == 0) {
        alert("There's nothing to save.");
        return;
    }

    let time = new Date();
    let d = time.getFullYear() + "-" + (time.getMonth()+1) + "-" + time.getDate() + "_" + time.getHours() + "." + time.getMinutes() + "." + time.getSeconds();
    let a = document.createElement("a");
    a.href = window.URL.createObjectURL(new Blob([text], {type: "text/plain"}));
    a.download = d + "minit-tracker.txt";
    a.click();
}

function WarpsToText (current_game) {
    let text = "";
    for (let key_location in current_game.warps) {
        if (!current_game.warps[key_location]) continue;

        for (let key_warp in current_game.warps[key_location]) {
            let warp = current_game.warps[key_location][key_warp];
            if (!warp) continue;

            text += current_game.name + "," + key_location + "," + key_warp + ",";
            if (warp.link_type) text += warp.link_type;
            text += ",";
            if (warp.link_location) text += warp.link_location;
            text += ",";
            if (warp.link) text += warp.link;
            text += ",";
            if (warp.modifier && warp.modifier != "null") text += warp.modifier;
            text += "\n";
        }
    }
    return text;
}
function LinesToWarps (lines) {
    for (let line of lines) {
        if (line.length == 0) continue;

        let f = line.split(",");
        if (f.length < 6) {
            console.error("ERROR: Invalid line in save file: " + line);
            continue;
        }
        
        ChangeWarpOffline(games[f[0]], f[1], f[2], f[3], f[4], f[5], f[6]);
    }
}

function ResetButton() {
    if (confirm ("You and ALL connected users will lose all data. Are you sure to continue?")) {
        ResetTracker();

        if (connected_to || connections.length > 0) {
            if (connected_to) {
                connected_to.send(RESET_MESSAGE);
            }
            else {
                for (let c of connections) {
                    c.connection.send(RESET_MESSAGE);
                }
            }
        }
    }
}

function InitTrackerToUnknowns() {
    for (let key_game in games) {
        // assuming these are always being tracked
        games[key_game].unknown_marks = {
                unknown:           games[key_game].marks[0][0],

               // item_event:        games[key_game].marks[1][0],
        }
        let marks = games[key_game].unknown_marks;
        for (let key in marks) {
            marks[key][1] = 0;
        }
        for (let key_location in games[key_game].warps) {
            for (let key_warp in games[key_game].warps[key_location]) {
                let w = games[key_game].warps[key_location][key_warp];
                w.link_type = LINKTYPE_MARK;
                w.modifier  = null;

                if (w.corridor) {
                    w.link = "corridor";
                    marks.corridor[1] += 1;
                    continue;
                }
                
                if (w.item) {
                    let name = "item_" + w.item;
                    if (!marks["item_" + w.item]) {
                        name = "item_event";
                    }
                    w.link = name;
                    marks[name][1] += 1;
                    continue;
                }

                w.link = "unknown";
                marks.unknown[1] += 1;
            }
        }
    }
}
function ResetTracker() {
    for (let key_game in games) {
        for (let array of [games[key_game].marks, games[key_game].progress, games[key_game].modifiers]) {
            for (let row of array) {
                for (let element of row) {
                    if (element[1] !== undefined && element[1] !== null) {
                        element[1] = 0;
                    }
                }
            }
        }
        games[key_game].obtained = new Set();
    }
    InitTrackerToUnknowns();
    RerenderAll();
}

function ChangeSmooth(checked) {
    localStorage.setItem(CACHE.SMOOTH_IMAGES, checked);
    RerenderLayer(LAYER_LOCATION);
}
function ChangeKeyboardControls(checked) { localStorage.setItem(CACHE.KEYBOARD_DISABLED, checked); }
function ChangeTooltips(checked)         { localStorage.setItem(CACHE.TOOLTIPS_DISABLED, checked); }
function ChangeFitToScreen(checked) {
    localStorage.setItem(CACHE.FIT_TO_SCREEN, checked);
    SetCanvasDimensions();
}


function ResetColor() { ChangeLineColor(DEFAULT_COLOR); }
function ChangeLineColor(color) {
    localStorage.setItem(CACHE.LINE_COLOR, color);
    line_color = color;
    html.config.line_color.value = color;
}

function ChangeGame(new_game) {
    if (!game.ready) return; // Return if game is being loaded
    game.button.disabled = false;
    game = new_game;
    game.button.disabled = true;
    localStorage.setItem(CACHE.GAME_LOADED, game.name);

    current_state = STATE_DEFAULT;
    current_location = game.start_location;
    left_click  = { down: false };
    right_click = { down: false };
    current_markcycle = undefined;

    RerenderAll();
    if (!game.ready) {
        LoadImages();
    }
    else {
        SetDimensions();
    }
}