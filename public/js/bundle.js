(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
const TableModel = require('./table-model');
const TableView = require('./table-view');

const model = new TableModel();
const tableView = new TableView(model);
tableView.init();

},{"./table-model":4,"./table-view":5}],2:[function(require,module,exports){
const getRange = (fromNum, toNum) => {
  return Array.from({length: toNum - fromNum + 1},
  (unused, i) => i + fromNum);
};

const getLetterRange = (firstLetter = 'A', numLetters) => {
  const rangeStart = firstLetter.charCodeAt(0);
  const rangeEnd = rangeStart + numLetters - 1;
  let letterRange = getRange(rangeStart, rangeEnd).map(charCode => String.fromCharCode(charCode));
  letterRange.unshift('Row Number');
  return letterRange;

};

module.exports = {
  getRange: getRange,
  getLetterRange: getLetterRange
};

},{}],3:[function(require,module,exports){
const removeChildren = (parentEl) => {
  while (parentEl.firstChild) {
    parentEl.removeChild(parentEl.firstChild);
  }
};

const createEl = (tagName) => {
  return (text) => {
    const el = document.createElement(tagName);
    if (text) {
      el.textContent = text;
    }
    return el;
  };
};

const createTR = createEl('TR');
const createTH = createEl('TH');
const createTD = createEl('TD');

module.exports = {
  createTR: createTR,
  createTH: createTH,
  createTD: createTD,
  removeChildren: removeChildren
};

},{}],4:[function(require,module,exports){
class TableModel {
  constructor(numCols = 3, numRows = 3) {
    this.numCols = numCols;
    this.numRows = numRows;
    this.data = {};
    this.formula = {};
  }

  _getCellId(location) {
    return `${location.col}:${location.row}`;
  }

  getValue(location) {
    return this.data[this._getCellId(location)];
  }

  getFormula(location) {
    return this.formula[this._getCellId(location)];
  }

  setValue(location, value) {

    if (value === undefined) {
      value = '';
    }

    let previousValue = this.getValue(location);
    let formula = this.identifyFormula(location, value);

    if (formula.operation == 'SUM') {
        this.data[this._getCellId(location)] = this.applySumFormula(formula);
    } else {
      if (formula == 'Not a valid formula') {
        this.data[this._getCellId(location)] = value;
      }
    }

    this.formula[this._getCellId(location)] = value;
  }

  identifyFormula(location, value) {
    let reg = /^=SUM\([A-Z]\d+:[A-Z]\d+\)/;
    let colonPosition = value.toString().indexOf(':');
    let initialCol = value.toString().substring(5,6);
    let finalCol = value.toString().substring(colonPosition + 1, colonPosition + 2);
    let initialRow = value.toString().substring(6, colonPosition);
    let finalRow = value.toString().substring(colonPosition + 2, value.toString().length - 1);
    let test = reg.test(value) &
    (initialCol == finalCol) &
    (initialRow <= finalRow) &
    (finalRow <= this.numRows);
    let colPosition = initialCol.charCodeAt(0) - 'A'.charCodeAt(0) + 1;

    if (test) {
      return {
        operation: 'SUM',
        colPosition: colPosition,
        initialRow: initialRow,
        finalRow: finalRow
      };
    } else {
      return 'Not a valid formula';
    }
  }

  applySumFormula(formula) {
    let total = 0;
    let value;
    for (let row = formula.initialRow - 1; row < formula.finalRow; row++) {
      value = this.getValue({col: formula.colPosition, row: row});
      value = parseInt(value, 10);

      if (!isNaN(value)) {
        total += value;
      }
    }
    return total;
  }


  addColumn(location) {

    if (location.col != this.numCols) {
      if (location.row == -1) {
        for (let col = this.numCols; col > location.col; col--) {
          for (let row = 0; row < this.numRows + 1; row++) {
            let value = this.getValue({
              col: col,
              row: row
            });
            this.setValue({
              col: col + 1,
              row: row
            }, value);
          }
        }
        for (let row = 0; row < this.numRows + 1; row++) {
          this.setValue({
            col: location.col + 1,
            row: row
          }, '');
        }
      }
    }
    this.numCols += 1;
  }

  addRow(location) {

    if (location.row + 1 != this.numRows && location.col === 0) {
      for (let row = this.numRows; row > location.row; row--) {
        for (let col = 1; col <= this.numCols; col++) {
          let value = this.getValue({
            col: col,
            row: row
          });
          this.setValue({
            col: col,
            row: row + 1
          }, value);
        }
      }

      for (let col = 0; col <= this.numCols + 1; col++) {
        this.setValue({
          col: col,
          row: location.row + 1
        }, '');
      }
    } else {
      for (let col = 0; col <= this.numCols + 1; col++) {
        this.setValue({
          col: col,
          row: this.numRows + 1
        }, this.getValue({
          col: col,
          row: this.numRows
        }));
        this.setValue({
          col: col,
          row: this.numRows
        }, '');
      }
    }
    this.numRows += 1;
  }

  // sumCol(col) {
  //   let total = 0;
  //   let value = 0;
  //   for (let i = 0; i < this.numRows; i++) {
  //     value = this.getValue({
  //       col: col,
  //       row: i
  //     });
  //     value = parseInt(value, 10);
  //
  //     if (!isNaN(value)) {
  //       total += value;
  //     }
  //   }
  //
  //   this.setValue({
  //     col: col,
  //     row: this.numRows
  //   }, total);
  // }
}

module.exports = TableModel;

},{}],5:[function(require,module,exports){
const {
  getLetterRange
} = require('./array-util');
const {
  removeChildren,
  createTD,
  createTH,
  createTR
} = require('./dom-util');

class TableView {
  constructor(model) {
    this.model = model;
  }

  init() {
    this.initDomReferences();
    this.initCurrentCell();
    this.renderTable();
    this.attachEventHandlers();
    this.formulaBarEl.click();
  }

  initDomReferences() {
    this.headerRowEl = document.querySelector('THEAD TR');
    this.sheetBodyEl = document.querySelector('TBODY');
    this.formulaBarEl = document.querySelector('#formula-bar');
  }

  initCurrentCell() {
    this.currentCellLocation = {
      col: 1,
      row: 0
    };
    this.renderFormulaBar();
  }

  normalizeValueForRendering(value) {
    return this.model.getFormula(this.currentCellLocation) || '';
  }

  renderFormulaBar() {
    const currentCellValue = this.model.getValue(this.currentCellLocation);
    this.formulaBarEl.value = this.normalizeValueForRendering(currentCellValue);
    this.formulaBarEl.focus();
  }

  renderTable() {
    this.renderTableHeader();
    let fragmentBody = '';

    for (let i = 0; i <= this.model.numCols; i++) {
      fragmentBody = this.createFragmentBody();
    }


    fragmentBody = this.createFragmentBody();

    let fragment = this.createFragmentFooter(fragmentBody);
    this.removeTable();
    this.createTable(fragment);
  }

  renderTableFooter() {
    let fragmentFooter = this.createFragmentFooter();
    this.removeTable();
    this.createTable(fragmentBody);
  }

  renderTableHeader() {
    let colNumber = 0;
    removeChildren(this.headerRowEl);
    getLetterRange('A', this.model.numCols)
      .map(colLabel => createTH(colLabel))
      .forEach(th => {
        th.addEventListener('click', this.handleHeaderClick.bind(this));
        th.setAttribute("id", 'c' + colNumber.toString() + '-1');
        colNumber++;
        this.headerRowEl.appendChild(th);
      });

  }


  isCurrentCell(col, row) {
    return this.currentCellLocation.col === col &&
      this.currentCellLocation.row === row;
  }

  createFragmentFooter(fragmentBody) {
    const tr = createTR();
    for (let col = 0; col < this.model.numCols + 1; col++) {
      const position = {
        col: col,
        row: this.model.numRows
      };

      let colLetter =  String.fromCharCode('A'.charCodeAt(0) + position.col);

      const formula = '=SUM(' + colLetter +'1:' + colLetter + this.model.numRows.toString() + ')';

      this.model.setValue({col: position.col + 1, row: position.row}, formula);

      const value = this.model.getValue(position);

      const td = createTD(value);
      td.className = 'footer-cell';
      tr.appendChild(td);
    }

    fragmentBody.appendChild(tr);

    return fragmentBody;
  }

  createFragmentBody() {
    let rowNumber = 1;
    let td = '';
    const fragmentBody = document.createDocumentFragment();
    for (let row = 0; row < this.model.numRows; row++) {
      const tr = createTR();
      for (let col = 0; col < this.model.numCols + 1; col++) {
        const position = {
          col: col,
          row: row
        };

        if (position.col !== 0) {

          const formula = this.model.getFormula(position);

          if(formula !== undefined) {
            if (this.model.identifyFormula(position, formula) != 'Not a valid formula') {
              this.model.setValue(position, formula);
            }

          }

          const value = this.model.getValue(position);

          td = createTD(value);
          td.setAttribute("id", 'c' + col.toString() + row.toString());
          td.addEventListener('click', this.handleSheetClick.bind(this));

          if (this.isCurrentCell(col, row)) {
            td.className = 'current-cell';
          }
        } else {
          td = createTD(rowNumber);
          td.setAttribute("id", 'c' + col.toString() + row.toString());
          td.addEventListener('click', this.handleRowNumberColumnClick.bind(this));
          td.className = 'rowNumberColumn';
          rowNumber++;
        }
        tr.appendChild(td);
      }

      fragmentBody.appendChild(tr);
    }
    return fragmentBody;

  }

  removeTable() {
    removeChildren(this.sheetBodyEl);
  }

  createTable(fragment) {
    this.sheetBodyEl.appendChild(fragment);
  }

  attachEventHandlers() {
    this.formulaBarEl.addEventListener('keyup', this.handleFormulaBarChange.bind(this));
    document.getElementById('add-column').addEventListener('click', this.addColumn.bind(this));
    document.getElementById('add-row').addEventListener('click', this.addRow.bind(this));
  }

  addColumn() {
    this.model.addColumn(this.currentCellLocation);
    this.renderTable();
  }

  addRow() {
    this.model.addRow(this.currentCellLocation);
    this.renderTable();
  }

  handleFormulaBarChange(evt) {
    const value = this.formulaBarEl.value;

    this.model.setValue(this.currentCellLocation, value);
    //this.model.sumCol(this.currentCellLocation.col);
    this.renderTable();
  }

  handleRowNumberColumnClick(evt) {

    const col = evt.target.cellIndex;
    const row = evt.target.parentElement.rowIndex - 1;

    this.currentCellLocation = {
      col: col,
      row: row
    };

    this.formulaBarEl.value = '';

    this.renderTable();

    for (let i = 0; i < this.model.numCols + 1; i++) {
      let element = document.getElementById('c' + i.toString() + row.toString());
      element.style.backgroundColor = "lightBlue";
    }
  }

  handleHeaderClick(evt) {
    const col = evt.target.cellIndex;
    const row = evt.target.parentElement.rowIndex - 1;

    this.currentCellLocation = {
      col: col,
      row: row
    };

    this.formulaBarEl.value = '';

    this.renderTable();

    if (col !== 0) {
      for (let i = -1; i < this.model.numRows; i++) {
        let element = document.getElementById('c' + col.toString() + i.toString());
        element.style.backgroundColor = "lightBlue";
      }
    }
  }


  handleSheetClick(evt) {

    const col = evt.target.cellIndex;
    const row = evt.target.parentElement.rowIndex - 1;

    this.currentCellLocation = {
      col: col,
      row: row
    };





    this.renderTable();
    this.renderFormulaBar();
  }

}

module.exports = TableView;

},{"./array-util":2,"./dom-util":3}]},{},[1]);
