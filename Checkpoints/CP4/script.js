// Declare a variable to hold the loaded JSON data.
var globalData;

// Define margins for the visualizations. 
const margin = { top: 20, right: 20, bottom: 50, left: 80 };

// Calculate the width and height of the visualizations based on the margins.
const width = 600 - margin.left - margin.right;
const height = 400 - margin.top - margin.bottom;
const center = height / 2

function startDashboard() {
    // Load the CSV data using D3.js.
    d3.csv("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/heatmap_data.csv")
        .then((data) => {
            // Once the data is loaded successfully, store it in the globalData variable.
            globalData = data;

            svg.selectAll()
                .data(data, function (d) { return d.group + ':' + d.variable; })
                .join("rect")
                .attr("x", function (d) { return x(d.group) })
                .attr("y", function (d) { return y(d.variable) })
                .attr("width", x.bandwidth())
                .attr("height", y.bandwidth())
                .style("fill", function (d) { return myColor(d.value) })

        })
        .catch((error) => {
            // If there's an error while loading the JSON data, log the error.
            console.error("Error loading the CSV file:", error);
        });
}