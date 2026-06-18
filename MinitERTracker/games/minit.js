let minit = {
	debug: false,
    name: "minit",
    folder: "minit",
    start_location: "10_10",
    font: "Avenir",
    font_size: "28px",

	is_item_tracker: false,
    // Config texts
	config_name: "Minit",
	config_randomizer_author: "qwint",
	config_randomizer_link: "https://archipelago.gg/tutorial/Minit/setup/en",
	//config_tracker_author: "", 
	//config_tracker_link: "",

	// Tracker information // copypasta1: "_":{x:,y:,w:23,h:17,name:"_()"}, // copypasta2: n0:{x:313,y:233},
    locations: {
        "7_10and7_11":{x:21,y:106,w:18,h:28,name:"7_10&7_11(lighthouse)"},
        "8_11":{x:41,y:121,w:18,h:13,name:"8_11(boat)"},
        "9_11":{x:61,y:121,w:18,h:13,name:"9_11(sword)"},
        "10_11":{x:81,y:121,w:18,h:13,name:"10_11(2crab)"},
        "11_11":{x:101,y:121,w:18,h:13,name:"11_11(dolphin)"},
        "12_11":{x:121,y:121,w:18,h:13,name:"12_11(desert beach)"},
        "8_10":{x:41,y:106,w:18,h:13,name:"8_10(coffee shop)"},
        "7_9":{x:21,y:91,w:18,h:13,name:"7_9(land is great)"},
        "10_10":{x:81,y:106,w:18,h:13,name:"10_10(dog house)"},
        "12_8and12_9and12_10":{x:121,y:76,w:18,h:43,name:"12_8&12_9&12_10(drill)"},
        "10_9":{x:81,y:91,w:18,h:13,name:"10_9(boattree)"},
        "9_8":{x:61,y:76,w:18,h:13,name:"9_8(river and maze)"},
        "8_9":{x:41,y:91,w:18,h:13,name:"8_9(3crab)"},
        "8_8":{x:41,y:76,w:18,h:13,name:"8_8(sewer island)"},
        "8_7":{x:41,y:61,w:18,h:13,name:"8_7(throwcheck)"},
        "9_4":{x:61,y:16,w:18,h:13,name:"9_4(bone room)"},
        "9_5":{x:61,y:31,w:18,h:13,name:"9_5(arena)"},
        "10_5":{x:81,y:31,w:18,h:13,name:"10_5(bridge switch)"},
        "10_6":{x:81,y:46,w:18,h:13,name:"10_6(bridge)"},
        "9_6":{x:61,y:46,w:18,h:13,name:"9_6(hotel)"},
        "10_7":{x:81,y:61,w:18,h:13,name:"10_7(mine entrance)"},
        "11_6":{x:101,y:46,w:18,h:13,name:"11_6(factory reception)"},
        "12_6":{x:121,y:46,w:18,h:13,name:"12_6(factory machine)"},
        "12_7":{x:121,y:61,w:18,h:13,name:"12_7(factory central)"},
        "13_7":{x:141,y:61,w:18,h:13,name:"13_7(factory loading)"},
        "14_8":{x:161,y:76,w:18,h:13,name:"14_8(shoe shop)"},
        "14_10":{x:161,y:106,w:18,h:13,name:"14_10(temple)"},
        "13_9":{x:141,y:91,w:18,h:13,name:"13_9(desert RV)"},
        "14_9":{x:161,y:91,w:18,h:13,name:"14_9(desert right cliffs)"},
        "13_10":{x:141,y:106,w:18,h:13,name:"13_10(desert left cliffs)"},
        "6_11":{x:1,y:121,w:18,h:13,name:"6_11(open waters rock)"},
        "11_7b":{x:101,y:61,w:18,h:13,name:"11_7b(mine main)"},
        "8_15b":{x:41,y:181,w:18,h:13,name:"8_15b(island teleporter)"},
        "10_15b":{x:81,y:181,w:18,h:13,name:"10_15b(teleporter maze)"},
        "endless_desert":{x:181,y:1,w:38,h:208,name:"The Endless Desert"},
    },
    // The list of unlisted screens due to being passageways or dead ends: 9_10, 11_10, 11_9, 9_9, 9_7, 8_6, 8_5, 9_3, 8_4, 10_4, 10_8, 11_7, 13_6, 13_8, 14_7, 8_15a(unrandomized), 12_8c, 13_10b, 13_9b, 14_11b, 15_10b, 16_10b, 14_9b, 14_8b, 9_9b, 8_9b, 8_8b, 7_10b, 9_15b, 11_15b, 10_16b, 11_6b, 13_6b, 11_8b, 11_9b, 10_8b, 9_7b, 8_7b, 
    // The list of screens for endless ocean border: 7_7, 7_8, 6_9, 6_10, 6_11(already implemented by itself), 7_12, 8_12, 9_12, 10_12, 11_12, 12_12(also in endless desert), (8_15b)
    // the list of screens for endless desert border: 12_12(also in endless ocean), 13_11, 14_11, 15_10, 15_9, 15_7, 14_6
    warps: {
        "7_10and7_11":{
            n0:{x:160,y:14},
            w0:{x:14,y:120},
            w1:{x:14,y:360},
            e0:{x:306,y:120},
            e1:{x:306,y:300},
            e2:{x:306,y:360},
            s0:{x:160,y:466},
        },
        "8_11":{
            n0:{x:32,y:7},
            n1:{x:184,y:7},
            w0:{x:7,y:60},
            w1:{x:7,y:120},
            e0:{x:313,y:104},
            e1:{x:313,y:208},
            s0:{x:160,y:233},
        },
        "9_11":{
            w0:{x:7,y:104},
            w1:{x:7,y:208},
            e0:{x:313,y:80},
            e1:{x:313,y:192},
            s0:{x:160,y:233},
        },
        "10_11":{
            n0:{x:136,y:7},
            n1:{x:248,y:7},
            n2:{x:272,y:7},
            w0:{x:7,y:80},
            w1:{x:7,y:192},
            e0:{x:313,y:72},
            e1:{x:313,y:192},
            s0:{x:160,y:233},
        },
        "11_11":{
            n0:{x:280,y:7},
            w0:{x:7,y:72},
            w1:{x:7,y:192},
            e0:{x:313,y:128},
            s0:{x:160,y:233},
        },
        "12_11":{
            w0:{x:7,y:128},
            e0:{x:313,y:128},
            s0:{x:80,y:233},
            s1:{x:240,y:233},
        },
        "8_10":{
            n0:{x:24,y:14},
            n1:{x:72,y:14},
            n2:{x:216,y:14},
            w0:{x:14,y:120},
            e0:{x:306,y:160},
            s0:{x:32,y:226},
            s1:{x:184,y:226},
            bn0:{x:208,y:254},
            bw0:{x:14,y:440},
        },
        "7_9":{
            n0:{x:160,y:7},
            w0:{x:7,y:120},
            e0:{x:313,y:72},
//          e1:{x:313,y:160}, //Dead end
            e2:{x:313,y:232},
            s0:{x:160,y:233},
        },
        "10_10":{
            n0:{x:160,y:7},
            n1:{x:248,y:7},
            w0:{x:7,y:120},
            e0:{x:313,y:120},
            s0:{x:136,y:233},
            s1:{x:248,y:233},
            s2:{x:272,y:233},
        },
        "12_8and12_9and12_10":{
            n0:{x:160,y:20},
            w0:{x:20,y:440},
            w1:{x:20,y:552},
            e0:{x:300,y:344},
            e1:{x:300,y:584},
        },
        "10_9":{
            w0:{x:14,y:56},
            e0:{x:306,y:64},
            s0:{x:160,y:226},
            s1:{x:248,y:226},
            bw0:{x:14,y:312},
        },
        "9_8":{
            n0:{x:144,y:14},
//          w0:{x:14,y:96}, //Dead end
            w1:{x:14,y:152},
            e0:{x:306,y:136},
            s0:{x:248,y:226},
            bn0:{x:24,y:254},
            bn1:{x:120,y:254},
//          bn2:{x:152,y:254}, //Passageway
//          be0:{x:306,y:40}, //Passageway
            be1:{x:306,y:312},
            be2:{x:306,y:408},
        },
        "8_9":{
//          n0:{x:64,y:7}, //Passageway
            n1:{x:208,y:7},
//          w0:{x:7,y:72}, //Passageway
//          w1:{x:7,y:160}, //Passageway
//          w2:{x:7,y:232}, //Passageway
            e0:{x:313,y:96},
//          s0:{x:24,y:233}, //Passageway
//          s1:{x:72,y:233}, //Passageway
            s2:{x:216,y:233},
        },
        "8_8":{
            n0:{x:104,y:7},
            n1:{x:248,y:7},
            w0:{x:7,y:120},
            e0:{x:313,y:96},
            e1:{x:313,y:152},
            s0:{x:64,y:233},
            s1:{x:208,y:233},
//          bs0:{x:128,y:473}, //Dead end
        },
        "8_7":{
            n0:{x:152,y:7},
            w0:{x:7,y:176},
            e0:{x:313,y:88},
            s0:{x:104,y:233},
            s1:{x:248,y:233},
        },
        "9_4":{
            n0:{x:160,y:7},
            w0:{x:7,y:136},
            e0:{x:313,y:120},
            s0:{x:176,y:233},
        },
        "9_5":{
            n0:{x:176,y:7},
            w0:{x:7,y:56},
            s0:{x:160,y:233},
        },
        "10_5":{
//          n0:{x:160,y:7}, //Dead end
            s0:{x:96,y:233},
            s1:{x:160,y:233},
            s2:{x:240,y:233},
        },
        "10_6":{
            n0:{x:96,y:7},
            n1:{x:160,y:7},
            n2:{x:240,y:7},
            w0:{x:7,y:120},
            e0:{x:313,y:120},
            s0:{x:88,y:233},
            s1:{x:168,y:233},
            s2:{x:280,y:233},
        },
        "9_6":{
            n0:{x:160,y:7},
            w0:{x:7,y:128},
            e0:{x:313,y:120},
        },
        "10_7":{
            n0:{x:88,y:14},
            n1:{x:168,y:14},
//          n2:{x:280,y:7}, //Passageway
            s0:{x:160,y:226},
//          be0:{x:313,y:344}, //Passageway
            be1:{x:306,y:408},
        },
        "11_6":{
            w0:{x:7,y:120},
            e0:{x:313,y:112},
            s0:{x:120,y:233},
        },
        "12_6":{
            w0:{x:14,y:112},
            e0:{x:306,y:176},
            s0:{x:160,y:226},
            bw0:{x:14,y:328},
            be0:{x:306,y:328},
            bs0:{x:160,y:466},
        },
        "12_7":{
            n0:{x:160,y:14},
            s0:{x:160,y:226},
            bn0:{x:160,y:254},
            cs0:{x:168,y:466},
        },
        "13_7":{
            n0:{x:112,y:7},
            e0:{x:313,y:120},
            s0:{x:160,y:233},
            bn0:{x:88,y:7},
        },
        "14_8":{ //Not a passageway because of teleport accessibility
            w0:{x:7,y:136},
            s0:{x:152,y:233},
        },
        "14_10":{
            n0:{x:160,y:14},
            w0:{x:14,y:120},
            e0:{x:306,y:120},
            s0:{x:160,y:226},
            bn0:{x:168,y:254},
            bw0:{x:14,y:360},
            be0:{x:306,y:360},
            bs0:{x:168,y:466},
        },
        "13_9":{
            w0:{x:7,y:104},
            e0:{x:313,y:128},
//          e1:{x:313,y:224}, //Passageway
            s0:{x:152,y:233},
//          s1:{x:296,y:233}, //Passageway
        },
        "14_9":{
            n0:{x:152,y:7},
            w0:{x:7,y:128},
            w1:{x:7,y:224},
            e0:{x:313,y:144},
            s0:{x:160,y:233},
        },
        "13_10":{
            n0:{x:152,y:7},
            n1:{x:296,y:7},
            w0:{x:7,y:104},
            e0:{x:313,y:120},
            s0:{x:176,y:233},
        },
        "6_11":{ //Not a deadend because of shark abuse
            e0:{x:313,y:120},
        },
        "11_7b":{
            n0:{x:216,y:7},
            w0:{x:7,y:104},
            w1:{x:7,y:168},
            s0:{x:184,y:233},
        },
        "8_15b":{ //Not a deadend
            e0:{x:313,y:88},
        },
        "10_15b":{
            w0:{x:7,y:88},
            e0:{x:313,y:24},
            s0:{x:248,y:233},
        },
        "endless_desert":{
            n0:{x:240,y:1489},
            n1:{x:480,y:1249},
            n2:{x:800,y:1249},
            w0:{x:1009,y:360},
            w1:{x:1009,y:840},
            w2:{x:1009,y:1080},
            w3:{x:369,y:1320},
            s0:{x:800,y:191},
        },
        template: {

        },
    },

    // Numbers are meant to be to check if exist any marks/progress in the maps
    // if null, then we don't do tracking
    // if undefined, then we don't draw the mark
    marks: [
        [["unknown",     0], ["corridor",    0], ["dead_end", null]],
        [["items",      0]]
        //[["item_event", 0], ["item_checked", null]]
    ],
    progress: [
        //[["feather_badge", 0]]
    ],
    modifiers: [
        [["#ce4069"],  ["#ff9c54"], ["#f3d23b"], ["#743683"], ["#654321"], ["#014f01"]],
    [["#4d90d5"], ["#74cec0"],   ["#90c12c"],  ["#ec8fe6"],   ["#5a5366"],  ["#00146b"]]
    ],
};