function compare(expected, actual) {
    let array1 = expected.slice()
    let array2 = actual.slice()
    return array1.length === array2.length && array1.sort().every(function (value, index) { return value === array2.sort()[index] });
}


function copyGrid(orig_board) {
    return JSON.parse(JSON.stringify(orig_board));
}


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
      var allOptions = [];
      var lowEnd = 1;
      var highEnd = numBells;
      while(lowEnd <= highEnd){
         allOptions.push(lowEnd++);
      }
      rowData.push(allOptions)
    }
  }
  puzzle.solution.push(rowData);
}
}

function updateGrid(rebuild=false, showPossibilities=false) {
  
  var board = puzzle.solution;
  
  if(rebuild)
    buildGrid(puzzle.numRows, puzzle.numBells);

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
            
            countPossibilitiesPrevious = board[i][j].length;
          }
          else
            countPossibilitiesPrevious = 1;
        }
        else
        {
          for(var r=0; r < numOptionRows; r++)
            for(var c=0; c < numOptionCols; c++)
              if(tbl.rows[r].cells[c].innerHTML.length > 0 && tbl.rows[r].cells[c].style.color != impossibleColour)
                countPossibilitiesPrevious++;
        }
      
        if(countPossibilitiesPrevious > 1)
        {
          for(var r=0; r < numOptionRows; r++)
            for(var c=0; c < numOptionCols; c++)
            { 
              var bell = r * numOptionCols + c + 1;
              if(board[i][j] == bell || Array.isArray(board[i][j]) && board[i][j].indexOf(bell) > -1)
                tbl.rows[r].cells[c].innerHTML = num2bell(bell);
              else
              {
                if(tbl.rows[r].cells[c].innerText == num2bell(bell))
                {
                  if(tbl.rows[r].cells[c].style.color == "")
                  {
                    tbl.rows[r].cells[c].style.color = impossibleColour;
                  }
                  else
                    tbl.rows[r].cells[c].innerHTML = "";
                }
              }
            }
        }
        else
          grid.rows[i].cells[j].innerHTML = num2bell(board[i][j]);
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

function updateControls() {
  document.getElementById("numberOfRows").value = puzzle.numRows;
  document.getElementById("numberOfBells").value = puzzle.numBells;
  
  var controls = document.getElementById("optionControls");
  var checkboxes = controls.querySelectorAll('input[type="checkbox"]');
  for (var checkbox of checkboxes) {
    checkbox.checked = puzzle.options.indexOf(checkbox.id) >= 0;      
  }
}

function updateConfig() {
  console.log("A checkbox has been changed by the user.")
}

var puzzle = [];

function loadInitialGrid() {
  puzzle = simplePuzzle();
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

function takeStep() {

  var strategies = [new OncePerRow(), new OnlyOneOptionInRow(), new NoJumping()];

  var isChanged = false;
  var message = "";
  
  for(var idx = 0; idx < strategies.length; idx++)
    if (strategies[idx].isActive)
    {
      isChanged = strategies[idx].step(puzzle.solution, []);
      if (isChanged)
      {
        message = "Success using: " + strategies[idx].constructor.name;
        break
      }
    }

  updateGrid(false, true)
  
  return {
    isChanged: isChanged,
    message: message
  };
}

function solveGrid() {
  var doContinue = true;
  while (doContinue)
  {
    var status = takeStep();
    doContinue = status.isChanged;
  }
  
  // Final step for cosmetic effect. 
  // Currently keep solution shown in 'possibility' format to avoid jumping around too much.
  takeStep();
}

function isPositionDetermined(board, idx, jdx) {
  if (!Array.isArray(board[idx][jdx]))
    return [1, board[idx][jdx]];
  else
    return [0, -1];
}

function removeBell(board, idx, jdx, bell) {
  var isChanged = false;
  if (Array.isArray(board[idx][jdx]))
  {
    const index = board[idx][jdx].indexOf(bell);
    if (index > -1) {
      // console.log("Removing bell " + bell + " from (" + idx + "," + jdx + ")")
      isChanged = true;
      board[idx][jdx].splice(index, 1);
      
      if (board[idx][jdx].length == 1)
        board[idx][jdx] = board[idx][jdx][0];
    }
  }
  return isChanged;
}

function isPositionPossible(board, idx, jdx, bell) {
  return board[idx][jdx] == bell || Array.isArray(board[idx][jdx]) && board[idx][jdx].indexOf(bell) >= 0;
}