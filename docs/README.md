# Methodoku
Methodoku puzzles, devised by Mark Davies, are similar to Sudoku puzzles. The [Ringing World](https://www.ringingworld.co.uk/) has included many of Mark's puzzles over the last year, and there's also a [book](https://www.ringingworld.co.uk/purchase/shop/methodoku-mayhem.html) with lots more puzzles and help getting started.

These puzzles are all carefully created to be solvable by hand, but it can be challenging to work out the next step, especially for the Diabolical puzzles! This [solver](solver.html) is written to try and solve the puzzles in a "human-like" way, and attempt to follow similar thought processes and explain why each decision was made. There are other interesting approaches for solving these kinds of puzzles using a computer, including searching for all the methods which fit the starting grid and the specified options, and also as an integer programming program.

[Click here to try out the solver.](solver.html)

# Approach
This solver solves puzzles by storing all the possible bells which can ring in each blow, and gradually reducing these possibilities until either the puzzles is solved and there is only one bell left in every blow, or no further progress has been made for puzzles which are too difficult for it!

The strategies the solver uses are listed below, in increasing order of complexity. If any of the strategies successfully remove a possibility from the grid, the solver restarts from the simplest strategy again.

## OncePerRow
Each bell can only ring once per row. If a bell's position within a row is fixed, remove the bell as an option from the other blows in that row.
 
## OnlyOneOptionInRow
If a bell can only ring in one position in a row, fix it to that position by removing the other possible bells from that blow.
  
## NoJumping
Prevents jump changes, by removing possibilities that would require a bell to jump more than one position between changes. From each fixed blow, this is done in four directions separately: up and to the left, up and to the right, down and to the left, down and to the right.  

## FillSquares
If a bell is moving from one place to another, the bells moving in the opposite direction must be able to ring in both of the blows. Any possibilities which can only ring in one of the blows are removed.

## RemoveDeadEnds
If a trail of possibilities for a particular bell reaches a dead end where there are no options in the next row, this 'dead-end' trail is removed.

## WorkingBells
If it's specified that all bells except the hunt bells are working bells, prevent each working bell from coming home at the end of the lead.
*Active if "All working except treble" or "Two hunt bells" is selected, or the treble is fixed and "Number of leads" is one less than the number of bells.*

## AllDoubleChanges
On five bells, this strategy ensures all the changes are double i.e. there's only one place made per change.
*Active if "All double changes" is selected*

## AllTripleChanges
On seven bells, this strategy ensures all the changes are triple i.e. there's only one place made per change.
*Active if "All triple changes" is selected*

## NoLongPlaces
Prevents any places longer than two blows being made. If a bell is making a place, it removes that bell as a possibility for the preceding and subsequent rows. Additionally, it prevents possibilities like dodging in 2-3 which would result in a bell leading for at least 3 blows.
*Active if "No long places" is selected*

## NoNminus1thPlacesExceptUnderTreble
Prevents a bell making places in e.g. 7ths place in major, unless it's below the treble.
*Active if "No N-1ths places except under treble" is selected*
 
## RightPlace
Ensures a method is right place, but making sure a cross notation is possible every other change. This means each pair of bells in 1-2, 3-4,... must be consistent with each other.
*Active if "Right place" is selected*

## NumberOfHuntBells
If the number of hunt bells has been specified, and there are already this many hunt bells (bells which are in their starting position in the final row), prevent any further hunt bells.
*Active if "Number of hunt bells" is specified*

## ApplyPalindromicSymmetry
Applies palindromic symmetry to a pair of bells if they cross at the halflead, or if their positions in the leadend (treble's handstroke lead) are fixed: for example if a bell is in its starting position at the leadend, for any of its fixed positions in one half of the lead, fix it in the symmetrical point of the other halflead.
*Active if "Palindromic symmetry" is selected*

## ApplyDoubleSymmetry
If a bell is fixed in the half-lead head (the treble's backstroke when it's lying behind), apply double (glide) symmetry.
*Active if "Double symmetry" is selected*
  
## ApplyMirrorSymmetry
For every change where it's known how a bell moves from one row to the next, make sure the possibilities in the mirrored positions to this bell's movement are consistent.
*Active if "Mirror symmetry" is selected*

## Is2OrNLeadEnd
Applies 2nds or Nths place leadend depending on the options specified. If a specific leadend has been specified, ensure the appropriate bells are crossing at the leadend. If it's either a 2nds or an Nths place leadend, first check whether both are possible - then if only one if possible, apply that leadend.
*Active if any of "2nds or Nths place leadend", "2nds place leadend", "Nths place leadend", or both "Palindromic symmetry" and "Plain bob leadend" are selected*

## NoShortCycles
If it's specified that all the working bells follow the same line, make sure there are no short cycles which would result in the course having a shorter number of leads.
*Active if "Full course" is selected*

## Surprise, Delight, TrebleBob
Makes sure the treble treble-bobs. Then ensure the appropriate places are made or not made before and after the treble's internal dodges. 
*Active if "Surprise", "Delight", or "Treble-bob" is selected and the number of bells is 6, 8, 10 or 12* 

## UpTo2PlacesPerChange
Prevent more than 2 places being made per change. If there are already 2 places being made, ensure no other places are made by preventing these other bells from ringing in the same position in the next row.
*Active if "At most 2 places per change" is specified*

## ConsecutivePlaceLimit
Prevents more than the specified number of consecutive (adjacent) places being made. If the limit is 1, then no consecutive places are allowed - in this case if there is a place made, prevent other places being made around it. If the limit is 2, prevent further places being made around a pair of consecutive places.
*Active if "Limit on number of consecutive places" is set to 1 or 2*

## DoNotMakeBadDecision (recursionLimit=1)
From a fixed position for a bell where there are multiple choices in the next row, test out each of the options to see if the puzzle becomes inconsistent. If an option becomes inconsistent, remove that option.

## DoNotMakeBadGuess (recursionLimit=1)
For blows where there are two remaining options, try out both of the options. If there are multiple choices in the subsequent row, also try out each of these options. If the puzzle becomes  inconsistent for each of these additional choices, remove that initial 'guess' as it cannot be possible.

## ApplyPalindromicSymmetryFull
For each bell, build up a list of the positions where it's fixed. Ensure the possibilities for all of the   symmetrical positions to these are consistent, by setting them all to be their 'intersection'.
*Active if "Palindromic symmetry" is selected*

## ApplyDoubleSymmetryFull
For each bell, build up a list of the positions where it's fixed. Ensure the possibilities for all of the   symmetrical positions to these are consistent, by setting them all to be their 'intersection'.
*Active if "Double symmetry" is selected*

## ApplyMirrorSymmetryFull
For each bell, build up a list of the positions where it's fixed. Ensure the possibilities for all of the   symmetrical positions to these are consistent, by setting them all to be their 'intersection'.
*Active if "Mirror symmetry" is selected*

## DoNotMakeBadDecision (withPropagation) (recursionLimit=1)
As for [DoNotMakeBadDecision (recursionLimit=1)](#donotmakebaddecision-recursionlimit1), but apply the non-guessing strategies before making a decision to determine more of the consequences of making the decision.

## DoNotMakeBadGuess (withPropagation) (recursionLimit=1)
As for [DoNotMakeBadGuess (recursionLimit=1)](#donotmakebadguess-recursionlimit1), but apply the non-guessing strategies before making a decision to determine more of the consequences of making the decision.

## DoNotMakeBadDecision (withPropagation) (recursionLimit=2)
As for [DoNotMakeBadDecision (withPropagation) (recursionLimit=1)](#donotmakebaddecision-withpropagation-recursionlimit1), but allow an extra guess or decision to be made.
 
## DoNotMakeBadGuess (withPropagation) (recursionLimit=2)
As for [DoNotMakeBadGuess (withPropagation) (recursionLimit=1)](#donotmakebadguess-withpropagation-recursionlimit1), but allow an extra guess or decision to be made.
 
Solver: &copy; Jonathan Agg 2021