function compare(expected, actual) {
    let array1 = expected.slice()
    let array2 = actual.slice()
    return array1.length === array2.length && array1.sort().every(function (value, index) { return value === array2.sort()[index] });
}

function compareStrict(expected, actual) {
    let array1 = expected.slice()
    let array2 = actual.slice()
    return array1.length === array2.length && array1.every(function (value, index) { return value === array2[index] });
}

function copyGrid(orig_board) {
  var newBoard = JSON.parse(JSON.stringify(orig_board));
  //TODO: Make sure this has no side effects
  newBoard.options = orig_board.options;
  return newBoard;
}

function copy(orig) {
  return JSON.parse(JSON.stringify(orig));
}

function intersect(array1, array2) {
  if(!Array.isArray(array1))
    array1 = [array1];
  if(!Array.isArray(array2))
    array2 = [array2];
    
  var res = array1.filter(value => array2.includes(value));
  return res;
}

function integerRange(lowEnd, highEnd) {
  var allOptions = [];
  while(lowEnd <= highEnd){
     allOptions.push(lowEnd++);
  }
  return allOptions;
}

/*
function simplePuzzle() {
  return {
    start: [
    [1,2,3,4],
    [0,1,0,3],
    [0,0,1,0],
    [2,0,0,1],
    [4,0,0,1],
    [0,0,1,0],
    [0,1,0,0],
    [1,0,0,2],
    [1,0,0,3]
    ],
    solution: [],
    options: [],
    numRows: 9,
    numBells: 4
  };
}
*/

function blankPuzzle(numRows, numBells) {
  
  var start = [];
  for(var i=0; i<numRows; i++)
  {
      var row = [];
      for(var j=0; j<numBells; j++)
      {
        if(i == 0)
          row.push(j + 1);
        else
          row.push(0);
      }
      start.push(row);
  }
  
  return {
    start: start,
    solution: [],
    options: [],
    optionsDerived: [],
    numRows: numRows,
    numBells: numBells
  };
}

function buildPuzzle() {

var numBells = puzzle.numBells;
var numRows = puzzle.numRows;

for(var row = 0; row < numRows; row++)
{
  var rowData = [];
  for(var col = 0; col < numBells; col++)
  { 
    if(puzzle.start[row][col] > 0)
    {
       // Bell is fixed
       rowData.push(puzzle.start[row][col]);
    }
    else
    {
      // Bell is free
      rowData.push(allOptions(puzzle.numBells))
    }
  }
  puzzle.solution.push(rowData);
}
}

function allOptions(numBells) {
var allOptions = [];
  var lowEnd = 1;
  var highEnd = numBells;
  return integerRange(lowEnd, highEnd);
}

function updateGrid(rebuild=false, showPossibilities=false) {
  
  var board = puzzle.solution;
  
  if(rebuild)
    buildGrid(puzzle.numRows, puzzle.numBells);

  var isChanged = false;

  var myElement = document.getElementById("grid");
  for(var i=0; i<puzzle.numRows; i++)
    for(var j=0; j<puzzle.numBells; j++)
    {
      var tbl = document.getElementById("options" + i + "_" + j);

      var numOptionRows = puzzle.numBells > 6 ? 3 : 2;
      var numOptionCols = Math.ceil(puzzle.numBells / numOptionRows);

      var impossibleColour = "#D3D3D3";
      var countPossibilitiesPrevious = 0;

      if(showPossibilities)
      {
        if(!tbl)
        {
          if(Array.isArray(board[i][j]))
          {
            var tbl = document.createElement('table');
            tbl.setAttribute("id", "options" + i + "_" + j);
            grid.rows[i].cells[j].append(tbl);

            for(var r=0; r < numOptionRows; r++)
            {
              var row = tbl.insertRow(r);
              for(var c=0; c < numOptionCols; c++)
              { 
                var cell = row.insertCell();
              }
            }
            isChanged = true;
            
            countPossibilitiesPrevious = board[i][j].length;
          }
          else
            countPossibilitiesPrevious = 1;
        }
        else
        {
          for(var r=0; r<tbl.rows.length; r++)
            for(var c=0; c<tbl.rows[r].cells.length; c++)
             if(isValidBellStr(tbl.rows[r].cells[c].innerText) && tbl.rows[r].cells[c].style.color != impossibleColour)
                countPossibilitiesPrevious++;
        }
      
        if(countPossibilitiesPrevious > 1)
        {
          for(var r=0; r < numOptionRows; r++)
            for(var c=0; c < numOptionCols; c++)
            { 
              var bell = r * numOptionCols + c + 1;
              if(board[i][j] == bell || Array.isArray(board[i][j]) && board[i][j].indexOf(bell) > -1)
              {
                isChanged = isChanged | setBell(tbl.rows[r].cells[c], num2bell(bell));
              }
              else
              {
                if(tbl.rows[r].cells[c].innerText == num2bell(bell))
                {
                  if(tbl.rows[r].cells[c].style.color == "")
                  {
                    tbl.rows[r].cells[c].style.color = impossibleColour;
                    isChanged = true;
                  }
                  else
                  {
                    isChanged = isChanged | setBell(tbl.rows[r].cells[c], "");
                  }
                }
              }
            }
        }
        else
        {
          isChanged = isChanged | setBell(grid.rows[i].cells[j], num2bell(board[i][j]));
        }
      }
      else
      {
        if(!Array.isArray(board[i][j]))
        {
          grid.rows[i].cells[j].innerHTML = num2bell(board[i][j]);
          
          // Make initially fixed bells as bold
          if(rebuild)
            grid.rows[i].cells[j].style.fontWeight = "bold"; 
        }
      }
    }
    
  return isChanged;
}

function setBell(cell, text) {
  var isChanged = false;
  if(cell.innerHTML != text)
  {
    cell.innerHTML = text;
    isChanged = true;
  }
  return isChanged;
}

function buildGrid(rows, cols) {
  var grid = document.getElementById("grid");
  
  for(var i=grid.rows.length-1; i>=0; i--)
    grid.deleteRow(i);
  
  for(var i=0; i<rows; i++)
  {
      var row = grid.insertRow(i);
      for(var j=0; j<cols; j++)
      {
        var cell = row.insertCell(j);
        
        if(i == 0)
          cell.innerHTML = num2bell(j+1);
      }
  }
}

function num2bell(i) {
  if (i < 10)
    return i;
  else if (i == 10)
    return "0";
  else if (i == 11)
    return "E";
  else if (i == 12)
    return "T";
  else 
    return "?";
}

function bell2num(i) {
  if (i >= 1 && i < 10)
    return i - "0";
  else if (i == "0")
    return 10;
  else if (i == "E")
    return 11;
  else if (i == "T")
    return 12;
  else 
    return "?";
}

function updateControls() {
  document.getElementById("numberOfRows").value = puzzle.numRows;
  document.getElementById("numberOfBells").value = puzzle.numBells;
  
  var controls = document.getElementById("optionControls");
  var checkboxes = controls.querySelectorAll('input[type="checkbox"]');
  for (var checkbox of checkboxes) {
    checkbox.checked = puzzle.options.indexOf(checkbox.id) >= 0 || puzzle.options[checkbox.id];
  }
}

function updatePuzzleFromGrid() {
  //Update possibilities from grid
  var myElement = document.getElementById("grid");
  for(var i=0; i<puzzle.numRows; i++)
    for(var j=0; j<puzzle.numBells; j++)
    {
      var tbl = document.getElementById("options" + i + "_" + j);
      if(!tbl)
      {
        if(grid.rows[i].cells[j].innerText)
          // User has specified a bell
          puzzle.solution[i][j] = bell2num(grid.rows[i].cells[j].innerText);
        else
          // This blow is free
          puzzle.solution[i][j] = allOptions(puzzle.numBells);
      }
      else
      {
        var options = [];
        for(var r=0; r<tbl.rows.length; r++)
          for(var c=0; c<tbl.rows[r].cells.length; c++)
          {
            if(isValidBellStr(tbl.rows[r].cells[c].innerText) && tbl.rows[r].cells[c].style.color == "")
              options.push(bell2num(tbl.rows[r].cells[c].innerText));
          }
          
        if(options.length == 1)
          options = options[0];
          
        puzzle.solution[i][j] = options;
      }
    }
    
  //Update options from checkboxes
  var controls = document.getElementById("optionControls");
  var checkboxes = controls.querySelectorAll('input[type="checkbox"]');
  for (var checkbox of checkboxes) {
    puzzle.options[checkbox.id] = checkbox.checked;
  }  
}

function isValidBellStr(str){
  var special = ["0", "E", "T"];
  return str && (str >= '1' && str <= '9' || special.indexOf(str) >= 0);
}


function updateConfig() {
  console.log("A checkbox has been changed by the user.")
}

var puzzle = [];

function loadPuzzle() {
  var dropdown = document.getElementById("examplePuzzle");
  puzzle = copyGrid(examplePuzzles[dropdown.selectedIndex]);
  buildPuzzle();
  updateControls();
  updateGrid(true)
}

function createNewPuzzle() {
  var numRows = document.getElementById("numberOfRows").value;
  var numBells = document.getElementById("numberOfBells").value;
  puzzle = blankPuzzle(numRows, numBells);
  buildPuzzle();
  updateGrid(true)
}

var strategies = [new AllWorkingExceptTreble(), new OncePerRow(), 
  new OnlyOneOptionInRow(), new NoJumping(), new FillSquares(), new RemoveDeadEnds(), new AllDoubleChanges(), new NoLongPlaces(),
  new NoNminus1thPlacesExceptUnderTreble(), 
  new ApplyPalindromicSymmetry(), new ApplyDoubleSymmetry(), new ApplyMirrorSymmetry(), 
  new Is2OrNLeadEnd(), new NoShortCycles(), 
  new DoNotMakeBadDecision(false), new DoNotMakeBadGuess(false), 
  new ApplyPalindromicSymmetryFull(), new ApplyDoubleSymmetryFull(), new ApplyMirrorSymmetryFull(), 
  new DoNotMakeBadDecision(true), new DoNotMakeBadGuess(true)];

function takeStep(updateMessage=true) {

  // Pick up changes made by the user
  updatePuzzleFromGrid();

  var isChanged = false;
  var message = "";
    
  for(var idx = 0; idx < strategies.length; idx++)
    if (strategies[idx].isActive(puzzle))
    {
      if(updateMessage)
        setStatus("Attempting strategy: " + strategies[idx].constructor.name)
      isChanged = strategies[idx].step(puzzle);
      if (isChanged)
      {
        message = "Success using: " + strategies[idx].constructor.name + " (" + countSolvedBlows(puzzle) + " " + countRemainingOptions(puzzle) + ")";
        if (strategies[idx].doPropagate)
          message += " (withPropagation)";

        if(saveOutput)
          testResults += message + "\n";
        console.log(message)

        break
      }
    }
  
  updateGrid(false, true)

  if(!checkSolutionValid(puzzle))
    message += "Things have gone wrong."
  else if (isSolved())
    message += "Solved!"
  else if(!isChanged)
    message = "No progress made"
  
  if(updateMessage)
    setStatus(message)
  
  return {
    isChanged: isChanged,
    message: message
  };
}

function setStatus(message) {
  document.getElementById("status").value = message;
}

function solveGrid() {

  var countSolvedPrev = countSolvedBlows(puzzle);
  var countRemainingPrev = countRemainingOptions(puzzle);

  var doContinue = true;
  while (doContinue)
  {
    var status = takeStep();

    var countSolved = countSolvedBlows(puzzle);
    var countRemaining = countRemainingOptions(puzzle);

    doContinue = status.isChanged && (countSolved != countSolvedPrev || countRemaining != countRemainingPrev);
    
    countRemainingPrev = countRemaining;
    countSolvedPrev = countSolved; 
  }
  
  // Final step for cosmetic effect. 
  // Currently keep solutions shown in 'possibility' format for one further step to avoid jumping around too much.
  takeStep(false);
}

function countSolvedBlows() {
  var count = 0;
  for(var i=0; i<puzzle.numRows; i++)
    for(var j=0; j<puzzle.numBells; j++)
      if(!Array.isArray(puzzle.solution[i][j]))
        count++;
  return count;
}

function countRemainingOptions() {
  var count = 0;
  for(var i=0; i<puzzle.numRows; i++)
    for(var j=0; j<puzzle.numBells; j++)
      count+= Array.isArray(puzzle.solution[i][j]) ? puzzle.solution[i][j].length : 1;
  return count;
}

function isSolved() {
  return countSolvedBlows() == puzzle.numRows * puzzle.numBells;
}

function isPositionDetermined(board, idx, jdx) {
  if (!Array.isArray(board[idx][jdx]))
    return {
      isFixed: 1,
      bell: board[idx][jdx]
    }
  else
    return {
      isFixed: 0,
      bell: -1
    }
}

function fixBell(board, idx, jdx, bell) {
  if (!Array.isArray(bell) && Array.isArray(board[idx][jdx]) || 
      !Array.isArray(bell) && !Array.isArray(board[idx][jdx]) && board[idx][jdx] != bell || 
      Array.isArray(bell) && Array.isArray(board[idx][jdx]) && !compare(bell, board[idx][jdx])) {
    board[idx][jdx] = bell;
    return true;
  }
  else
    return false;
}

var isGlobalOK = true;
function removeBell(board, idx, jdx, bell) {
  var isChanged = false;
  if (Array.isArray(board[idx][jdx])) {
    const index = board[idx][jdx].indexOf(bell);
    if (index > -1) {
      //console.log("Removing bell " + bell + " from " + (idx+1) + "," + (jdx+1))
      isChanged = true;
      board[idx][jdx].splice(index, 1);
      
      if (board[idx][jdx].length == 1)
        board[idx][jdx] = board[idx][jdx][0];

      isChanged = true;
    }
  }
  
  if (!Array.isArray(board[idx][jdx]) && !isChanged && board[idx][jdx] == bell || Array.isArray(board[idx][jdx]) && board[idx][jdx].length == 0) {
    //Things have gone wrong
    isGlobalOK = false;
  }
  return isChanged;
}

function isPositionPossible(board, idx, jdx, bell) {
  return board[idx][jdx] == bell || Array.isArray(board[idx][jdx]) && board[idx][jdx].indexOf(bell) >= 0;
}

function makeBlowsConsistent(board, idx1, jdx1, idx2, jdx2) {
  var array1 = board[idx1][jdx1];
  if(!Array.isArray(array1))
    array1 = [array1];
  var array2 = board[idx2][jdx2];
  if(!Array.isArray(array2))
    array2 = [array2];
  
  var filteredArray = intersect(array1, array2);
  
  if(filteredArray.length == 1)
    filteredArray = filteredArray[0];
  
  var isChanged = false;
  isChanged |= fixBell(board, idx1, jdx1, filteredArray);
  isChanged |= fixBell(board, idx2, jdx2, filteredArray);
  return isChanged;
}

function iterateIndex(board, idx, dir) {
  idx += dir;
  if(idx < 0)
    idx = board.length - 2;
  else if(idx >= board.length)
    idx = 1;
  return idx;
}

function findOptionsInRow(board, bell, idxNew, jdxPrev) {
  //Given a bell rang in index jdxPrev, find where can it ring in the row with index idxNew
  // With no jumping, there are at most three possible positions:
  var validMoves = integerRange(Math.max(0, jdxPrev-1), Math.min(jdxPrev+1, board[0].length-1));
  validMoves = validMoves.filter(value => isPositionPossible(board, idxNew, value, bell));
  return validMoves;
}

function isFixedInRow(board, bell, idx) {
  var isFixed = false;
  var pos = -1;
  for(var jdx=0; jdx<board[0].length; jdx++)
    if(board[idx][jdx] == bell) {
      isFixed = true;
      pos = jdx;
      break
    }
   
  return {
    isFixed: isFixed,
    jdx: pos
  }
}

function numberOfPossibilities(board, idx, jdx) {
  return Array.isArray(board[idx][jdx]) ? board[idx][jdx].length : 1;
}

function isRowDetermined(puzzle, idx) {
  return integerRange(0, puzzle.numBells-1).every(jdx => numberOfPossibilities(puzzle.solution, idx, jdx) == 1);
}

function takeGuess(puzzle, numberOptions, withPropagation) {
  var directions = [1, -1];
  var isChanged = false;
  for(var idx=0; idx<puzzle.numRows; idx++)
    for(var jdx=0; jdx<puzzle.numBells; jdx++)
      if(numberOfPossibilities(puzzle.solution, idx, jdx) == numberOptions) {
        var startingFromKnownPoint = numberOptions == 1;
        
        var bellOptions = puzzle.solution[idx][jdx];
        if(!Array.isArray(bellOptions)) bellOptions = [bellOptions];
        
        for(var bdx=0; bdx<bellOptions.length; bdx++) {
          var idxStart = idx;
          for(var ddx=0; ddx<directions.length; ddx++) {
            var idxNew = iterateIndex(puzzle.solution, idxStart, directions[ddx]);
            var candidates = findOptionsInRow(puzzle.solution, bellOptions[bdx], idxNew, jdx);
            
            // If any of these possible blows have just one option remaining, it must be our bell
            if(candidates.some(jdx => numberOfPossibilities(puzzle.solution, idxNew, jdx) == 1))
              continue;
              
            for(var cdx=0; cdx<candidates.length; cdx++) {
              var posToRemove = trackBellTillJunction(puzzle, bellOptions[bdx], idxNew, candidates[cdx], idx, jdx, directions[ddx], 
                startingFromKnownPoint, withPropagation);
              
              if(posToRemove.length > 0) {
                console.log("Remove bell " + bellOptions[bdx] + " from " + posToRemove[0] + "," + posToRemove[1])
                isChanged = removeBell(puzzle.solution, posToRemove[0], posToRemove[1], bellOptions[bdx]);
                return isChanged;
              }
            }
          }
        }
        
      }
  return isChanged;
}

function trackBellTillJunction(puzzle, bell, idx, jdx, idxOrig, jdxOrig, direction, startingFromKnownPoint, withPropagation) {
  var puzzleWorking = copyGrid(puzzle);
  puzzleWorking.solution[idx][jdx] = bell;
  var isValid = true;
  
  if(withPropagation) {
    isGlobalOK = true;
    
    //Determine consequences of making this guess
    while(true) {
      var isChanged = false;

      for(var idxS = 0; idxS < strategies.length; idxS++)
        if(!strategies[idxS].isRecursive && strategies[idxS].isActive(puzzleWorking) && isGlobalOK)
        {
          if(strategies[idxS].constructor.name == "NoNminus1thPlacesExceptUnderTreble")
            continue
          
          //console.log("Internal use of strategy: " + strategies[idxS].constructor.name);
          isChanged |= strategies[idxS].step(puzzleWorking);
          
          isValid &= checkSolutionValid(puzzleWorking);
      
          if(!isGlobalOK)
            isValid = false;
        }
      
      if(!isValid || !isChanged)
        break;
    }
  }
  
  var idxOrigin = idx;
  var history = [];
  history.push([idx, jdx]);
  
  if(isValid) {
    var idxPrevPrev = iterateIndex(puzzleWorking.solution, idxOrig, -direction);
    var idxNext = iterateIndex(puzzleWorking.solution, idx, direction);
    var idxNextNext = iterateIndex(puzzleWorking.solution, idxNext, direction);
    var candidates = findOptionsInRow(puzzleWorking.solution, bell, idxNext, jdx);
    var placeCount = jdx == jdxOrig ? 2 : 1;
    
    if(puzzleWorking.options.trueInLead) {
      var isFalse = checkLeadFalse(puzzleWorking, idx);
      isValid = !isFalse;
    }
    
    //If this implies a pair of bells are opposites, check if this is possible
    if(puzzleWorking.options.palindromicSymmetry) {
      var isPalindromicValid = true;
      var idxHLE = Math.floor(puzzleWorking.numRows/2)-1;
      if(idxHLE == idxOrig && direction > 0 || idxHLE == idx && direction < 0) {
        var candidateOppositeBell = -1;
        if(jdx == jdxOrig) {
          //Can we be pivot bell?
          candidateOppositeBell = bell;
          isPalindromicValid &= checkOppositesArePossible(puzzleWorking, bell, candidateOppositeBell);
        }
        else {
          //Which bell are we swapping with?
          var infoCandidateA = isPositionDetermined(puzzleWorking.solution, idxOrig, jdx);
          var infoCandidateB = isPositionDetermined(puzzleWorking.solution, idx, jdxOrig);
          if (infoCandidateA.isFixed && !infoCandidateB.isFixed) {
            candidateOppositeBell = infoCandidateA.bell;
            isPalindromicValid = isPositionPossible(puzzleWorking.solution, idx, jdxOrig, candidateOppositeBell)
              && checkOppositesArePossible(puzzleWorking, bell, candidateOppositeBell);
          }
          else if (!infoCandidateA.isFixed && infoCandidateB.isFixed) {
            candidateOppositeBell = infoCandidateB.bell;
            isPalindromicValid = isPositionPossible(puzzleWorking.solution, idxOrig, jdx, candidateOppositeBell)
              && checkOppositesArePossible(puzzleWorking, bell, candidateOppositeBell);
          }
          else if (infoCandidateA.isFixed && infoCandidateB.isFixed) {
            candidateOppositeBell = infoCandidateA.bell;
            isPalindromicValid = infoCandidateA.bell == infoCandidateB.bell
              && checkOppositesArePossible(puzzleWorking, bell, candidateOppositeBell);
          }
          else {
            isPalindromicValid = intersect(puzzleWorking.solution[idxOrig][jdx], puzzleWorking.solution[idx][jdxOrig]).length > 0;
          }
        }
        
        if(isPalindromicValid && candidateOppositeBell > 0)
          if(puzzleWorking.options.fullCourse && (puzzleWorking.options.is2LeadEnd || puzzleWorking.options.isNLeadEnd || puzzleWorking.options.is2OrNLeadEnd))
          {
            var puzzleNew = copyGrid(puzzleWorking);
            puzzleNew.solution[puzzleNew.numRows-2][bell-1] = candidateOppositeBell;
            puzzleNew.solution[puzzleNew.numRows-2][candidateOppositeBell-1] = bell;
            
            var strategy = new Is2OrNLeadEnd();
            var is2LeadEnd = puzzleNew.options.is2LeadEnd || !strategy.checkIfGivenLeadEndPossible(puzzleNew, puzzleNew.numBells);
            var isNLeadEnd = puzzleNew.options.isNLeadEnd || !strategy.checkIfGivenLeadEndPossible(puzzleNew, 2);
            if(is2LeadEnd)
              strategy.applyLeadEnd(puzzleNew, 2);
            else
              strategy.applyLeadEnd(puzzleNew, puzzleNew.numBells);
            
            strategy = new OnlyOneOptionInRow();
            strategy.step(puzzleNew);
           
            var isOK = checkNoShortCycles(puzzleNew);
            isPalindromicValid &= isOK;
          }
      }
      isValid &= isPalindromicValid;
    }
    
    //Check for cycles if applicable
    if(puzzleWorking.options.fullCourse) {
      var isOK = checkNoShortCycles(puzzleWorking);
      isValid &= isOK;
    }
    
    //Check for long places: need to only make invalid if there's no possibility of leading or lying behind before or after
    var N = puzzleWorking.numBells;
    if(startingFromKnownPoint && puzzleWorking.options.noLongPlaces && (direction*(idx-idxOrig)>0) && placeCount == 2 && 
      (jdx==1 && !(isPositionPossible(puzzleWorking.solution, idxNext, 0, bell) && isPositionPossible(puzzleWorking.solution, idxPrevPrev, 0, bell)) ||
      jdx==N-2 && !(isPositionPossible(puzzleWorking.solution, idxNext, N-1, bell) && isPositionPossible(puzzleWorking.solution, idxPrevPrev, N-1, bell))))
      isValid = false;
      
    var jdxPrev = jdxOrig;
    while ((candidates.length == 1) && idxNext != idxOrigin){
      
      placeCount = jdx == candidates[0] ? placeCount+1 : 1;
      
      if (startingFromKnownPoint && puzzleWorking.options.noLongPlaces && (direction*(idxNextNext-idxOrig)>0) && placeCount > 2)
        isValid = false;
        
      if (startingFromKnownPoint && puzzleWorking.options.noLongPlaces && (direction*(idxNextNext-idxOrig)>0) && placeCount == 2 &&
        (jdx==1 && !isPositionPossible(puzzleWorking.solution, idxNextNext, 0, bell) || jdx == N-2 && !isPositionPossible(puzzleWorking.solution, idxNextNext, N-1, bell)))
        isValid = false;
        
      if (startingFromKnownPoint && puzzleWorking.options.noLongPlaces && (direction*(idxNextNext-idxOrig)>0)) {
        var jdxs = [jdxPrev, jdx, candidates[0]];
        if (compare(jdxs, [1,1,2]) || compare(jdxs, [N-3,N-2,N-2]))
          isValid = false;
      }
      
      jdxPrev = jdx;
      jdx = candidates[0];
      history.push([idxNext, jdx]);
      idxPrev = idxNext;
      idxNext = iterateIndex(puzzleWorking.solution, idxPrev, direction);
      idxNextNext = iterateIndex(puzzleWorking.solution, idxNextNext, direction);
      candidates = findOptionsInRow(puzzleWorking.solution, bell, idxNext, jdx);
    }
  }
  
  if(!isValid) {
    if(history[0][0] == puzzleWorking.numRows-1) {
        history = [];
    }
    else { 
      //Report that the initial decision is invalid
      history = history[0];
    }
  }
  else{
    history = []; 
  }
  return history;
}

function checkSolutionValid(puzzle) {

var isValid = true;

for(var idx=0; idx<puzzle.numRows; idx++)
  for(var jdx=0; jdx<puzzle.numBells; jdx++)
    if(puzzle.solution[idx][jdx].length == 0)
      isValid = false;
      
for(var idx=0; idx<puzzle.numRows; idx++) {
  var fixedBells = [];
  for(var jdx=0; jdx<puzzle.numBells; jdx++) {
    var info = isPositionDetermined(puzzle.solution, idx, jdx);
    if(info.isFixed)
      fixedBells.push(info.bell);
  }
  
  isValid &= new Set(fixedBells).size == fixedBells.length
}
return isValid;
}

function checkOppositesArePossible(puzzle, forwardBell, backwardBell) {
  var isPossible = true;
  for(var idx=0; idx<puzzle.numRows-1; idx++) {
    var info1 = isFixedInRow(puzzle.solution, forwardBell, idx);
    if(info1.isFixed)
      isPossible &= isPositionPossible(puzzle.solution, puzzle.numRows-2 - idx, info1.jdx, backwardBell);

    var info2 = isFixedInRow(puzzle.solution, backwardBell, idx);
    if(info2.isFixed)
      isPossible &= isPositionPossible(puzzle.solution, puzzle.numRows-2 - idx, info2.jdx, forwardBell);
  }
  return isPossible;
}

function checkNoShortCycles(puzzle) {
var isValid = true;
for(var jdx=1; jdx<puzzle.numBells; jdx++) {
  var bell = jdx+1;
  var count = 1;
  var info = isPositionDetermined(puzzle.solution, puzzle.numRows-1, bell-1);
  while(info.isFixed && (bell-1 != jdx || count == 1)) {
    bell = info.bell;
    info = isPositionDetermined(puzzle.solution, puzzle.numRows-1, bell-1);
    count++;
  }
  
  if(bell-1 == jdx && count > 1 && count < puzzle.numBells) {
    isValid = false;
    break;
  }
}
return isValid;
}

function checkLeadFalse(puzzle, idx) {
//Check whether the row we've just changed is false against another complete row

var isInvalid = false;
var isRowComplete = integerRange(0, puzzle.numRows-1).map(function(idx) { return isRowDetermined(puzzle, idx); });
if(isRowComplete[idx]) {
  for(var r=0; r<puzzle.numRows; r++)
    if(r != idx && isRowComplete[r]) {
      isInvalid = compareStrict(puzzle.solution[r], puzzle.solution[idx]);
      if(isInvalid)
        break;
    }
}
return isInvalid;
}

function checkRowPossible(board, idx, row) {
  var isOK = true;
  for(var jdx=0; jdx<board[0].length; jdx++)
    isOK &= isPositionPossible(board, idx, jdx, row[jdx]);
  return isOK;
}