const CANVAS_MARGIN = 5; // Same value as CSS (body -> margin)
const BACKGROUND_COLOR = "#444444";

const LINE_THRESHOLD = 16;
const LINE_THICKNESS = 3;
const DEFAULT_COLOR  = "#00FFFF";
let line_color       = DEFAULT_COLOR;

const CHECKS_HEIGHT = 50;
const CHECKS_WIDTH  = 150;
const CHECKS_COLOR    = "#f7e1b4";
const CHECKS_FONTSIZE = "42px";
const CHECKS_XOFFSET  = 145;
const CHECKS_YOFFSET  = 9;

const MAP_MARK_OFFSET = 1;
const MAP_MARK_WIDTH  = 3;

const FRAME_WIDTH  = 167;
const FRAME_HEIGHT = 47;
const LINE_YOFFSET = 32;
const LINE_BREAK_YOFFSET = 14;

const MAP_SCALE = 2;
const LOCATION_SIZE = 1;
const SELECTED_MAP_XOFFSET = 6;
const WARP_LINE_YOFFSET = 5;
const WARP_FONT_SIZE    = 13;

const MARKS_YOFFSET    = 15;
const PROGRESS_YOFFSET = 10;
const MARK_SIZE        = 32;
const MARK_SEPARATION  = 5;
const UNCHECKED_FILTER = "grayscale(100%) opacity(50%)";
const MARKFOUND_SIZE  = 1;
const MARKFOUND_COLOR = "#AAAAAA"
const MODIFIER_RADIUS = MARK_SIZE/2;
const MODIFIER_WIDTH = 4;
const MODIFIER_ALPHA = "aa";
const MODIFIER_SEPARATION = 20;

const CONFIG_YOFFSET = 5;
const CONFIG_XOFFSET = 5;
const CONFIG_HEIGHT = 40;

const TOOLTIP_SIZEX = 120;
const TOOLTIP_SIZEY = 50;
const TOOLTIP_XOFFSET = 10;
const TOOLTIP_YOFFSET = 17;
const TOOLTIP_CENTERTEXT = 2;
const TOOLTIP_LINEBREAK = 16;

const LOADING_TEXT = "Loading map...";

const HIGHLIGHT_BLINKING = 150;  //milliseconds
const HIGHLIGHT_DURATION = 1500; //milliseconds
let highlight = {};

const DEFAULT_COOLDOWN_TOOLTIP = 500; //milliseconds
let cooldown_tooltip = DEFAULT_COOLDOWN_TOOLTIP;

let debug_widths  = [];
let debug_heights = [];

const LAYER_COUNT = 7;
const LAYER_MAP       = 0;
const LAYER_SQUARES   = 1;
const LAYER_MARKS     = 2;
const LAYER_LOCATION  = 3;
const LAYER_PROGRESS  = 4;
const LAYER_LINE      = 5;
const LAYER_HIGHLIGHT = 6;
const LAYER_NAME = ["MAP", "SQUARES", "MARKS", "LOCATION", "PROGRESS", "LINE", "HIGHLIGHT"]; // used for debugging
let layers = [];

let last_rendered_location = "";
let traslucent_warps = false;

// ██ ███    ███  █████   ██████  ███████     ██       ██████   █████  ██████  ██ ███    ██  ██████  
// ██ ████  ████ ██   ██ ██       ██          ██      ██    ██ ██   ██ ██   ██ ██ ████   ██ ██       
// ██ ██ ████ ██ ███████ ██   ███ █████       ██      ██    ██ ███████ ██   ██ ██ ██ ██  ██ ██   ███ 
// ██ ██  ██  ██ ██   ██ ██    ██ ██          ██      ██    ██ ██   ██ ██   ██ ██ ██  ██ ██ ██    ██ 
// ██ ██      ██ ██   ██  ██████  ███████     ███████  ██████  ██   ██ ██████  ██ ██   ████  ██████  

let loading_process = {};
let icons = {
    settings:  null,
    help:      null,
    remaining: null,
    item_frame: null,
};
let images = [];
function LoadImages() {
    // Obtain map and frame
    let list = ["images/" + game.folder + "/" + game.name + ".png", "images/" + game.folder + "/frame.png"];
    if (!icons.settings)  { list.push("images/settings.png"); }
    if (!icons.help)      { list.push("images/help.png"); }
    if (!icons.remaining) { list.push("images/remaining.png"); }

    // Check if same game has been already been loaded
    // this way we avoid loading the same image twice
    let similar_loaded_games = [];
    for (let g of ordered_games) {
        if (g.ready && g.folder == game.folder) {
            similar_loaded_games.push(g);
        }
    }

    loading_process.max_width  = 0;
    loading_process.max_height = 0;
    // Get location images
    loop:
    for (let key in game.locations) {
        for (g of similar_loaded_games) {
            if (g.locations[key]) {
                let i = g.locations[key].image;
                game.locations[key].image = i;
                
                if (i.naturalWidth  > loading_process.max_width)  loading_process.max_width  = i.naturalWidth;
                if (i.naturalHeight > loading_process.max_height) loading_process.max_height = i.naturalHeight;

                continue loop;
            }
        }

        list.push("images/" + game.folder + "/maps/" + key + ".png");
    }

    // Get marks images
    loading_process.row_count =  0;
    for (let row of game.marks) {
        loading_process.row_count += 1;
        for (let pair of row) {
            if(pair[1] !== undefined && !images.includes(pair[0])) { list.push("images/marks/" + pair[0] + ".png") }
        }
    }

    // Get progress tracker items
    for (let row of game.progress) {
        loading_process.row_count += 1;
        for (let pair of row) {
            if (pair[1] !== undefined && !images.includes(pair[0])) { list.push("images/" + game.folder + "/progress/" + pair[0] + ".png") }
        }
    }
    
    if (!icons.item_frame) { list.push("images/marks/item_frame.png"); }

    // Load all images
    if (list.length == 0) {
        game.ready = true;
        return;
    }

    html.config.loading_text.innerHTML = LOADING_TEXT;
    document.body.style.cursor = "wait";
    loading_process.loaded = 0;
    loading_process.to_load = list.length;
    for (let path of list) {
        const image = new Image();
        image.onload = ImageLoaded;
        image.onerror = ImageError;
        image.src = path;
    }
}
function ImageLoaded() {
    if (this.src.includes(game.name + ".png")) {
        game.map = {
            image: this,
            x: 0, y: 0,
            w: this.naturalWidth  * MAP_SCALE,
            h: this.naturalHeight * MAP_SCALE
        }

        // Check left side height in case it's higher than all the location maps
        let left_side_height = game.map.h
                             + MARKS_YOFFSET + PROGRESS_YOFFSET + loading_process.row_count*(MARK_SIZE+MARK_SEPARATION)
                             + CONFIG_YOFFSET + CONFIG_HEIGHT;
        if (left_side_height > loading_process.max_height) loading_process.max_height = left_side_height;

        // Check left side width in case the map itself is less wide than the marks+modifiers
        let marks_max_width = 0;
        for (let list of [game.marks, game.progress]) {
            for (let row of list) {
                if (marks_max_width < row.length) { marks_max_width = row.length; }
            }
        }

        game.left_width = (marks_max_width+game.modifiers.length)*(MARK_SIZE+MARK_SEPARATION) + MODIFIER_SEPARATION;
        if (game.left_width < game.map.w) { game.left_width = game.map.w; }
    }
    else if (this.src.includes("item_frame.png")) { icons.item_frame = this; }
    else if (this.src.includes("frame.png"))      { game.frame = this; }
    else if (this.src.includes("settings.png"))   { icons.settings = this;   }
    else if (this.src.includes("help.png"))       { icons.help = this;       }
    else if (this.src.includes("remaining.png"))  { icons.remaining = this;  }
    else if (this.src.includes("/marks/") || this.src.includes("/progress/")) {
        images[GetNameImage(this.src)] = this;
    }
    else {
        try {
            game.locations[GetNameImage(this.src)].image = this;
        }
        catch(err) {
            console.log(err);
            console.log(this.src);
            console.log(GetNameImage(this.src));
        }

        if (DEBUG.ENABLED) {
            debug_heights.push({ value: this.naturalHeight, name: this.src});
            debug_widths.push ({ value: this.naturalWidth , name: this.src});
        }

        // Get max width/height for later
        if (this.naturalWidth  > loading_process.max_width)  loading_process.max_width  = this.naturalWidth;
        if (this.naturalHeight > loading_process.max_height) loading_process.max_height = this.naturalHeight;
    }

    loading_process.loaded += 1;
    if (loading_process.loaded == loading_process.to_load) {
        if (DEBUG.ENABLED && DEBUG.IMAGE_DIMENSIONS) {
            debug_heights.sort((a, b) => (a.value > b.value) ? 1 : -1);
            debug_widths.sort ((a, b) => (a.value > b.value) ? 1 : -1);
            console.log("Heights:", debug_heights, "Widths:", debug_widths);
        }
        SetDimensions();

        html.config.loading_text.innerHTML = "";
        document.body.style.cursor = "default";
        game.ready = true;
        return;
    }

    html.config.loading_text.innerHTML = LOADING_TEXT + " (" + Math.floor(loading_process.loaded*100/loading_process.to_load) + "%)";
}
function ImageError() { console.error("ERROR: Couldn't load " + this.src); }

function GetNameImage(path) {
    let array = path.split("/");
    return array[array.length-1].split(".")[0];
}

function SetDimensions() {


    loading_process.max_width = (window.innerWidth-game.left_width  - 2*CANVAS_MARGIN);
    loading_process.max_height = (window.innerHeight - 2*CANVAS_MARGIN);
    // Set canvas dimensions
    game.right_width  = loading_process.max_width;
    game.right_height = loading_process.max_height;
    game.layer_width  = game.right_width + game.left_width + SELECTED_MAP_XOFFSET;
    game.layer_height = game.right_height;

    for (let layer of layers) {
        layer.canvas.width  = game.layer_width;
        layer.canvas.height = game.layer_height;
    }
    SetCanvasDimensions();
}
function SetCanvasDimensions() {
    game.canvas_stretched = {};
    let ratio_w = (window.innerWidth  - 2*CANVAS_MARGIN) / game.layer_width;
    let ratio_h = (window.innerHeight - 2*CANVAS_MARGIN) / game.layer_height;
    let ratio = (ratio_w > ratio_h) ? ratio_h : ratio_w;
    html.canvas.width  = game.layer_width  * ratio;
    html.canvas.height = game.layer_height * ratio;
    game.canvas_stretched.width  = ratio;
    game.canvas_stretched.height = ratio;
}

// ██████  ███████ ███    ██ ██████  ███████ ██████  ██ ███    ██  ██████  
// ██   ██ ██      ████   ██ ██   ██ ██      ██   ██ ██ ████   ██ ██       
// ██████  █████   ██ ██  ██ ██   ██ █████   ██████  ██ ██ ██  ██ ██   ███ 
// ██   ██ ██      ██  ██ ██ ██   ██ ██      ██   ██ ██ ██  ██ ██ ██    ██ 
// ██   ██ ███████ ██   ████ ██████  ███████ ██   ██ ██ ██   ████  ██████  
function InitRendering() {
    layers = [];
    for (let i = 0; i < LAYER_COUNT; ++i) {
        let c = {};
        c.canvas   = document.createElement("canvas");
        c.context  = c.canvas.getContext("2d");
        c.context.imageSmoothingEnabled = false;
        c.rerender = true;
        c.skip = false;
        layers.push(c);
    }
    layers[LAYER_MAP].      functions = [RenderBackgroundColors, RenderMap, RenderSettings, RenderRemainingIcon];
    layers[LAYER_SQUARES].  functions = [RenderMarkSquares];
    layers[LAYER_MARKS].    functions = [RenderMarks];
    layers[LAYER_LOCATION]. functions = [RenderLocation];
    layers[LAYER_PROGRESS]. functions = [RenderProgress];
    layers[LAYER_LINE].     functions = [RenderLine, RenderMapText, RenderRemainingText, RenderTooltip];
    layers[LAYER_HIGHLIGHT].functions = [RenderHighlights];
}

function Render() {
    // Render all layers that are issued with a rerender
    for (let layer of layers) {
        if (!layer.rerender) continue;
        layer.rerender = false;

        ClearLayerContext(layer);
        for (let fun of layer.functions) {
            fun(layer.context);
        }
    }
    layers[LAYER_LINE].rerender = true;

    // Mix all layers
    html.context.clearRect(0, 0, html.canvas.width, html.canvas.height);
    for (let layer of layers) {
        if (DEBUG.ENABLED && layer.skip) { continue; }
        html.context.drawImage(layer.canvas, 0, 0, html.canvas.width, html.canvas.height);
    }
}

//  ██████         ███    ███  █████  ██████  
// ██  ████        ████  ████ ██   ██ ██   ██ 
// ██ ██ ██        ██ ████ ██ ███████ ██████  
// ████  ██        ██  ██  ██ ██   ██ ██      
//  ██████  ██     ██      ██ ██   ██ ██      

function RenderBackgroundColors(context) {
    // ----- Render background progress tracker -----
    let max_progress_marks = 0;
    for (let p of game.progress) {
        if (p.length > max_progress_marks) { max_progress_marks = p.length; }
    }

    let background = {
        x: 0,
        y: game.map.h + MARKS_YOFFSET + game.marks.length*(MARK_SIZE + MARK_SEPARATION) - MARK_SEPARATION + PROGRESS_YOFFSET, 
        w: max_progress_marks   * (MARK_SIZE+MARK_SEPARATION) + MARK_SEPARATION,
        h: game.progress.length * (MARK_SIZE+MARK_SEPARATION) + MARK_SEPARATION
    };
    DrawSquareContextless(context, background, BACKGROUND_COLOR);

    // ----- Render location background -----
    background = {
        x: game.left_width + SELECTED_MAP_XOFFSET,
        y: 0,
        w: game.right_width,
        h: game.right_height
    };
    DrawSquareContextless(context, background, BACKGROUND_COLOR);

    // ----- Render remaining warps background -----
    background = {
        x: game.left_width   - CHECKS_WIDTH,
        y: game.right_height - CHECKS_HEIGHT,
        w: CHECKS_WIDTH,
        h: CHECKS_HEIGHT,
    };
    DrawSquareContextless(context, background, BACKGROUND_COLOR);
}

function RenderMap(context) {
    context.imageSmoothingEnabled = false;
    DrawImage(context, game.map.image, game.map);
}

function RenderSettings(context) {
    let layer = layers[LAYER_MAP];
    let v = {
        x: 0,
        y: layer.canvas.height - icons.settings.naturalHeight,
        w: icons.settings.naturalWidth,
        h: icons.settings.naturalHeight
    };
    DrawImage(context, icons.settings, v);
    v.x = v.w + CONFIG_XOFFSET;
    DrawImage(context, icons.help, v);
}

function RenderRemainingIcon(context) {
    let layer = layers[LAYER_MAP];
    context.imageSmoothingEnabled = false;
    let v = {
        x: game.left_width - CHECKS_XOFFSET,
        y: layer.canvas.height - icons.settings.naturalHeight - CHECKS_YOFFSET/2,
        w: CONFIG_HEIGHT,
        h: CONFIG_HEIGHT,
    };
    DrawImage(context, icons.remaining, v);
}

//  ██        ███████  ██████  ██    ██  █████  ██████  ███████ ███████ 
// ███        ██      ██    ██ ██    ██ ██   ██ ██   ██ ██      ██      
//  ██        ███████ ██    ██ ██    ██ ███████ ██████  █████   ███████ 
//  ██             ██ ██ ▄▄ ██ ██    ██ ██   ██ ██   ██ ██           ██ 
//  ██ ██     ███████  ██████   ██████  ██   ██ ██   ██ ███████ ███████ 

function RenderMarkSquares(context) {
    context.imageSmoothingEnabled = false;

    let boxes = [];
    let v = {
        x: MARK_SEPARATION,
        y: game.map.h + MARKS_YOFFSET,
        w: MARK_SIZE,
        h: MARK_SIZE
    };

    // ----- Obtain squares for marks -----
    for (let row of game.marks) {
        for (let pair of row) {
            //let name  = pair[0];
            let count = pair[1];
            if (count && count > 0) { boxes.push(GetPositionCopy(v)); }

            v.x += MARK_SIZE + MARK_SEPARATION;
        }
        v.y += MARK_SIZE + MARK_SEPARATION;
        v.x = MARK_SEPARATION;
    }

    // ----- Obtain squares for progress tracker -----
    v.y += PROGRESS_YOFFSET;
    for (let row of game.progress) {
        for (let pair of row) {
            //let name  = pair[0];
            let count = pair[1];
            if (count && count > 0) { boxes.push(GetPositionCopy(v)); }

            v.x += MARK_SIZE + MARK_SEPARATION;
        }
        v.y += MARK_SIZE + MARK_SEPARATION;
        v.x = MARK_SEPARATION;
    }

    // ----- Obtain boxes for modifiers -----
    let initial_y = game.map.h + MARKS_YOFFSET + MODIFIER_RADIUS;
    let position = {
        x: game.left_width - MODIFIER_RADIUS,
        y: initial_y,
    };
    for (let row of game.modifiers) {
        for (let pair of row) {
            let count = pair[1];
            if (count && count > 0) {
                let p = {
                    x: position.x - MODIFIER_RADIUS,
                    y: position.y - MODIFIER_RADIUS,
                    w: MODIFIER_RADIUS*2,
                    h: MODIFIER_RADIUS*2,
                }
                boxes.push(p);
            }
            position.y += MODIFIER_RADIUS*2 + MARK_SEPARATION;
        }
        position.x -= MODIFIER_RADIUS*2 + MARK_SEPARATION;
        position.y = initial_y;
    }

    // ----- Render everything in bulk -----
    context.save(); {
        context.lineWidth   = MARKFOUND_SIZE;
        context.strokeStyle = MARKFOUND_COLOR;
        for (let b of boxes) {
            DrawBox(context, b);
        }
    } context.restore();
}

// ██████      ███    ███  █████  ██████  ██   ██ ███████ 
//      ██     ████  ████ ██   ██ ██   ██ ██  ██  ██      
//  █████      ██ ████ ██ ███████ ██████  █████   ███████ 
// ██          ██  ██  ██ ██   ██ ██   ██ ██  ██       ██ 
// ███████     ██      ██ ██   ██ ██   ██ ██   ██ ███████ 

function GetPositionCopy(v) { return { x: v.x, y: v.y, w: v.w, h: v.h }; }
function RenderMarks(context) {
    context.imageSmoothingEnabled = true;

    let v = {
        x: MARK_SEPARATION,
        y: game.map.h + MARKS_YOFFSET,
        w: MARK_SIZE,
        h: MARK_SIZE
    };
    // ----- Obtain marks -----
    let marks = [];
    for (let row of game.marks) {
        for (let pair of row) {
            let name  = pair[0];
            let count = pair[1];
            if (count !== undefined) {
                marks.push({ name: name, position: GetPositionCopy(v)});
            }

            v.x += MARK_SIZE + MARK_SEPARATION;
        }
        v.y += MARK_SIZE + MARK_SEPARATION;
        v.x = MARK_SEPARATION;
    }

    // ----- Obtain progress tracker -----
    v.y += PROGRESS_YOFFSET;
    let progress = [];
    for (let row of game.progress) {
        for (let pair of row) {
            let name  = pair[0];
            let count = pair[1];
            if (count !== undefined) {
                let m = { name: name, position: GetPositionCopy(v)};
                progress.push(m);
            }
            v.x += MARK_SIZE + MARK_SEPARATION;
        }
        v.y += MARK_SIZE + MARK_SEPARATION;
        v.x = MARK_SEPARATION;
    }

    // ----- Obtain modifiers -----
    let modifiers = [];
    let initial_position = {
        x: game.left_width - MODIFIER_RADIUS,
        y: game.map.h + MARKS_YOFFSET + MODIFIER_RADIUS,
    };
    let offset = MODIFIER_RADIUS*2 + MARK_SEPARATION;
    
    let position = {
        x: initial_position.x,
        y: initial_position.y,
    };
    
    for (let row of game.modifiers) {
        for (let pair of row) {
            modifiers.push({ color: pair[0], position: GetPositionCopy(position)});
            position.y += offset;
        }
        position.x -= offset;
        position.y = initial_position.y;
    }

    // ----- Render everything in bulk -----
    for (let m of marks) {
        DrawImage(context, images[m.name], m.position);
    }
    
    context.save(); {
        context.filter = UNCHECKED_FILTER;
        for (let m of progress) {
            DrawImage(context, images[m.name], m.position);
        }
    } context.restore();
    
    context.save(); {
        context.lineWidth   = MARKFOUND_SIZE;
        context.strokeStyle = MARKFOUND_COLOR;
        for (let m of modifiers) {
            context.beginPath();
            context.fillStyle = m.color;
            context.arc(m.position.x, m.position.y, MODIFIER_RADIUS, 0, 2*Math.PI, false);
            context.fill();
        }
    } context.restore();
}

// ██████         ██       ██████   ██████  █████  ████████ ██  ██████  ███    ██ 
//      ██        ██      ██    ██ ██      ██   ██    ██    ██ ██    ██ ████   ██ 
//  █████         ██      ██    ██ ██      ███████    ██    ██ ██    ██ ██ ██  ██ 
//      ██        ██      ██    ██ ██      ██   ██    ██    ██ ██    ██ ██  ██ ██ 
// ██████  ██     ███████  ██████   ██████ ██   ██    ██    ██  ██████  ██   ████ 

let rendered_location = {};
function RenderLocation(context) {
    context.imageSmoothingEnabled = false;

    // ----- Render drawing space -----
    let background = {
        x: game.left_width + SELECTED_MAP_XOFFSET,
        y: 0,
        w: game.right_width,
        h: game.right_height
    };

    // ----- Render selected map -----
    let location = game.locations[current_location];
    let ratio = {
        width:  background.w / location.image.naturalWidth,
        height: background.h / location.image.naturalHeight
    };
    let scale;
    let center = { x: 0, y: 0 };
    if (ratio.height < ratio.width) {
        scale = ratio.height;
        center.x = (background.w - location.image.naturalWidth*scale) / 2;
    }
    else {
        scale = ratio.width;
        center.y = (background.h - location.image.naturalHeight*scale) / 2;
    }
    rendered_location = {
        x: background.x + center.x,
        y: background.y + center.y,
        w: location.image.naturalWidth  * scale,
        h: location.image.naturalHeight * scale,
        scale: scale
    };
    DrawImage(context, location.image, rendered_location);

    // ----- Render warps -----
    context.save(); {
        if (traslucent_warps) {
            context.globalAlpha = 0.2;
        }
        context.font = "bold " + WARP_FONT_SIZE * LOCATION_SIZE + "px Avenir";
        context.textAlign = "center";
        context.fillStyle = "#111111";
        for (let key in game.warps[current_location]) {
            let warp = game.warps[current_location][key];
            let info = GetWarpRenderInfo(warp);

            if (DEBUG.ENABLED && DEBUG.WARP_TO_SELF) {
                warp.link_type = LINKTYPE_WARP;
                warp.link = key;
                warp.link_location = current_location;
                info = GetWarpRenderInfo(warp);
            }

            if (info.type == "image") {
                if (info.item_frame) {
                    DrawImage(context, icons.item_frame, info.item_frame);
                }
                DrawImage(context, info.image, info);
                if (warp.modifier && warp.modifier != "null") {
                    DrawBoxContextless(context, info, MODIFIER_WIDTH, warp.modifier);
                }
            }
            else {
                DrawImage(context, game.frame, info);
                if (warp.modifier && warp.modifier != "null") {
                    DrawSquareContextless(context, info, warp.modifier + MODIFIER_ALPHA);
                }
                if (DEBUG.ENABLED && DEBUG.PRINT_KEY) {
                    context.fillText(key, info.text_position.x, info.text_position.y);
                    continue;
                }
                let text = info.text.split("\n");
                context.fillText(text[0], info.text_position.x, info.text_position.y);
            }
        }

    } context.restore();
}

// ██   ██        ██████  ██████   ██████   ██████  ██████  ███████ ███████ ███████ 
// ██   ██        ██   ██ ██   ██ ██    ██ ██       ██   ██ ██      ██      ██      
// ███████        ██████  ██████  ██    ██ ██   ███ ██████  █████   ███████ ███████ 
//      ██        ██      ██   ██ ██    ██ ██    ██ ██   ██ ██           ██      ██ 
//      ██ ██     ██      ██   ██  ██████   ██████  ██   ██ ███████ ███████ ███████ 

function RenderProgress(context) {
    context.imageSmoothingEnabled = true;

    let v = {
        x: MARK_SEPARATION,
        y: game.map.h + MARKS_YOFFSET + game.marks.length*(MARK_SIZE+MARK_SEPARATION) + PROGRESS_YOFFSET,
        w: MARK_SIZE,
        h: MARK_SIZE
    };
  
    // ----- Obtain progress tracker -----
    let progress = [];
    for (let row of game.progress) {
        for (let pair of row) {
            let name  = pair[0];
            //let count = pair[1];
            if (game.obtained.has(name)) { progress.push({ name: name, position: GetPositionCopy(v)}); }

            v.x += MARK_SIZE + MARK_SEPARATION;
        }
        v.y += MARK_SIZE + MARK_SEPARATION;
        v.x = MARK_SEPARATION;
    }

    context.save(); {
        context.shadowBlur = 5;
        context.shadowColor = "#F7E1B4";
        for (let m of progress) {
            DrawImage(context, images[m.name], m.position);
        }
    } context.restore();

}

// ███████        ██      ██ ███    ██ ███████ 
// ██             ██      ██ ████   ██ ██      
// ███████        ██      ██ ██ ██  ██ █████   
//      ██        ██      ██ ██  ██ ██ ██      
// ███████ ██     ███████ ██ ██   ████ ███████ 

function GetLineOrigin() {
    if (current_state == STATE_LINK1 || current_state == STATE_ITEMLINK) {
        let warp = game.warps[current_location][link_warp];
        let offset = { x: 0, y: 0};
        if (warp.link_type == LINKTYPE_WARP && warp.text_offset) {
            if (warp.text_offset.x) { offset.x = game.frame.naturalWidth  * warp.text_offset.x; }
            if (warp.text_offset.y) { offset.y = game.frame.naturalHeight * warp.text_offset.y; }
        }
        return {
            x: rendered_location.x + warp.x*rendered_location.scale + offset.x,
            y: rendered_location.y + warp.y*rendered_location.scale + offset.y
        }
    }
    else {
        let location = game.locations[link_location];
        return {
            x: (location.x + location.w/2) * MAP_SCALE,
            y: (location.y + location.h/2) * MAP_SCALE
        }
    }
}
function RenderLine(context) {
    if (current_state == STATE_DEFAULT) { return; }
    context.imageSmoothingEnabled = false;

    info = GetLineOrigin();
    context.save(); {
        context.strokeStyle = line_color;
        context.lineWidth = LINE_THICKNESS;
        context.beginPath();
        context.moveTo(info.x, info.y);
        context.lineTo(mouse_position.x, mouse_position.y);
        context.stroke();
    } context.restore();
}

function RenderMapText(context) {
    context.imageSmoothingEnabled = false;
    
    // ----- Draw location text -----
    let location = game.locations[current_location];
    context.save(); {
        context.font = "bold " + game.font_size + " " + game.font;
        context.textAlign = "center";
        context.fillStyle = "#111111";

        let text_position = {
            x: game.map.w - (FRAME_WIDTH /2)*MAP_SCALE,
            y: game.map.h - (FRAME_HEIGHT/2)*MAP_SCALE + LINE_YOFFSET
        };
        let lines = location.name.split("\n");
        if (current_hovering_location && current_hovering_location.target != current_location) {
            lines = game.locations[current_hovering_location.target].name.split("\n");
            context.fillStyle = "#888888";
        }
        switch (lines.length) {
            case 1: {
                context.fillText(lines[0], text_position.x, text_position.y);
            } break;
            default: {
                console.error("ERROR: Text can have more than 2 lines! Only rendering the 2 first lines.");
            } // falldown
            case 2: {
                context.fillText(lines[0], text_position.x, text_position.y - LINE_BREAK_YOFFSET);
                context.fillText(lines[1], text_position.x, text_position.y + LINE_BREAK_YOFFSET);
            } break;
        }
    } context.restore();

    // ----- Draw map mark -----
    context.save(); {
        context.lineWidth = MAP_MARK_WIDTH;
        context.strokeStyle = line_color;
        let v = {
            x: location.x*MAP_SCALE -   MAP_MARK_OFFSET,
            y: location.y*MAP_SCALE -   MAP_MARK_OFFSET,
            w: location.w*MAP_SCALE + 2*MAP_MARK_OFFSET,
            h: location.h*MAP_SCALE + 2*MAP_MARK_OFFSET,
        };
        DrawBox(context, v);
    } context.restore();
}

function RenderRemainingText(context) {
    let layer = layers[LAYER_LINE];
    context.imageSmoothingEnabled = false;

    context.save(); {
        context.font = "bold " + CHECKS_FONTSIZE + " Avenir";
        context.textAlign = "center";
        context.fillStyle = CHECKS_COLOR;

        let text_position = {
            x: game.left_width - CHECKS_XOFFSET + MARK_SIZE + 15 + CONFIG_HEIGHT,
            y: layer.canvas.height - CHECKS_YOFFSET,
        };
        context.fillText(game.marks[0][0][1], text_position.x, text_position.y);
    } context.restore();
}

function RenderTooltip(context) {
    if (!current_hovering_mark) { return; }
    cooldown_tooltip -= delta_time;
    if (cooldown_tooltip >= 0) { return; }

    // Get tooltip text & figure out if we should render the tooltip
    let tooltip_folder = tooltips[game.folder];
    let tooltip_text = undefined;
    if (tooltip_folder) {
        tooltip_text = tooltip_folder[current_hovering_mark.target];
        if (tooltip_text === null) { return; }
    }
    
    if (!tooltip_text) {
        tooltip_text = tooltips[current_hovering_mark.target];
    }
    if (tooltip_text === null) { return; }

    if (!tooltip_text) {
        let words = current_hovering_mark.target.split("_");
        for (let i = 0; i < words.length; ++i) {
            words[i] = words[i].charAt(0).toUpperCase() + words[i].slice(1);
        }
        tooltip_text = words.join(" ");
    }
    
    // Place tooltip box
    let v = {
        x: mouse_position.x + TOOLTIP_XOFFSET,
        y: mouse_position.y + TOOLTIP_YOFFSET,
        w: TOOLTIP_SIZEX,
        h: TOOLTIP_SIZEY,
    }
    if (current_hovering_mark.type == TYPE_MODIFIER) {
        v.x = mouse_position.x - TOOLTIP_SIZEX;
    }

    // Draw tooltip
    context.save(); {
        context.fillStyle = "#8a7c62" + "DD";
        DrawSquare(context, v);
        DrawBox(context, v);

        v.y += MARK_SIZE - TOOLTIP_CENTERTEXT;
        v.x += v.w/2;
        context.font = "bold 14px Avenir";
        context.textAlign = "center";
        context.fillStyle = CHECKS_COLOR;

        let lines = tooltip_text.split("\n");
        switch (lines.length) {
            case 1: {
                context.fillText(lines[0], v.x, v.y);
            } break;
            default: {
                console.error("ERROR: Text can have more than 2 lines! Only rendering the 2 first lines.");
            } // falldown
            case 2: {
                context.fillText(lines[0], v.x, v.y - TOOLTIP_LINEBREAK);
                context.fillText(lines[1], v.x, v.y + TOOLTIP_LINEBREAK);
            } break;
        }
    } context.restore();
}

//  ██████         ██   ██ ██  ██████  ██   ██ ██      ██  ██████  ██   ██ ████████ ███████ 
// ██              ██   ██ ██ ██       ██   ██ ██      ██ ██       ██   ██    ██    ██      
// ███████         ███████ ██ ██   ███ ███████ ██      ██ ██   ███ ███████    ██    ███████ 
// ██    ██        ██   ██ ██ ██    ██ ██   ██ ██      ██ ██    ██ ██   ██    ██         ██ 
//  ██████  ██     ██   ██ ██  ██████  ██   ██ ███████ ██  ██████  ██   ██    ██    ███████ 

function RenderHighlights(context) {
    if (!highlight) { return; }
    
    if (highlight.duration == undefined) { // new highlight
        highlight.duration   = HIGHLIGHT_DURATION;
        highlight.blinking   = true;
        highlight.blink_time = HIGHLIGHT_BLINKING;
    }
    if (highlight.duration < 0 || highlight.location != current_location) {
        highlight = null;
        return;
    }
    RerenderLayer(LAYER_HIGHLIGHT);

    highlight.duration   -= delta_time;
    highlight.blink_time -= delta_time;
    if (highlight.blink_time < 0) {
        highlight.blink_time = HIGHLIGHT_BLINKING;
        highlight.blinking = !highlight.blinking;
    }
    if (!highlight.blinking) { return; }

    context.save(); {
        context.fillStyle   = line_color + MODIFIER_ALPHA;
        context.strokeStyle = line_color;
        context.lineWidth = MAP_MARK_WIDTH;
        if (highlight.warps) {
            for (let w of highlight.warps) {
                let i = GetWarpRenderInfo(game.warps[highlight.location][w]);
                if (i.type == "image") {
                    DrawSquare(context, i);
                }
                else {
                    DrawBox(context, i);
                }
            }
        }

        if (highlight.locations) {
            for (let location_name of highlight.locations) {
                let location = game.locations[location_name];
                let v = {
                    x: location.x*MAP_SCALE -   MAP_MARK_OFFSET,
                    y: location.y*MAP_SCALE -   MAP_MARK_OFFSET,
                    w: location.w*MAP_SCALE + 2*MAP_MARK_OFFSET,
                    h: location.h*MAP_SCALE + 2*MAP_MARK_OFFSET,
                };
                DrawSquare(context, v);
            }
        }
    } context.restore();
}


//  █████  ██    ██ ██   ██ ██ ██      ██  █████  ██████  
// ██   ██ ██    ██  ██ ██  ██ ██      ██ ██   ██ ██   ██ 
// ███████ ██    ██   ███   ██ ██      ██ ███████ ██████  
// ██   ██ ██    ██  ██ ██  ██ ██      ██ ██   ██ ██   ██ 
// ██   ██  ██████  ██   ██ ██ ███████ ██ ██   ██ ██   ██ 

function GetWarpRenderInfo(warp) {
    let info = {
        type: "image",
        image: images["unknown"],
        x: 0, y: 0, w: 0, h: 0,
        text_position: {x: 0, y:0 }, text: ""
    };
    if (warp.link_type) {
        if (warp.link_type == LINKTYPE_MARK) {
            info.image = images[warp.link];
        }
        else {
            info.type = "text";
            // Draw location/warp
            info.x = rendered_location.x + warp.x*rendered_location.scale - (game.frame.naturalWidth * LOCATION_SIZE)/2 ;
            info.y = rendered_location.y + warp.y*rendered_location.scale - (game.frame.naturalHeight * LOCATION_SIZE)/2;
            info.w = game.frame.naturalWidth * LOCATION_SIZE;
            info.h = game.frame.naturalHeight * LOCATION_SIZE;
            info.image = game.frame;

            info.text_position = {
                x: rendered_location.x + warp.x*rendered_location.scale,
                y: rendered_location.y + warp.y*rendered_location.scale + WARP_LINE_YOFFSET
            }
            info.text = game.locations[warp.link_location].name;

            if (warp.text_offset) {
                if (warp.text_offset.x) {
                    let offset = game.frame.naturalWidth * LOCATION_SIZE * warp.text_offset.x;
                    info.text_position.x += offset;
                    info.x               += offset;
                }
                if (warp.text_offset.y) {
                    let offset = game.frame.naturalHeight * LOCATION_SIZE * warp.text_offset.y;
                    info.text_position.y += offset;
                    info.y               += offset;
                }
            }

            if (game.warps[warp.link_location][warp.link].name) info.text = game.warps[warp.link_location][warp.link].name;
        }
    }

    if (info.type == "image") {
        info.x = rendered_location.x + warp.x*rendered_location.scale - (info.image.naturalWidth * LOCATION_SIZE)/2;
        info.y = rendered_location.y + warp.y*rendered_location.scale - (info.image.naturalHeight * LOCATION_SIZE)/2;
        info.w = info.image.naturalWidth * LOCATION_SIZE;
        info.h = info.image.naturalHeight * LOCATION_SIZE;

        if (warp.item) {
            let new_w = info.w / 1.375;
            let new_h = info.h / 1.375;

            if (!warp.link.startsWith("item_")) {
                info.item_frame = {};
                info.item_frame.x = rendered_location.x + warp.x*rendered_location.scale - (icons.item_frame.naturalWidth * LOCATION_SIZE)/2;
                info.item_frame.y = rendered_location.y + warp.y*rendered_location.scale - (icons.item_frame.naturalHeight * LOCATION_SIZE)/2;
                info.item_frame.w = icons.item_frame.naturalWidth * LOCATION_SIZE;
                info.item_frame.h = icons.item_frame.naturalHeight * LOCATION_SIZE;

                new_w = info.w / 1.5;
                new_h = info.h / 1.5;
            }

            info.x += (info.w - new_w) / 2;
            info.y += (info.h - new_h) / 2;
            info.w = new_w;
            info.h = new_h;
        }
    }

    return info;
}

function DrawSquareContextless(context, v, color) {
    context.save(); {
        context.fillStyle = color;
        context.fillRect(v.x, v.y, v.w, v.h);
    } context.restore();
}
function DrawSquare(context, v) {
    context.fillRect(v.x, v.y, v.w, v.h);
}

function DrawBox(context, v) {
    context.strokeRect(v.x, v.y, v.w, v.h);
}
function DrawBoxContextless(context, v, width, color) {
    context.save(); {
        context.lineWidth   = width;
        context.strokeStyle = color;
        context.strokeRect(v.x, v.y, v.w, v.h);
    } context.restore();
}

function DrawImage(context, image, v) {
    context.drawImage(image, v.x, v.y, v.w, v.h);
}

function ClearLayerContext(layer) {
    layer.context.clearRect(0, 0, layer.canvas.width, layer.canvas.height);
}
function RerenderLayer(level) {
    //if (DEBUG.ENABLED) { console.log("Rerendering " + LAYER_NAME[level]); }
    layers[level].rerender = true;
    if (level == LAYER_LOCATION) {
        highlight = null;
    }
}
function RerenderAll() {
    //if (DEBUG.ENABLED) { console.log("Rerendering ~everything~"); }
    for (let layer of layers) {
        layer.rerender = true;
    }
}