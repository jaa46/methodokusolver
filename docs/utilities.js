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