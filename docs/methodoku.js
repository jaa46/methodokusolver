function blankPuzzle(numRows, numBells, treblePath) {
  
  if(treblePath == "plainHunt")
    numRows = 2*numBells + 1;
  else if(treblePath == "trebleBob")
    numRows = 4*numBells + 1;
  
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
  
  if(treblePath == "plainHunt") {
    for(var j=0; j<numBells; j++) {
      start[j][j] = 1;
      start[numRows-2 - j][j] = 1;
    }
    start[numRows-1][0] = 1;
  }
  else if(treblePath == "trebleBob") {
    var pattern = [0,1,0,1];
    for(var j=0; j<numBells; j+=2) {
      for(var k=0; k<pattern.length; k++) {
        var p = pattern[k] + j;
        start[4*(j/2)+k][p] = 1;
        start[numRows-2 - (4*(j/2)+k)][p] = 1;
      }
    }
    start[numRows-1][0] = 1;
  }
  
  return {
    start: start,
    solution: [],
    options: [],
    optionsDerived: [],
    numRows: numRows,
    numBells: numBells,
    isValid: true
  };
}

function resetPuzzle() {
setStatus("")
puzzle.isValid = true;
puzzle.solution = [];
puzzle.optionsDerived = [];

}
 
function buildStartingSolution() {

resetPuzzle();

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

function updateGrid(rebuild=false) {
  
  if(rebuild)
    buildGrid(puzzle.numRows, puzzle.numBells);

  var isChanged = false;

  var myElement = document.getElementById("grid");
  for(var i=0; i<puzzle.numRows; i++)
    for(var j=0; j<puzzle.numBells; j++) {
      var tbl = document.getElementById("options" + i + "_" + j);

      var numOptionRows = puzzle.numBells > 6 ? 3 : 2;
      var numOptionCols = Math.ceil(puzzle.numBells / numOptionRows);

      var impossibleColour = "#D3D3D3";
      var countPossibilitiesPrevious = 0;

      var board = puzzle.solution;
      if(board.length > 0) {
        
        //Remove residual boldness if this blow isn't specified in initial grid
        if(puzzle.start[i][j] == 0)
          grid.rows[i].cells[j].style.fontWeight = "normal";
        
        if(!tbl) {
          if(Array.isArray(board[i][j])) {
            var tbl = document.createElement('table');
            tbl.setAttribute("id", "options" + i + "_" + j);
            grid.rows[i].cells[j].append(tbl);

            for(var r=0; r < numOptionRows; r++) {
              var row = tbl.insertRow(r);
              for(var c=0; c < numOptionCols; c++) { 
                var cell = row.insertCell();
              }
            }
            isChanged = true;
            
            countPossibilitiesPrevious = board[i][j].length;
          }
          else
            countPossibilitiesPrevious = 1;
        }
        else {
          for(var r=0; r<tbl.rows.length; r++)
            for(var c=0; c<tbl.rows[r].cells.length; c++)
             if(isValidBellStr(tbl.rows[r].cells[c].innerText) && tbl.rows[r].cells[c].style.color != impossibleColour)
                countPossibilitiesPrevious++;
        }
      
        if(countPossibilitiesPrevious > 1) {
          for(var r=0; r < numOptionRows; r++)
            for(var c=0; c < numOptionCols; c++) { 
              var bell = r * numOptionCols + c + 1;
              if(board[i][j] == bell || Array.isArray(board[i][j]) && board[i][j].indexOf(bell) > -1) {
                isChanged |= setBell(tbl.rows[r].cells[c], num2bell(bell));
              }
              else {
                if(tbl.rows[r].cells[c].innerText == num2bell(bell)) {
                  if(tbl.rows[r].cells[c].style.color == "") {
                    tbl.rows[r].cells[c].style.color = impossibleColour;
                    isChanged = true;
                  }
                  else {
                    isChanged |= setBell(tbl.rows[r].cells[c], "");
                  }
                }
              }
            }
        }
        else {
          isChanged |= setBell(grid.rows[i].cells[j], num2bell(board[i][j]));
        }
      }
      
      //No solution yet - show initial puzzle
      else {
        // Show initially fixed bells in bold
        if(puzzle.start[i][j] > 0) {
          grid.rows[i].cells[j].innerHTML = num2bell(puzzle.start[i][j]);
          grid.rows[i].cells[j].style.fontWeight = "bold"; 
        }
        else {
          grid.rows[i].cells[j].innerHTML = "";
          grid.rows[i].cells[j].style.fontWeight = "normal"; 
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
    checkbox.checked = checkbox.id in puzzle.options && puzzle.options[checkbox.id];
  }
  var numberboxes = controls.querySelectorAll('input[type="number"]');
  for (var numberbox of numberboxes) {
    //Ignore the unspecified value of -1
    if (numberbox.id in puzzle.options && puzzle.options[numberbox.id] > -1)
      numberbox.value = puzzle.options[numberbox.id];
    else
      numberbox.value = "";
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
        if(puzzle.solution.length > 0) {
          if(grid.rows[i].cells[j].innerText)
            // User has specified a bell
            puzzle.solution[i][j] = bell2num(grid.rows[i].cells[j].innerText);
          else
            // This blow is free
            puzzle.solution[i][j] = allOptions(puzzle.numBells);
        }
        else {
          if(grid.rows[i].cells[j].innerText.length > 0) {
            // User has specified a bell
            var bell = bell2num(grid.rows[i].cells[j].innerText);
            if(bell == "?") {
              grid.rows[i].cells[j].innerText = "";
              console.log("Invalid bell specified")

              // Declare this blow to be free
              puzzle.start[i][j] = 0;
            }
            else
              puzzle.start[i][j] = bell;
            
          }
          else
            // This blow is free
            puzzle.start[i][j] = 0;
        }
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
  //Update options from numerical inputs
  var numberboxes = controls.querySelectorAll('input[type="number"]');
  for (var numberbox of numberboxes) {
    if (numberbox.value >= numberbox.min)
      puzzle.options[numberbox.id] = parseInt(numberbox.value);
    else {
      //Set to -1 if invalid
      puzzle.options[numberbox.id] = -1;
      if (numberbox.value && numberbox.value != "")
        console.log("Ignoring numerical input '" + numberbox.id + "' as invalid.")
    }
  }
}

function isValidBellStr(str){
  var special = ["0", "E", "T"];
  return str.length == 1 && (str >= '1' && str <= '9' || special.indexOf(str) >= 0);
}


function updateConfig() {
  console.log("A checkbox has been changed by the user.")
}

var puzzle = [];

function loadPuzzle() {
  var dropdown = document.getElementById("examplePuzzle");
  puzzle = copyGrid(examplePuzzles[dropdown.selectedIndex]);
  resetPuzzle();
  updateControls();
  updateGrid(true)
}

function createNewPuzzle() {
  var numRows = parseInt(document.getElementById("numberOfRows").value);
  var numBells = parseInt(document.getElementById("numberOfBells").value);
  var treblePathSelector = document.getElementById("trebleType");
  var treblePath = treblePathSelector.options[treblePathSelector.selectedIndex].value;
  puzzle = blankPuzzle(numRows, numBells, treblePath);
  updateGrid(true)
}

function restartPuzzle() {

  resetPuzzle();
  highlightActiveStrategy(-1);
  
  if(puzzle.start.length > 0)
    updateGrid(false);
  else
    console.log("Puzzle not started yet")
}

function updateStrategyVisibility(puzzle) {
  var display = document.getElementById("strategiesDisplay");
  for(var idx=0; idx<strategies.length; idx++) {
    var td = display.rows[idx].cells[0];
    if(strategies[idx].isActive(puzzle)) {
      td.style.color = "black";
    }
    else {
      td.style.color = "#D3D3D3";
    }
  } 
}

function highlightActiveStrategy(idxActive) {
  var display = document.getElementById("strategiesDisplay");
  for(var idx=0; idx<strategies.length; idx++) {
    var td = display.rows[idx].cells[0];
    if(idx == idxActive) {
      td.style.borderColor = "blue";
      td.style.borderWidth = "thick";
    }
    else {
      td.style.borderColor = "black";
      td.style.borderWidth = "thin";
    }
  }   
}

function buildStrategyTable() {
  var display = document.getElementById("strategiesDisplay");
  
  for(var idx=0; idx<strategies.length; idx++) {
    var row = display.insertRow(idx);
    var cell = row.insertCell();
    cell.className = "strategyDisplay";
    cell.id = "strategy_" + idx;
    
    var str = getStrategyName(strategies[idx]);
    cell.innerHTML = '<a href="https://jaa46.github.io/methodokusolver/#' + convertToID(str) + '" target="_blank">' + str + '</a>';
  }
}

function convertToID(str) {
  str = str.toLowerCase();
  str = str.replace('=', '');
  str = str.replace(/(^-\d-|^\d|^-\d|^--)/,'a$1').replace(/[\W]/g, '-');
  
  const reg = /\-{2,}/g;
  str = str.replaceAll(reg, '-');
  
  if (str.charAt(str.length - 1) == '-')
    str = str.slice(0, -1);
  
  return str;
}

var counterExamples = [];
function showReasoning(result) {
    
  var title = document.getElementById("counterExampleTitle");
  title.style.visibility = "visible";
  title.innerText = result.decision;
  
  var evidence = result.evidence;
  
  if(evidence.length == 0)
    return
  
  var selector = document.getElementById("counterExampleSelector");
  if(Array.isArray(evidence)) {
    counterExamples = evidence;

    showCounterExample(0);
    
    selector.style.visibility = "visible";
 
    var numberLabel = document.getElementById("counterExampleNumber");
    numberLabel.innerText = "of " + counterExamples.length;
 
    var control = document.getElementById("selectedCounterExample");
    control.value = 1;
    control.max = counterExamples.length;
  }
  else {
    //Only one counterexample - disable selection
    selector.style.visibility = "hidden";

    counterExamples = [evidence];
    
    showCounterExample(0); 
  }
}

function showCounterExample(index) {
  var evidence = counterExamples[index];

  var reason = document.getElementById("counterExampleReason");
  if(evidence.reasonForFailure.length > 0) {
    reason.innerText = evidence.reasonForFailure;
    reason.style.visibility = "visible";
  }
  else {
    reason.innerText = "";
    reason.style.visibility = "hidden";
  }
    
  var counterExample = evidence.counterExample;
  
  var disp = document.getElementById("counterExamples");
  for(var i=disp.rows.length-1; i>=0; i--)
      disp.deleteRow(i);
  
  for(var i=0; i<counterExample.numRows; i++)
  {
    var row = disp.insertRow(i);
    for(var j=0; j<counterExample.numBells; j++)
    {
      var cell = row.insertCell(j);
      cell.innerHTML = counterExample.solution[i][j];
    }
  }

  //Highlight the starting guesses which resulted in this counterexample
  var startingPoints = counterExample.stepsGuessed;
  for(var idxP = 0; idxP<startingPoints.length; idxP++) {
    if(idxP == 0)
      disp.rows[startingPoints[idxP].idx].cells[startingPoints[idxP].jdx].style.backgroundColor = "rgba(0, 0, 255, 0.6)";
    else
      disp.rows[startingPoints[idxP].idx].cells[startingPoints[idxP].jdx].style.backgroundColor = "rgba(0, 0, 255, 0.3)";      
  }
}

function hideReasoning() {
  counterExamples = [];
  
  var disp = document.getElementById("counterExamples");
  for(var i=disp.rows.length-1; i>=0; i--)
      disp.deleteRow(i);
    
  var title = document.getElementById("counterExampleTitle");
  title.style.visibility = "hidden";

  var reason = document.getElementById("counterExampleReason");
  reason.style.visibility = "hidden";
  
  var selector = document.getElementById("counterExampleSelector");
  selector.style.visibility = "hidden";
}

var strategies = [new OncePerRow(), new OnlyOneOptionInRow(), new NoJumping(), new FillSquares(), new RemoveDeadEnds(), 
  new WorkingBells(), new AllDoubleChanges(), new AllTripleChanges(), new NoLongPlaces(),
  new NoNminus1thPlacesExceptUnderTreble(), new RightPlace(), new NumberOfHuntBells(), 
  new ApplyPalindromicSymmetry(), new ApplyDoubleSymmetry(), new ApplyMirrorSymmetry(), 
  new Is2OrNLeadEnd(), new NoShortCycles(), new SurpriseMinor(), new DelightMinor(), new TrebleBobMinor(), 
  new UpTo2PlacesPerChange(), new ConsecutivePlaceLimit(), 
  new DoNotMakeBadDecision(false), new DoNotMakeBadGuess(false), 
  new ApplyPalindromicSymmetryFull(), new ApplyDoubleSymmetryFull(), new ApplyMirrorSymmetryFull(), 
  new DoNotMakeBadDecision(true), new DoNotMakeBadGuess(true), new DoNotMakeBadDecision(true, 2), new DoNotMakeBadGuess(true, 2)];

function getStrategyName(strategy) {
  var name = strategy.constructor.name;
  if (strategy.doPropagate)
    name += " (withPropagation)";
  if (strategy.recursionLimit)
    name += " (recursionLimit=" + strategy.recursionLimit + ")";
  return name;
}

function takeStep(updateMessage=true) {

  // Pick up changes made by the user
  updatePuzzleFromGrid();

  if(puzzle.solution.length == 0) {
    buildStartingSolution();
  }

  updateStrategyVisibility(puzzle);

  var isChanged = false;
  var message = getStatus();
  var decision = "";  
  hideReasoning();
  
  for(var idx = 0; idx < strategies.length && puzzle.isValid; idx++)
    if (strategies[idx].isActive(puzzle))
    {
      if (!isSolved())
        highlightActiveStrategy(idx);
      
      if(updateMessage)
        setStatus("Attempting strategy: " + getStrategyName(strategies[idx]))
      
      var isOK = true;
      try {
        if(strategies[idx].isRecursive) {
          var result = strategies[idx].step(puzzle);
          isChanged = result.isChanged;
          if(isChanged) {
            decision = result.decision;
            showReasoning(result);
          }
        }
        else {
          isChanged = strategies[idx].step(puzzle);
        }
      }
      catch(err) {
        isOK = false;
        puzzle.isValid = false;
      }
      if (isChanged || !puzzle.isValid)
      {
        if(!puzzle.isValid) {
          isChanged = false;
          message = "Things have gone wrong using " + getStrategyName(strategies[idx]);
        }
        else {
          message = "Success using: " + getStrategyName(strategies[idx]) + " (" + countSolvedBlows(puzzle) + " " + countRemainingOptions(puzzle) + ")";
          
          if(decision.length > 0)
            message += "\n" + decision;
        
          if(saveOutput)
            testResults += message + "\n";
          console.log(message)
        }
        break
      }
    }

  updateGrid(false)
  
  if(!checkSolutionValid(puzzle))
    message += "Things have gone wrong."
  else if (isSolved()) {
    if (!message.endsWith("Solved!"))
      message += ". Solved!"
  }
  else if(!isChanged && puzzle.isValid)
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

function getStatus() {
  return document.getElementById("status").value;
}

function solveGrid() {
  
  // Pick up changes made by the user
  updatePuzzleFromGrid();

  if(puzzle.solution.length == 0)
    buildStartingSolution();

  updateStrategyVisibility(puzzle);
  
  var countSolvedPrev = countSolvedBlows(puzzle);
  var countRemainingPrev = countRemainingOptions(puzzle);

  var doContinue = puzzle.isValid;
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
  updateGrid(false)
}

function countSolvedBlows(puzzle) {
  var count = 0;
  for(var i=0; i<puzzle.numRows; i++)
    for(var j=0; j<puzzle.numBells; j++)
      if(!Array.isArray(puzzle.solution[i][j]))
        count++;
  return count;
}

function countRemainingOptions(puzzle) {
  var count = 0;
  for(var i=0; i<puzzle.numRows; i++)
    for(var j=0; j<puzzle.numBells; j++)
      count+= Array.isArray(puzzle.solution[i][j]) ? puzzle.solution[i][j].length : 1;
  return count;
}

function isSolved() {
  return countSolvedBlows(puzzle) == puzzle.numRows * puzzle.numBells;
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

function methodokuError() {
  throw "Things have gone wrong"
  isGlobalOK = false;
}

function fixBell(board, idx, jdx, bell) {
  if(!Array.isArray(board[idx][jdx]) &&  board[idx][jdx] != bell || Array.isArray(board[idx][jdx]) && board[idx][jdx].length == 0 || bell == []) {
    methodokuError();
    return false;
  }
  
  if (!Array.isArray(bell) && Array.isArray(board[idx][jdx]) || 
      !Array.isArray(bell) && !Array.isArray(board[idx][jdx]) && board[idx][jdx] != bell || 
      Array.isArray(bell) && Array.isArray(board[idx][jdx]) && !compare(bell, board[idx][jdx])) {
    board[idx][jdx] = bell;
    return true;
  }
  else
    return false;
}

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
    //console.log("Invalid bell being removed")
    methodokuError();
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

function areBlowsConsistent(board, idx1, jdx1, idx2, jdx2) {
  var blow1 = board[idx1][jdx1];
  var blow2 = board[idx2][jdx2];
  return intersect(blow1, blow2).length > 0;
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

function findFirstWorkingBell(puzzle) {
  var firstBell = -1;
  if (puzzle.options.twoHuntBells)
    firstBell = 3;
  else if (puzzle.options.allWorkingExceptTreble)
    firstBell = 2;
  else {
    for(var bell=1; bell<=puzzle.numBells; bell++) {
      var info = isFixedInRow(puzzle.solution, bell, puzzle.numRows-1);
      if (info.isFixed) {
        firstBell = bell+1;
        break;
      }
    }
  }
  return firstBell;
}

function isRowDetermined(puzzle, idx) {
  return integerRange(0, puzzle.numBells-1).every(jdx => numberOfPossibilities(puzzle.solution, idx, jdx) == 1);
}

function isShiftedSymmetryPoint(puzzle) {
// Are there two hunt bells which plain hunt?
var idxLH = Math.floor(puzzle.numRows/2);
// Is the two in N-1st place at the half lead
return puzzle.options.twoHuntBells && isPositionPossible(puzzle.solution, idxLH, puzzle.numBells-2, 2);
}

function applyTrebleBobTreble(puzzle) {
var jdxs = [0,1,0,1,2,3,2,3,4,5,4,5,5,4,5,4,3,2,3,2,1,0,1,0,0];
var treble = 1;
var isChanged = false;
for(var idx=0; idx<jdxs.length; idx++)
  isChanged |= fixBell(puzzle.solution, idx, jdxs[idx], treble);
return isChanged;
}

function takeGuess(puzzle, numberOptions, withPropagation, config) {
  var directions = [1, -1];
  var isChanged = false;
  for(var idx=0; idx<puzzle.numRows; idx++)
    for(var jdx=0; jdx<puzzle.numBells; jdx++)
      if(numberOfPossibilities(puzzle.solution, idx, jdx) == numberOptions) {
        //Record whether we're starting from a fixed blow or not
        var startingFromKnownPoint = numberOptions == 1;
        
        var bellOptions = puzzle.solution[idx][jdx];
        if(!Array.isArray(bellOptions)) bellOptions = [bellOptions];
        
        for(var bdx=0; bdx<bellOptions.length; bdx++) {
          var idxStart = idx;
          for(var ddx=0; ddx<directions.length; ddx++) {
            var idxNew = iterateIndex(puzzle.solution, idxStart, directions[ddx]);
            
            //Avoid the case when we've reached the end of the grid
            if(directions[ddx] * (idxNew - idxStart) <= 0)
              continue
            
            //Find positions in this next row where this bell can ring
            var candidates = findOptionsInRow(puzzle.solution, bellOptions[bdx], idxNew, jdx);
            
            // If any of these possible blows have just one option remaining, it must be our bell
            if(candidates.some(jdx => numberOfPossibilities(puzzle.solution, idxNew, jdx) == 1))
              continue;
            
            var isCandidatePossible = [];
            var judgements = [];
            
            for(var cdx=0; cdx<candidates.length; cdx++) {
              //Determine consequences of picking this candidate
              var judgement = trackBellTillJunction(puzzle, bellOptions[bdx], idxNew, candidates[cdx], idx, jdx, directions[ddx], 
                withPropagation, config);
              
              if(startingFromKnownPoint && !judgement.isValid) {
                var posToRemove = judgement.badChoice;
                var message = "Removing bell " + bellOptions[bdx] + " from " + posToRemove[0] + "," + posToRemove[1];
                if(config.recursionLevel == 1)
                  console.log(message)
                isChanged = removeBell(puzzle.solution, posToRemove[0], posToRemove[1], bellOptions[bdx]);
                return { "isChanged": isChanged, "decision": message, "evidence": judgement };
              }

              isCandidatePossible.push(judgement.isValid);
              if(!judgement.isValid)
                judgements.push(judgement);
            }
            
            if(!startingFromKnownPoint && !isCandidatePossible.some(idx => idx)) {
              //If we guessed a position initially and then all
              //possibilities from there resulted in error, than
              //the bell cannot be in this guessed location
              var message = "Removing bell " + bellOptions[bdx] + " from " + idxStart + "," + jdx;
              if(config.recursionLevel == 1)
                console.log(message)
              isChanged = removeBell(puzzle.solution, idxStart, jdx, bellOptions[bdx]);
              return { "isChanged": isChanged, "decision": message, "evidence": judgements };
            }
          }
        }
        
      }
  return { "isChanged": isChanged, "decision": "", "judgement": [] };
}

function trackBellTillJunction(puzzle, bell, idx, jdx, idxPrev, jdxPrev, direction, withPropagation, config) {
  
  if(direction*(idx-idxPrev) <= 0)
    console.log("Things have gone wrong: bad inputs to trackBellTillJunction")
  
  var puzzleWorking = copyGrid(puzzle);
  
  if(!puzzleWorking.stepsGuessed)
    puzzleWorking.stepsGuessed = [];

  var isChanged = fixBell(puzzleWorking.solution, idxPrev, jdxPrev, bell);
  if(isChanged)
    puzzleWorking.stepsGuessed.push({'bell':bell, 'idx':idxPrev, 'jdx':jdxPrev});
  
  isChanged = fixBell(puzzleWorking.solution, idx, jdx, bell);
  if(isChanged)
    puzzleWorking.stepsGuessed.push({'bell':bell, 'idx':idx, 'jdx':jdx});
  
  var isValid = true;
  
  var judgements = [];
  var reasonForFailure = "";
  
  if(withPropagation) {
    //Determine consequences of making this guess
    while(true) {
      var isChanged = false;

      for(var idxS = 0; idxS < strategies.length; idxS++)
        if(isValid && strategies[idxS].isActive(puzzleWorking)) {
          if(!strategies[idxS].isRecursive) {
            try {
              isChanged |= strategies[idxS].step(puzzleWorking);
            }
            catch(err) {
              reasonForFailure = "Failure applying strategy " + getStrategyName(strategies[idxS]);
              isValid = false;
            }
          }
          else {
            //Ignores strategies without propagation, as the pretence of not tree searching is rapidly disappearing
            if(config.recursionLevel < config.recursionLimit && strategies[idxS].doPropagate && strategies[idxS].recursionLimit == config.recursionLimit) {
              try {
                var result = strategies[idxS].step(puzzleWorking, config.recursionLevel + 1);
                isChanged |= result.isChanged;
                if(result.decision.length > 0)
                  judgements.push(result);
              }
              catch(err) {
                //TODO: Record failures when errors occur while recursing
                reasonForFailure = "Failure applying strategy " + getStrategyName(strategies[idxS]);
                isValid = false;
              }
            }
          }
          
          var isSolutionValid = checkSolutionValid(puzzleWorking);
          if(!isSolutionValid) {
            isValid = false;
            reasonForFailure = "Invalid solution reached applying strategy " + getStrategyName(strategies[idxS]);
          }
        }
      
      if(!isValid || !isChanged)
        break;
    }      
  }
  
  //Record where we started analysing
  var idxOrigin = idx;
  var history = [];
  history.push([idx, jdx]);
  
  if(isValid) {
    if(puzzleWorking.options.trueInLead || puzzleWorking.options.trueInCourse) {
      var isFalse = checkLeadFalse(puzzleWorking, idx);
      if(isFalse) {
        reasonForFailure = "Lead is false";
        isValid = false;
      }
    }

    if(puzzleWorking.options.trueInCourse) {
      var isFalse = checkCourseFalse(puzzleWorking);
      if(isFalse) {
        reasonForFailure = "Course is false";
        isValid = false;
      }
    }
    
    if(puzzleWorking.options.palindromicSymmetry) {
      //If this implies a pair of bells are opposites, check if this is possible
      var isPalindromicValid = checkPalindromicSymmetryPossible(puzzleWorking, bell, idxPrev, idx, jdxPrev, jdx, direction);
      if(!isPalindromicValid) {
        isValid = false;
        reasonForFailure = "Palindromic symmetry not possible";
      }
    }
    
    //Check for cycles if applicable
    if(puzzleWorking.options.fullCourse) {
      var isOK = checkNoShortCycles(puzzleWorking);
      if(!isOK) {
        isValid = false;
        reasonForFailure = "Not full course";
      }
    }
    
    if(puzzleWorking.options.numberOfLeads > 0) {
      var isCourseRightLength = checkCourseLength(puzzleWorking);
      if(!isCourseRightLength) {
        isValid = false;
        reasonForFailure = "Course incorrect length";
      }
    }
    
    if(puzzleWorking.options.numberOfHuntBells > 0) {
      var isHuntBellsOK = checkNumberOfHuntBells(puzzleWorking);
      if(!isHuntBellsOK) {
        isValid = false;
        reasonForFailure = "Too many hunt bells";
      }
    }
    
    if (puzzleWorking.options.atMost2PlacesPerChange) {
      var isPlacesValid = checkUpToTwoPlacesPerChange(puzzleWorking);
      if(!isPlacesValid) {
        isValid = false;
        reasonForFailure = "Too many places per change";
      }
    }
    
    if (puzzleWorking.options.consecutivePlaceLimit >= 0) {
      var noConsecutivePlaces = checkConsecutivePlaceLimit(puzzleWorking);
      if(!noConsecutivePlaces) {
        isValid = false;
        reasonForFailure = "Too many consecutive places";
      }
    }
    
    var state = formState(puzzleWorking, idxPrev, jdxPrev, idx, jdx, bell, direction);

    var placeCount;
    if(state.jdxs[0] == state.jdxs[1])
      placeCount = 2;
    else 
      placeCount = 1;
      
    while (isValid && state.jdxs[3] >= 0 && state.bells[3] >= 0 && state.idxs[3] != idxOrigin) {
      
      if(state.jdxs[1] == state.jdxs[2]) {
        placeCount++;
      }
      else {
        placeCount = 1;
      }
      
      if (puzzleWorking.options.noLongPlaces && placeCount > 2)
        isValid = false;
        
      //Check for long places: need to only make invalid if there's no possibility of leading or lying behind before or after
      var N = puzzleWorking.numBells;
      if(puzzleWorking.options.noLongPlaces && placeCount == 2 && state.jdxs[3] >= 0 && state.jdxs[0] >= 0 &&
        (state.jdxs[1]==1 && !(isPositionPossible(puzzleWorking.solution, state.idxs[0], 0, state.bells[0]) && isPositionPossible(puzzleWorking.solution, state.idxs[3], 0, state.bells[3])) ||
        state.jdxs[1]==N-2 && !(isPositionPossible(puzzleWorking.solution, state.idxs[0], N-1, state.bells[0]) && isPositionPossible(puzzleWorking.solution, state.idxs[3], N-1, state.bells[3])))) {
          isValid = false;
          reasonForFailure = "Bell " + state.bells[1] + " made long places";
        }
        
      if (puzzleWorking.options.noLongPlaces) {
        if (state.bells.slice(1).every(function(b) {return b > 0;}) && (compare(state.jdxs.slice(1), [1,1,2]) || compare(state.jdxs.slice(1), [N-3,N-2,N-2]))) {
          isValid = false;
          reasonForFailure = "Bell " + state.bells[1] + " caused another bell to make long places";          
        }
      }
      
      history.push([state.idxs[3], state.jdxs[3]]);
      state = updateState(puzzleWorking, state, direction);
    }
  }
  
  if(!isValid) {
    //Report that the initial decision is invalid
    history = history[0];
  }
  else{
    history = []; 
  }
  return { "isValid": isValid, "badChoice": history, "counterExample": puzzleWorking, "furtherEvidence": judgements, "reasonForFailure": reasonForFailure };
}

function takeStepForward(puzzle, idx, jdx, bell, direction) {
  var idxNext = iterateIndex(puzzle.solution, idx, direction);
  
  var jdxNext;
  var bellNext;
  if(idxNext == 1 && direction > 0) {
    //Jumped from end to the start
    // Do we know which bell we've become?
    var info = isPositionDetermined(puzzle.solution, 0, jdx);
    bellNext = info.bell;
    
    if(!info.isFixed) {
      //Unlikely - conventionally, the first row is specified
      jdxNext = -1;
      bellNext = -1;
    }
    else {
      //If so, do we know where we are in the subsequent row?
      var infoNext = isFixedInRow(puzzle.solution, bellNext, idxNext);
      jdxNext = infoNext.jdx;
      if (!infoNext.isFixed)
        jdxNext = -1;
    }
  }
  else if(idxNext == puzzle.numRows-2 && direction < 0){
    //Jumped from start to the end
    // Do we know which bell we've become?
    var info = isPositionDetermined(puzzle.solution, puzzle.numRows-1, jdx);
    bellNext = info.bell;
    
    if(!info.isFixed) {
      jdxNext = -1;
      bellNext = -1;
    }
    else {
      //If so, do we know where we are in the precending row?
      var infoNext = isFixedInRow(puzzle.solution, bellNext, idxNext);
      jdxNext = infoNext.jdx;
      if (!infoNext.isFixed)
        jdxNext = -1;
    }
  }
  else {
    var infoNext = isFixedInRow(puzzle.solution, bell, idxNext);
    jdxNext = infoNext.jdx;
    if (!infoNext.isFixed)
        jdxNext = -1;
    bellNext = bell;
  }
  
  return {'idx': idxNext, 'jdx': jdxNext, 'bell': bellNext};
}

function takeStepBackward(puzzle, idx, jdx, bell, direction) {
  return takeStepForward(puzzle, idx, jdx, bell, -direction);
}

function formState(puzzle, idxPrev, jdxPrev, idx, jdx, bell, direction) {
//By design, bellPrev is bell
var bellPrev = bell;

//Record one further step back
var infoPrevPrev = takeStepBackward(puzzle, idxPrev, jdxPrev, bellPrev, direction);

// Record one step forward
var infoNext = takeStepForward(puzzle, idx, jdx, bell, direction);

return {
  'idxs': [infoPrevPrev.idx, idxPrev, idx, infoNext.idx], 
  'jdxs': [infoPrevPrev.jdx, jdxPrev, jdx, infoNext.jdx], 
  'bells': [infoPrevPrev.bell, bellPrev, bell, infoNext.bell] };
}

function updateState(puzzle, state, direction) {
var infoNextNext = takeStepForward(puzzle, state.idxs[3], state.jdxs[3], state.bells[3], direction);

var idxs = state.idxs.slice(1);
idxs.push(infoNextNext.idx);
var jdxs = state.jdxs.slice(1);
jdxs.push(infoNextNext.jdx);
var bells = state.bells.slice(1);
bells.push(infoNextNext.bell);
return {
  'idxs': idxs, 'jdxs': jdxs, 'bells': bells
  }
}

function checkSolutionValid(puzzle) {

//TODO: Add checks for the selected options

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

function checkPalindromicSymmetryPossible(puzzleWorking, bell, idxPrev, idx, jdxPrev, jdx, direction) {
  var isPalindromicValid = true;
  
  var idxHLE;
  if(isShiftedSymmetryPoint(puzzle))
    idxHLE = Math.floor(puzzleWorking.numRows/2);
  else
    idxHLE = Math.floor(puzzleWorking.numRows/2)-1;
    
  if(idxHLE == idxPrev && direction > 0 || idxHLE == idx && direction < 0) {
    var candidateOppositeBell = -1;
    if(jdx == jdxPrev) {
      //Can we be pivot bell?
      candidateOppositeBell = bell;
      isPalindromicValid &= checkOppositesArePossible(puzzleWorking, bell, candidateOppositeBell);
    }
    else {
      //Which bell are we swapping with?
      var infoCandidateA = isPositionDetermined(puzzleWorking.solution, idxPrev, jdx);
      var infoCandidateB = isPositionDetermined(puzzleWorking.solution, idx, jdxPrev);
      if (infoCandidateA.isFixed && !infoCandidateB.isFixed) {
        candidateOppositeBell = infoCandidateA.bell;
        isPalindromicValid = isPositionPossible(puzzleWorking.solution, idx, jdxPrev, candidateOppositeBell)
          && checkOppositesArePossible(puzzleWorking, bell, candidateOppositeBell);
      }
      else if (!infoCandidateA.isFixed && infoCandidateB.isFixed) {
        candidateOppositeBell = infoCandidateB.bell;
        isPalindromicValid = isPositionPossible(puzzleWorking.solution, idxPrev, jdx, candidateOppositeBell)
          && checkOppositesArePossible(puzzleWorking, bell, candidateOppositeBell);
      }
      else if (infoCandidateA.isFixed && infoCandidateB.isFixed) {
        candidateOppositeBell = infoCandidateA.bell;
        isPalindromicValid = infoCandidateA.bell == infoCandidateB.bell
          && checkOppositesArePossible(puzzleWorking, bell, candidateOppositeBell);
      }
      else {
        isPalindromicValid = intersect(puzzleWorking.solution[idxPrev][jdx], puzzleWorking.solution[idx][jdxPrev]).length > 0;
      }
    }
    
    if(isPalindromicValid && candidateOppositeBell > 0)
      if(puzzleWorking.options.fullCourse && (puzzleWorking.options.is2LeadEnd || puzzleWorking.options.isNLeadEnd || puzzleWorking.options.is2OrNLeadEnd))
      {
        var puzzleNew = copyGrid(puzzleWorking);
        
        var idxLH, idxLE;
        if(isShiftedSymmetryPoint(puzzleWorking)) {
          idxLH = 1;
          idxLE = puzzle.numRows-1;
        }
        else {
          idxLH = 0;
          idxLE = puzzle.numRows-2;          
        }
        puzzleNew.solution[idxLH][bell-1] = bell;
        puzzleNew.solution[idxLH][candidateOppositeBell-1] = candidateOppositeBell;
        puzzleNew.solution[idxLE][bell-1] = candidateOppositeBell;
        puzzleNew.solution[idxLE][candidateOppositeBell-1] = bell;
        
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
  return isPalindromicValid;
}

function checkOppositesArePossible(puzzle, forwardBell, backwardBell) {
  var isPossible = true;
  
  var relevantRows;
  if(isShiftedSymmetryPoint(puzzle)) {
    relevantRows = integerRange(1, puzzle.numRows-1);
  }
  else {
    relevantRows = integerRange(0, puzzle.numRows-2);
  }
  
  for(var idx=0; idx<relevantRows.length; idx++) {
    var info1 = isFixedInRow(puzzle.solution, forwardBell, relevantRows[idx]);
    if(info1.isFixed)
      isPossible &= isPositionPossible(puzzle.solution, relevantRows[relevantRows.length-1 - idx], info1.jdx, backwardBell);

    var info2 = isFixedInRow(puzzle.solution, backwardBell, relevantRows[idx]);
    if(info2.isFixed)
      isPossible &= isPositionPossible(puzzle.solution, relevantRows[relevantRows.length-1 - idx], info2.jdx, forwardBell);
  }
  return isPossible;
}

function checkNoShortCycles(puzzle) {
var isValid = true;

var firstWorkingBell = findFirstWorkingBell(puzzle);

//If it's not known who the first working bell is, abandon for now
if (firstWorkingBell < 0)
    return

for(var jdx=firstWorkingBell-1; jdx<puzzle.numBells; jdx++) {
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

function checkCourseLength(puzzle) {
  
  var cycleLengths = [];
  
  var isBellChecked = [];
  for(var jdx =0; jdx<puzzle.numBells; jdx++)
    isBellChecked.push(false);
  
  for(var jdx=0; jdx<puzzle.numBells; jdx++) {
    
    if(isBellChecked[jdx])
      continue;
    
    var bell = jdx+1;
    var count = 1;
    while (true) {
      isBellChecked[bell-1] = true;
      var info = isPositionDetermined(puzzle.solution, puzzle.numRows-1, bell-1);
      if(info.isFixed && info.bell == jdx+1) {
        cycleLengths.push(count);
        break;
      }
      else if (!info.isFixed)
        break;
        
      bell = info.bell;
      count++;
    }
  }
  
  var cycleSums = cycleLengths.reduce(function (accumulator, currentValue) {
  return accumulator + currentValue 
  }, 0);
  if(cycleSums < puzzle.numBells)
    //Inconclusive
    isValid = true;
  else {
    //Course length is the lowest common multiple of the cycles
    var cycleLCM = cycleLengths.reduce(function (accumulator, currentValue) {
    return (accumulator*currentValue)/gcd(accumulator,currentValue);
    }, 1);
    isValid = cycleLCM == puzzle.options.numberOfLeads;
  }
  
  return isValid;
}

function gcd(num1, num2) {
  
  //Loop till both numbers are not equal
  while(num1 != num2){
    
    //check if num1 > num2
    if(num1 > num2){
      //Subtract num2 from num1
      num1 = num1 - num2;
    }else{
      //Subtract num1 from num2
      num2 = num2 - num1;
    }
  }
  
  return num2;
}

function checkUpToTwoPlacesPerChange(puzzle) {
  var isValid = true;
  for(var idx=0; idx<puzzle.numRows-1; idx++) {
    var placeCount = 0;
    for(var jdx=0; jdx<puzzle.numBells; jdx++) {
      var info1 = isPositionDetermined(puzzle.solution, idx, jdx);
      var info2 = isPositionDetermined(puzzle.solution, idx+1, jdx);
      if(info1.isFixed && info2.isFixed && info1.bell == info2.bell)
        placeCount++;
    }
    isValid &= placeCount <= 2;
  }
  return isValid;
}

function checkConsecutivePlaceLimit(puzzle) {
  var isValid = true;
  var limit = puzzle.options.consecutivePlaceLimit;
  for(var idx=0; idx<puzzle.numRows-1; idx++)
    for(var jdx=0; jdx<puzzle.numBells-1; jdx++) {
      var info1 = isPositionDetermined(puzzle.solution, idx, jdx);
      var info2 = isPositionDetermined(puzzle.solution, idx+1, jdx);
      var info3 = isPositionDetermined(puzzle.solution, idx, jdx+1);
      var info4 = isPositionDetermined(puzzle.solution, idx+1, jdx+1);
      
      if (info1.isFixed && info2.isFixed && info3.isFixed && info4.isFixed &&
      info1.bell == info2.bell && info3.bell == info4.bell) {
        if (limit == 0)
          isValid = false;
          else if(limit == 2) {
            if(jdx < puzzle.numBells-2) {
              var info5 = isPositionDetermined(puzzle.solution, idx, jdx+2);
              var info6 = isPositionDetermined(puzzle.solution, idx+1, jdx+2);
              if(info5.isFixed && info6.isFixed && info5.bell == info6.bell)
                isValid = false;
            }
          }
      }
    }
  return isValid;
}
 
function ensureOnePlacePerChange(puzzle) {
  
  var hasChanged = false;
  
  for(var idx=0; idx<puzzle.numRows-1; idx++) {
    var possiblePlaces = [];
    for(var place = 1; place<=puzzle.numBells; place+=2) {
      if(isSinglePlacePossible(puzzle, idx, idx+1, place))
        possiblePlaces.push(place);
    }
    
    if(possiblePlaces.length == 1)
      hasChanged |= applySinglePlace(puzzle, idx, possiblePlaces[0]);
    
    if(possiblePlaces.length == 0)
      methodokuError();
  }
  
  //Prevent places in even positions
  for(var idx=0; idx<puzzle.numRows-1; idx++)
    for(var jdx=1; jdx<puzzle.numBells-1; jdx+=2) {
      var info = isPositionDetermined(puzzle.solution, idx, jdx);
      if(info.isFixed)
        hasChanged |= removeBell(puzzle.solution, idx+1, jdx, info.bell);
    }
    
  return hasChanged;
}

function isSinglePlacePossible(puzzle, idx1, idx2, place) {
  var tf = true;
  for(var below=0; below<place-1; below+=2)
    tf &= canPairCross(puzzle, idx1, below, idx2, below+1);
  
  tf &= canPairCross(puzzle, idx1, place-1, idx2, place-1);
  
  for(var above=place; above<puzzle.numBells-1; above+=2)
    tf &= canPairCross(puzzle, idx1, above, idx2, above+1);
  
  return tf;
}

function applySinglePlace(puzzle, idx, place) {
  var hasChanged = false;
  for(var below=0; below<place-1; below+=2)
    hasChanged |= makePairCross(puzzle, idx, below, idx+1, below+1);
  
  hasChanged |= makeBlowsConsistent(puzzle.solution, idx, place-1, idx+1, place-1);

  for(var above=place; above<puzzle.numBells-1; above+=2)
    hasChanged |= makePairCross(puzzle, idx, above, idx+1, above+1);
  
  return hasChanged;
}

function canPairCross(puzzle, idx1, jdx1, idx2, jdx2) {
  return areBlowsConsistent(puzzle.solution, idx1, jdx1, idx2, jdx2) && areBlowsConsistent(puzzle.solution, idx1, jdx2, idx2, jdx1);
}

function makePairCross(puzzle, idx1, jdx1, idx2, jdx2) {
  var DR = makeBlowsConsistent(puzzle.solution, idx1, jdx1, idx2, jdx2);
  var DL = makeBlowsConsistent(puzzle.solution, idx1, jdx2, idx2, jdx1);
  return DR || DL;
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

function checkCourseFalse(puzzle) {
//Check whether the course contains any repeated rows

var isInvalid = false;
var isRowComplete = integerRange(0, puzzle.numRows-1).map(function(idx) { return isRowDetermined(puzzle, idx); });
if(isRowComplete[isRowComplete.length-1]) {
  var rowsInCourse = [];
  for(var r=1; r<puzzle.numRows; r++)
    if(isRowComplete[r])
      rowsInCourse.push(copy(puzzle.solution[r]));
  
  var idxStart = 0;
  var numKnownRows = rowsInCourse.length;
  var perm = rowsInCourse[rowsInCourse.length-1];
  
  while(!compareStrict(rowsInCourse[rowsInCourse.length-1], integerRange(1, puzzle.numBells))) {    
    for(var idx=idxStart; idx<idxStart+numKnownRows; idx++) {
      var newRow = [];
      rowsInCourse[idx].forEach(bell => newRow.push(perm[bell-1]));
      rowsInCourse.push(newRow);
    }
    idxStart += numKnownRows;
  }

  rowsInCourse.forEach(function(row, index, arr) {
    arr[index] = row.reduce(function (accumulator, currentValue) {
    return accumulator + num2bell(currentValue);
  }, "");
  });
  
  var setRows = new Set(rowsInCourse);
  isInvalid = setRows.size != rowsInCourse.length;
}
return isInvalid;
}

function checkNumberOfHuntBells(puzzle) {
  var huntBells = identifyHuntBells(puzzle);
  return huntBells.fixed.length <= puzzle.options.numberOfHuntBells;
}

function identifyHuntBells(puzzle) {
  var possible = [];
  var fixed = [];
  for(var jdx=0; jdx<puzzle.numBells; jdx++) {
    var info = isPositionDetermined(puzzle.solution, puzzle.numRows-1, jdx);
    if(info.isFixed) {
      if(info.bell == jdx+1)
        fixed.push(jdx+1);
    }
    else {
      if(isPositionPossible(puzzle.solution, puzzle.numRows-1, jdx, jdx+1))
        possible.push(jdx+1);
    }
  }
  return {'possible' : possible, 'fixed' : fixed};
}

function checkRowPossible(board, idx, row) {
  var isOK = true;
  for(var jdx=0; jdx<board[0].length; jdx++)
    isOK &= isPositionPossible(board, idx, jdx, row[jdx]);
  return isOK;
}