class Strategy {
  isActive(puzzle)
  {
  }
  step(puzzle)
  {
  }
}

class AllWorkingExceptTreble extends Strategy {
  isActive(puzzle)
  {
    return puzzle.options.allWorkingExceptTreble;
  }
  step(puzzle)
  {
    var isChanged = false;
    
    var treble = 1;
    isChanged = isChanged | fixBell(puzzle, puzzle.numRows, 1, treble);
    
    for(var b=1; b<=puzzle.numBells; b++) {
      isChanged = isChanged | removeBell(puzzle.solution, puzzle.numRows, b, b);
    }
    
    return isChanged;
  }
}

class UpdatePossibilities extends Strategy {
  isActive(puzzle)
  {
    return true;
  }
  step(puzzle)
  {
    return updateGrid(false, true)
  }
}

class OncePerRow extends Strategy {
 isActive(puzzle)
 {
   return true;
 } 
 step(puzzle)
 {
   var isChanged = false;
   for(var idx = 0; idx < puzzle.solution.length; idx++)
     for(var jdx = 0; jdx < puzzle.solution[0].length; jdx++)
     {
       var info = isPositionDetermined(puzzle.solution, idx, jdx);
       if (info.isFixed)
       {
         for (var kdx = 0; kdx < puzzle.solution[0].length; kdx++)
          if (kdx != jdx)
          {
            isChanged = isChanged | removeBell(puzzle.solution, idx, kdx, info.bell);
          }
       }
     }
   return isChanged;
 }
}

class OnlyOneOptionInRow extends Strategy {
  isActive(puzzle)
  {
    return true;
  }
  step(puzzle)
  {
    var isChanged = false;
    for(var idx = 0; idx < puzzle.solution.length; idx++)
      for(var bell = 1; bell <= puzzle.solution[0].length; bell++)
      {
        var possiblePlaces = [];
        for (var jdx = 0; jdx < puzzle.solution[0].length; jdx++)
          if (isPositionPossible(puzzle.solution, idx, jdx, bell))
            possiblePlaces.push(jdx);
            
        if (possiblePlaces.length == 1)
        {
          if (puzzle.solution[idx][possiblePlaces[0]] != bell)
          {
            puzzle.solution[idx][possiblePlaces[0]] = bell;
            isChanged = true;
          }
        }
      }
    return isChanged;
  }
}

class NoJumping extends Strategy {
  isActive(puzzle)
  {
    return true;
  }
  step(puzzle)
  {
    var isChanged = false;
    for(var idx = 0; idx < puzzle.solution.length; idx++)
      for(var jdx = 0; jdx < puzzle.solution[0].length; jdx++)
      {
        var info = isPositionDetermined(puzzle.solution, idx, jdx);
        if (info.isFixed)
        {
          isChanged = isChanged | this.propagateUL(puzzle.solution, idx, jdx, info.bell);
          isChanged = isChanged | this.propagateUR(puzzle.solution, idx, jdx, info.bell);
          isChanged = isChanged | this.propagateDL(puzzle.solution, idx, jdx, info.bell);
          isChanged = isChanged | this.propagateDR(puzzle.solution, idx, jdx, info.bell);
        }
      }
    return isChanged;
  }
  
  propagateUL(puzzle, idx, jdx, bell)
  {
    var isChanged = false;
    while (idx > 0 && jdx > 0)
    {
      // Remove any positions up and to the left which aren't possible from this fixed position
      for(var j = 0; j < jdx-1; j++)
        isChanged = isChanged | removeBell(puzzle, idx-1, j, bell);
      
      // Become less agressive if needed based on the possibilities in the precending row
      if (isPositionPossible(puzzle, idx-1, jdx-1, bell))
        jdx--;
        
      idx--;
    }
    return isChanged;
  }
  
  propagateUR(puzzle, idx, jdx, bell)
  {
    var isChanged = false;
    while (idx > 0 && jdx < puzzle[0].length - 1)
    {
      // Remove any positions up and to the right which aren't possible from this fixed position
      for(var j = jdx+2; j < puzzle[0].length; j++)
        isChanged = isChanged | removeBell(puzzle, idx-1, j, bell);
      
      // Become less agressive if needed based on the possibilities in the precending row
      if (isPositionPossible(puzzle, idx-1, jdx+1, bell))
        jdx++;
        
      idx--;
    }
    return isChanged;
  }
  
  propagateDL(puzzle, idx, jdx, bell)
  {
    var isChanged = false;
    while (idx < puzzle.length - 1 && jdx > 0)
    {
      // Remove any positions down and to the left which aren't possible from this fixed position
      for(var j = 0; j < jdx-1; j++)
        isChanged = isChanged | removeBell(puzzle, idx+1, j, bell);
      
      // Become less agressive if needed based on the possibilities in the precending row
      if (isPositionPossible(puzzle, idx+1, jdx-1, bell))
        jdx--;
        
      idx++;
    }
    return isChanged;
  }
  
  propagateDR(puzzle, idx, jdx, bell)
  {
    var isChanged = false;
    while (idx < puzzle.length - 1 && jdx < puzzle[0].length - 1)
    {
      // Remove any positions down and to the right which aren't possible from this fixed position
      for(var j = jdx+2; j < puzzle[0].length; j++)
        isChanged = isChanged | removeBell(puzzle, idx+1, j, bell);
      
      // Become less agressive if needed based on the possibilities in the precending row
      if (isPositionPossible(puzzle, idx+1, jdx+1, bell))
        jdx++;
        
      idx++;
    }
    return isChanged;
  }
}

class FillSquares extends Strategy {
  isActive(puzzle) {
    return true;
  }
  step(puzzle) {
    for(var idx=0; idx<puzzle.numRows-1; idx++)
      for(var jdx=0; jdx<puzzle.numBells-1; jdx++) { 
        var square1 = isPositionDetermined(puzzle.solution, idx, jdx);
        var square2 = isPositionDetermined(puzzle.solution, idx, jdx+1);
        var square3 = isPositionDetermined(puzzle.solution, idx+1, jdx);
        var square4 = isPositionDetermined(puzzle.solution, idx+1, jdx+1);
        
        if(square1.isFixed && square4.isFixed && square1.bell == square4.bell)
          makeBlowsConsistent(puzzle.solution, idx, jdx+1, idx+1, jdx);
        if(square2.isFixed && square3.isFixed && square2.bell == square3.bell)
          makeBlowsConsistent(puzzle.solution, idx, jdx, idx+1, jdx+1);
      }
  }
}

class RemoveDeadEnds extends Strategy {
  isActive(puzzle) {
    return true;
  }
  step(puzzle) {
    var isChanged = false;
    
    var directions = [+1, -1];
    
    for(var idx=0; idx<puzzle.numRows; idx++)
      for(var jdx=0; jdx<puzzle.numBells; jdx++) {
        var possibleBells = puzzle.solution[idx][jdx];
        if(!Array.isArray(possibleBells))
          possibleBells = [possibleBells];

        for(var kdx=0; kdx<possibleBells.length; kdx++)
          for(var ldx=0; ldx<directions.length; ldx++) {
            var bell = possibleBells[kdx];
            var dir = directions[ldx];
            var idxNew = iterateIndex(puzzle.solution, idx, dir);
            var pos = findInRow(puzzle.solution, bell, idxNew, jdx)
            if(dir*(idxNew-idx) > 0 && pos.length == 0)
              isChanged = isChanged | removeBell(puzzle.solution, idx, jdx, bell);
          }
      }
    return isChanged;
  }
}

class AllDoubleChanges extends Strategy {
  isActive(puzzle) {
    return puzzle.options.allDoubleChanges
  }
  step(puzzle) {
    var isChanged = false;
    if(puzzle.numBells != 5)
    {
      console.log("Not implemented yet")
      return isChanged;
    }
    
    for(var idx=0; idx<puzzle.numRows-1; idx++)
      for(var jdx=0; jdx<puzzle.numBells; jdx++){
        var info = isPositionDetermined(puzzle.solution, idx, jdx);
        if(info.isFixed && (jdx+1 == 2 || jdx+1 == 4))
          isChanged = isChanged | removeBell(puzzle.solution, idx+1, jdx, info.bell);
      }
    for(var idx=puzzle.numRows-1; idx>0; idx--)
      for(var jdx=0; jdx<puzzle.numBells; jdx++){
        var info = isPositionDetermined(puzzle.solution, idx, jdx);
        if(info.isFixed && (jdx+1 == 2 || jdx+1 == 4))
          isChanged = isChanged | removeBell(puzzle.solution, idx-1, jdx, info.bell);
      }
    
    return isChanged;
  }
}

class NoLongPlaces extends Strategy {
  isActive(puzzle) {
    return puzzle.options.noLongPlaces;
  }
  step(puzzle) {
    var isChanged = false;
    
    var directions = [+1, -1];
    for(var ddx=0; ddx<directions.length; ddx++) {
      for(var idx=0; idx<puzzle.numRows; idx++)
        for(var jdx=0; jdx<puzzle.numBells; jdx++) {
          var info = isPositionDetermined(puzzle.solution, idx, jdx);
          
          var idxNext = iterateIndex(puzzle.solution, idx, directions[ddx]);
          var idxNextNext = iterateIndex(puzzle.solution, idxNext, directions[ddx]);
          
          var infoNext = isPositionDetermined(puzzle.solution, idxNext, jdx);
          
          var isOK = directions[ddx] * (idxNextNext - idx) > 0;
          
          if(info.isFixed && infoNext.isFixed && isOK && info.bell == infoNext.bell)
            isChanged = isChanged | removeBell(puzzle.solution, idxNextNext, jdx, info.bell);
        }
    }
    
    return isChanged;
  }
}