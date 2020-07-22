function Solver(S) {
  this.tactics = {};

  this.tactics.lastHero = {
    estimate: function() {
      S.forAll(function(i, j) {
        if(S[i][j].candidates.toArray().length == 1) {
          S.setColorsOfSmallSquares(i, j, S[i][j].candidates, [0, 255, 0]);
        }
      });
    },
    solve: function() {
      S.forAll(function(i, j) {
        let arr = S[i][j].candidates.toArray();
        if(arr.length == 1 && S[i][j].n == 0) {
          S[i][j].n = arr[0];
        }
      });
    }
  };

  this.tactics.hiddenOne = {
    estimate: function() {
      let arr = S.sumAllRowsColumnsAndBoxes();
      for(let i in arr) {
        let x = arr[i].coords[0];
        let y = arr[i].coords[1];
        let digit = arr[i].digit;
        let set = S.arrayToSet([digit]).inverse().intersection(S[x][y].candidates);
        S.setColorsOfSmallSquares(x, y, set, [255, 255, 0]);
      }
    },
    solve: function() {
      let arr = S.sumAllRowsColumnsAndBoxes();
      for(let i in arr) {
        let x = arr[i].coords[0];
        let y = arr[i].coords[1];
        let digit = arr[i].digit;
        S[x][y].n = digit;
      }
    }
  };

  this.estimate = function(tactic) {
    S.setAllCandidates();
    S.clearColors(); // fix color bug
    if(typeof(tactic) == "string")
      this.tactics[tactic].estimate();
    else {
      for(let i in this.tactics)
        this.tactics[i].estimate();
    }
    this.detectErrors();
    S.print();
  }

  this.solve = function(tactic) {
    if(typeof(tactic) == "string") {
      S.setAllCandidates();
      this.tactics[tactic].solve();
    } else {
      for(let i in this.tactics) {
        S.setAllCandidates();
        this.tactics[i].solve();
      }
    }
    S.clearColors();
    this.detectErrors();
    S.print();
  }

  this.detectErrors = function() {
    let pairErrors = S.detectPairs(S.onlyDigits( S.allRowsColumnsAndBoxes() ));
    let nullErrors = [];
    S.forAll(function(i, j) {
      if (typeof(S[i][j].candidates) == "object")
        if (S[i][j].candidates.toArray().length == 0)
          nullErrors.push({x: i, y: j});
    });
    for(let i in nullErrors) {
      let o = nullErrors[i];
      if (S[o.x][o.y].n == 0) S.setColor(o.x, o.y, [255, 255, 0]);
    }
    for(let i in pairErrors) {
      let o = pairErrors[i];
      S.setColor(o.x, o.y, [255, 0, 0]);
    }
  }

  return this; 
}

let s = Sudoku();
// s.setRow(0,[0,0,0, 0,0,0, 6,0,0]);
// s.setRow(1,[0,0,0, 0,0,0, 1,2,3]);
// s.setRow(2,[5,0,9, 0,6,0, 0,0,0]);

// s.setRow(3,[0,0,0, 3,0,0, 0,7,0]);
// s.setRow(4,[6,0,0, 2,0,0, 0,0,5]);
// s.setRow(5,[0,4,0, 0,0,8, 0,0,0]);

// s.setRow(6,[0,0,0, 0,8,0, 7,0,6]);
// s.setRow(7,[2,6,4, 0,0,0, 0,0,0]);
// s.setRow(8,[0,0,5, 0,0,4, 0,0,0]);

s.setRow(0,[0,0,5, 0,0,4, 0,0,0]);
s.setRow(1,[2,0,0, 0,9,0, 0,4,0]);
s.setRow(2,[0,0,0, 1,3,2, 6,5,0]);

s.setRow(3,[1,0,0, 0,0,0, 4,3,0]);
s.setRow(4,[0,0,0, 0,0,0, 0,0,5]);
s.setRow(5,[0,4,0, 8,0,0, 0,6,2]);

s.setRow(6,[0,0,0, 0,0,0, 5,8,6]);
s.setRow(7,[0,0,0, 0,0,3, 0,0,9]);
s.setRow(8,[0,8,6, 9,0,0, 3,0,4]);


//s[0][0].n=3;
//s[0][1].n=4;
//s[1][0].n=2;

s.setAllCandidates();
s.print();

let estimate = true;

function turn() {
  if(estimate)
    s.solver.estimate();
  else
    s.solver.solve();
    
  estimate = !estimate;
}

s.elem.addEventListener('click', turn);
window.addEventListener('keydown', turn);

function Sudoku() {
  let sudoku = [];
  for(let i=0; i<9; i++) {
    sudoku[i] = [];
    for(let j=0; j<9; j++) { sudoku[i][j] = new Square(); }
  }

  sudoku.load = function() {
    if(typeof(this._save) != "object") {
      console.warn("_save is empty");
      return;
    }
    for(let i=0; i<9; i++) {
      for(let j=0; j<9; j++) {
        let sq = this._save[i][j];
        let _sq = this[i][j];
        _sq.n = sq.n;
        _sq.candidates = sq.candidates.copy();
      }
    }
  }

  sudoku.save = function() {
    this._save = [];
    for(let i=0; i<9; i++) {
      this._save[i] = [];
      for(let j=0; j<9; j++) {
        this._save[i][j] = new Square();
        let sq = this[i][j];
        let _sq = this._save[i][j];
        _sq.n = sq.n;
        _sq.candidates = sq.candidates.copy();
      }
    }
  }

  sudoku.logArray = function log(arr) {
    for(let i in arr) console.log(JSON.stringify(arr[i]));
  }

  sudoku.append = function(arr, o) {
    for(let i in arr)
      if(arr[i].n == o.n)
        return {o: arr[i], res: false};
    arr.push(o);
    return {res: true};
  }

  sudoku.detectPairs = function(a) {
    let arrayOfErrors = [];
    for(let i=0; i<a.length; i++) {
      let row = [];
      for(let j=0; j<a[i].length; j++) {
        let o = a[i][j];
        let stateOfAppend = this.append(row, o);
        if(!stateOfAppend.res) {
          let _o = stateOfAppend.o;
          arrayOfErrors.push({x: o.x, y: o.y});
          arrayOfErrors.push({x: _o.x, y: _o.y});
        }
      }
    } 
    return arrayOfErrors;
  }

  sudoku.onlyDigits = function(a) {
    let arr = [];
    for(let i=0; i<a.length; i++) {
      arr[i] = [];
      for(let j=0; j<a[i].length; j++) {
        let x = a[i][j].x;
        let y = a[i][j].y;
        let n = this[x][y].n;
        if(n > 0)
          arr[i].push({x: x, y: y, n: n});
      }
    }
    return arr;
  }

  sudoku.allRowsColumnsAndBoxes = function() {
    let arr = [], sets = ['row', 'column', 'box'];
    for(let k=0; k<3; k++) {
      for(let i=0; i<9; i++) {
        let set = this[sets[k]](i);
        arr.push(set);
      }
    }
    return arr;
  }

  sudoku.sumAllRowsColumnsAndBoxes = function() {
    let arr = [];
    for(let i=0; i<9; i++) {
      let c = this.sumCandidatesOfArray(this.row(i));
      for(let j=0; j<c.length; j++)
        arr.push(c[j]);
    }

    for(let i=0; i<9; i++) {
      let c = this.sumCandidatesOfArray(this.column(i));
      for(let j=0; j<c.length; j++)
        arr.push(c[j]);
    }

    for(let i=0; i<9; i++) {
      let c = this.sumCandidatesOfArray(this.box(i));
      for(let j=0; j<c.length; j++)
        arr.push(c[j]);
    }

    return arr;
  }

  sudoku.sumCandidatesOfArray = function(arr) {
    let obj = {digits: [], coords: []}
    let digits = obj.digits;
    let coords = obj.coords;

    for(let i=0; i<9; i++) {
      digits[i] = 0;
      coords[i] = 0;
    }

    for(let i=0; i<9; i++) {
      let x = arr[i].x;
      let y = arr[i].y;
      let sqr = this[x][y];
      if(sqr.n == 0) {
        for(let j=0; j<9; j++) {
          digits[j] += sqr.candidates[j];
          if(digits[j] == 1 && coords[j] == 0) { coords[j] = [x, y] }
          if(digits[j] > 1) { coords[j] = -1 }
        }
      }
    }

    arr = [];
    for(let i=0; i<9; i++)
      if(typeof(coords[i]) == "object")
        arr.push({digit: i+1, coords: coords[i]});
    return arr;
  }

  sudoku.box = function(n) {
    let arr = [];
    let x = div(n, 3), y = n % 3;
    for(let i=0; i<3; i++)
      for(let j=0; j<3; j++)
        arr.push({x: 3*x + i, y: 3*y + j});
    return arr;
  }

  sudoku.column = function(n) {
    let arr = [];
    for(let i=0; i<9; i++) { arr.push({x: i, y: n}) }
    return arr;
  }

  sudoku.row = function(n) {
    let arr = [];
    for(let i=0; i<9; i++) { arr.push({x: n, y: i}) }
    return arr;
  }

  sudoku.forAll = function(call) {
    for(let i=0; i<9; i++)
      for(let j=0; j<9; j++)
        call(i, j);
  }

  sudoku.clearColors = function() {
    this.forAll(function(i, j) {
      delete sudoku[i][j].color;
      delete sudoku[i][j].colorsOfSmallSquares;
    });
  }

  sudoku.setColor = function(x, y, color) {
    this[x][y].color = color;
  }

  sudoku.setColorsOfSmallSquares = function(x, y, set, color) {
    let square = this[x][y];
    if (square.colorsOfSmallSquares == undefined)
      square.colorsOfSmallSquares=[];
    for (let i=0; i<9; i++) {
      if (set.isElem(i + 1))
        square.colorsOfSmallSquares[i] = color;
    }
  }

  sudoku.solver = new Solver(sudoku);

  sudoku.arrayToSet = function(arr) {
    let set = new Set();
    set.unionWithArray(arr);
    return set;
  }

  sudoku.digitInBoxes = function(digit) {
    let set = new Set();
    for (let i=0; i<9; i++)
      set[i] = this.digitInBox(digit, div(i, 3), i % 3) ? 1 : 0;
    return set;
  }

  sudoku.digitInBox = function(digit, x, y) {
    let set = new Set();
    set.unionWithArray(this.getBlock(x, y));
    return set.isElem(digit);
  }

  sudoku.resetCandidates = function() {
    this.forAll(function(i, j) {
      sudoku[i][j].candidates = new Set().inverse();
    });
  }

  sudoku.setAllCandidates = function() {
    this.forAll(function(i, j) {
      sudoku.setCandidates(i, j);
    });
  }

  sudoku.setCandidates = function(x, y) {
    let sq = this[x][y];
    if(sq.candidates == undefined) sq.candidates = new Set().inverse();
    sq.candidates.intersection(this.getCandidates(x, y));
  }

  sudoku.getCandidates = function(x, y) {
    let set = this.getVarietyOf(x, y);
    return set.inverse();
  }

  sudoku.getVarietyOf = function(x, y) {
    let set = new Set();
    set.unionWithArray(this.getRow(x));
    set.unionWithArray(this.getColumn(y));
    set.unionWithArray(this.getBox(div(x, 3), div(y, 3)));
    return set;
  }

  sudoku.getBox = function(x, y) {
    let block = [];
    for (let i=x*3; i<(x+1)*3; i++)
      for (let j=y*3; j<(y+1)*3; j++) {
        block.push(this[i][j].n);
      }
    return block;
  }

  sudoku.getColumn = function(n) {
    let column = [];
    for (let i=0; i<9; i++) {
      column.push(this[i][n].n);
    }
    return column;
  }

  sudoku.setColumn = function(n, column) {
    let L = this.limit(column.length);
    for (let i=0; i<L; i++) {
      this[i][n].n = column[i];
    }
  }

  sudoku.getRow = function(n) {
    let row = [];
    for (let j=0; j<9; j++) {
      row.push(this[n][j].n);
    }
    return row;
  }

  sudoku.setRow = function(n, row) {
    let L = this.limit(row.length);
    for (let j=0; j<L; j++) {
      this[n][j].n = row[j];
    }
  }

  sudoku.limit = function(L) {
    return L > 9 ? 9 : L;
  }

  sudoku.print = function() {
    let s = '';

    function styles(i, j) {
      let arr = [1, 0, 0, 1];
      if(i % 3 == 2) {
      arr[2] = 1;
      }
      if(j % 3 == 2) {
      arr[1] = 1;
      }
      return arr;
    }


    function w(str) {
      s += str + '\n';
    }

    function getStyle(o) {
      let str = "border-style: solid; border-width: ";
      str += o[0] +"px "+ o[1] +"px "+ o[2] +"px "+ o[3] +"px;";
      return str;
    }

    function getSquare(x, y, n, candidates, color, colors) {
      let s = "";

      let colorToString = function(c) {
        if(c == undefined || c.length != 3) {
          return ";";
        }
        return 'rgb('+ c[0] +', '+ c[1] +', '+ c[2] +');';
      }

      let w = function(str) {
        s += str + '\n';
      }

      let getColor = function(i, j) {
        let m = 3*i+j;
        if(colors == undefined) {
          return '';
        }
        return ' style="background-color: '+colorToString(colors[m])+'"';
      }

      let getNumber = function(i, j) {
        let m = 3*i+j;
        if(candidates[m] == 1) {
          return m+1;
        }
        return "&nbsp;";
      }

      if(n === "" && candidates != undefined) {
        w('<table id="cl01" class="candtbSmall" cellspacing="0" align="center"><tbody>');

        for(let i=0; i<3; i++) {
          w('<tr>');
          for(let j=0; j<3; j++) {
            w('<td'+ getColor(i, j) +'>'+ getNumber(i, j) +'</td>');
          }
          w('</tr>');
        }

        w('</tbody></table>');
      } else {
        s = n;
      }
      return '<td class="InnerBigSmall" style="'+ getStyle(styles(x, y)) +' background-color: '+ colorToString(color)+ '">' + s;
    }

    //***********************************************
    w('<caption>Судоку</caption>');
    w('<tbody>');

    for(let i=0; i<9; i++) {
      w('<tr>');
      for(let j=0; j<9; j++) {
        w( getSquare(i, j, this.getN(i, j), this[i][j].candidates,  this[i][j].color, this[i][j].colorsOfSmallSquares) );
        w('</td>');
      }
      w('</tr>');
    }

    w('</tbody>');
    //***********************************************

    if(this.elem == undefined) {
      this.elem = document.createElement("table");
    }
    this.elem.className="OuterT";
    this.elem.innerHTML = s;
    document.body.appendChild(this.elem);
  }

  sudoku.getN = function(x, y) {
    if(this[x][y].n == 0) return "";
    return this[x][y].n;
  }

  sudoku.setN = function(x, y, n) {
    this[x][y].n = n;
  }

  return sudoku;
}

function testSet() {
  let X = new Set();
  let Y = new Set();
  X[5] = 1;
  X.inverse();
  console.log("X", X);
  Y[0] = 1;
  console.log("Y", Y);
  console.log("X&Y", X.copy().intersection(Y));
  console.log("X|Y", X.copy().union(Y));
  console.log("X/Y", X.copy().sub(Y));
  X = new Set();
  X.unionWithArray([1,4,5]);
  console.log("[1,4,5] =>", X);
  console.log("X.toArray() =>", X.toArray());
  console.log("X.isElem(1) =>", X.isElem(1));
  console.log("X.isElem(0) =>", X.isElem(0));
}

function div(x, y) {
  return Math.floor(x / y);
}
// *************** Set ***************
function Set() {
  let set = [];
  for(let i=0; i<9; i++) {
    set.push(0);
  }

  set.isElem = function(n) {
    return this[n - 1] == 1;
  }

  set.toArray = function() {
    let arr=[];
    for(let i=0; i<9; i++) {
      this[i] == 1 ? arr.push(i+1) : 1;
    }
    return arr;
  }

  set.subWithArray = function(arr) {
    for(let i=0; i<arr.length; i++) {
      if(this.limit(arr[i])) {
        this[arr[i] - 1] = 0;
      }
    }
    return this;
  }

  set.unionWithArray = function(arr) {
    for(let i=0; i<arr.length; i++) {
      if(this.limit(arr[i]))
        this[arr[i] - 1] = 1;
    }
    return this;
  }

  set.limit = function(x) {
    return x >= 1 && x <= 9;
  }

  set.copy = function() {
    let set = new Set();
    for(let i=0; i<9; i++)
      set[i] = this[i];
    return set;
  }

  set.sub = function(Y) {
    this.inverse();
    this.union(Y);
    this.inverse();
    return this;
  }

  set.inverse = function() {
    for(let i=0; i<9; i++)
      this[i] = 1 - this[i];
    return this;
  }

  set.union = function(Y) {
    for(let i=0; i<9; i++)
      this[i] = this[i] | Y[i];
    return this;
  }

  set.intersection = function(Y) {
    for(let i=0; i<9; i++)
      this[i] = this[i] & Y[i];
    return this;
  }

  return set;
}

function undef(x, value) {
  if(value == undefined) value = 0;
  if(x == undefined) return value;
  return x;
}

function Square(n) {
  return {n: undef(n)};
}
