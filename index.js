window.addEventListener('load', () => {
    // constants
    const segments = {
        "Chapter A": {
            levels: ["A01", "A01.1", "A05", "A06", "A07", "A08", "A09", "A10", "A11", "A12", "A13", "A14", "A15", "A16", "A17", "A18", "A19", "A20", "A21"],
            numberOfTimesInLevelSelect: 1,
        },
        "Chapter B": {
            levels: ["B01", "B02", "B04", "B05", "B06", "B07", "B08", "B09", "B10", "B11", "B12", "B13", "B14", "B15", "B16", "B17", "B18", "B19"],
            numberOfTimesInLevelSelect: 1,
        },
        "Chapter C": {
            levels: ["C01", "C04", "C05", "C06", "C07", "C08", "C09", "C10", "C11", "C12", "C13", "C14", "C15", "C16", "C17", "C18", "C19", "C20", "C21", "C22"],
            numberOfTimesInLevelSelect: 1,
        },
        "Chapter D": {
            levels: ["D01", "D05", "D06", "D07", "D08", "D09", "D10", "D11", "D12", "D13", "D14", "D15", "D16", "D17", "D18", "D19", "D20"],
            numberOfTimesInLevelSelect: 1,
        },
        "Chapter E": {
            levels: ["E01", "E02", "E05", "E06", "E07", "E08", "E09", "E10", "E11", "E12", "E13", "E14", "E15", "E16", "E17", "E18", "E19"],
            numberOfTimesInLevelSelect: 2,
        },
    }
    
    const loadingTimeEnteringLevel = 0.835;
    const timeSpentPerTripInLevelSelect = 0.845; 
    const levelCount = Object.values(segments).reduce((prev, curr) => prev + curr.levels.length, 0);
    const levelSelectTripsCount = Object.values(segments).reduce((prev, curr) => prev + curr.numberOfTimesInLevelSelect, 0);
    
    // time holders
    let totalTime = loadingTimeEnteringLevel*(levelCount-1);       
    const segmentTimes = [];

    // player leaderboard
    const playerRecords = {};
    const untiedPlayerRecords = {};

    // helper funcs
    const get = async (url) => await fetch(url).then(resp => resp.json()).then(resp => resp.data);
    const formatTime = (t) => `${Math.floor(t/60)}:${(t%60).toFixed(2).length<5?`0${(t%60).toFixed(2)}`:(t%60).toFixed(2)}`;
    let error = false;

    // holds Time Calculation text
    const timeCalcText = document.createElement('p');
    timeCalcText.className = "calc-time";
    timeCalcText.innerText = "Loading...";
    document.body.appendChild(timeCalcText);

    // holds Loading Time text
    const loadingTimeText = document.createElement('p');
    loadingTimeText.className = "loading-time";
    loadingTimeText.innerText = "Loading...";
    document.body.appendChild(loadingTimeText);

    // holds all segments
    const container = document.createElement("div");
    container.className = "container";
    document.body.appendChild(container);

    get("https://www.speedrun.com/api/v1/games/9do8nro1/levels").then(levelsArr => {
        const segmentPromises = [];

        // note: in Will You Snail, segments = chapters
        Object.entries(segments).forEach(([segmentName, segment], segI) => {
            totalTime += segment.numberOfTimesInLevelSelect*timeSpentPerTripInLevelSelect;
            const levelPromises = [];

            // container for this segment (column)
            const segmentContainer = document.createElement("div");
            segmentContainer.className = "segment";
            
            // Chapter X text
            const segmentHeading = document.createElement("h4");
            segmentHeading.className = "segment-label";
            segmentHeading.innerText = segmentName;
            segmentContainer.appendChild(segmentHeading);

            // time for each segment
            const segmentTimeLabel = document.createElement("p");
            segmentTimeLabel.className = "segment-time";
            segmentTimeLabel.innerText = "Loading...";
            segmentContainer.appendChild(segmentTimeLabel);

            let segmentTime = (segment.levels.length-1)*loadingTimeEnteringLevel + segment.numberOfTimesInLevelSelect * timeSpentPerTripInLevelSelect;
            segment.levels.forEach(level => {
                const levelObj = levelsArr.find(obj => obj.name === level);
                const levelUrl = levelObj.links[0].uri;
                const levelId = levelObj.id;

                // Create the div to hold the level/time pair
                const levelTimePairElement = document.createElement("p");
                levelTimePairElement.id = level;

                const levelAElement = document.createElement("a");
                levelAElement.innerText = level;
                levelAElement.target = "_blank";
                levelAElement.href = levelObj.weblink;

                const connector = document.createElement("span");
                connector.innerText = " : ";

                const levelTimeElement = document.createElement("a");
                levelTimeElement.target = "_blank";
                
                levelTimePairElement.appendChild(levelAElement);
                levelTimePairElement.appendChild(connector);
                levelTimePairElement.appendChild(levelTimeElement);
                segmentContainer.appendChild(levelTimePairElement);

                levelPromises.push(get(`${levelUrl}/variables`).then(variableArr => {
                    const variableQueryArr = [];
                    for(let o of variableArr) if(o["is-subcategory"]) variableQueryArr.push(`var-${o.id}=${o.values.default}`);
                    return get(`https://www.speedrun.com/api/v1/leaderboards/9do8nro1/level/${levelId}/7dg1g3xd?embed=players&top=1&${variableQueryArr.join("&")}`).then(async (ilObj) => {
                        if(!ilObj) ilObj = await get(`https://www.speedrun.com/api/v1/leaderboards/9do8nro1/level/${levelId}/7dg1g3xd?embed=players&top=1&${variableQueryArr.join("&")}`);

                        const ilTime = ilObj.runs[0].run.times.primary_t;
                        totalTime += ilTime;
                        segmentTime += ilTime;
                        levelTimeElement.innerText = ilTime.toFixed(2);
                        levelTimeElement.href = ilObj.runs[0].run.weblink; // if there are multiple runs the first one is taken arbitrarily
                        ilObj.runs.forEach(run => {
                            const playerId = run.run.players[0].id;
                            const playerName = ilObj.players.data.find(p => p.id === playerId).names.international;
                            
                            if(!playerRecords[playerName]) playerRecords[playerName] = 0;
                            playerRecords[playerName]++;

                            if(ilObj.runs.length === 1) {
                                if(!untiedPlayerRecords[playerName]) untiedPlayerRecords[playerName] = 0;
                                untiedPlayerRecords[playerName]++;
                            }
                        });
                    }).catch(err => {
                        error = true;
                        console.error(err);
                        console.log(level);
                        console.log(err.message);
                        levelTimeElement.innerText = `ERROR (${err.message})`;
                        document.body.style = "color:#D00;";
                    });
                }));
            });

            container.appendChild(segmentContainer);
            
            segmentPromises.push(Promise.all(levelPromises).then(() => {
                const formattedTime = formatTime(segmentTime);
                segmentTimeLabel.innerText = `${formattedTime}`;
                segmentTimes[segI] = segmentTime;
            }));
        });

        return Promise.all(segmentPromises);
    }).then(() => {            
        document.getElementsByTagName("h1")[0].innerText = formatTime(totalTime);
        
        if(error) {
            document.getElementsByTagName("h1")[0].innerText += " + ERROR";
            const errorHeader = document.createElement("h3")
            errorHeader.innerText = "An error has occured. Please try refreshing the page. If that doesn't resolve the issue, please ping @Ezra3#0928 on Discord with any details that you have";
            document.body.prepend(errorHeader);
        }

        timeCalcText.innerText = `Time Calculation: ${segmentTimes.map(formatTime).join(" + ")} + 4 * ${loadingTimeEnteringLevel}`;
        loadingTimeText.innerText = `Loading Time and Time in Level Select : ${levelCount-1}*${loadingTimeEnteringLevel} + ${levelSelectTripsCount}*${timeSpentPerTripInLevelSelect} = ${((levelCount-1)*loadingTimeEnteringLevel + levelSelectTripsCount*timeSpentPerTripInLevelSelect).toFixed(2)}`;
        
        // display record count leaderboards
        const createLeaderboard = (records, title, anchor=document.body) => {
            const board = document.createElement("div");
            board.className = 'leaderboard-container';
            
            const titleElement = document.createElement("h2");
            titleElement.className = 'leaderboard-title';
            titleElement.innerText = title;
            board.appendChild(titleElement);

            let currPos = 1, prevCount = -1;
            Object.entries(records).sort(([_, a], [__, b]) => b-a).forEach(([name, count], i) => {
                if(prevCount !== count) currPos = i+1;

                const row = document.createElement("div");
                row.className = 'leaderboard-row';
                row.innerText = `[${currPos}] ${name}: ${count}`;
                board.appendChild(row);

                prevCount = count;
            });

            anchor.appendChild(board);
        }

        createLeaderboard(playerRecords, "Total Records Per Player");
        createLeaderboard(untiedPlayerRecords, "Total Untied Records Per Player");
    })
});