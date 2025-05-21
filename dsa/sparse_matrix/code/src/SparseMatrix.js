const fs = require('fs');

class SparseMatrix {
  constructor(filePathOrConfig) {
    this.data = new Map();

    if (!filePathOrConfig) {
      throw new Error("SparseMatrix constructor requires a file path or config object");
    }

    // If a file path is provided
    if (typeof filePathOrConfig === 'string') {
      const content = fs.readFileSync(filePathOrConfig, 'utf-8');
      const lines = content.split('\n').map(line => line.trim()).filter(line => line);

      // Validate first two lines
      if (!lines[0]?.startsWith('rows=') || !lines[1]?.startsWith('cols=')) {
        throw new Error('Input file has wrong format (missing rows= or cols=)');
      }

      this.rows = parseInt(lines[0].split('=')[1]);
      this.cols = parseInt(lines[1].split('=')[1]);

      // Parse matrix values
      for (let i = 2; i < lines.length; i++) {
        const match = lines[i].match(/^\((\d+),\s*(\d+),\s*(-?\d+)\)$/);
        if (!match) {
          throw new Error(`Invalid format on line ${i + 1}: "${lines[i]}"`);
        }
        const [_, r, c, v] = match;
        const key = `${r},${c}`;
        this.data.set(key, parseInt(v));
      }

    } 
    // If a config object is passed (for operations)
    else if (typeof filePathOrConfig === 'object') {
      const { rows, cols, data } = filePathOrConfig;
      if (typeof rows !== 'number' || typeof cols !== 'number') {
        throw new Error("Invalid config: rows and cols must be numbers");
      }
      this.rows = rows;
      this.cols = cols;
      this.data = new Map(data || []);
    } 
    else {
      throw new Error("SparseMatrix expects a file path (string) or config object");
    }
  }

  getElement(r, c) {
    return this.data.get(`${r},${c}`) || 0;
  }

  setElement(r, c, val) {
    const key = `${r},${c}`;
    if (val === 0) {
      this.data.delete(key);
    } else {
      this.data.set(key, val);
    }
  }
}

module.exports = SparseMatrix;
