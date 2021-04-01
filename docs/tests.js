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

        if(files.length ==0) {
          tidyUp();
        }
        else {
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
        }
    };
    xmlHttp.onerror = tidyUp;
    xmlHttp.send(null);

    function tidyUp(e) {
          var b = document.getElementById('loadPuzzle');
          b.style.display = 'none';
          
          b = document.getElementById('runExamples');
          b.style.display = 'none';
          
          b = document.getElementById('examplePuzzle');
          b.style.display = 'none';          
    };
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
  
  //TODO: make these visible to the user
  var nums = ["numberOfHuntBells", "numberOfLeads", "consecutivePlaceLimit"];
  for (var idx=0; idx<nums.length; idx++) {
    options[nums[idx]] = -1;
  }  
  
  //Mark relevant options true
  var index = 0;
  while(index < lines.length) {
    if (bell2num(lines[index][0]) != "?")
      break;
    
    var line = lines[index];
    if(line.startsWith("##")) {
      index++;
      continue;
    }
    
    if(line.startsWith("#")) {
      var tokens = line.split(" ").filter(function(t) {return t.startsWith('-');});
      tokens = tokens.map(function(t) {return parseToken(t);});
      for(var idx=0; idx<tokens.length; idx++) {
        var t = tokens[idx];
        if (!Array.isArray(t))
          t = [t];
        for(var jdx=0; jdx<t.length; jdx++)
          if(typeof(t[jdx])==="string" && t[jdx] in options)
            options[t[jdx]] = true;
          else if(t[jdx].name in options)
            options[t[jdx].name] = t[jdx].value;
          else
            console.log("Unkown option: "+ t[jdx]);
      }
    }
    else if (line.trim() in options) {
      options[line.trim()] = true;
    } 
    
    index++;
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

function parseToken(line) {
  if (line.startsWith("-Q$o==")) {
    //N lead plain course
    numLeads = line.replace("-Q$o==", "");
    line = {"name": 'numberOfLeads', "value": parseInt(numLeads)};
  }
else if (line.startsWith("-Q$B-$u==")) {
    //TODO: Generalise this
    //N working bells
    numBells = line.replace("-Q$B-$u==", "");
    console.log("Assuming " + line + " means N working bells")
    line = "allWorkingExceptTreble";
}
else if (line.startsWith("-Q$u==")) {
    //Number of hunt bells
    numberOfHuntBells = line.replace("-Q$u==", "");
    line = {"name": 'numberOfHuntBells', "value": parseInt(numberOfHuntBells)};
}
else if (line.startsWith("-m*(12|1")) {
    //2 or N lead end
    console.log("Assuming " + line + " means 2nds or Nths leadend")
    line = "is2OrNLeadEnd";
}
else if (line.startsWith("-m*(1") && line != "-m*(12)") {
    //N lead end
    numBells = line.replace("-m*(1","")[0];
    console.log("Assuming " + line + " means Nths leadend")
    line = "isNLeadEnd";
}
else
    switch (line.trim()) {
        case "-p2":
            line = "noLongPlaces";
        break;
        
        case "--pbles":
            line = "plainBobLeadEnd";
        break;

        case "-s":
            line = "palindromicSymmetry";
        break;
            
        case "-ds":
            line = ["doubleSymmetry", "palindromicSymmetry"];
        break;

        case "-Fc":
            line = "trueInLead"; // TODO: Make this trueInCourse
        break;
        
        case "-m*(12)":
            line = "is2LeadEnd";
        break;

        case "-T":
            line = "trebleBob";
        break;
            
        case "--delight":
            line = "delight";
        break;
            
        case "-S":
            line = "surprise";
        break;

        case "-j":
            line = {"name": 'consecutivePlaceLimit', "value": 0};
        break;

        case "-j2":
            line = {"name": 'consecutivePlaceLimit', "value": 2};
        break;

        case "-l2":
            line = "atMost2PlacesPerChange";
        break;
            
        case "-w":
            line = "rightPlace";
        break;

        case "-c":
            line = "cyclicLeadEnd";
        break;
            
        case "-Q$G==2&&$l~~\"1*\"" :
            // Bells 2-N do the same work
            line = ["fullCourse", "allWorkingExceptTreble"];
        break;
           
        case "-Q$G==3&&$l~~\"12*\"" :
            // Bells 3-N do the same work
            line = ["fullCourse", "twoHuntBells"];
        break;
    }
  return line;
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