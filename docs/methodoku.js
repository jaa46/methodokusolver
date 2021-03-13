function compare(expected, actual) {
    let array1 = expected.slice()
    let array2 = actual.slice()
    return array1.length === array2.length && array1.sort().every(function (value, index) { return value === array2.sort()[index] });
}


function copyGrid(orig_board) {
    return JSON.parse(JSON.stringify(orig_board));
}


function simplePuzzle() {
  return [
    [1,2,3,4],
    [0,1,0,3],
    [0,0,1,0],
    [2,0,0,1],
    [4,0,0,1],
    [0,0,1,0],
    [0,1,0,0],
    [1,0,0,2],
    [1,0,0,3]
];
}

function buildPuzzle() {

puzzle = [];

var numBells = start[0].length;

for(var row = 0; row < start.length; row++)
{
  var rowData = [];
  for(var col = 0; col < start[0].length; col++)
  { 
    if(start[row][col] > 0)
    {
       // Bell is fixed
       rowData.push(start[row][col]);
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
  puzzle.push(rowData);
}
}

function updateGrid(board, rebuild=false, showPossibilities=false) {
  if(rebuild)
    buildGrid(board.length, board[0].length);

  var myElement = document.getElementById("grid");
  for(var i=0; i<board.length; i++)
    for(var j=0; j<board[0].length; j++)
    {
      var tbl = document.getElementById("options" + i + j);

      var numRows = board[0].length > 6 ? 3 : 2;
      var numCols = Math.ceil(board[0].length / numRows);

      var impossibleColour = "#D3D3D3";
      var countPossibilitiesPrevious = 0;

      if(showPossibilities)
      {
        if(!tbl)
        {
          if(Array.isArray(board[i][j]))
          {
            var tbl = document.createElement('table');
            tbl.setAttribute("id", "options" + i + j);
            grid.rows[i].cells[j].append(tbl);

            for(var r=0; r < numRows; r++)
            {
              var row = tbl.insertRow(r);
              for(var c=0; c < numCols; c++)
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
          for(var r=0; r < numRows; r++)
            for(var c=0; c < numCols; c++)
              if(tbl.rows[r].cells[c].innerHTML.length > 0 && tbl.rows[r].cells[c].style.color != impossibleColour)
                countPossibilitiesPrevious++;
        }
      
        if(countPossibilitiesPrevious > 1)
        {
          for(var r=0; r < numRows; r++)
            for(var c=0; c < numCols; c++)
            { 
              var bell = r * numCols + c + 1;
              if(board[i][j] == bell || Array.isArray(board[i][j]) && board[i][j].indexOf(bell) > -1)
                tbl.rows[r].cells[c].innerHTML = bell;
              else
              {
                if(tbl.rows[r].cells[c].innerText == bell)
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
          grid.rows[i].cells[j].innerHTML = board[i][j];
      }
      else
      {
        if(!Array.isArray(board[i][j]))
        {
          grid.rows[i].cells[j].innerHTML = board[i][j];
          
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

var puzzle = [];
var start = [];

function loadInitialGrid() {
  start = simplePuzzle();
  buildPuzzle();
  updateGrid(puzzle, true)
}

function takeStep() {

  var strategies = [new OncePerRow(), new OnlyOneOptionInRow(), new NoJumping()];

  var isChanged = false;
  var message = "";
  
  for(var idx = 0; idx < strategies.length; idx++)
    if (strategies[idx].isActive)
    {
      isChanged = strategies[idx].step(puzzle, []);
      if (isChanged)
      {
        message = "Success using: " + strategies[idx].constructor.name;
        break
      }
    }

  updateGrid(puzzle, false, true)
  
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
}

function isPositionDetermined(puzzle, idx, jdx) {
  if (!Array.isArray(puzzle[idx][jdx]))
    return [1, puzzle[idx][jdx]];
  else
    return [0, -1];
}

function removeBell(puzzle, idx, jdx, bell) {
  var isChanged = false;
  if (Array.isArray(puzzle[idx][jdx]))
  {
    const index = puzzle[idx][jdx].indexOf(bell);
    if (index > -1) {
      // console.log("Removing bell " + bell + " from (" + idx + "," + jdx + ")")
      isChanged = true;
      puzzle[idx][jdx].splice(index, 1);
      
      if (puzzle[idx][jdx].length == 1)
        puzzle[idx][jdx] = puzzle[idx][jdx][0];
    }
  }
  return isChanged;
}

function isPositionPossible(puzzle, idx, jdx, bell) {
  return puzzle[idx][jdx] == bell || Array.isArray(puzzle[idx][jdx]) && puzzle[idx][jdx].indexOf(bell) >= 0;
}