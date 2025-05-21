const path = require('path');
const fs = require('fs');
const SparseMatrix = require('./SparseMatrix');
const { addMatrices, subtractMatrices, multiplyMatrices } = require('./operations');
const readline = require('readline-sync');

// ✅ Build absolute paths to input files
const matrixAPath = path.join(__dirname, '../../sample_inputs/matrixA.txt');
const matrixBPath = path.join(__dirname, '../../sample_inputs/matrixB.txt');

// ✅ Build path to output file
const resultPath = path.join(__dirname, '../../output/result.txt');

// ✅ Debug print paths
console.log('Matrix A Path:', matrixAPath);
console.log('Matrix B Path:', matrixBPath);

try {
  const A = new SparseMatrix(matrixAPath);
  const B = new SparseMatrix(matrixBPath);

  const choice = readline.question('Choose operation (add / subtract / multiply): ').trim().toLowerCase();
  let result;

  if (choice === 'add' || choice === '+') {
    result = addMatrices(A, B);
  } else if (choice === 'subtract' || choice === '-') {
    result = subtractMatrices(A, B);
  } else if (choice === 'multiply' || choice === '*') {
    result = multiplyMatrices(A, B);
  } else {
    throw new Error('Invalid choice');
  }

  // ✅ Print result
  console.log('\n✅ Result:');
  console.log(`rows=${result.rows}`);
  console.log(`cols=${result.cols}`);
  for (let [key, val] of result.data) {
    const [r, c] = key.split(',');
    console.log(`(${r}, ${c}, ${val})`);
  }

  // ✅ Save result to output/result.txt
  const outputLines = [
    `rows=${result.rows}`,
    `cols=${result.cols}`,
    ...Array.from(result.data).map(([key, val]) => {
      const [r, c] = key.split(',');
      return `(${r}, ${c}, ${val})`;
    })
  ];

  fs.writeFileSync(resultPath, outputLines.join('\n'), 'utf-8');
  console.log(`\n💾 Result saved to: ${resultPath}`);
  console.log(`🧮 Total non-zero elements: ${result.data.size}`);

} catch (err) {
  console.error('❌ Error:', err.message);
}
