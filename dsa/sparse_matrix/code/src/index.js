/**
 * Sparse Matrix Implementation for DSA Assignment
 * 
 * This program implements sparse matrix operations including:
 * - Loading sparse matrices from files
 * - Addition, subtraction, and multiplication operations
 * - Efficient storage using a Map-based approach
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

/**
 * SparseMatrix class to efficiently store and manipulate sparse matrices
 */
class SparseMatrix {
    /**
     * Initialize a sparse matrix
     * @param {number|string} rowsOrFilePath - Either number of rows or file path to load from
     * @param {number} [cols] - Number of columns (optional if loading from file)
     */
    constructor(rowsOrFilePath, cols) {
        // If rowsOrFilePath is a string, treat it as a file path
        if (typeof rowsOrFilePath === 'string') {
            const filePath = rowsOrFilePath;
            this.loadFromFile(filePath);
        } else {
            // Otherwise, create an empty matrix with specified dimensions
            this.rows = rowsOrFilePath;
            this.cols = cols;
            this.elements = new Map(); // Using Map for efficient sparse representation
        }
    }

    /**
     * Key generation for storing matrix elements in the Map
     * @param {number} row - Row index
     * @param {number} col - Column index
     * @returns {string} - Key for the Map
     */
    getKey(row, col) {
        return `${row},${col}`;
    }

    /**
     * Get element value at the specified position
     * @param {number} row - Row index
     * @param {number} col - Column index
     * @returns {number} - Value at the position (0 if not set)
     */
    getElement(row, col) {
        const key = this.getKey(row, col);
        return this.elements.has(key) ? this.elements.get(key) : 0;
    }

    /**
     * Set element value at the specified position
     * @param {number} row - Row index
     * @param {number} col - Column index
     * @param {number} value - Value to set
     */
    setElement(row, col, value) {
        // Validate input indices
        if (row < 0 || row >= this.rows || col < 0 || col >= this.cols) {
            throw new Error(`Invalid indices: (${row}, ${col}) for matrix of size ${this.rows}x${this.cols}`);
        }

        const key = this.getKey(row, col);
        
        // Only store non-zero values to optimize space
        if (value === 0) {
            this.elements.delete(key);
        } else {
            this.elements.set(key, value);
        }
    }

    /**
     * Load matrix from a file
     * @param {string} filePath - Path to the input file
     */
    loadFromFile(filePath) {
        try {
            const data = fs.readFileSync(filePath, 'utf8');
            // Split by newlines and filter out empty lines or lines with only whitespace
            const lines = data.split('\n')
                .map(line => line.trim())
                .filter(line => line.length > 0);

            // Check if the file has at least 2 lines (rows and cols definitions)
            if (lines.length < 2) {
                throw new Error("Input file format is incorrect: Missing row/column definitions");
            }

            // Parse rows and columns with flexible whitespace
            const rowsMatch = lines[0].match(/^\s*rows\s*=\s*(\d+)\s*$/);
            const colsMatch = lines[1].match(/^\s*cols\s*=\s*(\d+)\s*$/);

            if (!rowsMatch || !colsMatch) {
                console.error(`Failed to parse rows/cols. Line 1: "${lines[0]}", Line 2: "${lines[1]}"`);
                throw new Error("Input file has wrong format");
            }

            this.rows = parseInt(rowsMatch[1], 10);
            this.cols = parseInt(colsMatch[1], 10);
            this.elements = new Map();

            // Parse matrix elements
            for (let i = 2; i < lines.length; i++) {
                const line = lines[i];
                // Match pattern like (0, 381, -694) with flexible whitespace
                const elementMatch = line.match(/^\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(-?\d+)\s*\)\s*$/);
                
                if (!elementMatch) {
                    console.error(`Line parsing error at line ${i+1}: "${line}"`);
                    throw new Error("Input file has wrong format");
                }

                const row = parseInt(elementMatch[1], 10);
                const col = parseInt(elementMatch[2], 10);
                const value = parseInt(elementMatch[3], 10);

                if (isNaN(row) || isNaN(col) || isNaN(value)) {
                    console.error(`Invalid number format at line ${i+1}: row=${row}, col=${col}, value=${value}`);
                    throw new Error("Input file has wrong format");
                }

                if (row < 0 || row >= this.rows || col < 0 || col >= this.cols) {
                    console.error(`Index out of bounds at line ${i+1}: (${row}, ${col}) for matrix of size ${this.rows}x${this.cols}`);
                    throw new Error("Input file has wrong format");
                }

                this.setElement(row, col, value);
            }
        } catch (error) {
            if (error.code === 'ENOENT') {
                throw new Error(`File not found: ${filePath}`);
            } else if (error.message === "Input file has wrong format") {
                throw error;
            } else {
                console.error(`Error details: ${error.message}`);
                throw new Error(`Error loading matrix from file: ${error.message}`);
            }
        }
    }

    /**
     * Add another matrix to this one
     * @param {SparseMatrix} other - Matrix to add
     * @returns {SparseMatrix} - New matrix containing the sum
     */
    add(other) {
        // Validate dimensions
        if (this.rows !== other.rows || this.cols !== other.cols) {
            throw new Error("Matrix dimensions must match for addition");
        }

        const result = new SparseMatrix(this.rows, this.cols);

        // Add all non-zero elements from this matrix
        for (const [key, value] of this.elements.entries()) {
            const [row, col] = key.split(',').map(Number);
            result.setElement(row, col, value);
        }

        // Add all non-zero elements from the other matrix
        for (const [key, value] of other.elements.entries()) {
            const [row, col] = key.split(',').map(Number);
            const currentValue = result.getElement(row, col);
            result.setElement(row, col, currentValue + value);
        }

        return result;
    }

    /**
     * Subtract another matrix from this one
     * @param {SparseMatrix} other - Matrix to subtract
     * @returns {SparseMatrix} - New matrix containing the difference
     */
    subtract(other) {
        // Validate dimensions
        if (this.rows !== other.rows || this.cols !== other.cols) {
            throw new Error("Matrix dimensions must match for subtraction");
        }

        const result = new SparseMatrix(this.rows, this.cols);

        // Add all non-zero elements from this matrix
        for (const [key, value] of this.elements.entries()) {
            const [row, col] = key.split(',').map(Number);
            result.setElement(row, col, value);
        }

        // Subtract all non-zero elements from the other matrix
        for (const [key, value] of other.elements.entries()) {
            const [row, col] = key.split(',').map(Number);
            const currentValue = result.getElement(row, col);
            result.setElement(row, col, currentValue - value);
        }

        return result;
    }

    /**
     * Multiply this matrix with another matrix
     * @param {SparseMatrix} other - Matrix to multiply with
     * @returns {SparseMatrix} - New matrix containing the product
     */
    multiply(other) {
        // Validate dimensions for multiplication
        if (this.cols !== other.rows) {
            throw new Error(`Matrix dimensions incompatible for multiplication: ${this.rows}x${this.cols} and ${other.rows}x${other.cols}`);
        }

        const result = new SparseMatrix(this.rows, other.cols);

        // Collecting row indices with non-zero elements for this matrix
        const thisRowIndices = new Map();
        for (const [key] of this.elements.entries()) {
            const [row, col] = key.split(',').map(Number);
            if (!thisRowIndices.has(row)) {
                thisRowIndices.set(row, []);
            }
            thisRowIndices.get(row).push(col);
        }

        // Collecting column indices with non-zero elements for other matrix
        const otherColIndices = new Map();
        for (const [key] of other.elements.entries()) {
            const [row, col] = key.split(',').map(Number);
            if (!otherColIndices.has(col)) {
                otherColIndices.set(col, []);
            }
            otherColIndices.get(col).push(row);
        }

        // Perform matrix multiplication efficiently using sparse properties
        for (const [rowA, colsA] of thisRowIndices.entries()) {
            for (let colB = 0; colB < other.cols; colB++) {
                let sum = 0;
                const rowsB = otherColIndices.get(colB) || [];
                
                // For each common index between columns of A and rows of B
                colsA.forEach(colA => {
                    if (rowsB.includes(colA)) {
                        sum += this.getElement(rowA, colA) * other.getElement(colA, colB);
                    }
                });

                if (sum !== 0) {
                    result.setElement(rowA, colB, sum);
                }
            }
        }

        return result;
    }

    /**
     * Convert matrix to string format for file output
     * @returns {string} - String representation of the matrix
     */
    toString() {
        let result = `rows=${this.rows}\ncols=${this.cols}\n`;
        
        // Sort entries for consistent output
        const entries = Array.from(this.elements.entries())
            .map(([key, value]) => {
                const [row, col] = key.split(',').map(Number);
                return { row, col, value };
            })
            .sort((a, b) => {
                if (a.row !== b.row) return a.row - b.row;
                return a.col - b.col;
            });
        
        for (const { row, col, value } of entries) {
            result += `(${row}, ${col}, ${value})\n`;
        }
        
        return result;
    }
}

/**
 * Get list of available matrix files in the input directory
 * @returns {string[]} - Array of file paths
 */
function getAvailableMatrices() {
    // Try different relative paths to find sample_inputs directory
    const possiblePaths = [
        path.join(__dirname, '../../', 'sample_inputs'),
        path.join(__dirname, 'sample_inputs'),
        path.join(process.cwd(), 'sample_inputs'),
        path.join(process.cwd(), '../../', 'sample_inputs'),
        './sample_inputs',
        '../sample_inputs'
    ];
    
    for (const inputDir of possiblePaths) {
        try {
            if (fs.existsSync(inputDir)) {
                console.log(`Found sample_inputs directory at: ${inputDir}`);
                const files = fs.readdirSync(inputDir)
                    .filter(file => file.endsWith('.txt'))
                    .map(file => path.join(inputDir, file));
                
                if (files.length > 0) {
                    return files;
                }
            }
        } catch (error) {
            // Continue checking other paths
        }
    }
    
    console.error("Could not find sample_inputs directory with matrix files");
    return [];
}

/**
 * Write matrix to output file
 * @param {SparseMatrix} matrix - Matrix to output
 * @param {string} operation - Operation performed (add/subtract/multiply)
 * @param {string} file1 - First input file name
 * @param {string} file2 - Second input file name
 */
function writeMatrixToFile(matrix, operation, file1, file2) {
    // Try different paths for output file
    const possiblePaths = [
        path.join(__dirname, '../../output/', 'output.txt'),
        path.join(__dirname, 'output.txt'),
        path.join(process.cwd(), 'output.txt'),
        '../../output/output.txt'
    ];
    
    // Find the first writable path or use current directory
    let outputPath = './output.txt';
    for (const potentialPath of possiblePaths) {
        try {
            // Check if directory is writable by attempting to access it
            const dir = path.dirname(potentialPath);
            fs.accessSync(dir, fs.constants.W_OK);
            outputPath = potentialPath;
            break;
        } catch (error) {
            // Try next path
        }
    }
    
    const timestamp = new Date().toISOString();
    const header = `// Operation: ${operation}\n// Matrices: ${path.basename(file1)} and ${path.basename(file2)}\n// Timestamp: ${timestamp}\n\n`;
    
    try {
        fs.writeFileSync(outputPath, header + matrix.toString());
        console.log(`Result successfully written to: ${outputPath}`);
    } catch (error) {
        console.error(`Error writing to output file: ${error.message}`);
        // Fallback to console output if file write fails
        console.log("\n--- RESULT MATRIX ---\n");
        console.log(matrix.toString());
    }
}

/**
 * Main function to run the program
 */
async function main() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    const question = (query) => new Promise((resolve) => rl.question(query, resolve));

    try {
        // Get available matrices
        const matrices = getAvailableMatrices();
        if (matrices.length < 2) {
            console.error("Need at least two matrix files in the sample_inputs directory");
            rl.close();
            return;
        }

        // Display operation menu
        console.log("\n=== Sparse Matrix Operations ===");
        console.log("1. Addition");
        console.log("2. Subtraction");
        console.log("3. Multiplication");
        
        const operationChoice = await question("Select operation (1-3): ");
        let operation;
        
        switch (operationChoice) {
            case '1':
                operation = 'add';
                break;
            case '2':
                operation = 'subtract';
                break;
            case '3':
                operation = 'multiply';
                break;
            default:
                throw new Error("Invalid operation choice");
        }

        // Display available matrices
        console.log("\nAvailable matrices:");
        matrices.forEach((matrix, index) => {
            console.log(`${index + 1}. ${path.basename(matrix)}`);
        });

        // Select first matrix
        const matrix1Index = parseInt(await question("\nSelect first matrix (1-" + matrices.length + "): "), 10) - 1;
        if (isNaN(matrix1Index) || matrix1Index < 0 || matrix1Index >= matrices.length) {
            throw new Error("Invalid matrix selection");
        }

        // Select second matrix
        const matrix2Index = parseInt(await question("Select second matrix (1-" + matrices.length + "): "), 10) - 1;
        if (isNaN(matrix2Index) || matrix2Index < 0 || matrix2Index >= matrices.length) {
            throw new Error("Invalid matrix selection");
        }

        // Load matrices
        console.log("\nLoading matrices...");
        const matrix1Path = matrices[matrix1Index];
        const matrix2Path = matrices[matrix2Index];
        
        const matrix1 = new SparseMatrix(matrix1Path);
        const matrix2 = new SparseMatrix(matrix2Path);
        
        console.log(`Matrix 1: ${matrix1.rows}x${matrix1.cols} with ${matrix1.elements.size} non-zero elements`);
        console.log(`Matrix 2: ${matrix2.rows}x${matrix2.cols} with ${matrix2.elements.size} non-zero elements`);

        // Perform operation
        console.log(`\nPerforming ${operation} operation...`);
        let result;
        
        switch (operation) {
            case 'add':
                result = matrix1.add(matrix2);
                break;
            case 'subtract':
                result = matrix1.subtract(matrix2);
                break;
            case 'multiply':
                result = matrix1.multiply(matrix2);
                break;
        }

        console.log(`Result matrix: ${result.rows}x${result.cols} with ${result.elements.size} non-zero elements`);
        
        // Write result to file
        writeMatrixToFile(result, operation, matrix1Path, matrix2Path);

    } catch (error) {
        console.error(`Error: ${error.message}`);
    } finally {
        rl.close();
    }
}

// Run the program
main();