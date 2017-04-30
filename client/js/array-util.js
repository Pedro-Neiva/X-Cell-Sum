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
