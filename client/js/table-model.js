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
}

module.exports = TableModel;
