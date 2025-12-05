let CELL_SIZE = 60; // Maybe edit later?
let BOARD_COLS = 10;
let BOARD_ROWS = 8;
let BOARD_OFFSET_X = 50;
let BOARD_OFFSET_Y = 80;

const PLAYER_COLORS = [
  '#4FC3F7',
  '#81C784',
  '#FFB74D',
  '#E57373',
  '#BA68C8'
];

const PLAYER_NAMES = ['Blue', 'Green', 'Orange', 'Red', 'Purple'];

let gameState = 'setup';
let numPlayers = 2;
let waterSparsity = 0.3;
let poisonSparsity = 0.15;
let obstacleSparsity = 0.08;
let maxDropWeight = 5;

let board = [];
let players = [];
let currentPlayerIndex = 0;
let selectedWeight = 1;
let selectedColumn = -1;

let fallingDrop = null;
let fallingSpeed = 5;
let animationFrame = 0;

let collectedThisTurn = 0;
let gameMessage = '';
let messageTimer = 0;

let setupButtons = [];
let weightButtons = [];
let columnButtons = [];

const CELL_EMPTY = 0;
const CELL_OBSTACLE = 'X';

function setup() {
  let canvasWidth = BOARD_OFFSET_X * 2 + BOARD_COLS * CELL_SIZE + 150; // extra for side panel
  let canvasHeight = BOARD_OFFSET_Y * 2 + BOARD_ROWS * CELL_SIZE + 100; // extra for controls
  let canvas = createCanvas(canvasWidth, canvasHeight);
  canvas.parent('sketch-container');
  textFont('Segoe UI');
  createSetupButtons();
}

function draw() {
  background(25, 35, 55);
  
  if (gameState === 'setup') {
    drawSetupScreen();
  } else if (gameState === 'playing' || gameState === 'animating') {
    drawGame();
  } else if (gameState === 'gameOver') {
    drawGame();
    drawGameOver();
  }
  
  if (messageTimer > 0) {
    messageTimer--;
    drawMessage();
  }
}

function createSetupButtons() {
  setupButtons = [];
}

function drawSetupScreen() {
  push();
  
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(40);
  text('Heavy Rain', width / 2, 70);
  
  textSize(20);
  fill(200);
  text('Configure your game settings', width / 2, 110);
  
  let startY = 200;
  let spacing = 50;
  let labelX = 150;
  let btnStartX = 300;
  
  fill(255);
  textSize(20);
  textAlign(LEFT, CENTER);
  text('Players:', labelX, startY);
  
  for (let i = 1; i <= 5; i++) {
    let btnX = btnStartX + (i - 1) * 38;
    let btnY = startY - 15;
    let isSelected = numPlayers === i;
    
    fill(isSelected ? PLAYER_COLORS[i - 1] : 60);
    stroke(isSelected ? 255 : 100);
    strokeWeight(2);
    rect(btnX, btnY, 32, 30, 5);
    
    fill(isSelected ? 0 : 200);
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(20);
    text(i, btnX + 16, btnY + 15);
  }
  
  startY += spacing;
  fill(255);
  textSize(20);
  textAlign(LEFT, CENTER);
  text('Water:', labelX, startY);
  
  let sparsityOptions = [
    { label: 'Dense', value: 0.5 },
    { label: 'Medium', value: 0.3 },
    { label: 'Sparse', value: 0.15 }
  ];
  
  for (let i = 0; i < sparsityOptions.length; i++) {
    let btnX = btnStartX + i * 90;
    let btnY = startY - 15;
    let isSelected = waterSparsity === sparsityOptions[i].value;
    
    fill(isSelected ? '#4FC3F7' : 60);
    stroke(isSelected ? 255 : 100);
    strokeWeight(2);
    rect(btnX, btnY, 80, 30, 5);
    
    fill(isSelected ? 0 : 200);
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(20);
    text(sparsityOptions[i].label, btnX + 40, btnY + 15);
  }
  
  startY += spacing;
  fill(255);
  textSize(20);
  textAlign(LEFT, CENTER);
  text('Poison:', labelX, startY);
  
  let poisonOptions = [
    { label: 'None', value: 0 },
    { label: 'Few', value: 0.1 },
    { label: 'Many', value: 0.2 },
    { label: 'Lots', value: 0.3 }
  ];
  
  for (let i = 0; i < poisonOptions.length; i++) {
    let btnX = btnStartX + i * 65;
    let btnY = startY - 15;
    let isSelected = poisonSparsity === poisonOptions[i].value;
    
    fill(isSelected ? '#E57373' : 60);
    stroke(isSelected ? 255 : 100);
    strokeWeight(2);
    rect(btnX, btnY, 60, 30, 5);
    
    fill(isSelected ? 0 : 200);
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(20);
    text(poisonOptions[i].label, btnX + 30, btnY + 15);
  }
  
  startY += spacing;
  fill(255);
  textSize(20);
  textAlign(LEFT, CENTER);
  text('Obstacles:', labelX, startY);
  
  let obstacleOptions = [
    { label: 'None', value: 0 },
    { label: 'Few', value: 0.05 },
    { label: 'Some', value: 0.1 },
    { label: 'Many', value: 0.15 }
  ];
  
  for (let i = 0; i < obstacleOptions.length; i++) {
    let btnX = btnStartX + i * 65;
    let btnY = startY - 15;
    let isSelected = obstacleSparsity === obstacleOptions[i].value;
    
    fill(isSelected ? '#78909C' : 60);
    stroke(isSelected ? 255 : 100);
    strokeWeight(2);
    rect(btnX, btnY, 60, 30, 5);
    
    fill(isSelected ? 0 : 200);
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(20);
    text(obstacleOptions[i].label, btnX + 30, btnY + 15);
  }
  
  startY += spacing;
  fill(255);
  textSize(20);
  textAlign(LEFT, CENTER);
  text('Drops (k):', labelX, startY);
  
  for (let i = 3; i <= 7; i++) {
    let btnX = btnStartX + (i - 3) * 38;
    let btnY = startY - 15;
    let isSelected = maxDropWeight === i;
    
    fill(isSelected ? '#81C784' : 60);
    stroke(isSelected ? 255 : 100);
    strokeWeight(2);
    rect(btnX, btnY, 32, 30, 5);
    
    fill(isSelected ? 0 : 200);
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(20);
    text(i, btnX + 16, btnY + 15);
  }
  
  startY += spacing + 30;
  let startBtnX = width / 2 - 80;
  let startBtnY = startY;
  
  fill(76, 175, 80);
  stroke(255);
  strokeWeight(3);
  rect(startBtnX, startBtnY, 160, 50, 8);
  
  fill(255);
  noStroke();
  textAlign(CENTER, CENTER);
  textSize(25);
  text('Start Game', width / 2, startBtnY + 25);
  
  textSize(20);
  fill(150);
  text('Each player gets raindrops of weights 1 to k', width / 2, startBtnY + 100);
  
  fill('#E57373');
  text('Red = poison (subtract points)', width / 2, startBtnY + 130);
  
  fill('#78909C');
  text('Gray = obstacles (block path)', width / 2, startBtnY + 160);
  
  pop();
}

function drawGame() {
  drawBoard();
  drawPlayerInfo();
  drawControls();
  
  if (fallingDrop) {
    drawFallingDrop();
    updateFallingDrop();
  }
}

function drawBoard() {
  push();
  
  fill(200);
  textAlign(CENTER, CENTER);
  textSize(20);
  for (let col = 0; col < BOARD_COLS; col++) {
    text(col + 1, BOARD_OFFSET_X + col * CELL_SIZE + CELL_SIZE / 2, BOARD_OFFSET_Y - 25);
  }
  
  for (let row = 0; row < BOARD_ROWS; row++) {
    for (let col = 0; col < BOARD_COLS; col++) {
      let x = BOARD_OFFSET_X + col * CELL_SIZE;
      let y = BOARD_OFFSET_Y + row * CELL_SIZE;
      
      let cellValue = board[row][col];
      
      if (cellValue === CELL_OBSTACLE) {
        fill(80, 90, 100);
        stroke(100, 110, 120);
        strokeWeight(2);
        rect(x, y, CELL_SIZE, CELL_SIZE);
        
        fill(60, 70, 80);
        noStroke();
        rect(x + 5, y + 5, CELL_SIZE - 10, CELL_SIZE - 10, 3);
        
        stroke(90, 100, 110);
        strokeWeight(2);
        line(x + 10, y + 10, x + CELL_SIZE - 10, y + CELL_SIZE - 10);
        line(x + CELL_SIZE - 10, y + 10, x + 10, y + CELL_SIZE - 10);
      } else {
        fill(40, 50, 70);
        stroke(60, 80, 100);
        strokeWeight(1);
        rect(x, y, CELL_SIZE, CELL_SIZE);
        
        if (cellValue !== 0) {
          let isPoison = cellValue < 0;
          let dropColor = isPoison ? '#E57373' : '#64B5F6';
          drawWaterDrop(x + CELL_SIZE / 2, y + CELL_SIZE / 2, Math.abs(cellValue), dropColor, isPoison);
        }
      }
    }
  }
  
  if (gameState === 'playing' && selectedColumn >= 0) {
    let x = BOARD_OFFSET_X + selectedColumn * CELL_SIZE;
    stroke(PLAYER_COLORS[currentPlayerIndex]);
    strokeWeight(3);
    noFill();
    rect(x, BOARD_OFFSET_Y - 40, CELL_SIZE, 35, 5);
    
    fill(PLAYER_COLORS[currentPlayerIndex]);
    noStroke();
    triangle(
      x + CELL_SIZE / 2, BOARD_OFFSET_Y - 10,
      x + CELL_SIZE / 2 - 8, BOARD_OFFSET_Y - 25,
      x + CELL_SIZE / 2 + 8, BOARD_OFFSET_Y - 25
    );
  }
  
  pop();
}

function drawWaterDrop(x, y, weight, baseColor, isPoison = false) {
  push();
  
  let size = map(weight, 1, 20, 15, 35);
  size = constrain(size, 15, 40);
  
  let c = color(baseColor);
  fill(c);
  noStroke();
  
  if (isPoison) {
    beginShape();
    for (let a = 0; a < TWO_PI; a += TWO_PI / 6) {
      let outerX = x + cos(a - HALF_PI) * size * 0.5;
      let outerY = y + sin(a - HALF_PI) * size * 0.5;
      vertex(outerX, outerY);
      let innerX = x + cos(a - HALF_PI + TWO_PI / 12) * size * 0.25;
      let innerY = y + sin(a - HALF_PI + TWO_PI / 12) * size * 0.25;
      vertex(innerX, innerY);
    }
    endShape(CLOSE);
  } else {
    beginShape();
    vertex(x, y - size * 0.8);
    bezierVertex(x + size * 0.6, y - size * 0.3, x + size * 0.5, y + size * 0.5, x, y + size * 0.5);
    bezierVertex(x - size * 0.5, y + size * 0.5, x - size * 0.6, y - size * 0.3, x, y - size * 0.8);
    endShape(CLOSE);
    
    fill(255, 255, 255, 100);
    ellipse(x - size * 0.15, y - size * 0.2, size * 0.2, size * 0.3);
  }
  
  fill(isPoison ? 255 : 0);
  textAlign(CENTER, CENTER);
  textSize(constrain(size * 0.55, 9, 14)+5);
  let displayText = isPoison ? '-' + weight : weight;
  text(displayText, x, y + (isPoison ? 0 : size * 0.1));
  
  pop();
}

function drawPlayerInfo() {
  push();
  
  let panelX = BOARD_OFFSET_X + BOARD_COLS * CELL_SIZE + 15;
  let panelY = BOARD_OFFSET_Y;
  let panelWidth = 120;
  
  fill(40, 50, 70);
  stroke(60, 80, 100);
  strokeWeight(2);
  rect(panelX, panelY, panelWidth, BOARD_ROWS * CELL_SIZE, 8);
  
  fill(255);
  textAlign(CENTER, TOP);
  textSize(20);
  text('Scores', panelX + panelWidth / 2, panelY + 8);
  
  for (let i = 0; i < players.length; i++) {
    let player = players[i];
    let y = panelY + 40 + i * 50;
    let isCurrentPlayer = players.indexOf(player) === currentPlayerIndex;
    
    if (isCurrentPlayer && gameState === 'playing') {
      fill(PLAYER_COLORS[players.indexOf(player)]);
      noStroke();
      rect(panelX + 4, y - 4, panelWidth - 8, 40, 4);
      fill(0);
    } else {
      fill(PLAYER_COLORS[players.indexOf(player)]);
    }
    
    textAlign(LEFT, TOP);
    textSize(20);
    text(player.name, panelX + 10, y);
    
    textSize(15);
    if (isCurrentPlayer && gameState === 'playing') {
      fill(0);
    } else {
      fill(200);
    }
    text(player.score + ' pts', panelX + 10, y + 20);
    
    let dropsLeft = player.availableWeights.length;
    textAlign(RIGHT, TOP);
    text(dropsLeft + ' left', panelX + panelWidth - 10, y + 20);
  }
  
  pop();
}

function drawControls() {
  if (gameState !== 'playing') return;
  
  push();
  
  let player = players[currentPlayerIndex];
  let controlY = BOARD_OFFSET_Y + BOARD_ROWS * CELL_SIZE + 40;
  
  fill(255);
  textAlign(LEFT, CENTER);
  textSize(20);
  text(player.name + ' - Weight:', 30, controlY + 17);
  
  let btnX = 170;
  for (let i = 0; i < player.availableWeights.length; i++) {
    let w = player.availableWeights[i];
    let isSelected = selectedWeight === w;
    
    fill(isSelected ? PLAYER_COLORS[currentPlayerIndex] : 60);
    stroke(isSelected ? 255 : 100);
    strokeWeight(2);
    rect(btnX + i * 40, controlY + 3, 32, 26, 5);
    
    fill(isSelected ? 0 : 200);
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(20);
    text(w, btnX + i * 40 + 16, controlY + 16);
  }
  
  if (selectedColumn >= 0) {
    let dropBtnX = width - 200;
    fill(76, 175, 80);
    stroke(255);
    strokeWeight(2);
    rect(dropBtnX, controlY + 3, 100, 50, 5);
    
    fill(255);
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(25);
    text('Drop!', dropBtnX + 50, controlY + 30);
  }
  
  fill(180);
  textAlign(LEFT, CENTER);
  textSize(20);
  text('Click column to select, then Drop!', 30, controlY + 60);
  
  pop();
}

function drawFallingDrop() {
  if (!fallingDrop) return;
  
  let x = BOARD_OFFSET_X + fallingDrop.col * CELL_SIZE + CELL_SIZE / 2;
  let y = BOARD_OFFSET_Y + fallingDrop.visualRow * CELL_SIZE + CELL_SIZE / 2;
  
  let displayWeight = Math.abs(fallingDrop.weight);
  let dropColor = PLAYER_COLORS[fallingDrop.playerIndex];
  
  if (fallingDrop.weight <= 0) {
    dropColor = '#E57373';
  }
  
  drawWaterDrop(x, y, displayWeight, dropColor, fallingDrop.weight < 0);
  
  if (collectedThisTurn !== 0) {
    push();
    fill(collectedThisTurn > 0 ? '#81C784' : '#E57373');
    textAlign(CENTER, BOTTOM);
    textSize(20);
    let sign = collectedThisTurn > 0 ? '+' : '';
    text(sign + collectedThisTurn, x, y - 30);
    pop();
  }
}

function updateFallingDrop() {
  if (!fallingDrop) return;
  
  fallingDrop.visualRow += fallingSpeed / 60;
  
  if (fallingDrop.visualRow >= fallingDrop.targetRow) {
    fallingDrop.visualRow = fallingDrop.targetRow;
    
    let currentRow = Math.floor(fallingDrop.targetRow);
    let currentCol = fallingDrop.col;
    
    let cellValue = board[currentRow][currentCol];
    if (cellValue !== 0 && cellValue !== CELL_OBSTACLE) {
      collectedThisTurn += cellValue;
      fallingDrop.weight += cellValue;
      board[currentRow][currentCol] = 0;
    }
    
    if (currentRow >= BOARD_ROWS - 1) {
      finishDrop();
      return;
    }
    
    let nextMove = calculateNextMove(currentRow, currentCol, fallingDrop.weight);
    
    if (nextMove) {
      fallingDrop.col = nextMove.col;
      fallingDrop.targetRow = nextMove.row;
    } else {
      finishDrop();
    }
  }
}

function calculateNextMove(row, col, dropWeight) {
  if (row >= BOARD_ROWS - 1) return null;
  
  function getCellValue(r, c) {
    if (r < 0 || r >= BOARD_ROWS || c < 0 || c >= BOARD_COLS) return null;
    let val = board[r][c];
    if (val === CELL_OBSTACLE) return null;
    return val;
  }
  
  let downVal = getCellValue(row + 1, col);
  let downLeftVal = col > 0 ? getCellValue(row + 1, col - 1) : null;
  let downRightVal = col < BOARD_COLS - 1 ? getCellValue(row + 1, col + 1) : null;
  
  let candidates = [];
  
  if (downVal !== null) {
    candidates.push({ row: row + 1, col: col, water: downVal, direction: 'down' });
  }
  if (downLeftVal !== null) {
    candidates.push({ row: row + 1, col: col - 1, water: downLeftVal, direction: 'left' });
  }
  if (downRightVal !== null) {
    candidates.push({ row: row + 1, col: col + 1, water: downRightVal, direction: 'right' });
  }
  
  if (candidates.length === 0) {
    return null;
  }
  
  let down = candidates.find(c => c.direction === 'down');
  
  if (candidates.length === 1) {
    return candidates[0];
  }
  
  let maxWater = Math.max(...candidates.map(c => c.water));
  
  if (maxWater === 0) {
    return down || candidates[0];
  }
  
  let downLeftWater = downLeftVal !== null ? downLeftVal : -Infinity;
  let downRightWater = downRightVal !== null ? downRightVal : -Infinity;
  
  if (downLeftWater <= dropWeight && downRightWater <= dropWeight) {
    if (down) {
      return down;
    }
    let heaviest = candidates.reduce((a, b) => a.water >= b.water ? a : b);
    return heaviest;
  }
  
  if (down && down.water >= maxWater) {
    return down;
  }
  
  let heaviestCandidates = candidates.filter(c => c.water === maxWater);
  
  if (heaviestCandidates.length === 1) {
    return heaviestCandidates[0];
  }
  
  let hasDown = heaviestCandidates.some(c => c.direction === 'down');
  if (hasDown) {
    return down;
  }
  
  return heaviestCandidates[0];
}

function finishDrop() {
  players[fallingDrop.playerIndex].score += collectedThisTurn;
  
  let message;
  if (collectedThisTurn > 0) {
    message = players[fallingDrop.playerIndex].name + ' collected ' + collectedThisTurn + ' water!';
  } else if (collectedThisTurn < 0) {
    message = players[fallingDrop.playerIndex].name + ' lost ' + Math.abs(collectedThisTurn) + ' points to poison!';
  } else {
    message = players[fallingDrop.playerIndex].name + ' collected nothing.';
  }
  showMessage(message);
  
  fallingDrop = null;
  collectedThisTurn = 0;
  
  nextTurn();
}

function nextTurn() {
  let startIndex = currentPlayerIndex;
  
  do {
    currentPlayerIndex = (currentPlayerIndex + 1) % numPlayers;
    
    if (currentPlayerIndex === startIndex) {
      if (players[currentPlayerIndex].availableWeights.length === 0) {
        endGame();
        return;
      }
      break;
    }
  } while (players[currentPlayerIndex].availableWeights.length === 0);
  
  if (players[currentPlayerIndex].availableWeights.length > 0) {
    selectedWeight = players[currentPlayerIndex].availableWeights[0];
    selectedColumn = -1;
    gameState = 'playing';
  } else {
    endGame();
  }
}

function endGame() {
  gameState = 'gameOver';
}

function drawGameOver() {
  push();
  
  // semi-transparent background
  fill(0, 0, 0, 180);
  noStroke();
  rect(0, 0, width, height);
  
  // central box
  fill(40, 50, 70);
  stroke(100, 150, 200);
  strokeWeight(3);
  let boxWidth = 320;
  let boxHeight = 280;
  let boxX = (width - boxWidth) / 2;
  let boxY = (height - boxHeight) / 2;
  rect(boxX, boxY, boxWidth, boxHeight, 12);
  
  // "Game Over!" text
  fill(255);
  noStroke(); // ensure no border
  textAlign(CENTER, CENTER);
  textSize(26);
  text('Game Over!', width / 2, boxY + 30);
  
  // winner text
  let sortedPlayers = [...players].sort((a, b) => b.score - a.score);
  let winner = sortedPlayers[0];
  
  fill(PLAYER_COLORS[players.indexOf(winner)]);
  noStroke();
  textSize(20);
  text(winner.name + ' Wins!', width / 2, boxY + 65);
  
  // player scores
  textSize(20);
  for (let i = 0; i < sortedPlayers.length; i++) {
  let p = sortedPlayers[i];
  let medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '  ';
  fill(PLAYER_COLORS[players.indexOf(p)]);
  noStroke();
  textAlign(CENTER, CENTER);
  text(medal + ' ' + p.name + ': ' + p.score + ' pts', width / 2, boxY + 100 + i * 24);
  }
  
  // "Play Again" button
  let btnX = width / 2 - 60;
  let btnY = boxY + boxHeight - 70;
  fill(76, 175, 80);
  stroke(255);
  strokeWeight(2);
  rect(btnX, btnY, 120, 50, 8);
  
  fill(255);
  noStroke(); // remove border from button text
  textSize(20);
  text('Play Again', width / 2, btnY + 25);
  
  pop();
  }  

function drawMessage() {
  push();
  
  let alpha = map(messageTimer, 0, 120, 0, 255);
  fill(255, 255, 255, alpha);
  textAlign(CENTER, CENTER);
  textSize(14);
  text(gameMessage, width / 2, BOARD_OFFSET_Y - 50);
  
  pop();
}

function showMessage(msg) {
  gameMessage = msg;
  messageTimer = 120;
}

function initGame() {
  board = [];
  for (let row = 0; row < BOARD_ROWS; row++) {
    board[row] = [];
    for (let col = 0; col < BOARD_COLS; col++) {
      let rand = random();
      
      if (rand < obstacleSparsity) {
        board[row][col] = CELL_OBSTACLE;
      } else if (rand < obstacleSparsity + poisonSparsity) {
        board[row][col] = -floor(random(1, 6));
      } else if (rand < obstacleSparsity + poisonSparsity + waterSparsity) {
        board[row][col] = floor(random(1, 8));
      } else {
        board[row][col] = 0;
      }
    }
  }
  
  for (let col = 0; col < BOARD_COLS; col++) {
    if (board[0][col] === CELL_OBSTACLE) {
      board[0][col] = 0;
    }
  }
  
  players = [];
  for (let i = 0; i < numPlayers; i++) {
    let weights = [];
    for (let w = 1; w <= maxDropWeight; w++) {
      weights.push(w);
    }
    players.push({
      name: PLAYER_NAMES[i],
      score: 0,
      availableWeights: weights
    });
  }
  
  currentPlayerIndex = 0;
  selectedWeight = players[0].availableWeights[0];
  selectedColumn = -1;
  fallingDrop = null;
  collectedThisTurn = 0;
  gameState = 'playing';
}

function mousePressed() {
  if (gameState === 'setup') {
    handleSetupClick();
  } else if (gameState === 'playing') {
    handlePlayingClick();
  } else if (gameState === 'gameOver') {
    handleGameOverClick();
  }
}

function handleSetupClick() {
  let startY = 200;
  let spacing = 50;
  let btnStartX = 300;
  
  for (let i = 1; i <= 5; i++) {
    let btnX = btnStartX + (i - 1) * 38;
    let btnY = startY - 15;
    if (mouseX >= btnX && mouseX <= btnX + 32 && mouseY >= btnY && mouseY <= btnY + 30) {
      numPlayers = i;
      return;
    }
  }
  
  startY += spacing;
  let sparsityOptions = [
    { label: 'Dense', value: 0.5 },
    { label: 'Medium', value: 0.3 },
    { label: 'Sparse', value: 0.15 }
  ];
  
  for (let i = 0; i < sparsityOptions.length; i++) {
    let btnX = btnStartX + i * 90;
    let btnY = startY - 15;
    if (mouseX >= btnX && mouseX <= btnX + 80 && mouseY >= btnY && mouseY <= btnY + 30) {
      waterSparsity = sparsityOptions[i].value;
      return;
    }
  }
  
  startY += spacing;
  let poisonOptions = [
    { label: 'None', value: 0 },
    { label: 'Few', value: 0.1 },
    { label: 'Many', value: 0.2 },
    { label: 'Lots', value: 0.3 }
  ];
  
  for (let i = 0; i < poisonOptions.length; i++) {
    let btnX = btnStartX + i * 65;
    let btnY = startY - 15;
    if (mouseX >= btnX && mouseX <= btnX + 60 && mouseY >= btnY && mouseY <= btnY + 30) {
      poisonSparsity = poisonOptions[i].value;
      return;
    }
  }
  
  startY += spacing;
  let obstacleOptions = [
    { label: 'None', value: 0 },
    { label: 'Few', value: 0.05 },
    { label: 'Some', value: 0.1 },
    { label: 'Many', value: 0.15 }
  ];
  
  for (let i = 0; i < obstacleOptions.length; i++) {
    let btnX = btnStartX + i * 65;
    let btnY = startY - 15;
    if (mouseX >= btnX && mouseX <= btnX + 60 && mouseY >= btnY && mouseY <= btnY + 30) {
      obstacleSparsity = obstacleOptions[i].value;
      return;
    }
  }
  
  startY += spacing;
  for (let i = 3; i <= 7; i++) {
    let btnX = btnStartX + (i - 3) * 38;
    let btnY = startY - 12;
    if (mouseX >= btnX && mouseX <= btnX + 32 && mouseY >= btnY && mouseY <= btnY + 24) {
      maxDropWeight = i;
      return;
    }
  }
  
  startY += spacing + 30;
  let startBtnX = width / 2 - 80;
  let startBtnY = startY;
  if (mouseX >= startBtnX && mouseX <= startBtnX + 160 && mouseY >= startBtnY && mouseY <= startBtnY + 50) {
    initGame();
  }
}

function handlePlayingClick() {
  let player = players[currentPlayerIndex];
  let controlY = BOARD_OFFSET_Y + BOARD_ROWS * CELL_SIZE + 40;
  
  let btnX = 170;
  for (let i = 0; i < player.availableWeights.length; i++) {
    let w = player.availableWeights[i];
    if (mouseX >= btnX + i * 40 && mouseX <= btnX + i * 40 + 32 &&
        mouseY >= controlY + 3 && mouseY <= controlY + 29) {
      selectedWeight = w;
      return;
    }
  }
  
  for (let col = 0; col < BOARD_COLS; col++) {
    let x = BOARD_OFFSET_X + col * CELL_SIZE;
    if (mouseX >= x && mouseX <= x + CELL_SIZE &&
        mouseY >= BOARD_OFFSET_Y - 40 && mouseY <= BOARD_OFFSET_Y + BOARD_ROWS * CELL_SIZE) {
      selectedColumn = col;
      return;
    }
  }
  
  if (selectedColumn >= 0) {
    let dropBtnX = width - 200;
    if (mouseX >= dropBtnX && mouseX <= dropBtnX + 100 &&
        mouseY >= controlY + 3 && mouseY <= controlY + 53) {
      dropRaindrop();
      return;
    }
  }
}

function handleGameOverClick() {
  let boxWidth = 320;
  let boxHeight = 280;
  let boxY = (height - boxHeight) / 2;
  let btnX = width / 2 - 60;
  let btnY = boxY + boxHeight - 70;
  
  if (mouseX >= btnX && mouseX <= btnX + 120 && mouseY >= btnY && mouseY <= btnY + 50) {
    gameState = 'setup';
  }
}

function dropRaindrop() {
  if (selectedColumn < 0 || gameState !== 'playing') return;
  
  let player = players[currentPlayerIndex];
  let weightIndex = player.availableWeights.indexOf(selectedWeight);
  if (weightIndex === -1) return;
  
  player.availableWeights.splice(weightIndex, 1);
  
  fallingDrop = {
    playerIndex: currentPlayerIndex,
    weight: selectedWeight,
    col: selectedColumn,
    visualRow: -1,
    targetRow: 0
  };
  
  collectedThisTurn = 0;
  gameState = 'animating';
}

function keyPressed() {
  if (gameState === 'playing') {
    if (key >= '1' && key <= '9') {
      let col = parseInt(key) - 1;
      if (col < BOARD_COLS) {
        selectedColumn = col;
      }
    } else if (key === '0') {
      selectedColumn = 9;
    } else if (key === '-' || key === '_') {
      selectedColumn = 10;
    } else if (key === '=' || key === '+') {
      selectedColumn = 11;
    } else if (keyCode === ENTER && selectedColumn >= 0) {
      dropRaindrop();
    }
  }
}
