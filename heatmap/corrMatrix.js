// Creating an object to store the close price data to be filtered by range later

let forexDataStore = {
  allData: [],

  loadData: function (files, callback) {
    let datasets = [];

    // Load each file
    files.forEach(function (file, index) {
      d3.csv(file, function (error, data) {
        if (error) throw error;

        // Extract currencyPair from the filename
        let currencyPair = file.split('-')[0];
        datasets[index] = {
          currencyPair: currencyPair,
          data: data
        };

        // Check if all files are loaded
        if (datasets.length === files.length && !datasets.includes(undefined)) {
          let joinedData = {};

          datasets.forEach(dataset => {
            dataset.data.forEach(row => {
              if (!joinedData[row.date]) {
                joinedData[row.date] = {};
              }
              joinedData[row.date][dataset.currencyPair] = +row.Close;
            });
          });

          // Convert back to array format
          forexDataStore.allData = Object.keys(joinedData).map(date => {
            let obj = { date: date };
            Object.assign(obj, joinedData[date]);
            return obj;
          });

          if (callback) callback(forexDataStore.allData);
        }
      });
    });
  },

  getMinDate: function () {
    return d3.min(this.allData, d => new Date(d.date));
  },

  getMaxDate: function () {
    return d3.max(this.allData, d => new Date(d.date));
  },

  filterByDateRange: function (startDate, endDate) {
    // If no dates are provided, default to the minimum and maximum dates
    startDate = startDate || this.getMinDate();
    endDate = endDate || this.getMaxDate();
    return this.allData.filter(d => new Date(d.date) >= new Date(startDate) && new Date(d.date) <= new Date(endDate));
  }

};

let files = [
  'AUDUSD-prepared.csv',
  'EURUSD-prepared.csv',
  'GBPUSD-prepared.csv',
  'NZDUSD-prepared.csv',
  'USDCAD-prepared.csv',
  'USDCHF-prepared.csv',
  'USDJPY-prepared.csv'
];

// Load and join the data
forexDataStore.loadData(files, function (loadedData) {
  console.log("Data Loaded:", loadedData);

  // Later in your code, when you want to filter by a date range:
  let filteredData = forexDataStore.filterByDateRange('2022-01-01', '2022-06-30');
  console.log("Filtered Data:", filteredData);
});

// ========== CORRELATION MATRIX ==========

function mean(data) {
  return data.reduce((a, b) => a + b) / data.length;
}

function standardDeviation(data) {
  const m = mean(data);
  return Math.sqrt(data.reduce((sum, value) => sum + (value - m) * (value - m), 0) / data.length);
}

function correlationCoefficient(x, y) {
  const meanX = mean(x);
  const meanY = mean(y);
  const stdX = standardDeviation(x);
  const stdY = standardDeviation(y);

  const n = x.length;
  let num = 0;
  for (let i = 0; i < n; i++) {
    num += (x[i] - meanX) * (y[i] - meanY);
  }

  return num / (n * stdX * stdY);
}

function computeCorrelationMatrix(data) {
  const currencyPairs = Object.keys(data[0]).filter(d => d !== 'date');
  const matrix = [];

  for (let i = 0; i < currencyPairs.length; i++) {
    matrix[i] = [];
    for (let j = 0; j < currencyPairs.length; j++) {
      if (i === j) {
        matrix[i][j] = 1;  // diagonal is always 1, as data is perfectly correlated with itself
      } else {
        const x = data.map(d => d[currencyPairs[i]]);
        const y = data.map(d => d[currencyPairs[j]]);
        matrix[i][j] = correlationCoefficient(x, y);
      }
    }
  }

  return matrix;
}

console.log(computeCorrelationMatrix(forexDataStore.allData))