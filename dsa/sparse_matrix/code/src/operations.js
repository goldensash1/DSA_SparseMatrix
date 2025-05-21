const SparseMatrix = require('./SparseMatrix');

function addMatrices(A, B) {
  if (A.rows !== B.rows || A.cols !== B.cols) {
    throw new Error('Matrix dimensions do not match for addition');
  }

  const result = new SparseMatrix({ rows: A.rows, cols: A.cols });

  // Copy A's data
  for (let [key, value] of A.data) {
    result.data.set(key, value);
  }

  // Add B's data
  for (let [key, value] of B.data) {
    const current = result.data.get(key) || 0;
    const sum = current + value;
    if (sum !== 0) result.data.set(key, sum);
    else result.data.delete(key);
  }

  return result;
}

function subtractMatrices(A, B) {
  const negativeB = new SparseMatrix({ rows: B.rows, cols: B.cols });

  for (let [key, value] of B.data) {
    negativeB.data.set(key, -value);
  }

  return addMatrices(A, negativeB);
}

function multiplyMatrices(A, B) {
  if (A.cols !== B.rows) {
    throw new Error('Matrix dimensions do not match for multiplication');
  }

  const result = new SparseMatrix({ rows: A.rows, cols: B.cols });

  for (let [aKey, aVal] of A.data) {
    const [i, k] = aKey.split(',').map(Number);
    for (let j = 0; j < B.cols; j++) {
      const bVal = B.getElement(k, j);
      if (bVal !== 0) {
        const key = `${i},${j}`;
        const current = result.data.get(key) || 0;
        result.data.set(key, current + aVal * bVal);
      }
    }
  }

  return result;
}

module.exports = { addMatrices, subtractMatrices, multiplyMatrices };
