// https://gist.github.com/HarryStevens/302d078a089caf5aeb13e480b86fdaeb

const stats = require('stats.js');

const data = [[1, 2, 3], [4, 5, 6], [7, 8, 9]];

const correlationMatrix = new Array(data.length).fill(new Array(data.length).fill(0));

for (let i = 0; i < data.length; i++) {
  for (let j = 0; j < data.length; j++) {
    const x = data[i];
    const y = data[j];

    // Calculate the Pearson correlation coefficient.
    correlationMatrix[i][j] = stats.PearsonCC(x, y);
  }
}
