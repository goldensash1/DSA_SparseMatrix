# Sparse Matrix CLI Tool

A Node.js utility to load two sparse matrices from text files, perform addition, subtraction, or multiplication, and save the result.


Input files must follow this format:

```txt
rows=NUMBER_OF_ROWS
cols=NUMBER_OF_COLUMNS
(rowIndex, colIndex, value)
(rowIndex, colIndex, value)
…
```

Only non-zero entries are listed.


## Installation

```bash
git clone <https://github.com/goldensash1/DSA_SparseMatrix.git>
cd dsa/sparse_matrix/code/src
npm install readline-sync
```

*(The only external dependency is `readline-sync`.)*

## Usage

From the `code/src/` folder, run:

```bash
node index.js
```

1. The tool will scan `../../sample_inputs` and list available `.txt` matrix files.
2. Choose an operation: **add**, **subtract**, or **multiply**.
3. Select two matrices by their list numbers.
4. The result is saved automatically to `../../output/output.txt`.

Example session:

```text
Available matrices:
1. matrixA.txt
2. matrixB.txt
3. matrixShortened.txt
Choose operation (add / subtract / multiply): add
Select first matrix (number): 1
Select second matrix (number): 2
Result written to ../../output/output.txt
```

## Core Modules

### `index.js`

* Lists input files from `../../sample_inputs`
* Prompts for operation and matrix selections
* Loads matrices and calls:

  * `addMatrices(A, B)`
  * `subtractMatrices(A, B)`
  * `multiplyMatrices(A, B)`
* Saves result to `../../output/output.txt`


## Example

Given `sample_inputs/matrixA.txt`:

```txt
rows=2
cols=2
(0,0,1)
(1,1,3)
```

and `sample_inputs/matrixB.txt`:

```txt
rows=2
cols=2
(0,0,2)
(1,0,4)
```

Running `node index.js` + `add` yields in `output/output.txt`:

```txt
rows=2
cols=2
(0,0,3)
(1,0,4)
```
