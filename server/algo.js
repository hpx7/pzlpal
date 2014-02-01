runAlgo = function (slots) {
  console.log("Starting algo...")

  var maxSlots;
  var maxBoard;
  var maxSlotsCount = 0;

  var startTime = new Date().getTime();
  var MAX_RUN_TIME = 30*1000;

  // pre-processing
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
      // console.log(maxSlotsCount);
      pushToMongo(maxSlots);
//      printBoard(maxBoard);
    }
  }

  function clone (obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  function getSlotIndex (board) {
    var maxCollisions = -100000000;
    var mcSlotIndex = -1;

    for (var i = 0; i < slots.length; i++) {
      var slot = slots[i];
      if (slot.answer.replace(/\s+/g, '').length !== 0) {
        continue;
      }

      var collisions = 0;
      var num5Star = 0;
      for (var j = 0; j < slot.len; j++) {
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

      // Check number of 5 star answer choices and pick clue with lowest one
      for (var j = 0; j < slot.answers.length; j++) {
        if (slot.answers[j].conf === 5) {
          num5Star++;
        }
      }

      if (num5Star) {
        collisions =  (collisions * 50) - num5Star;
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
  }

  function eraseAnswer (slotIndex) {
    var newStr = "";
    for (var i = 0; i < slots[slotIndex].len; i++) 
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
	if (Math.random() < 0.1)
	    pushToMongo(slots);
      var solved = solve(newBoard, numSkips);
      if (solved)
        return true;

      // we chose a wrong possible answer, erase it
      eraseAnswer(slotIndex);
    }

    if (numSkips < 3) {
      slots[slotIndex].answer = "*";
      if (solve(board, ++numSkips)) {
        return true;
      }
      eraseAnswer(slotIndex);
    }
    return false;
  }

  function printBoard (board) {
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

  function pushToMongo (slotsToPush) {
      var maxSlotsMongo = clone(slotsToPush)

    maxSlotsMongo.forEach(function (slot) {
      if (slot.answer === "*") {
        var newAns = "";
        for (var i = 0; i < slot.len; i++)
          newAns += " ";
        slot.answer = newAns;
      }
    });
    for (var i = 0; i < maxSlotsMongo.length; i++) {
      maxSlotsMongo[i].startx++;
      maxSlotsMongo[i].starty++;
    }

    for (var i = 0; i < maxSlotsMongo.length; i++) {
      var slot = maxSlotsMongo[i];
      Slots.update({_id: slot._id}, slot);
    }
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
    for (var j = 0; j < slot.len; j++) {
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
  console.log('DONE!');

  // post-processing
  pushToMongo(maxSlots);
  // maxSlots.forEach(function (slot) {
  //   if (slot.answer === "*") {
  //     var newAns = "";
  //     for (var i = 0; i < slot.len; i++)
  //       newAns += " ";
  //     slot.answer = newAns;
  //   }
  // });
  // for (var i = 0; i < maxSlots.length; i++) {
  //   maxSlots[i].startx++;
  //   maxSlots[i].starty++;
  // }

  // for (var i = 0; i < maxSlots.length; i++) {
  //   var slot = maxSlots[i];
  //   Slots.update({_id: slot._id}, slot);
  // }
}
