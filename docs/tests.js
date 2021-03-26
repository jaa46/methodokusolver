var examplePuzzles = [];

function loadTests() {

    var parser = new DOMParser();

    var directory = '../puzzles';
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open('GET', directory, true);
    xmlHttp.onload = function (e) {

        var ret = xmlHttp.responseText;
        var fileList = ret.split('\n');
        var files = [];
        for (i = 0; i < fileList.length; i++) {
            var fileinfo = fileList[i].split('="');
            if (fileinfo[0] == '<li><a href') {
                files.push(fileinfo[1].split('">')[0]);
            }
        }

        for(var i=0; i<files.length; i++) {
          var f = new XMLHttpRequest();
          f.open("GET", directory + "/" + files[i], false);
          f.onreadystatechange = function ()
          {
            if(f.readyState === 4)
            {
              if(f.status === 200 || f.status == 0)
              {
                  var res = f.responseText;
                  addPuzzle(res, f.responseURL);
              }
            }
          }
          f.send(null);
        }
    };
    xmlHttp.send(null);
}

function addPuzzle(text, url) {

  var fileName = url.split('/');
  fileName = fileName[fileName.length - 1];
  
  var dropdown = document.getElementById("examplePuzzle");
  dropdown.options.add( new Option(fileName, fileName) );

  var options = [];
  var start = [];
  
  var lines = text.split('\n');
    
  //Build options from checkboxes
  var controls = document.getElementById("optionControls");
  var checkboxes = controls.querySelectorAll('input[type="checkbox"]');
  for (var checkbox of checkboxes) {
    options[checkbox.id] = false;
  }  

  //Mark relevant options true
  var index = 0;
  while(index < lines.length && lines[index][0] != "1") {
    options[lines[index++].trim()] = true;
  }
    
  //Read puzzle
  var numBells = lines[index].trim().length;
  
  var numRows = 0;
  while(index < lines.length && lines[index].length > 0) {

    var row = [];
    for(var jdx=0; jdx<numBells; jdx++) {
      row.push(bell2num(lines[index][jdx]));
    }
    start.push(row);
    index++;
    numRows++;
  }
  
  examplePuzzles.push({
    start: start,
    solution: [],
    options: options,
    optionsDerived: [],
    numRows: numRows,
    numBells: numBells
  });
  
}

var testResults = [];
var saveOutput = false;
function runAllLoadedPuzzles() {
  testResults = [];
  runTest = function() {
    loadPuzzle();
    solveGrid();
  }
  saveOutput = true;
  var dropdown = document.getElementById("examplePuzzle");
  for(var idx=0; idx<examplePuzzles.length; idx++) {
    dropdown.selectedIndex = idx;
    var puzzleName = dropdown.options[dropdown.selectedIndex].value;
    testResults += puzzleName + "\n";
    runTest();
    testResults += "\n";
  }
  prepareResultsForDownload();
  saveOutput = false;
}

function prepareResultsForDownload() {
  var textFile = null,
  makeTextFile = function (text) {
    var data = new Blob([text], {type: 'text/plain'});

    // If we are replacing a previously generated file we need to
    // manually revoke the object URL to avoid memory leaks.
    if (textFile !== null) {
      window.URL.revokeObjectURL(textFile);
    }

    textFile = window.URL.createObjectURL(data);

    return textFile;
  };

  var link = document.getElementById('downloadlink');
  link.href = makeTextFile(testResults);
  link.style.display = 'block';
}