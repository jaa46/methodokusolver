class Strategy {
  isRecursive = false;
  isActive(puzzle)
  {
  }
  step(puzzle)
  {
  }
}

class WorkingBells extends Strategy {
  isActive(puzzle)
  {
    return puzzle.options.allWorkingExceptTreble || puzzle.options.twoHuntBells || puzzle.options.numberOfLeads > 0 || puzzle.options.numberOfHuntBells >= 0;
  }
  step(puzzle)
  {
    var isChanged = false;
    
    var treble = 1;
    
    //If an N-1 lead course specified, see if treble has been fixed at lead end
    //Be careful with e.g. a Triples method with leadend 1325647 (2*3=6 leads, but not all bells working)
    if(puzzle.options.numberOfLeads == puzzle.numBells-1 && isPrime(puzzle.options.numberOfLeads)) {
      var info = isPositionDetermined(puzzle.solution, puzzle.numRows-1, 0);
      if(info.isFixed && info.bell == treble)
        //<MODIFYOPTIONS>
        puzzle.options.allWorkingExceptTreble = true;
    }
    
    //Fix treble if not working
    if (puzzle.options.allWorkingExceptTreble || puzzle.options.twoHuntBells)
      isChanged |= fixBell(puzzle.solution, puzzle.numRows-1, 0, treble);
    
    //Fix two if two hunt bells specified
    if(puzzle.options.twoHuntBells)
      isChanged |= fixBell(puzzle.solution, puzzle.numRows-1, 1, 2);

    //Prevent other bells coming home after one lead if appropriate
    if(puzzle.options.twoHuntBells || puzzle.options.allWorkingExceptTreble) {
      var firstWorkingBell = findFirstWorkingBell(puzzle);
      if (firstWorkingBell > 0)
        for(var b=firstWorkingBell; b<=puzzle.numBells; b++) {
          isChanged |= removeBell(puzzle.solution, puzzle.numRows-1, b-1, b);
          
          if(puzzle.options.doubleSymmetry) {
            var idxHLH = Math.floor(puzzle.numRows/2);
            isChanged |= removeBell(puzzle.solution, idxHLH, puzzle.numBells-b, b);
          }
        }
    }
    
    //Handle principles
    if(puzzle.options.numberOfHuntBells == 0)
      for(var bell=1; bell<=puzzle.numBells; bell++)
        isChanged |= removeBell(puzzle.solution, puzzle.numRows-1, bell-1, bell);
      
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
    return puzzle.options.allDoubleChanges && puzzle.numBells == 5
  }
  step(puzzle) {
    return ensureOnePlacePerChange(puzzle);
  }
}

class AllTripleChanges extends Strategy {
  isActive(puzzle) {
    return puzzle.options.allTripleChanges && puzzle.numBells == 7
  }
  step(puzzle) {
    return ensureOnePlacePerChange(puzzle);
  }
}

class NoLongPlaces extends Strategy {
  constructor(includeOverLeadEnds) {
    super();
    this.includeOverLeadEnds = includeOverLeadEnds;
  }
  
  includeOverLeadEnds = true;

  isActive(puzzle) {
    return puzzle.options.noLongPlaces && this.includeOverLeadEnds || puzzle.options.noLongPlacesExceptOverLeadEnd && !this.includeOverLeadEnds;
  }
  step(puzzle) {
    var isChanged = false;
    
    var rowLimits = [0, puzzle.numRows];
    if (!this.includeOverLeadEnds)
      rowLimits = [1, puzzle.numRows-2];
    
    //If a place has been made, prevent the same bell making further places
    for(var idx=rowLimits[0]; idx<rowLimits[1]; idx++)
      for(var jdx=0; jdx<puzzle.numBells; jdx++) {
        var info = isPositionDetermined(puzzle.solution, idx, jdx);

        if(!info.isFixed)
          continue;
        
        var nextBlow = takeStepForward(puzzle, idx, jdx, info.bell, +1);
        if(nextBlow.jdx != jdx || nextBlow.bell <= 0 || nextBlow.jdx < 0)
          continue;
        
        //Prevent a place being made afterwards
        var nextNextBlow = takeStepForward(puzzle, nextBlow.idx, jdx, nextBlow.bell, +1);
        if(nextNextBlow.bell > 0)
          isChanged |= removeBell(puzzle.solution, nextNextBlow.idx, jdx, nextNextBlow.bell);

        //Prevent a place being made beforehand
        var previousBlow = takeStepBackward(puzzle, idx, jdx, info.bell, +1);
        if(previousBlow.bell > 0)
          isChanged |= removeBell(puzzle.solution, previousBlow.idx, jdx, previousBlow.bell);
      }
    
    //Prevent a bell ringing in a particular blow if it would result in long places
    for(var idx=rowLimits[0]; idx<rowLimits[1]; idx++)
      for(var jdx=0; jdx<puzzle.numBells; jdx++) {
        var info = isPositionDetermined(puzzle.solution, idx, jdx);
        
        if(!info.isFixed)
          continue;
        
        var nextBlow = takeStepForward(puzzle, idx, jdx, info.bell, +1);
        
        var assumePlaceMade;
        var idxNext = nextBlow.idx;
        var jdxNext = nextBlow.jdx;
        if(nextBlow.jdx < 0 && idxNext == puzzle.solution.length - 1) {
          assumePlaceMade = true;
          jdxNext = jdx;
        }
        else
          assumePlaceMade = false;
        
        var nextNextBlow = takeStepForward(puzzle, nextBlow.idx, jdxNext, nextBlow.bell, +1);
        
        if(assumePlaceMade && jdxNext != nextNextBlow.jdx)
          //Not the case that long places are made across the leadend
          continue;
        
        if(nextNextBlow.bell > 0)
          if(nextNextBlow.jdx == jdx) {
            //Prevent this bell ringing 3 blows in the same place in a row
            isChanged |= removeBell(puzzle.solution, nextBlow.idx, jdx, nextBlow.bell);
            
            if (!assumePlaceMade) {
              //Additionally, prevent causing another bell to make 3 blows at the front or the back by dodging in 2/3
              if(jdx == 1)
                isChanged |= removeBell(puzzle.solution, nextBlow.idx, 2, nextBlow.bell);
              else if(jdx == 2)
                isChanged |= removeBell(puzzle.solution, nextBlow.idx, 1, nextBlow.bell);
              else if(jdx == puzzle.numBells-3)
                isChanged |= removeBell(puzzle.solution, nextBlow.idx, puzzle.numBells-2, nextBlow.bell);
              else if(jdx == puzzle.numBells-2)
                isChanged |= removeBell(puzzle.solution, nextBlow.idx, puzzle.numBells-3, nextBlow.bell);
            }
          }
          else {
            // Also prevent 2,2,3 and 3,2,2
            if(compare([jdx, nextNextBlow.jdx], [1,2]))
              isChanged |= removeBell(puzzle.solution, nextBlow.idx, 1, nextBlow.bell);
            else if(compare([jdx, nextNextBlow.jdx], [puzzle.numBells-3,puzzle.numBells-2]))
              isChanged |= removeBell(puzzle.solution, nextBlow.idx, puzzle.numBells-2, nextBlow.bell);
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

class RightPlace extends Strategy {
  isActive(puzzle) {
    return puzzle.options.rightPlace
  }
  step(puzzle) {
    var isChanged = false;
    
    for(var idx=0; idx<puzzle.numRows-1; idx+=2)
      for(var jdx=0; jdx<puzzle.numBells-1; jdx+=2) {
        isChanged |= makeBlowsConsistent(puzzle.solution, idx, jdx, idx+1, jdx+1);
        isChanged |= makeBlowsConsistent(puzzle.solution, idx, jdx+1, idx+1, jdx);
      }
      
    return isChanged;
  }
}

class RightPlaceAboveTreble extends Strategy {
  isActive(puzzle) {
    return puzzle.options.rightPlaceAboveTreble
  }
  step(puzzle) {
    var isChanged = false;
    
    var treble = 1;
    for(var idx=0; idx<puzzle.numRows-1; idx+=2) {
      
      var infoTrebleFixed = isFixedInRow(puzzle.solution, treble, idx);
      var infoTrebleFixedNext = isFixedInRow(puzzle.solution, treble, idx+1);
      
      if(infoTrebleFixed.isFixed && infoTrebleFixedNext.isFixed) {
        // Assume the treble is right-hunting
        var jdxAbove = Math.max(infoTrebleFixed.jdx, infoTrebleFixedNext.jdx) + 1;
        for(var jdx=jdxAbove; jdx<puzzle.numBells-1; jdx+=2) {
          isChanged |= makeBlowsConsistent(puzzle.solution, idx, jdx, idx+1, jdx+1);
          isChanged |= makeBlowsConsistent(puzzle.solution, idx, jdx+1, idx+1, jdx);
        }
      }
    }
    return isChanged;
  }
}

class NumberOfHuntBells extends Strategy {
  isActive(puzzle) {
    return puzzle.options.numberOfHuntBells > 0
  }
  step(puzzle) {
    var isChanged = false;
    
    var totaNumberPossibleHunts = 0;
    for(var jdx=0; jdx<puzzle.numBells; jdx++)
      if(isPositionPossible(puzzle.solution, puzzle.numRows-1, jdx, jdx+1))
        totaNumberPossibleHunts++;
    
    if (totaNumberPossibleHunts == puzzle.options.numberOfHuntBells) {
      //All of the possible hunt bells must be
      for(var jdx=0; jdx<puzzle.numBells; jdx++)
        if(isPositionPossible(puzzle.solution, puzzle.numRows-1, jdx, jdx+1))
          isChanged |= fixBell(puzzle.solution, puzzle.numRows-1, jdx, jdx+1);
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
    var isChanged = false;

    var idxLH, idxLE;
    if (isShiftedSymmetryPoint(puzzle)) {
      idxLH = 1;
      idxLE = puzzle.numRows-1;
    }
    else {
      idxLH = 0;
      idxLE = puzzle.numRows-2;
    }

    //From leadhead to leadend
    for(var jdx=0; jdx<puzzle.numBells; jdx++) {
      var infoLE = isPositionDetermined(puzzle.solution, idxLE, jdx);
      var infoLH = isPositionDetermined(puzzle.solution, idxLH, jdx);
      if(infoLH.isFixed && infoLE.isFixed) {
        var backwardBell = infoLE.bell;
        var forwardBell = infoLH.bell;
        isChanged |= this.i_palindromic(puzzle, forwardBell, backwardBell);
      }
    }
    
    //From half-lead
    var idxHLE, idxHLH = 0;
    if (isShiftedSymmetryPoint(puzzle)) {
      idxHLE = Math.floor(puzzle.numRows/2);
      idxHLH = idxHLE+1;
    }
    else {
      idxHLE = Math.floor(puzzle.numRows/2)-1;
      idxHLH = idxHLE+1;
    }

    //Check if a pair crosses here
    for(var jdx=0; jdx<puzzle.numBells-1; jdx++) {
      var infoHLE_L = isPositionDetermined(puzzle.solution, idxHLE, jdx);
      var infoHLH_L = isPositionDetermined(puzzle.solution, idxHLH, jdx);
      var infoHLE_R = isPositionDetermined(puzzle.solution, idxHLE, jdx+1);
      var infoHLH_R = isPositionDetermined(puzzle.solution, idxHLH, jdx+1);
      
      if(infoHLE_L.isFixed && infoHLE_R.isFixed && infoHLH_L.isFixed && infoHLH_R.isFixed &&
        infoHLE_L.bell == infoHLH_R.bell && infoHLE_R.bell == infoHLH_L.bell) {
        isChanged |= this.i_palindromic(puzzle, infoHLE_L.bell, infoHLE_R.bell);
      }
    }

    //Check if a pivot bell
    for(var jdx=0; jdx<puzzle.numBells; jdx++) {
      var infoHLE = isPositionDetermined(puzzle.solution, idxHLE, jdx);
      var infoHLH = isPositionDetermined(puzzle.solution, idxHLH, jdx);
      
      if(infoHLE.isFixed && infoHLH.isFixed && infoHLE.bell == infoHLH.bell) {
        isChanged |= this.i_palindromic(puzzle, infoHLE.bell, infoHLE.bell);
      }
    }
    
    return isChanged;
  }
  
  i_palindromic(puzzle, bell1, bell2) {
    var isChanged = false;

    var relevantRows;
    if(isShiftedSymmetryPoint(puzzle)) {
      relevantRows = integerRange(1, puzzle.numRows-1);
    }
    else {
      relevantRows = integerRange(0, puzzle.numRows-2);
    }

    for(var idx=0; idx<relevantRows.length; idx++) {
      var info = isFixedInRow(puzzle.solution, bell1, relevantRows[idx]);
      if(info.isFixed)
        isChanged |= fixBell(puzzle.solution, relevantRows[relevantRows.length-1 - idx], info.jdx, bell2);
        
      info = isFixedInRow(puzzle.solution, bell2, relevantRows[idx]);
      if(info.isFixed)
        isChanged |= fixBell(puzzle.solution, relevantRows[relevantRows.length-1 - idx], info.jdx, bell1);
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
      
    return puzzle.options.is2OrNLeadEnd || puzzle.options.is2LeadEnd || puzzle.options.isNLeadEnd ||
      puzzle.options.palindromicSymmetry && puzzle.options.plainBobLeadEnd;
  }
  
  step(puzzle) {
    
    var isChanged = false;
    var is2LeadEnd = puzzle.options.is2LeadEnd;
    var isNLeadEnd = puzzle.options.isNLeadEnd;
    
    //Determine if we require either a 2nds or an Nth place leadend
    if(puzzle.options.is2OrNLeadEnd || puzzle.options.palindromicSymmetry && puzzle.options.plainBobLeadEnd) {
      //Can it be an Nths place lead end?
      if(!this.checkIfGivenLeadEndPossible(puzzle, puzzle.numBells)) {
        if(puzzle.options.isNLeadEnd) {
          methodokuError();
          return isChanged;
        }
        else {
          //If not, it must be a 2nds place leadend
          is2LeadEnd = true;
        }
      }
      //Can it be a 2nds place lead end?
      if(!this.checkIfGivenLeadEndPossible(puzzle, 2)) {
        if(puzzle.options.is2LeadEnd) {
          methodokuError();
          return isChanged;
        }
        else {
          //If not, it must be a Nths place leadend
          isNLeadEnd = true;
        }
      }
    }
     
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
    
    if(place % 2 == 0)
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

    var jdx = 0;
    while(jdx < puzzle.numBells) {
      if (jdx == 0 || jdx == place-1)
        isChanged |= makeBlowsConsistent(puzzle.solution, idxLE, jdx, idxLH, jdx)
      else if(jdx<puzzle.numBells-1) {        
        isChanged |= this.makePairSwappingConsistent(puzzle, jdx, jdx+1)
        jdx++;
      }
      
      jdx++;
    }

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
    
    var firstWorkingBell = findFirstWorkingBell(puzzle);
    if (firstWorkingBell < 0)
      return;
    
    //Check for one-cycles
    for(var bell=firstWorkingBell; bell<=puzzle.numBells; bell++)
      isChanged |= removeBell(puzzle.solution, puzzle.numRows-1, bell-1, bell);
    
    //Check for two cycles
    for(var bell = firstWorkingBell; bell<=puzzle.numBells; bell++) {
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

class Surprise extends Strategy {
  isActive(puzzle) {
    return puzzle.options.surprise && InternalPlaces.isRelevant(puzzle);
  }
  step(puzzle) {
    var isChanged = false;
    isChanged |= applyTrebleBobTreble(puzzle);
    
    var info = InternalPlaces.placeInformation(puzzle);
    
    //TODO: For stages above minor, check there's a place made for each row i.e. if there's only one possible place left, apply it
    for(var p=0; p<info.places.length; p++)
      if (puzzle.numBells == 6)
        isChanged |= ensurePlace(puzzle.solution, info.idxs[p][0], info.idxs[p][1], info.places[p]);
        
    return isChanged;
  }
}

class Delight extends Strategy {
  isActive(puzzle) {
    return puzzle.options.delight && InternalPlaces.isRelevant(puzzle);
  }
  step(puzzle) {
    var isChanged = false;
    isChanged |= applyTrebleBobTreble(puzzle);
    
    //Identify the relevant changes
    // N.B. this only returns the indices from the first halflead if palindromic symmetry is active
    var placeInfo = InternalPlaces.placeInformation(puzzle);

    //Check whether any internal places are made at the relevant changes
    var isInternalPlaceMade = [];
    for(var p=0; p<placeInfo.places.length; p++)
      isInternalPlaceMade.push(checkWhetherInternalPlacesMade(puzzle, placeInfo.idxs[p][0], placeInfo.idxs[p][1])); 

    //See whether having no internal places is possible at each of the relevant changes
    var isAllPlainHuntingPossible = [];
    for(var p=0; p<placeInfo.places.length; p++)
      isAllPlainHuntingPossible.push(checkNoInternalPlacesPossible(puzzle, placeInfo.idxs[p][0], placeInfo.idxs[p][1]));

    //If there's only one change which can be plain hunting, ensure it happens
    if(isAllPlainHuntingPossible.filter(Boolean).length == 1) {
      var idx = isAllPlainHuntingPossible.indexOf(1);
      isChanged |= ensureNoInternalPlaces(puzzle, placeInfo.idxs[idx][0], placeInfo.idxs[idx][1]);
    }

    if(puzzle.numBells == 6) {
      // TODO: Extend this for higher stages
      var isInternalPlaceNotPossible = [];
      for(var p=0; p<placeInfo.places.length; p++) {
        isInternalPlaceNotPossible.push(!areBlowsConsistent(puzzle.solution, 
          placeInfo.idxs[p][0], placeInfo.places[p]-1, 
          placeInfo.idxs[p][1], placeInfo.places[p]-1));
      }
      //If it's minor, and there's only one place that can be made, ensure it's made
      if(isInternalPlaceNotPossible.filter(Boolean).length == isInternalPlaceNotPossible.length-1) {
        var idx = isInternalPlaceNotPossible.indexOf(false);
        isChanged |= ensurePlace(puzzle.solution, placeInfo.idxs[idx][0], placeInfo.idxs[idx][1], placeInfo.places[idx]);
      }
    }
    
    //Throw an error if it's not possible for there to be no internal places at one of the changes
    if(!isAllPlainHuntingPossible.some(Boolean)) {
      console.log("Things have gone wrong with delight places");
      methodokuError();
    }
      
    return isChanged;
  }
}

class TrebleBob extends Strategy {
  isActive(puzzle) {
    return puzzle.options.trebleBob && InternalPlaces.isRelevant(puzzle);
  }
  step(puzzle) {
    var isChanged = false;
    isChanged |= applyTrebleBobTreble(puzzle);
    
    var info = InternalPlaces.placeInformation(puzzle);
    
    for(var p=0; p<info.places.length; p++)
      isChanged |= ensureNoInternalPlaces(puzzle, info.idxs[p][0], info.idxs[p][1]);
    
    return isChanged;
  }
}


class UpTo2PlacesPerChange extends Strategy {
  isActive(puzzle) {
    return puzzle.options.atMost2PlacesPerChange;
  }
  step(puzzle) {
    var isChanged = false;
    
    for(var idx=0; idx<puzzle.numRows-1; idx++) {
      //Count the number of places per change
      var placeCount = 0;
      for(var jdx=0; jdx<puzzle.numBells; jdx++) {
        var info1 = isPositionDetermined(puzzle.solution, idx, jdx);
        var info2 = isPositionDetermined(puzzle.solution, idx+1, jdx);
        if(info1.isFixed && info2.isFixed && info1.bell == info2.bell)
          placeCount++;
      }
      
      //If at limit, prevent further places
      if (placeCount == 2) {
        for(var jdx=0; jdx<puzzle.numBells; jdx++) {
          var info1 = isPositionDetermined(puzzle.solution, idx, jdx);
          var info2 = isPositionDetermined(puzzle.solution, idx+1, jdx);
          if(info1.isFixed && !info2.isFixed)
            isChanged |= removeBell(puzzle.solution, idx+1, jdx, info1.bell);
          }
      }
      
      if(placeCount > 2){
        methodokuError();
      }
    }
    
    return isChanged;
  }
}

class ConsecutivePlaceLimit extends Strategy {
  isActive(puzzle) {
    return puzzle.options.consecutivePlaceLimit > 0;
  }
  step(puzzle) {
    var isChanged = false;
    
    var limit = puzzle.options.consecutivePlaceLimit;
    for(var idx=0; idx<puzzle.numRows-1; idx++)
      for(var jdx=0; jdx<puzzle.numBells; jdx++) {
        // Is a place made?
        var info1 = isPositionDetermined(puzzle.solution, idx, jdx);
        var info2 = isPositionDetermined(puzzle.solution, idx+1, jdx);
        if(info1.isFixed && info2.isFixed && info1.bell == info2.bell)
          if(limit == 1) {
            if(jdx > 1) {
              // Ensure no place to the left
              isChanged |= makeBlowsConsistent(puzzle.solution, idx, jdx-2, idx+1, jdx-1);
              isChanged |= makeBlowsConsistent(puzzle.solution, idx, jdx-1, idx+1, jdx-2);
            }
            if(jdx < puzzle.numBells-2) {
              // Ensure no place to the right
              isChanged |= makeBlowsConsistent(puzzle.solution, idx, jdx+2, idx+1, jdx+1);
              isChanged |= makeBlowsConsistent(puzzle.solution, idx, jdx+1, idx+1, jdx+2);
            }
          }
          else if(limit == 2 && jdx<puzzle.numBells-1) {
            //Is an adjacent place to the right also made?
            var info3 = isPositionDetermined(puzzle.solution, idx, jdx+1);
            var info4 = isPositionDetermined(puzzle.solution, idx+1, jdx+1);
            if(info3.isFixed && info4.isFixed && info3.bell == info4.bell) {
              //Prevent places either side of these two places
              if(jdx > 2) {
                // Ensure no place to the left
                isChanged |= makeBlowsConsistent(puzzle.solution, idx, jdx-2, idx+1, jdx-1);
                isChanged |= makeBlowsConsistent(puzzle.solution, idx, jdx-1, idx+1, jdx-2);
              }
              if(jdx < puzzle.numBells-3) {
                // Ensure no place to the right
                isChanged |= makeBlowsConsistent(puzzle.solution, idx, jdx+3, idx+1, jdx+2);
                isChanged |= makeBlowsConsistent(puzzle.solution, idx, jdx+2, idx+1, jdx+3);
              }
            }
          }
          
        //Prevent places being made in 2nds/N-1st place, as these will cause consecutive places
        if(limit == 1 && (jdx == 1 || jdx == puzzle.numBells-2) && info1.isFixed)
          isChanged |= removeBell(puzzle.solution, idx+1, jdx, info1.bell);
      } 
    
    return isChanged;
  }  
} 

class DirectKillerLogic extends Strategy {
  isActive(puzzle)
  {
    return puzzle.killer.clues.length > 0;
  }
  step(puzzle, recursionLevel)
  {
    var isChanged = false;
    var letters = ["a", "b", "c", "d"];
    
    for(const letter of letters) {
      var clues = puzzle.killer.clues.filter(c => c[2] == letter);
      var numCells = clues.length;
      
      var totalBox = document.getElementById("killer" + letter + "Sum");
      var total = parseInt(totalBox.value);
      if(!total || total < numCells)
        continue;
      
      //If one bell left, determine its value
      var indices = integerRange(0, numCells-1);
      var infoIsFixed = indices.map(i => isPositionDetermined(puzzle.solution, clues[i][0], clues[i][1]));
      var numFixed = infoIsFixed.filter(i => i.isFixed).length;
      
      if(numFixed == numCells-1) {
        var partialTotal = infoIsFixed.filter(i => i.isFixed).map(i => i.bell).reduce((a,b) => a + b, 0);
        var remaining = total - partialTotal;
        var idxUnfixed = infoIsFixed.map(i => !i.isFixed).indexOf(true);
        isChanged |= fixBell(puzzle.solution, clues[idxUnfixed][0], clues[idxUnfixed][1], remaining);
      }
      
      var obj = new DoNotMakeBadGuess();
      var options = obj.generateKillerOptions(total, numCells, puzzle.numBells);
      
      //Initial attempt to restrict options in palindromic cases
      if(numCells == 2 && puzzle.options.palindromicSymmetry) {
        //Require options to be consistent if rows are opposites and positions in the change match
        if(clues[0][1] == clues[1][1] && clues[0][0] + clues[1][0] == puzzle.numRows - 2) {
          //This pair of bells must be opposites
          function isPairValid(opt) {
            var bell1 = opt[0];
            var bell2 = opt[1];
            var opposite1 = findOpposite(puzzle, bell1);
            var opposite2 = findOpposite(puzzle, bell2);
            return !(opposite1 > 0 && opposite2 > 0 && (opposite1 != bell2 || opposite2 != bell1));
          }
          
          options = options.filter(o => isPairValid(o));
        }
      }
      
      //Limit options to those in the possible sums 
      var allOptions = [].concat(...options);
      var uniqueOptions = [...new Set(allOptions)];
      for(var idxC=0; idxC<numCells; idxC++) {
        if(!isPositionDetermined(puzzle.solution, clues[idxC][0], clues[idxC][1]).isFixed) {
          var currentOptions = puzzle.solution[clues[idxC][0]][clues[idxC][1]];
          var relevantOptions = intersect(currentOptions, uniqueOptions);
          isChanged |= fixBell(puzzle.solution, clues[idxC][0], clues[idxC][1], relevantOptions);
        }
      }
      
    }

    return isChanged;
  }  
}

class DoNotMakeBadDecision extends Strategy {
  constructor(doPropagate, recursionLimit) {
    super();
    this.doPropagate = doPropagate;
    
    if(recursionLimit)
      this.recursionLimit = recursionLimit;
  }
  isRecursive = true;
  recursionLimit = 1;
  isActive(puzzle)
  {
    return true;
  }
  step(puzzle, recursionLevel)
  {
    if(!recursionLevel)
      recursionLevel = 1;
    
    var config = {'recursionLevel': recursionLevel, 'recursionLimit': this.recursionLimit};
    
    //Only guess from fixed bells
    var result = takeGuess(puzzle, 1, this.doPropagate, config);
    
    return result;
  }
}

class DoNotMakeBadGuess extends Strategy {
  constructor(doPropagate, recursionLimit) {
    super();
    this.doPropagate = doPropagate;

    if(recursionLimit)
      this.recursionLimit = recursionLimit;
  }
  isRecursive = true;
  recursionLimit = 1;
  isActive(puzzle)
  {
    return true;
  }
  step(puzzle, recursionLevel)
  {
    if(!recursionLevel)
      recursionLevel = 1;
    
    var config = {'recursionLevel': recursionLevel, 'recursionLimit': this.recursionLimit};
    
    //Guess the bell for each blows with up to 2 possibilities, and test out
    //each of the options to see if a guess can be ruled out
    var result = takeGuess(puzzle, 2, this.doPropagate, config)
    
    //Guess plain bob leadends
    if(!result.isChanged && puzzle.options.plainBobLeadEnd) {
      var plainBobLeadHeads = this.generatePlainBobLeadHeads(puzzle.numBells);
      var idxHLH = Math.floor(puzzle.numRows/2);
      var idxLH = puzzle.numRows - 1;
      result = this.guessLE_HL(puzzle, this.doPropagate, plainBobLeadHeads, [idxLH, idxLH-1], [idxHLH, idxHLH-1], -1, config);
      
      if(!result.isChanged && puzzle.options.palindromicSymmetry) {
        var plainBobLeadEnds = this.generatePlainBobLeadEnds(puzzle.numBells);
        var idxHLE = Math.floor(puzzle.numRows/2) - 1;
        var idxLE = puzzle.numRows - 2;
        result = this.guessLE_HL(puzzle, this.doPropagate, plainBobLeadEnds, [idxLE, idxLE+1], [idxHLE, idxHLE+1], +1, config);
      }
    }

    //Guess cyclic leadends
    if(!result.isChanged && puzzle.options.cyclicLeadEnd) {
      var cyclicLeadHeads = this.generateCyclicLeadHeads(puzzle.numBells);
      var idxHLH = Math.floor(puzzle.numRows/2);
      var idxLH = puzzle.numRows - 1;
      result = this.guessLE_HL(puzzle, this.doPropagate, cyclicLeadHeads, [idxLH, idxLH-1], [idxHLH, idxHLH-1], -1, config);
    }

    //Guess an extra hunt bull
    if(!result.isChanged && puzzle.options.numberOfHuntBells > 0) {
      var huntBells = identifyHuntBells(puzzle);
      if(huntBells.fixed.length < puzzle.options.numberOfHuntBells) {
        result = this.guessHuntBells(puzzle, this.doPropagate, huntBells, config);
      }
    }

    //Guess Killer logic
    if(!result.isChanged && puzzle.killer.clues.length > 0) {
      result = this.guessKillerClues(puzzle, this.doPropagate, config);
    }

    return result;
  }
  
  guessHuntBells(puzzle, withPropagation, huntBells, config) {
    var result = {"isChanged": false, "decision": "", "evidence": []};
    var possibles = [];
    var judgements = [];
    for(var idx=0; idx<huntBells.possible.length; idx++) {
      var puzzleNew = copyGrid(puzzle);
      
      var newHuntBell = huntBells.possible[idx];
      fixBell(puzzleNew.solution, puzzle.numRows-1, newHuntBell-1, newHuntBell);

      if(!puzzleNew.stepsGuessed)
        puzzleNew.stepsGuessed = [];
      puzzleNew.stepsGuessed.push({'bell':newHuntBell, 'idx':puzzle.numRows-1, 'jdx':newHuntBell-1});
      
      //TODO: This assumes treble is already fixed
      var treble = 1;
      var judgement = trackBellTillJunction(puzzleNew, treble, puzzle.numRows-1, 0, puzzle.numRows-2, 0, +1, withPropagation, config);
      if(judgement.isValid)
        possibles.push(newHuntBell);
      else
        judgements.push(judgement);
    }
    
    if(possibles.length == 1) {
      var isChanged = fixBell(puzzle.solution, puzzle.numRows-1, possibles[0]-1, possibles[0]);
      var message = "";
      if(isChanged)
        message = "Setting additional huntbell: " + possibles[0] + "\n" + "All other possibilities ruled out.";
      if(config.recursionLevel == 1)
        console.log(message)
      result = {"isChanged": isChanged, "decision": message, "evidence": judgements }
    }

    if(possibles.length == 0) {
      methodokuError()
    }
    return result;
  }
  
  guessLE_HL(puzzle, withPropagation, possibleLeads, idxLead, idxHalfLead, direction, config) {
    
    //Test out leadhead/end
    var jdxLead = [0,0];
    var result = this.tryEachRow(puzzle, withPropagation, possibleLeads, idxLead, jdxLead, direction, config);
    
    if(!result.isChanged && puzzle.options.doubleSymmetry) {
      //Test out half-leadhead/end
      var possibleHeadLeads = possibleLeads.map(function(v) {return v.reverse();});
      var jdxHalfLead = [puzzle.numBells-1, puzzle.numBells-1];
      result = this.tryEachRow(puzzle, withPropagation, possibleHeadLeads, idxHalfLead, jdxHalfLead, direction, config);      
    }
    
    return result;
  }
  tryEachRow(puzzle, withPropagation, possibleRows, idxRows, jdxRows, direction, config) {
    var idxValidRows = [];
    var judgements = [];
    for(var rdx=0; rdx<possibleRows.length; rdx++) {
      var row = possibleRows[rdx];
      
      if(idxRows[0] == puzzle.numRows-1 && compareStrict(row, integerRange(1, puzzle.numBells))) {
        //Can't have rounds as leadhead by convention
        continue;
      }
      
      if(checkRowPossible(puzzle.solution, idxRows[0], row)) {
        var puzzleWorking = copyGrid(puzzle);
        for(var jdx=0; jdx<puzzle.numBells; jdx++) {
          fixBell(puzzleWorking.solution, idxRows[0], jdx, row[jdx]);
        }
        
        var treble = 1;
        var judgement = trackBellTillJunction(puzzleWorking, treble, idxRows[1], jdxRows[1], idxRows[0], jdxRows[0], 
          direction, withPropagation, config);
        if(judgement.isValid)
          idxValidRows.push(rdx);
        else
          judgements.push(judgement);
      
      }
    }
    
    var isChanged = false;
    var message = "";
    if(idxValidRows.length == 1) {
      for(var jdx=0; jdx<puzzle.numBells; jdx++)
        isChanged |= fixBell(puzzle.solution, idxRows[0], jdx, possibleRows[idxValidRows[0]][jdx]);

      if(isChanged && config.recursionLevel == 1) {
        message = "Identified leadend/halflead row at " + idxRows[0] + ": " + possibleRows[idxValidRows[0]] + 
          "\n" + "All other possibilities ruled out.";
        console.log(message)
      }
    }
    else{
      //Only report back if a conclusion has been found
      judgements = [];
    }
    
    if(idxValidRows.length == 0)
      methodokuError();
  
    return {"isChanged": isChanged, "decision": message, "evidence": judgements};
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
  generateCyclicLeadHeads(numBells) {
    // 134562
    var firstLead = integerRange(1, numBells);
    firstLead.splice(1,1); // remove 2
    firstLead.push(2); // add 2 at the end
    
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
  
  guessKillerClues(puzzle, withPropagation, config) {
    var message = "";
    var letters = ["a", "b", "c", "d"];
    
    var result = {"isChanged": false, "decision": "", "evidence": []};

    for(const letter of letters) {
      var clues = puzzle.killer.clues.filter(c => c[2] == letter);
      var numCells = clues.length;
      
      var totalBox = document.getElementById("killer" + letter + "Sum");
      var total = parseInt(totalBox.value);
      if(!total || total < numCells)
        continue;
      
      var options = this.generateKillerOptions(total, numCells, puzzle.numBells);
      
      var result = this.tryEachKillerOption(puzzle, clues, options, withPropagation, config);
      
      if(result.isChanged)
        //Don't check other letters if we've made progress
        break;
    }
    
    return result;
  }
  
  tryEachKillerOption(puzzle, relevantClues, possibleOptions, withPropagation, config) {
    var idxValidOptions = [];
    var judgements = [];
    for(var rdx=0; rdx<possibleOptions.length; rdx++) {
      var opt = possibleOptions[rdx];
            
      if(this.checkOptionPossible(puzzle.solution, relevantClues, opt)) {
        var puzzleWorking = copyGrid(puzzle);
        this.applyKillerOption(puzzleWorking.solution, relevantClues, opt);
        
        var bell = opt[0];
        var idx = relevantClues[0][0];
        var jdx = relevantClues[0][1];
        var idxPrev = -1;
        var jdxPrev = -1;
        var direction = 1;
        var judgement = trackBellTillJunction(puzzleWorking, bell, idx, jdx, idxPrev, jdxPrev, 
          direction, withPropagation, config);
        if(judgement.isValid)
          idxValidOptions.push(rdx);
        else
          judgements.push(judgement);
      }
    }
    
    var isChanged = false;
    var message = "";
    if(idxValidOptions.length == 1) {
        isChanged |= this.applyKillerOption(puzzle.solution, relevantClues, possibleOptions[idxValidOptions[0]]);

      if(isChanged && config.recursionLevel == 1) {
        message = "Identified Killer option: " + possibleOptions[idxValidOptions[0]] + 
          "\n" + "All other possibilities ruled out.";
        console.log(message)
      }
    }
    else{
      //Only report back if a conclusion has been found
      judgements = [];
    }
    
    if(idxValidOptions.length == 0)
      methodokuError();
  
    return {"isChanged": isChanged, "decision": message, "evidence": judgements};
  }
  
  checkOptionPossible(solution, relevantClues, opt) {
    var isPossible = true;
    for(var c=0; c<relevantClues.length; c++) {
      if(!isPositionPossible(solution, relevantClues[c][0], relevantClues[c][1], opt[c]))
        isPossible = false;
    }
    return isPossible;
  }
  
  applyKillerOption(board, relevantClues, opt) {
    var isChanged = false;
    for(var c=0; c<relevantClues.length; c++) {
      isChanged |= fixBell(board, relevantClues[c][0], relevantClues[c][1], opt[c]);
    }
    return isChanged;
  }
  
  generateKillerOptions(total, numCells, numBells) {
    
    var opts = [];
    var opt = new Array(numCells).fill(1);
    
    while(true) {
      //Record option if its sum is correct
      if(opt.reduce((a, b) => a + b, 0) == total) {
        opts.push(copy(opt))
      } 
      
      //Generate next option
      opt[0]++;
      for(var e=0; e<numCells-1; e++)
        if(opt[e] > numBells) {
          opt[e] = 1;
          opt[e+1]++;
        }
      
      if(opt[numCells-1] > numBells)
        break;
    }
    
    return opts;
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

    var idxStart, idxEnd;
    if (isShiftedSymmetryPoint(puzzle)) {
      idxStart = 1;
      idxEnd = puzzle.numRows-1;
    }
    else {
      idxStart = 0;
      idxEnd = puzzle.numRows-2;
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
          var correspondingBlow = this.map(puzzle,idx,info.jdx,puzzle.numRows,puzzle.numBells,direction);
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
  map(puzzle,idx,jdx,numRows,numBells,direction) {
    //Reflect vertically
    if(isShiftedSymmetryPoint(puzzle))
      return [numRows - idx, jdx];
    else
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