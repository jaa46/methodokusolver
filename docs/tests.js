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

  //Build options from numerical inputs
  var numberboxes = controls.querySelectorAll('input[type="number"]');
  for (var numberbox of numberboxes) {
    options[numberbox.id] = -1;
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
    else if(line.includes("+=")) {
      //Parse Killer clue: e.g. "a += 17"
      var tokens = line.split("+=");
      var boxId = "killer" + tokens[0].trim().toLowerCase() + "Sum";
      options[boxId] = parseInt(tokens[1].trim());
    }
    
    index++;
  }
    
  //Read puzzle
  var numBells = lines[index].trim().length;
  
  var numRows = 0;
  while(index < lines.length && lines[index].length > 0) {
    
    if(lines[index][0] == "#" || lines[index].length == 1)
      break;
      
    var row = [];
    for(var jdx=0; jdx<numBells; jdx++) {
      var clue = lines[index][jdx];
      if(isKillerClue(numBells, clue))
        row.push(clue);
      else
        row.push(bell2num(clue));
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
    numBells: numBells,
    killer: {clues: []}
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
    // TODO: Handle "-l1" for double/triple changes
  
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
            line = "trueInCourse";
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
            line = {"name": 'consecutivePlaceLimit', "value": 1};
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
  var link = document.getElementById('downloadlink');
  link.href = makeTextFile(testResults);
  link.style.display = 'block';
}

function makeTextFile(text) {
  var textFile = null;
  var data = new Blob([text], {type: 'text/plain'});

  // If we are replacing a previously generated file we need to
  // manually revoke the object URL to avoid memory leaks.
  if (textFile !== null) {
    window.URL.revokeObjectURL(textFile);
  }

  textFile = window.URL.createObjectURL(data);

  return textFile;
};

function downloadPuzzle() {
  var text = generatePuzzleText(puzzle);
  var link = document.getElementById('exportlink');
  link.href = makeTextFile(text);
  link.style.display = 'block';
}

function generatePuzzleText(puzzle) {
  
  var text = "";
  
  // Add rules
  text += addRuleSummary(puzzle);
  
  text += "\n";

  // Add puzzle definition
  var symbols = copy(puzzle.start);
  
  for(var idx=0; idx<puzzle.numRows; idx++)
    for(var jdx=0; jdx<puzzle.numBells; jdx++)
      if(symbols[idx][jdx] == "?" || symbols[idx][jdx] == 0)
        symbols[idx][jdx] = ".";
      
  // Include Killer clues
  for(var i=0; i<puzzle.killer.clues.length; i++) {
    var c = puzzle.killer.clues[i];
    if(c[2] >= "a" && c[2] <= "d")
      symbols[c[0]][c[1]] = c[2];
  }
  
  for(var idx=0; idx<puzzle.numRows; idx++) {
    for(var jdx=0; jdx<puzzle.numBells; jdx++)  
      text += symbols[idx][jdx];
    text += "\n";
  }
  
  return text;
}

function addRuleSummary(puzzle) {
  var text = "";
  
  for(var rule in puzzle.options)
    text += ruleToText(puzzle, rule);
  
  // Special cases
  if(puzzle.options.doubleSymmetry && puzzle.options.palindromicSymmetry)
    text += "## Double, palindromic symmetry" + "\n" + "# -ds" + "\n";
  else if(puzzle.options.doubleSymmetry)
    text += "## Double symmetry" + "\n" + "# -d" + "\n";
  else if(puzzle.options.palindromicSymmetry)
    text += "## Palindromic symmetry" + "\n" + "# -s" + "\n";  
  
  if(puzzle.options.fullCourse && puzzle.options.allWorkingExceptTreble)
    text += "## Bells 2-N do the same work\n# -Q$G==2&&$l~~\"1*\"\n";
  
  if(puzzle.options.fullCourse && puzzle.options.twoHuntBells)
    text += "## Bells 3-N do the same work\n# -Q$G==3&&$l~~\"12*\"\n";
  
  // Killer clues
  for(var idx=0; idx<listKillerColours().length; idx++) {
    var killerLetter = String.fromCharCode("a".charCodeAt(0) + idx);
    var fieldName = ["killer" + killerLetter + "Sum"];
    if(puzzle.options[fieldName] && puzzle.options[fieldName] > 0) {
      if(idx == 0)
        text += "\n";
      text += killerLetter + " += " + puzzle.options["killer" + killerLetter + "Sum"] + "\n";
    }
  }
  
  return text;
}

function ruleToText(puzzle, option) {
  
  var text = "";
  
  if (option == "numberOfLeads" && puzzle.options.numberOfLeads > 0) {
    text = "## numberOfLeads = " + puzzle.options.numberOfLeads + "\n";
    text += "# -Q$o==" + puzzle.options.numberOfLeads + "\n";
  }
  else if (option == "allWorkingExceptTreble" && puzzle.options.allWorkingExceptTreble) {
    text = "## numberOfWorkingBells = " + (puzzle.numBells-1) + "\n";
    text += "# -Q$B-$u==" + (puzzle.numBells-1) + "\n";
  }
  else if (option == "numberOfHuntBells" && puzzle.options.numberOfHuntBells > 0) {
    text = "## numberOfHuntBells = " + puzzle.options.numberOfHuntBells + "\n";
    text += "# -Q$u====" + puzzle.options.numberOfHuntBells + "\n";
  }
  else if (option == "is2OrNLeadEnd" && puzzle.options.is2OrNLeadEnd) {
    text = "## is2OrNLeadEnd" + "\n";
    text += "# -m*(12|1" + num2bell(puzzle.numBells) + ")\n";
  }
  else if (option == "isNLeadEnd" && puzzle.options.isNLeadEnd) {
    text = "## isNLeadEnd" + "\n";
    text += "# -m*(1" + num2bell(puzzle.numBells) + ")\n";
  }
  else if (option == "consecutivePlaceLimit" && puzzle.options.consecutivePlaceLimit > 0) {
    text = "## consecutivePlaceLimit = " + puzzle.options.consecutivePlaceLimit + "\n";
    if (puzzle.options.consecutivePlaceLimit == 1)
      text += "# -j\n";
    else
      text += "# -j2\n";
  }
  else {
      var symbol;
      switch (option) {
          case "mirrorSymmetry":
              symbol = "--mirror";
          break;
          
          case "is2LeadEnd":
              symbol = "-m*(12)";
          break;
          
          case "plainBobLeadEnd":
              symbol = "--pbles";
          break;
          
          case "cyclicLeadEnd":
              symbol = "-c";
          break;
          
          case "trueInLead":
              symbol = "-Fc";
          break;
          
          case "trueInCourse":
              symbol = "-Fc";
          break;
          
          case "noLongPlaces":
              symbol = "-p2";
          break;
              
          case "rightPlace":
              symbol = "-w";
          break;
          
          case "atMost2PlacesPerChange":
              symbol = "-l2";
          break;
          
          case "allDoubleChanges":
              symbol = "-l1";
          break;
          
          case "allTripleChanges":
              symbol = "-l1";
          break;
          
          case "noNminus1thPlacesExceptUnderTreble":
              symbol = "-f";
          break;
          
          case "surprise":
              symbol = "-S";
          break;
          
          case "delight":
              symbol = "--delight";
          break;
              
          case "trebleBob":
              symbol = "-T";
          break;
      }
    
    if(symbol && puzzle.options[option])
      text = "## " + option + "\n# " + symbol + "\n";    
  }
  
  return text;
}
