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
