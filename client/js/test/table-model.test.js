const TableModel = require('../table-model');

describe('table-model', () => {
  it('can set then get a value', () => {
    // set up initial state
    const model = new TableModel();
    const location = {row: 3, col: 5};

    // inspect initial state
    expect(model.getValue(location)).toBeUndefined();

    // execute code under test
    model.setValue(location, 'foo');

    // inspect resulting state
    expect(model.getValue(location)).toBe('foo');
  });
});
