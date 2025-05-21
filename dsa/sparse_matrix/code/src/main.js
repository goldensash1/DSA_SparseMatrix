    class SparseMatrix {
            constructor(source = null, numRows = 0, numCols = 0) {
            this.data = new Map();
            this.numRows = numRows;
            this.numCols = numCols;
            
            
            //Checks if the source text are characters & strings
            if (typeof source === 'string') {
                this._loadFromFile(source);
            } else {
                this.numRows = numRows;
                this.numCols = numCols;
            }
        }
        
        _loadFromFile(filePath) {
            const fs = require('fs');
            
            try {
                const fileContent = fs.readFileSync(filePath, 'utf8');
                const lines = fileContent.split('\n').map(line => line.trim()).filter(line => line);
                if (!lines[0].startsWith("rows=") || !lines[1].startsWith("cols=")) {
                    throw new Error("Input file has wrong format");
                }
                
                try {
                    this.numRows = parseInt(lines[0].split('=')[1]);
                    this.numCols = parseInt(lines[1].split('=')[1]);
                    
                    if (isNaN(this.numRows) || isNaN(this.numCols)) {
                        throw new Error("Input file has a wrong format");
                    }
                } catch (e) {
                    throw new Error("Input file has a wrong format");
                }
                
                for (let i = 2; i < lines.length; i++) {
                    const line = lines[i].replace(/\s/g, "");
                    if (!line.startsWith('(') || !line.endsWith(')')) {
                        throw new Error("Input file has wrong format");
                    }
                    const content = line.substring(1, line.length - 1);
                    const parts = content.split(',');
                    
                    if (parts.length !== 3) {
                        throw new Error("Input file has wrong format");
                    }
                    
                    try {
                        const row = parseInt(parts[0]);
                        const col = parseInt(parts[1]);
                        const value = parseInt(parts[2]);
                        
                        if (isNaN(row) || isNaN(col) || isNaN(value)) {
                            throw new Error("Input file has wrong format");
                        }
                        
                        if (row < 0 || row >= this.numRows || col < 0 || col >= this.numCols) {
                            throw new Error(`Matrix indices out of bounds: (${row}, ${col})`);
                        }
                        
                        if (value !== 0) {
                            this.data.set(`${row},${col}`, value);
                        }
                    } catch (e) {
                        throw new Error("Input file has wrong format");
                    }
                }
            } catch (error) {
                if (error.code === 'ENOENT') {
                    throw new Error(`File not found: ${filePath}`);
                } else {
                    throw error;
                }
            }
        }
        
        getElement(row, col) {
            const key = `${row},${col}`;
            return this.data.has(key) ? this.data.get(key) : 0;
        }
        
        setElement(row, col, value) {
            if (row < 0 || row >= this.numRows || col < 0 || col >= this.numCols) {
                throw new Error(`Matrix indices out of bounds: (${row}, ${col})`);
            }
            
            const key = `${row},${col}`;
            if (value === 0) {
                this.data.delete(key);
            } else {
                this.data.set(key, value);
            }
        }
        
        add(other) {
            if (this.numRows !== other.numRows || this.numCols !== other.numCols) {
                throw new Error(`Matrix dimensions don't match for addition: ` +
                            `(${this.numRows}x${this.numCols}) + (${other.numRows}x${other.numCols})`);
            }
            
            const result = new SparseMatrix(null, this.numRows, this.numCols);
            for (const [key, value] of this.data.entries()) {
                const [row, col] = key.split(',').map(Number);
                result.setElement(row, col, value);
            }
            
            for (const [key, value] of other.data.entries()) {
                const [row, col] = key.split(',').map(Number);
                const current = result.getElement(row, col);
                result.setElement(row, col, current + value);
            }
            
            return result;
        }
        
        subtract(other) {
            if (this.numRows !== other.numRows || this.numCols !== other.numCols) {
                throw new Error(`Matrix dimensions don't match for subtraction: ` +
                            `(${this.numRows}x${this.numCols}) - (${other.numRows}x${other.numCols})`);
            }
            
            const result = new SparseMatrix(null, this.numRows, this.numCols);
            
            for (const [key, value] of this.data.entries()) {
                const [row, col] = key.split(',').map(Number);
                result.setElement(row, col, value);
            }
            
            for (const [key, value] of other.data.entries()) {
                const [row, col] = key.split(',').map(Number);
                const current = result.getElement(row, col);
                result.setElement(row, col, current - value);
            }
            
            return result;
        }
        
        multiply(other) {
            if (this.numCols !== other.numRows) {
                throw new Error(`Matrix dimensions don't match for multiplication: ` +
                            `(${this.numRows}x${this.numCols}) * (${other.numRows}x${other.numCols})`);
            }
            
            const result = new SparseMatrix(null, this.numRows, other.numCols);
            
            for (const [key1, val1] of this.data.entries()) {
                const [row1, col1] = key1.split(',').map(Number);
            
                for (let col2 = 0; col2 < other.numCols; col2++) {
                    let productSum = 0;
                    
                    const val2 = other.getElement(col1, col2);
                    if (val2 !== 0) {
                        productSum += val1 * val2;
                    }
                    
                    
                    if (productSum !== 0) {
                        const current = result.getElement(row1, col2);
                        result.setElement(row1, col2, current + productSum);
                    }
                }
            }
            
            return result;
        }
        
        toString() {
            let output = [`SparseMatrix(${this.numRows}x${this.numCols}):`];
            
            for (let i = 0; i < this.numRows; i++) {
                let row = [];
                for (let j = 0; j < this.numCols; j++) {
                    row.push(String(this.getElement(i, j)));
                }
                output.push(row.join(' '));
            }
            
            return output.join('\n');
        }
        
        toFile(filePath) {
            const fs = require('fs');
            
            let content = `rows=${this.numRows}\n`;
            content += `cols=${this.numCols}\n`;
            
            const entries = Array.from(this.data.entries())
                .map(([key, value]) => {
                    const [row, col] = key.split(',').map(Number);
                    return { row, col, value };
                })
                .sort((a, b) => a.row - b.row || a.col - b.col);
            
            for (const entry of entries) {
                content += `(${entry.row}, ${entry.col}, ${entry.value})\n`;
            }
            
            fs.writeFileSync(filePath, content);
        }
    }

    function main() {
        const fs = require('fs');
        const path = require('path');
        const readline = require('readline');
        
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        
        console.log("Sparse Matrix Operations");
        console.log("=======================");
        
        const sampleInputsDir = path.resolve(__dirname, "../../sample_inputs");
        const outputFile = path.resolve(__dirname, "../../sample_inputs/outputs.txt");
        
        let matrixFiles;
        try {
            matrixFiles = fs.readdirSync(sampleInputsDir)
                .filter(file => file.endsWith('.txt'))
                .map(file => path.join(sampleInputsDir, file));
            
            if (matrixFiles.length < 2) {
                console.error("Error: Need at least two matrix files in the ../sample_inputs directory");
                rl.close();
                return;
            }
        } catch (error) {
            console.error(`Error accessing sample_inputs directory: ${error.message}`);
            console.log("Make sure ../sample_inputs directory exists and contains matrix files.");
            rl.close();
            return;
        }
        
        
        console.log("\nAvailable matrix files:");
        matrixFiles.forEach((file, index) => {
            console.log(`${index + 1}. ${path.basename(file)}`);
        });
        
        rl.question("\nSelect first matrix (enter number): ", (choice1) => {
            const matrix1Index = parseInt(choice1) - 1;
            
            if (isNaN(matrix1Index) || matrix1Index < 0 || matrix1Index >= matrixFiles.length) {
                console.error("Invalid selection for first matrix");
                rl.close();
                return;
            }
            
            
            rl.question("Select second matrix (enter number): ", (choice2) => {
                const matrix2Index = parseInt(choice2) - 1;
                
                if (isNaN(matrix2Index) || matrix2Index < 0 || matrix2Index >= matrixFiles.length) {
                    console.error("Invalid selection for second matrix");
                    rl.close();
                    return;
                }
                
                const matrix1Path = matrixFiles[matrix1Index];
                const matrix2Path = matrixFiles[matrix2Index];
                
                try {
                    const matrix1 = new SparseMatrix(matrix1Path);
                    const matrix2 = new SparseMatrix(matrix2Path);
                    
                    console.log("\nMatrix 1:");
                    console.log(matrix1.toString());
                    
                    console.log("\nMatrix 2:");
                    console.log(matrix2.toString());
                    
                    console.log("\nSelect operation:");
                    console.log("1. Addition");
                    console.log("2. Subtraction");
                    console.log("3. Multiplication");
                    
                    rl.question("Enter your choice (1-3): ", (choice) => {
                        try {
                            let result;
                            let operationName;
                            
                            if (choice === '1') {
                                result = matrix1.add(matrix2);
                                operationName = "Addition";
                            } else if (choice === '2') {
                                result = matrix1.subtract(matrix2);
                                operationName = "Subtraction";
                            } else if (choice === '3') {
                                result = matrix1.multiply(matrix2);
                                operationName = "Multiplication";
                            } else {
                                console.log("Invalid choice");
                                rl.close();
                                return;
                            }
                            
                            console.log(`\nResult of ${operationName}:`);
                            console.log(result.toString());
                            
                            // ALL the data is stored in memory in the outputs.txt
                            result.toFile(outputFile);
                            console.log(`\nResult saved to ${outputFile}`);
                            rl.close();
                        } catch (error) {
                            console.error(`Error: ${error.message}`);
                            rl.close();
                        }
                    });
                } catch (error) {
                    console.error(`Error: ${error.message}`);
                    rl.close();
                }
            });
        });
    }

    if (require.main === module) {
        main();
    }

    module.exports = SparseMatrix;