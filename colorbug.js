let numBuggiesW, numBuggiesH;
if (window.innerWidth > window.innerHeight){
    // Assuming regular pc screen
    numBuggiesW = 13;
    numBuggiesH = 11;
} else {
    // Assuming mobile screen
    numBuggiesW = 7;
    numBuggiesH = 9;
}

let COLOR_CHOICES = ['blue','purple','green','red','orange'];
var visited = [];
var bugAt = [Math.ceil((numBuggiesH/2-1)),Math.floor(numBuggiesW/2)];

$( document ).ready(function() {
    resize();
    window.onresize = resize;

    initBuggie();
    runBuggie();
});


function initBuggie(){
    for (var i = 0; i < numBuggiesH; i++){
        visited[i] = [];
        for (var j = 0; j < numBuggiesW; j++){
            visited[i][j] = false;
            
            buggieId = i+','+j;
            $("<div>", {
                'id':buggieId,
                'css': {
                    'background-color':'white',
                    'color':'white',
                    'padding-right':window.innerWidth/numBuggiesW+'px',
                    'padding-top':window.innerHeight/numBuggiesH+'px',
                    'display': 'inline-block',
                    'margin-bottom': '0px',
                    'float':'left'
                }
            }).appendTo('body');
        }
    }
}


function runBuggie(){
    visited[bugAt[0]][bugAt[1]]=true;
    
    var count = 0;
    (function loop() {
        if (bugAt == null){
            return;
        }
        if (count < 3) {
            // Making sure framerate is not too high
            count++;
            requestAnimationFrame(loop);
            return;
        }
        count = 0;
        addBuggie(bugAt);
        bugAt = selectUnvisitedNeighbor(bugAt, visited);
        requestAnimationFrame(loop);
    })();
}

document.addEventListener('click', function(){
if (bugAt == null)
    refresh();
});

document.addEventListener('touchstart', function(){
if (bugAt == null)
    refresh();
});


function resize() {
    document.body.style.width = window.innerWidth + 'px';
    document.body.style.height = window.innerHeight + 'px';

    if (document.getElementById('0,0') === null){
        // Buggies have not been instantiated yet
        return;
    }

    for (var i = 0; i < numBuggiesH; i++){
        for (var j = 0; j < numBuggiesW; j++){
            buggieId = i+','+j;
            buggie = document.getElementById(buggieId);
            
            buggie.style.paddingRight = window.innerWidth/numBuggiesW+'px';
            buggie.style.paddingTop = window.innerHeight/numBuggiesH+'px';
        }
    }
}


function addBuggie(coord){
    visited[coord[0]][coord[1]] = true;
    let buggieId = coord[0]+','+coord[1];
    let color = random_choice(COLOR_CHOICES)
    document.getElementById(buggieId).style.backgroundColor = color;
    document.getElementById(buggieId).style.color = color;
}
    

function selectUnvisitedNeighbor(coord, arr){
    // Returns null if coord has no unvisited neighbors
    var x = coord[0], y = coord[1];
    
    let unvisitedNeighbors =  getUnvisitedNeighbors(coord, arr);
    if (unvisitedNeighbors.length === 0)
        return null;

    var returnOptions = unvisitedNeighbors.filter(function(obj){
        return stillConnected(obj, arr);
    });
    
    if (returnOptions.length === 0){
        // All possible moves will create a new partition
        return safestMove(unvisitedNeighbors, arr);
    }
        
    return random_choice(returnOptions);
}


// Returns move which creates the largest partition and visits all smaller partitions
function safestMove(coordList, arr){ 
    var partsLists = []
    for (var i = 0; i < coordList.length; i++){
        let coord = coordList[i];
        arr[coord[0]][coord[1]] = true;
        partsLists.push(getPartitionsAndSizes(arr));
        arr[coord[0]][coord[1]] = false;
    }

    var largestPart = {'size':0};
    var idx = 0;
    
    for (var i = 0; i < partsLists.length; i++){
        partsLists[i].forEach(function(part){
            if (part['size'] > largestPart['size']){
                largestPart = part;
                idx = i;
            }
        });
    }

    arr[coordList[idx][0]][coordList[idx][1]] = true;
    partsLists[idx].forEach(function(part){
        if (part['size'] != largestPart['size'] || part['x'] != largestPart['x'] || part['y'] != largestPart['y']){
            var coord = [part['x'],part['y']];
            numUnvisitedConnected(coord, arr);
        }
    });
    arr[coordList[idx][0]][coordList[idx][1]] = false;

    return coordList[idx];
}


// Returns [] if coord has no unvisited neighbors
function getUnvisitedNeighbors(coord, arr){
    var x = coord[0], y = coord[1];
    var returnOptions = [];
    
    if (x != 0 && !arr[x-1][y]){
        returnOptions.push([x-1, y]);
    }   
    if (y != 0 && !arr[x][y-1]){
        returnOptions.push([x, y-1]);
    }   
    if (x < arr.length-1 && !arr[x+1][y]){
        returnOptions.push([x+1, y]);
    }   
    if (y < arr[x].length-1 && !arr[x][y+1]){
        returnOptions.push([x, y+1]);
    }
    
    return returnOptions;
}


// Returns true if visiting coord in arr will not create a new partition
function stillConnected(coord, arr){
    var arr_cp = deepCopy(arr);

    arr_cp[coord[0]][coord[1]] = true;
    
    var firstUnvisited = getFirstUnvisited(arr_cp);
    if (firstUnvisited === null)
        return true;
    
    var totUn = totalUnvisited(arr_cp);
    var numUnCon = numUnvisitedConnected(firstUnvisited, arr_cp);
    return totUn === numUnCon;
}


function deepCopy(arr){
    return arr.map(function(array) {
        return array.slice();
    });
}


function getFirstUnvisited(arr){
    for (var i = 0; i < arr.length; i++){
        for (var j = 0; j < arr[i].length; j++){
            if (!arr[i][j]){
                return [i,j];
            }   
        }
    }
    return null;
}


//  Visits all unvisited cells in arr which are connected to coord
//  Returns count of cells visited
function numUnvisitedConnected(coord, arr){
    if (arr[coord[0]][coord[1]])
        return 0;
    
    var sum = 1;
    arr[coord[0]][coord[1]] = true;

    let unvisitedNeighbors = getUnvisitedNeighbors(coord, arr);
    unvisitedNeighbors.forEach(function(coord){
        sum += numUnvisitedConnected(coord, arr);
    });

    return sum;
}


// Returns array of partition objects in form {'x':int, 'y':int, 'size':int}
//         where x and y represent a coordinate in the partition
function getPartitionsAndSizes(arr){
    var arr_cp = deepCopy(arr);

    var firstUnvisited = getFirstUnvisited(arr_cp);
    var returnArr = [];

    while (firstUnvisited !== null){
        partition = {'x':firstUnvisited[0], 'y':firstUnvisited[1]};
        partition['size'] = numUnvisitedConnected(firstUnvisited, arr_cp);
        returnArr.push(partition);
        firstUnvisited = getFirstUnvisited(arr_cp);
    }
    
    return returnArr;
}


function totalUnvisited(arr){
    var unvisitedCount = 0 ;
    arr.forEach(function(obj){
        unvisitedCount += obj.filter(function(obj){return obj===false;}).length;
    });
    return unvisitedCount;
}


function random_choice(arr){
    return arr[Math.floor(Math.random()*arr.length)];
}


function refresh(){
    $('body').empty();
    bugAt = [Math.ceil((numBuggiesH/2-1)),Math.floor(numBuggiesW/2)];
    initBuggie();
    runBuggie();
}
