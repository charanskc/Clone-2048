import Grid from "./Grid.js";
import Tile from "./Tile.js";




const gameBoard = document.getElementById("game-board");


const grid = new Grid(gameBoard)
grid.randomEmptyCell().tile = new Tile(gameBoard)
grid.randomEmptyCell().tile = new Tile(gameBoard)

let details = navigator.userAgent;
let regexp = /android|iphone|kindle|ipad/i;

let isMobileDevice = regexp.test(details);

if(isMobileDevice){
    mobileInput()
}else{
    setupInput()
}

function setupInput(){
    window.addEventListener("keydown",handleInput,{once:true})
}

function mobileInput(){
    var startingX, startingY, movingX, movingY;

    document.getElementById("game-board").addEventListener("touchstart", e =>{
        startingX = e.touches[0].clientX;
        startingY = e.touches[0].clientY;
    });
    document.getElementById("game-board").addEventListener("touchmove", e =>{
        movingX = e.touches[0].clientX;
        movingY = e.touches[0].clientY;
    });
    document.getElementById("game-board").addEventListener("touchend", e =>{
        if(startingX+100 < movingX){
            moveRight()
        }else if(startingX - 100 > movingX){
            moveLeft()
        }
    
        if(startingY+100 < movingY){
            moveDown()
        }else if(startingY - 100 > movingY){
            moveUp()
        }
    
        grid.cells.forEach(cell => cell.mergeTiles())
    
        const newTile = new Tile(gameBoard)
        grid.randomEmptyCell().tile = newTile
    
        if(!canMoveUp() && !canMoveDown() && !canMoveLeft() && !canMoveRight()){
            newTile.waitForTransition(true).then(() => {
               myFunction()
            })
            return
        }
        setupInput()
    
    });
}




function myFunction() {
    var x = document.getElementById("snackbar");
    x.className = "show";
    setTimeout(function(){ x.className = x.className.replace("show", ""); }, 3000);
  }

async function handleInput(e){
    switch (e.key){
        case "ArrowUp":
            if(!canMoveUp()){
                setupInput()
                return
            }
            await moveUp()
            break
        case "ArrowDown":
            if(!canMoveDown()){
                setupInput()
                return
            }
            await moveDown()
            break
        case "ArrowLeft":
            if(!canMoveLeft()){
                setupInput()
                return
            }
            await moveLeft()
            break
        case "ArrowRight":
            if(!canMoveRight()){
                setupInput()
                return
            }
            await moveRight()
            break
        default:
            setupInput()
            return
    }

    grid.cells.forEach(cell => cell.mergeTiles())

    const newTile = new Tile(gameBoard)
    grid.randomEmptyCell().tile = newTile

    if(!canMoveUp() && !canMoveDown() && !canMoveLeft() && !canMoveRight()){
        newTile.waitForTransition(true).then(() => {
           myFunction()
        })
        return
    }
    setupInput()
}


function moveUp(){
    return slideTiles(grid.cellsByColumn)
}

function moveDown(){
    return slideTiles(grid.cellsByColumn.map(column => [...column].reverse()))
}

function moveLeft(){
    return slideTiles(grid.cellsByRow)
}

function moveRight(){
    return slideTiles(grid.cellsByRow.map(row => [...row].reverse()))
}

function canMoveUp(){
    return canMove(grid.cellsByColumn)
}
function canMoveDown(){
    return canMove(grid.cellsByColumn.map(column => [...column].reverse()))
}
function canMoveLeft(){
    return canMove(grid.cellsByRow)
}
function canMoveRight(){
    return canMove(grid.cellsByRow.map(row => [...row].reverse()))
}

function canMove(cells){
    return cells.some(group => {
        return group.some((cell,index) =>{
            if(index == 0) return false
            if(cell.tile == null) return false
            const moveToCell = group[index - 1]
            return moveToCell.canAccept(cell.tile)
        })
    })
}


function slideTiles(cells){
    return Promise.all(
    cells.flatMap(group => {
        const promises = []
        for(let i=1;i<group.length;i++){
            const cell = group[i]
            if(cell.tile == null) continue
            let lastValidCell
            for(let j = i -1; j >= 0; j--){
                const moveToCell = group[j]
                if(!moveToCell.canAccept(cell.tile)) break
                lastValidCell = moveToCell
            }
            if(lastValidCell != null){
                promises.push(cell.tile.waitForTransition())
                if(lastValidCell.tile != null){
                    lastValidCell.mergeTile = cell.tile
                }else{
                    lastValidCell.tile = cell.tile
                }
                cell.tile = null
            }
        }
        return promises
    }))
}