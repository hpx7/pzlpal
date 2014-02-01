var data = require("./good-data.js");
var slots = data.array;
var maxSlots;
var maxBoard;
var maxSlotsCount = 0;

var startTime = new Date().getTime();
var MAX_RUN_TIME = 10*1000;

for (var i = 0; i < slots.length; i++) {
    slots[i].startx--;
    slots[i].starty--;
}

function updateBest(board) {
  var fullSlotsCount = 0;
  for (var i = 0; i < slots.length; i++)
    if (slots[i].answer.replace(/\s+/g, '') !== '' &&
        slots[i].answer !== '*')
      fullSlotsCount++;

  if (fullSlotsCount > maxSlotsCount) {
    maxSlotsCount = fullSlotsCount;
    maxSlots = clone(slots);
    maxBoard = clone(board);
    console.log(maxSlotsCount);
    printBoard(maxBoard);
  }
}

function clone (obj) {
  return JSON.parse(JSON.stringify(obj));
}

function getSlotIndex (board) {
  var maxCollisions = -1;
  var mcSlotIndex = -1;

  for (var i = 0; i < slots.length; i++) {
    var slot = slots[i];
    if (slot.answer.replace(/\s+/g, '').length !== 0) {
      continue;
    }

    collisions = 0;
    for (var j = 0; j < slot.length; j++) {
      var curX = slot.startx;
      var curY = slot.starty;
      if (slot.orientation == "across")
          curX += j;
      else
          curY += j;

      var curC = board[curY][curX];
      // if curC is a real char and is different from what we want to insert
      if (curC !== null)
        collisions++;
    }

    if (collisions > maxCollisions) {
      maxCollisions = collisions;
      mcSlotIndex = i;
    }
  }

  return mcSlotIndex;
}

function getPossibleAnswers (slotIndex) {
  return slots[slotIndex].answers;
}

function canInsert(board, slotIndex, possibleAnswerIdx) {
  var slot = slots[slotIndex];
  var possibleAnswer = slot.answers[possibleAnswerIdx];
  for (var i = 0; i < possibleAnswer.name.length; i++) {
      var curX = slot.startx;
      var curY = slot.starty;
      if (slot.orientation == "across")
          curX += i;
      else
          curY += i;

      var curC = board[curY][curX];
      // if curC is a real char and is different from what we want to insert
      if (curC !== null && curC != possibleAnswer.name[i])
        return false;
  }
  return true;
}

function insert (board, slotIndex, possibleAnswerIdx) {
  var slot = slots[slotIndex];
  var possibleAnswer = slot.answers[possibleAnswerIdx];
  var newBoard = clone(board); // deep copy
  for (var i = 0; i < possibleAnswer.name.length; i++) {
      var curX = slot.startx;
      var curY = slot.starty;
      if (slot.orientation == "across")
          curX += i;
      else
          curY += i;
      newBoard[curY][curX] = possibleAnswer.name[i];
  }
  slots[slotIndex].answer = possibleAnswer.name;
  return newBoard;
}

// modifies slots
function fillInAnswer (board, slotIndex, possibleAnswerIdx) {
  if (canInsert(board, slotIndex, possibleAnswerIdx)) {
    var newBoard = insert(board, slotIndex, possibleAnswerIdx);
    return newBoard;
  }
  return null;
}

function finished () {
  if (new Date().getTime() - startTime > MAX_RUN_TIME) {
    console.log("TIMEOUT");
    return true;
  }

  return maxSlotsCount === slots.length;
  // for (var i = 0; i < slots.length; i++) {
  //   var slot = slots[i];
  //   if (slot.answer.replace(/\s+/g, '') !== '')
  //     return false;
  // }
  // console.log("finished");
  // return true;
}

function eraseAnswer (slotIndex) {
  var newStr = "";
  for (var i = 0; i < slots[slotIndex].length; i++) 
    newStr += " ";
  slots[slotIndex].answer = newStr;
}

function solve (board, numSkips) {
  var slotIndex = getSlotIndex(board);
  if (slotIndex === -1) {
    return false;
  }
  var possibleAnswers = getPossibleAnswers(slotIndex);
  for (var possibleAnswerIdx = 0; possibleAnswerIdx < possibleAnswers.length; possibleAnswerIdx++) {
    var newBoard = fillInAnswer(board, slotIndex, possibleAnswerIdx);
    if (newBoard == null)
      continue;

    // base case
    if (finished())
      return true;

    updateBest(board);
    var solved = solve(newBoard, numSkips);
    if (solved)
      return true;

    // we chose a wrong possible answer, erase it
    eraseAnswer(slotIndex);
  }

  if (numSkips < 0.025 * slots.length) {
    slots[slotIndex].answer = "*";
    if (solve(board, ++numSkips)) {
      return true;
    }
    eraseAnswer(slotIndex);
  }
  return false;
}

function printBoard(board) {
  for (var i = 0; i < 15; i++) {
    cur = ""
    for (var j = 0; j < 15; j++) {
      if (board[i][j] == null)
        cur += "_ ";
      else
        cur += (board[i][j] + " ");
    }
    console.log(cur);
  }
  console.log();
}

board = [];
for (var i = 0; i < 15; i++) {
	board[i] = [];
  for (var j = 0; j < 15; j++)
    board[i][j] = null
}

for (var i = 0; i < slots.length; i++) {
  if (slots[i].answer.replace(/\s+/g, '') == '')
    continue;
  slot = slots[i];
  for (var j = 0; j < slot.length; j++) {
    var curX = slot.startx;
    var curY = slot.starty;
    if (slot.orientation == "across")
      curX += j;
    else
      curY += j;
    board[curY][curX] = slot.answer[j];
  }
}

solve(board, 0);
printBoard(maxBoard);

