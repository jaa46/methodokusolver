class Strategy {
  isRecursive = false;
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
    isChanged = isChanged | fixBell(puzzle.solution, puzzle.numRows-1, 0, treble);
    
    for(var b=2; b<=puzzle.numBells; b++) {
      isChanged = isChanged | removeBell(puzzle.solution, puzzle.numRows-1, b-1, b);
    }
    
    return isChanged;
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
    var isChanged = false;

    for(var idx=0; idx<puzzle.numRows-1; idx++)
      for(var jdx=0; jdx<puzzle.numBells-1; jdx++) { 
        var square1 = isPositionDetermined(puzzle.solution, idx, jdx);
        var square2 = isPositionDetermined(puzzle.solution, idx, jdx+1);
        var square3 = isPositionDetermined(puzzle.solution, idx+1, jdx);
        var square4 = isPositionDetermined(puzzle.solution, idx+1, jdx+1);
        
        if(square1.isFixed && square4.isFixed && square1.bell == square4.bell)
          isChanged |= makeBlowsConsistent(puzzle.solution, idx, jdx+1, idx+1, jdx);
        if(square2.isFixed && square3.isFixed && square2.bell == square3.bell)
          isChanged |= makeBlowsConsistent(puzzle.solution, idx, jdx, idx+1, jdx+1);
      }
    return isChanged;
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
        var possibleBells = copy(puzzle.solution[idx][jdx]);
        if(!Array.isArray(possibleBells))
          possibleBells = [possibleBells];

        for(var kdx=0; kdx<possibleBells.length; kdx++)
          for(var ldx=0; ldx<directions.length; ldx++) {
            var bell = possibleBells[kdx];
            var dir = directions[ldx];
            var idxNew = iterateIndex(puzzle.solution, idx, dir);
            var pos = findOptionsInRow(puzzle.solution, bell, idxNew, jdx)
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

class NoNminus1thPlacesExceptUnderTreble extends Strategy {
  isActive(puzzle) {
    return puzzle.options.noNminus1thPlacesExceptUnderTreble
  }
  step(puzzle) {
    var isChanged = false;
    var treble = 1;
    for(var idx=0; idx<puzzle.numRows-1; idx++) {
      var info = isPositionDetermined(puzzle.solution, idx, puzzle.numBells-2);
      if(info.isFixed && !isPositionPossible(puzzle.solution, idx, puzzle.numBells-1, treble) && !isPositionPossible(puzzle.solution, idx+1, puzzle.numBells-1, treble))
        isChanged |= removeBell(puzzle.solution, idx+1, puzzle.numBells-2, info.bell);
    }
    for(var idx=puzzle.numRows-1; idx>=1; idx--) {
      var info = isPositionDetermined(puzzle.solution, idx, puzzle.numBells-2);
      if(info.isFixed && !isPositionPossible(puzzle.solution, idx, puzzle.numBells-1, treble) && !isPositionPossible(puzzle.solution, idx-1, puzzle.numBells-1, treble))
        isChanged |= removeBell(puzzle.solution, idx-1, puzzle.numBells-2, info.bell);
    }
    
    return isChanged;
  }
}

class ApplyMirrorSymmetry extends Strategy {
  isActive(puzzle) {
    return puzzle.options.mirrorSymmetry
  }
  step(puzzle) {
    var isChanged = false;
    for(var idx=1; idx<puzzle.numRows; idx++)
      for(var firstBell = 1; firstBell<=puzzle.numBells; firstBell++) {
        var infoBefore = isFixedInRow(puzzle.solution, firstBell, idx-1);
        var infoNow = isFixedInRow(puzzle.solution, firstBell, idx);
        
        if(infoBefore.isFixed && infoNow.isFixed) {
          var jdxBefore_mirror = puzzle.numBells - 1 - infoBefore.jdx;
          var jdxNow_mirror = puzzle.numBells - 1 - infoNow.jdx;
          isChanged |= makeBlowsConsistent(puzzle.solution, idx-1, jdxBefore_mirror, idx, jdxNow_mirror);
        }
      }
    return isChanged;
  }
}

class ApplyPalindromicSymmetry extends Strategy {
  isActive(puzzle) {
    return puzzle.options.palindromicSymmetry
  }
  step(puzzle) {
    //TODO: Handle symmetry in twin-hunt methods

    var isChanged = false;

    //From leadhead to leadend
    for(var idx=0; idx<puzzle.numBells; idx++) {
      var info = isPositionDetermined(puzzle.solution, puzzle.numRows-2, idx);
      if(info.isFixed) {
        var backwardBell = info.bell;
        var forwardBell = puzzle.solution[0][idx];
        isChanged |= this.i_palindromic(puzzle, forwardBell, backwardBell);
      }
    }
    
    //From half-lead
    var idxHLE = Math.floor(puzzle.numRows/2)-1;
    var idxHLH = idxHLE+1;

    //Check if a pair crosses here
    for(var idx=0; idx<puzzle.numBells-1; idx++) {
      var infoHLE_L = isPositionDetermined(puzzle.solution, idxHLE, idx);
      var infoHLH_L = isPositionDetermined(puzzle.solution, idxHLH, idx);
      var infoHLE_R = isPositionDetermined(puzzle.solution, idxHLE, idx+1);
      var infoHLH_R = isPositionDetermined(puzzle.solution, idxHLH, idx+1);
      
      if(infoHLE_L.isFixed && infoHLE_R.isFixed && infoHLH_L.isFixed && infoHLH_R.isFixed &&
        infoHLE_L.bell == infoHLH_R.bell && infoHLE_R.bell == infoHLH_L.bell) {
        isChanged |= this.i_palindromic(puzzle, infoHLE_L.bell, infoHLE_R.bell);
      }
    }

    //Check if a pivot bell
    for(var idx=0; idx<puzzle.numBells; idx++) {
      var infoHLE = isPositionDetermined(puzzle.solution, idxHLE, idx);
      var infoHLH = isPositionDetermined(puzzle.solution, idxHLH, idx);
      
      if(infoHLE.isFixed && infoHLH.isFixed && infoHLE.bell == infoHLH.bell) {
        isChanged |= this.i_palindromic(puzzle, infoHLE.bell, infoHLE.bell);
      }
    }
    
    return isChanged;
  }
  
  i_palindromic(puzzle, bell1, bell2) {
    var isChanged = false;
    for(var idx=0; idx<puzzle.numRows-2; idx++) {
      var info = isFixedInRow(puzzle.solution, bell1, idx);
      if(info.isFixed)
        isChanged |= fixBell(puzzle.solution, puzzle.numRows-2 - idx, info.jdx, bell2);
        
      info = isFixedInRow(puzzle.solution, bell2, idx);
      if(info.isFixed)
        isChanged |= fixBell(puzzle.solution, puzzle.numRows-2 - idx, info.jdx, bell1);
    }
    
    return isChanged;
  }
}

class ApplyDoubleSymmetry extends Strategy {
  isActive(puzzle) {
    return puzzle.options.doubleSymmetry
  }
  
  step(puzzle) {
  
    var isChanged = false;
    var idxHLE = Math.floor(puzzle.numRows/2)-1;
    var idxHLH = idxHLE+1;
    
    for(var firstBell=1; firstBell<= puzzle.numBells; firstBell++) {
      var idxSecondBell = puzzle.numBells - firstBell;
      var info = isPositionDetermined(puzzle.solution, idxHLH, idxSecondBell);
      if(info.isFixed) {
        isChanged |= this.i_double(puzzle, firstBell, info.bell)
      }
    }
    return isChanged;
  }
  
  i_double(puzzle, bell1, bell2) {
    var isChanged = false;
    for(var idx=1; idx<Math.ceil(puzzle.numRows/2); idx++) {
      var infoFirstHalfBell = isFixedInRow(puzzle.solution, bell1, idx);
      if(infoFirstHalfBell.isFixed) {
        isChanged |= fixBell(puzzle.solution, (puzzle.numRows-1)/2 + idx, puzzle.numBells-1 - infoFirstHalfBell.jdx, bell2)
      }
      var infoSecondHalfBell = isFixedInRow(puzzle.solution, bell2, (puzzle.numRows-1)/2 + idx);
      if(infoSecondHalfBell.isFixed) {
        isChanged |= fixBell(puzzle.solution, idx, puzzle.numBells-1 - infoSecondHalfBell.jdx, bell1)
      }
    }
    return isChanged;
  }
}

class Is2OrNLeadEnd extends Strategy {
  isActive(puzzle) {
    if(puzzle.options.is2LeadEnd && puzzle.options.isNLeadEnd) {
      console.log("Invalid configuration: can not have 2 lead ends specified")
      return false;
    }
      
    return puzzle.options.is2OrNLeadEnd || puzzle.options.is2LeadEnd || puzzle.options.isNLeadEnd
  }
  
  step(puzzle) {
    
    var isChanged = false;
    var is2LeadEnd = puzzle.options.is2LeadEnd || !this.checkIfGivenLeadEndPossible(puzzle, puzzle.numBells);
    var isNLeadEnd = puzzle.options.isNLeadEnd || !this.checkIfGivenLeadEndPossible(puzzle, 2);
  
    if(is2LeadEnd)
      isChanged |= this.applyLeadEnd(puzzle, 2);
    else if (isNLeadEnd)
      isChanged |= this.applyLeadEnd(puzzle, puzzle.numBells);

    return isChanged;
  }
  
  checkIfGivenLeadEndPossible(puzzle, place) {
    var isPossible = true;
    
    if(place != 2 && place != puzzle.numBells)
      console.log("Not implemented yet")
    
    isPossible &= this.checkLeadEndPairFeasible(puzzle, place, place);
    
    if(place == 2) {
      for(var bell1 = 3; bell1<puzzle.numBells; bell1+=2)
        isPossible &= this.checkLeadEndPairFeasible(puzzle, bell1, bell1+1);   
    }
    else if(place == puzzle.numBells) {
      for(var bell1 = 2; bell1<puzzle.numBells; bell1+=2)
        isPossible &= this.checkLeadEndPairFeasible(puzzle, bell1, bell1+1);
    }
    
    //Rule out nth place leads starting with another place if only two blows in
    //a place are allowed
    var infoStart = isPositionDetermined(puzzle.solution, 0, puzzle.numBells-1);
    var infoNext = isPositionDetermined(puzzle.solution, 1, puzzle.numBells-1);
    
    if(puzzle.options.noLongPlaces && infoNext.isFixed && infoStart.bell == infoNext.bell)
      isPossible &= place != puzzle.numBells;
      
    return isPossible;
  }
  
  checkLeadEndPairFeasible(puzzle, bell1, bell2) {
    var idxLE = puzzle.numRows-2;
    var idxLH = puzzle.numRows-1;
    return intersect(puzzle.solution[idxLE][bell1-1], puzzle.solution[idxLH][bell2-1]).length > 0 &&
      intersect(puzzle.solution[idxLE][bell2-1], puzzle.solution[idxLH][bell1-1]).length > 0;
  }
  
  applyLeadEnd(puzzle, place) {
    var isChanged = false;
    var idxLE = puzzle.numRows-2;
    var idxLH = puzzle.numRows-1;
    isChanged |= makeBlowsConsistent(puzzle.solution, idxLE, place-1, idxLH, place-1)
    
    if(place == 2)
      for(var idx=2; idx<puzzle.numBells; idx+=2)
        isChanged |= this.makePairSwappingConsistent(puzzle, idx, idx+1)
    else if(place == puzzle.numBells)
      for(var idx=1; idx<puzzle.numBells-1; idx+=2)
        isChanged |= this.makePairSwappingConsistent(puzzle, idx, idx+1)

    return isChanged;
  }
  
  makePairSwappingConsistent(puzzle, jdx1, jdx2) {
    var isChanged = false;
    var idxLE = puzzle.numRows-2;
    var idxLH = puzzle.numRows-1;
    isChanged |= makeBlowsConsistent(puzzle.solution, idxLE, jdx1, idxLH, jdx2)
    isChanged |= makeBlowsConsistent(puzzle.solution, idxLE, jdx2, idxLH, jdx1)
    
    return isChanged;
  }
}

class NoShortCycles extends Strategy {
  isActive(puzzle) {
    return puzzle.options.fullCourse;
  }
  
  step(puzzle) {
    //TODO: Generalise this to longer-cycles
    var isChanged = false;
    
    //Check for two cycles
    for(var bell = 2; bell<=puzzle.numBells; bell++) {
      // If we know where this bell is at the lead head, its new place bell
      // cannot become this bell's original place bell.
      var info = isFixedInRow(puzzle.solution, bell, puzzle.numRows-1);
      if(info.isFixed) {
        isChanged |= removeBell(puzzle.solution, puzzle.numRows-1, bell-1, info.jdx+1)
      }
    }
    
    return isChanged;
  }
}

class DoNotMakeBadDecision extends Strategy {
  constructor(doPropagate) {
    super();
    this.doPropagate = doPropagate;
  }
  isRecursive = true;
  isActive(puzzle)
  {
    return true;
  }
  step(puzzle)
  {
    //Only guess from fixed bells, with no propagation
    var isChanged = takeGuess(puzzle, 1, this.doPropagate);
    return isChanged;
  }
}

class DoNotMakeBadGuess extends Strategy {
  constructor(doPropagate) {
    super();
    this.doPropagate = doPropagate;
  }
  isRecursive = true;
  isActive(puzzle)
  {
    return true;
  }
  step(puzzle)
  {
    //Guess from blows with 2 remaining options, with no propagation
    var isChanged = takeGuess(puzzle, 2, this.doPropagate)
    
    //Guess plain bob leadends
    if(puzzle.options.plainBobLeadEnd) {
      var plainBobLeadHeads = this.generatePlainBobLeadHeads(puzzle.numBells);
      var idxHLH = Math.floor(puzzle.numRows/2);
      var idxLH = puzzle.numRows - 1;
      isChanged |= this.guessPlainBob(puzzle, this.doPropagate, plainBobLeadHeads, [idxLH, idxLH-1], [idxHLH, idxHLH-1]);

      var plainBobLeadEnds = this.generatePlainBobLeadEnds(puzzle.numBells);
      var idxHLE = Math.floor(puzzle.numRows/2) - 1;
      var idxLE = puzzle.numRows - 2;
      isChanged |= this.guessPlainBob(puzzle, this.doPropagate, plainBobLeadEnds, [idxLE, idxLE+1], [idxHLE, idxHLE+1]);
    }

    return isChanged;
  }
  guessPlainBob(puzzle, withPropagation, possibleLeads, idxLead, idxHalfLead) {
    var isChanged = false;
    
    //Test out leadhead/end
    var jdxLead = [0,0];
    isChanged |= this.tryEachRow(puzzle, withPropagation, possibleLeads, idxLead, jdxLead);
    
    if(puzzle.options.doubleSymmetry) {
      //Test out half-leadhead/end
      var possibleHeadLeads = possibleLeads.map(function(v) {return v.reverse();});
      var jdxHalfLead = [puzzle.numBells-1, puzzle.numBells-1];
      isChanged |= this.tryEachRow(puzzle, withPropagation, possibleHeadLeads, idxHalfLead, jdxHalfLead);      
    }
    
    return isChanged;
  }
  tryEachRow(puzzle, withPropagation, possibleRows, idxRows, jdxRows) {
    var idxValidRows = [];
    for(var rdx=0; rdx<possibleRows.length; rdx++) {
      var row = possibleRows[rdx];
      if(checkRowPossible(puzzle.solution, idxRows[0], row)) {
        var puzzleWorking = copyGrid(puzzle);
        for(var jdx=0; jdx<puzzle.numBells; jdx++) {
          fixBell(puzzleWorking.solution, idxRows[0], jdx, row[jdx]);
        }
        
        var startingFromKnownPoint = false;
        var treble = 1;
        var direction = 1;
        var posToRemove = trackBellTillJunction(puzzleWorking, treble, idxRows[0], jdxRows[0], idxRows[1], jdxRows[1], 
          direction, startingFromKnownPoint, withPropagation);
        if(posToRemove.length == 0)
          idxValidRows.push(rdx);
      }
    }
    
    var isChanged = false;
    if(idxValidRows.length == 1) {
      console.log("identified PB at " + idxRows[0] + ": " + possibleRows[idxValidRows[0]])
      for(var jdx=0; jdx<puzzle.numBells; jdx++)
        isChanged |= fixBell(puzzle.solution, idxRows[0], jdx, possibleRows[idxValidRows[0]][jdx]);
    }
    
    return isChanged;
  }
  generatePlainBobLeadHeads(numBells) {
    // 123456
    var firstLead = integerRange(1, numBells);
    
    // 132546
    for(var idx=1; idx<numBells-1; idx+=2) {
      var t = firstLead[idx];
      firstLead[idx] = firstLead[idx+1];
      firstLead[idx+1] = t;
    }

    // 135264
    for(var idx=2; idx<numBells-1; idx+=2) {
      var t = firstLead[idx];
      firstLead[idx] = firstLead[idx+1];
      firstLead[idx+1] = t;
    }
    
    var collection = [];
    collection.push(firstLead);
    
    for(var ldx=1; ldx<numBells-1; ldx++) {
      var prevLead = collection[ldx-1];
      var newLead = [];
      collection[0].forEach(bell => newLead.push(prevLead[bell-1]));
      collection.push(newLead);
    }
    return collection;
  }
  generatePlainBobLeadEnds(numBells) {
    var leadends = this.generatePlainBobLeadHeads(numBells);

    // 132546
    var perm = integerRange(1, numBells);
    for(var idx=1; idx<numBells-1; idx+=2) {
      var t = perm[idx];
      perm[idx] = perm[idx+1];
      perm[idx+1] = t;
    }
    var leadheads = leadends.map(function(r){return perm.map(function(p) {return r[p-1];} );});
    return leadheads;
  }
}

class ApplyPalindromicSymmetryFull extends Strategy {
  isActive(puzzle)
  {
    return puzzle.options.palindromicSymmetry;
  }
  step(puzzle)
  {
    var isChanged = false;
    //Apply symmetry from forwards to backwards
    isChanged |= this.apply(puzzle, 1);
    
    //Apply symmetry from backwards to forwards (likely not required)
    isChanged |= this.apply(puzzle, -1);
    
    return isChanged;
  }
  apply(puzzle, direction) {
    var idxStart = 0;
    var idxEnd = puzzle.numRows-2;
    
    var isChanged = false;
    for(var bell=1; bell<=puzzle.numBells; bell++) {
      var candidates = [];
      var otherBlows = [];
      var isFirstOccurence = true;
      for(var idx=idxStart; idx<=idxEnd; idx++) {
        var info = isFixedInRow(puzzle.solution, bell, idx);
        if(info.isFixed) {
          //These positions in the other part of the lead must all compatible
          //i.e. the options must be the intersection of each other
          var correspondingBlow = this.map(idx,info.jdx,puzzle.numRows,puzzle.numBells,direction);
          otherBlows.push(correspondingBlow);
          if(isFirstOccurence) {
            candidates = puzzle.solution[correspondingBlow[0]][correspondingBlow[1]];
            isFirstOccurence = false;
          }
          else {
            candidates = intersect(candidates, puzzle.solution[correspondingBlow[0]][correspondingBlow[1]]);
          }
        }
      }
      
      if(candidates.length == 1)
        candidates = candidates[0];
      
      //Update these blows with the possibilities
      for(var count=0; count<otherBlows.length; count++) {
        var blow = otherBlows[count];
        isChanged |= fixBell(puzzle.solution, blow[0], blow[1], candidates);
      }
    }
    return isChanged;
  }
  map(idx,jdx,numRows,numBells,direction) {
    //Reflect vertically
    return [numRows-2 - idx, jdx];
  }
}

class ApplyDoubleSymmetryFull extends Strategy {
  isActive(puzzle)
  {
    return puzzle.options.doubleSymmetry;
  }
  step(puzzle)
  {
    var isChanged = false;
    //Apply symmetry from first half to second
    isChanged |= this.apply(puzzle, 1);
    
    //Apply symmetry from second half to first
    isChanged |= this.apply(puzzle, -1);
    
    return isChanged;
  }
  apply(puzzle, direction) {
    if(direction > 0) {
      var idxStart = 0;
      var idxEnd = Math.ceil(puzzle.numRows/2)-1;
    }
    else {
      var idxStart = Math.ceil(puzzle.numRows/2)-1;
      var idxEnd = puzzle.numRows-1;      
    }
    
    var isChanged = false;
    for(var bell=1; bell<=puzzle.numBells; bell++) {
      var candidates = [];
      var otherBlows = [];
      var isFirstOccurence = true;
      for(var idx=idxStart; idx<=idxEnd; idx++) {
        var info = isFixedInRow(puzzle.solution, bell, idx);
        if(info.isFixed) {
          //These positions in the other part of the lead must all compatible
          //i.e. the options must be the intersection of each other
          var correspondingBlow = this.map(idx,info.jdx,puzzle.numRows,puzzle.numBells,direction);
          otherBlows.push(correspondingBlow);
          if(isFirstOccurence) {
            candidates = puzzle.solution[correspondingBlow[0]][correspondingBlow[1]];
            isFirstOccurence = false;
          }
          else {
            candidates = intersect(candidates, puzzle.solution[correspondingBlow[0]][correspondingBlow[1]]);
          }
        }
      }
      
      if(candidates.length == 1)
        candidates = candidates[0];
      
      //Update these blows with the possibilities
      for(var count=0; count<otherBlows.length; count++) {
        var blow = otherBlows[count];
        isChanged |= fixBell(puzzle.solution, blow[0], blow[1], candidates);
      }
    }
    return isChanged;
  }
  map(idx,jdx,numRows,numBells,direction) {
    if(direction > 0)
      //First halflead to second
      return [idx + Math.floor(numRows/2), numBells-1 -jdx];
    else
      //Second halflead to first
      return [idx - Math.floor(numRows/2), numBells-1 -jdx];
  }
}

class ApplyMirrorSymmetryFull extends Strategy {
  isActive(puzzle)
  {
    return puzzle.options.mirrorSymmetry;
  }
  step(puzzle)
  {
    var isChanged = false;
    //Apply symmetry from first half to second
    isChanged |= this.apply(puzzle, 1);
    
    //Apply symmetry from second half to first (likely unnecessary)
    isChanged |= this.apply(puzzle, -1);
    
    return isChanged;
  }
  apply(puzzle, direction) {
    var idxStart = 0;
    var idxEnd = puzzle.numRows-1;
    
    var isChanged = false;
    for(var bell=1; bell<=puzzle.numBells; bell++) {
      var candidates = [];
      var otherBlows = [];
      var isFirstOccurence = true;
      for(var idx=idxStart; idx<=idxEnd; idx++) {
        var info = isFixedInRow(puzzle.solution, bell, idx);
        if(info.isFixed) {
          //These positions in the other part of the lead must all compatible
          //i.e. the options must be the intersection of each other
          var correspondingBlow = this.map(idx,info.jdx,puzzle.numRows,puzzle.numBells,direction);
          otherBlows.push(correspondingBlow);
          if(isFirstOccurence) {
            candidates = puzzle.solution[correspondingBlow[0]][correspondingBlow[1]];
            isFirstOccurence = false;
          }
          else {
            candidates = intersect(candidates, puzzle.solution[correspondingBlow[0]][correspondingBlow[1]]);
          }
        }
      }
      
      if(candidates.length == 1)
        candidates = candidates[0];
      
      //Update these blows with the possibilities
      for(var count=0; count<otherBlows.length; count++) {
        var blow = otherBlows[count];
        isChanged |= fixBell(puzzle.solution, blow[0], blow[1], candidates);
      }
    }
    return isChanged;
  }
  map(idx,jdx,numRows,numBells,direction) {
    //Reflect horizontally
    return [idx, numBells-1 -jdx];
  }
}