class InternalPlaces {
  static isRelevant(puzzle) {
    return puzzle.numBells >= 6 && puzzle.numBells <= 12 && puzzle.numBells % 2 == 0 && 
      puzzle.numRows == 4 * puzzle.numBells + 1;
  }
  
  static placeInformation(puzzle) {
    var idxs = [];
    var places = [];
    var x = puzzle.numRows - 1;
    
    //3rds
    idxs.push([7,8]);
    idxs.push([x-9,x-8]);
    places.push(3);
    places.push(3);
    
    //4ths
    idxs.push([3,4]);
    idxs.push([x-5,x-4]);
    places.push(4);
    places.push(4);

    if(puzzle.numBells >= 8) {
      //5ths
      idxs.push([11,12]);
      idxs.push([x-13,x-12]);
      places.push(5);
      places.push(5);
     
      //6ths
      idxs.push([7,8]);
      idxs.push([x-9,x-8]);      
      places.push(6);
      places.push(6);
    }

    if(puzzle.numBells >= 10) {
      //7ths
      idxs.push([15,16]);
      idxs.push([x-17,x-16]);
      places.push(7);
      places.push(7);
     
      //8ths
      idxs.push([11,12]);
      idxs.push([x-13,x-12]);
      places.push(8);
      places.push(8);
    }

    if(puzzle.numBells >= 12) {
      //9ths
      idxs.push([19,20]);
      idxs.push([x-21,x-20]);
      places.push(9);
      places.push(9);
      
      //10ths
      idxs.push([15,16]);
      idxs.push([x-17,x-16]);
      places.push(10);
      places.push(10);
   }
    
    return {'idxs': idxs, 'places': places};
  }
}