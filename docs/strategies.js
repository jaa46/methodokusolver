class Strategy {
  isActive(options)
  {
  }
  step(puzzle, options)
  {
  }
}

class UpdatePossibilities extends Strategy {
  isActive(options)
  {
    return true;
  }
  step(puzzle, options)
  {
    return updateGrid(false, true)
  }
}

class OncePerRow extends Strategy {
 isActive(options)
 {
   return true;
 } 
 step(puzzle, options)
 {
   var isChanged = false;
   for(var idx = 0; idx < puzzle.length; idx++)
     for(var jdx = 0; jdx < puzzle[0].length; jdx++)
     {
       var info = isPositionDetermined(puzzle, idx, jdx);
       if (info[0])
       {
         for (var kdx = 0; kdx < puzzle[0].length; kdx++)
          if (kdx != jdx)
          {
            isChanged = isChanged | removeBell(puzzle, idx, kdx, info[1]);
          }
       }
     }
   return isChanged;
 }
}

class OnlyOneOptionInRow extends Strategy {
  isActive(options)
  {
    return true;
  }
  step(puzzle, options)
  {
    var isChanged = false;
    for(var idx = 0; idx < puzzle.length; idx++)
      for(var bell = 1; bell <= puzzle[0].length; bell++)
      {
        var possiblePlaces = [];
        for (var jdx = 0; jdx < puzzle[0].length; jdx++)
          if (isPositionPossible(puzzle, idx, jdx, bell))
            possiblePlaces.push(jdx);
            
        if (possiblePlaces.length == 1)
        {
          if (puzzle[idx][possiblePlaces[0]] != bell)
          {
            puzzle[idx][possiblePlaces[0]] = bell;
            isChanged = true;
          }
        }
      }
    return isChanged;
  }
}

class NoJumping extends Strategy {
  isActive(options)
  {
    return true;
  }
  step(puzzle, options)
  {
    var isChanged = false;
    for(var idx = 0; idx < puzzle.length; idx++)
      for(var jdx = 0; jdx < puzzle[0].length; jdx++)
      {
        var info = isPositionDetermined(puzzle, idx, jdx);
        if (info[0])
        {
          isChanged = isChanged | this.propagateUL(puzzle, idx, jdx, info[1]);
          isChanged = isChanged | this.propagateUR(puzzle, idx, jdx, info[1]);
          isChanged = isChanged | this.propagateDL(puzzle, idx, jdx, info[1]);
          isChanged = isChanged | this.propagateDR(puzzle, idx, jdx, info[1]);
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
