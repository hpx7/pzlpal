var data = require("./data.js");
var slots = data.array;

function clone (obj) {
  return JSON.parse(JSON.stringify(obj));
}

function getSlotIndex () {
  for (var i = 0; i < slots.length; i++) {
    var slot = slots[i];
    if (slot.answer === "")
      return i;
  }
  return -1;
}

function getPossibleAnswers (slotIndex) {
  return slots[slotIndex].answers;
}

function canInsert(board, slotIndex, possibleAnswerIdx) {
  var slot = slots[slotIndex];
  // console.log("slotIndex" + slotIndex);
  // console.log(slot);
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
      // XXX test undefined
      if (curC !== undefined && curC != possibleAnswer.name[i])
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
  slots[slotIndex].answer = possibleAnswer;
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
  return getSlotIndex() === -1;
}

function eraseAnswer (slotIndex) {
  slots[slotIndex].answer = "";
}

solve = function (board) {
	console.log(board)
  var slotIndex = getSlotIndex();
  var possibleAnswers = getPossibleAnswers(slotIndex);
  for (var possibleAnswerIdx = 0; possibleAnswerIdx < possibleAnswers.length; possibleAnswerIdx++) {
    var newBoard = fillInAnswer(board, slotIndex, possibleAnswerIdx);
    if (newBoard == null)
      continue;

    // base case
    if (finished())
      return true;

    var solved = solve(newBoard);
    if (solved)
      return true;

    // we chose a wrong possible answer, erase it
    eraseAnswer(slotIndex);
  }
  return false;
}

board = [];
for (var i = 0; i < 3; i++) 
	board[i] = [];

solve(board);

