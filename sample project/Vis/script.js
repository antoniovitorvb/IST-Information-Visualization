const margin = { top: 20, right: 30, bottom: 40, left: 50 };
var width = 710 - margin.left - margin.right;
var height = 400 - margin.top - margin.bottom;
let mouseClick = "Select a country";
let targetSelected = "Select the Target Type";
let attackSelected = "Select the Attack Type";
var range_years = [1970, 2017];
var drawn = false

function init() {
  createCountriesBtn();
  createChoropleth("#vi1");
  createLineChart("#vi2");
  createMatrix("#vi3");
  createBoxplot("#vi4");
}

function myFunction() {
  document.getElementById("myDropdown").classList.toggle("show");
}

function createCountriesBtn() {
  d3.json("globalterrorism.json").then(function (data) {
    let countries = data.map((d) => d.country_txt);
    let uniqueCountries = [...new Set(countries)];

    let targetTypes = data.map((d) => d.targtype1_txt);
    let uniqueTargetTypes = [...new Set(targetTypes)];

    let attackTypes = data.map((d) => d.attacktype1_txt);
    let uniqueAttackTypes = [...new Set(attackTypes)];

    d3.select("#selectButton")
      .style("title", "Choose a country")
      .style("width", "230px")
      .style("height", "40px")
      .selectAll("myOptions")
      .data(uniqueCountries.sort())
      .enter()
      .append("option")
      .text(function (d) {
        return d;
      }) // text showed in the menu
      .attr("value", function (d) {
        return d;
      }); // corresponding value returned by the button

    d3.select("#selectAttackType")
      .style("title", "Choose an attack type")
      .style("width", "230px")
      .style("height", "40px")
      .selectAll("myOptions")
      .data(uniqueAttackTypes.sort())
      .enter()
      .append("option")
      .text(function (d) {
        return d;
      }) // text showed in the menu
      .attr("value", function (d) {
        return d;
      });

    d3.select("#selectTargetType")
      .style("title", "Choose a target type")
      .style("width", "230px")
      .style("height", "40px")
      .selectAll("myOptions")
      .data(uniqueTargetTypes.sort())
      .enter()
      .append("option")
      .text(function (d) {
        return d;
      }) // text showed in the menu
      .attr("value", function (d) {
        return d;
      });
  });
}
function updateMap() {
  // Map and projection
  var projection = d3
    .geoMercator()
    .scale(110)
    .center([-80, 85])
    .translate([220, -10]);

  Promise.all([
    d3.json(
      "world.geojson"
    ),
    d3.json("globalterrorism.json").then(function (newData) {
      data = [];
      var countries = newData.map((d) => d.country_txt);
      var countriesPerYear = newData.filter(
        (d) => d.iyear >= range_years[0] && d.iyear <= range_years[1]
      );
      var targetFilter =
        targetSelected === "Select the Target Type"
          ? countriesPerYear
          : countriesPerYear.filter((d) => d.targtype1_txt === targetSelected);
      var attackFilter =
        attackSelected === "Select the Attack Type"
          ? targetFilter
          : targetFilter.filter((d) => d.attacktype1_txt === attackSelected);
      attackFilter = attackFilter.map((d) => d.country_txt);
      let uniqueCountries = [...new Set(countries)];
      for (let i = 0; i < uniqueCountries.length; i++) {
        data.push({
          name: uniqueCountries[i],
          count: getOccurrenceCountry(attackFilter, uniqueCountries[i]),
        });
      }
    }),
  ]).then(function (loadData) {
    const colorScale = d3
      .scaleSequential()
      .domain([0, 9000])
      .interpolator(d3.interpolate("rgb(230,230,250)", "rgb(189, 0, 0)"));

    let topo = loadData[0];

    //update tooltip
    var total = data.find((a) => a.name == mouseClick)?.count || 0;
    d3.select(".map").html(
      "Number of cases in " + mouseClick + ":<br/>" + total
    );

    // Draw the map
    d3.select("#vi1")
      .select("g")
      //.append("g")
      .selectAll("path")
      .data(topo.features)
      .join("path")
      // draw each country
      .attr("d", d3.geoPath().projection(projection))
      .transition()
      .duration(300)
      // set the color of each country
      .attr("fill", function (d, i) {
        d.total = data.find((a) => a.name == d.properties.name)?.count || 0;
        return colorScale(d.total);
      })
      //mouseover and highligth the countries and tooltip
      .attr("class", function (d) {
        return "Country " + d.properties.name;
      });
  });
}

let data = [];
function createChoropleth(id) {
  // The svg
  var svg = d3.select(id),
    width = +svg.attr("width"),
    height = +svg.attr("height");

  // Map and projection
  var projection = d3
    .geoMercator()
    .scale(110)
    .center([-80, 85])
    .translate([220, -10]);

  // create color scale
  const colorScale = d3
    .scaleSequential()
    .domain([0, 9000])
    .interpolator(d3.interpolate("rgb(230,230,250)", "rgb(189, 0, 0)"));

  // create legend
  var linearScale = d3.scaleLinear().domain([0, 100]).range([0, 100]);
  var sequentialScale = d3
    .scaleSequential()
    .domain([0, 45])
    .interpolator(d3.interpolate("rgb(230,230,250)", "rgb(189, 0, 0)"));
  var myData = d3.range(0, 100);
  function legend(d) {
    d3.select(this)
      .selectAll("rect")
      .data(myData)
      .join("rect")
      .attr("x", function (d) {
        return linearScale(d) + 40;
      })
      .attr("y", 400)
      .attr("width", 10)
      .attr("height", 15)
      .style("fill", function (d) {
        return sequentialScale(d);
      });
  }
  svg.each(legend);
  svg
    .append("rect")
    .attr("x", 41)
    .attr("y", 400)
    .attr("width", 108)
    .attr("height", 15)
    .attr("fill", "transparent")
    .attr("stroke", "white");
  svg
    .append("text")
    .attr("x", 75)
    .attr("y", 390)
    .text("Cases")
    .style("fill", "white")
    .style("font-size", "15px");
  svg
    .append("rect")
    .attr("x", 40)
    .attr("y", 395)
    .attr("width", 1)
    .style("fill", "white")
    .attr("height", 20);
  svg
    .append("text")
    .attr("x", 37)
    .attr("y", 390)
    .text("0")
    .style("fill", "white")
    .style("font-size", "10px");
  svg
    .append("rect")
    .attr("x", 149)
    .attr("y", 395)
    .attr("width", 1)
    .style("fill", "white")
    .attr("height", 20);
  svg
    .append("text")
    .attr("x", 135)
    .attr("y", 390)
    .text("9000+")
    .style("fill", "white")
    .style("font-size", "10px");

  // Load external data and boot
  Promise.all([
    d3.json(
      "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson"
    ),
    d3.json("globalterrorism.json").then(function (newData) {
      let countries = newData.map((d) => d.country_txt);
      let uniqueCountries = [...new Set(countries)];
      for (let i = 0; i < uniqueCountries.length; i++) {
        data.push({
          name: uniqueCountries[i],
          count: getOccurrenceCountry(countries, uniqueCountries[i]),
        });
      }
    }),
  ]).then(function (loadData) {
    let topo = loadData[0];
    var div = d3
      .select("body")
      .append("div")
      .attr("class", "tooltip map")
      .style("opacity", 0);

    // Draw the map
    svg
      .append("g")
      .selectAll("path")
      .data(topo.features)
      .join("path")
      // draw each country
      .attr("d", d3.geoPath().projection(projection))
      // set the color of each country
      .attr("fill", function (d, i) {
        d.total = data.find((a) => a.name == d.properties.name)?.count || 0;
        return colorScale(d.total);
      })

      //mouseover and highligth the countries and tooltip
      .style("stroke", "transparent")
      .style("opacity", 1)
      .attr("class", function (d) {
        return "Country " + d.properties.name;
      })
      .on("click", function (event, d) {
        let selected = d3.select("#selectButton").property("value");
        if (mouseClick === selected) {
          if (mouseClick === d.properties.name) {
            mouseClick = "Select a country";
            d3.select("#selectButton").property("value", "Select a country");
          } else {
            d3.select("#selectButton").property("value", d.properties.name);
            d3.selectAll(".Country")
              .transition()
              .duration(200)
              .style("opacity", 0.4)
              .style("stroke", "transparent");
            d3.select(this)
              .transition()
              .duration(200)
              .style("opacity", 1)
              .style("stroke", "white");
            div.transition().duration(200).style("opacity", 0.8);
            div
              .html(
                "Number of cases in " + d.properties.name + ":<br/>" + d.total
              )
              .style("left", event.pageX + "px")
              .style("top", event.pageY + "px");
            mouseClick = d.properties.name;
          }
        } else {
          d3.select("#selectButton").property("value", d.properties.name);
          d3.selectAll(".Country")
            .transition()
            .duration(200)
            .style("opacity", 0.4)
            .style("stroke", "transparent");
          d3.select(this)
            .transition()
            .duration(200)
            .style("opacity", 1)
            .style("stroke", "white");
          div.transition().duration(200).style("opacity", 0.8);
          div
            .html(
              "Number of cases in " + d.properties.name + ":<br/>" + d.total
            )
            .style("left", event.pageX + "px")
            .style("top", event.pageY + "px");
          mouseClick = d.properties.name;
        }
      })
      .on("mouseover", function (event, d) {
        if (mouseClick === "Select a country") {
          d3.selectAll(".Country")
            .transition()
            .duration(200)
            //.style("opacity", 0.4)
            .style("stroke", "transparent");
          d3.select(this)
            .transition()
            .duration(200)
            //.style("opacity", 1)
            .style("stroke", "purple")
           
          div.transition().duration(200).style("opacity", 0.8);
          div
            .html(
              "Number of cases in " + d.properties.name + ":<br/>" + d.total
            )
            .style("left", event.pageX + "px")
            .style("top", event.pageY + "px");
        }
      })
      .on("mouseout", function (d) {
        if (mouseClick === "Select a country") {
          d3.selectAll(".Country")
            .transition()
            .duration(200)
            .style("stroke", "transparent")
            .style("opacity", 1);
          d3.select(this)
            .transition()
            .duration(200)
            .style("stroke", "transparent")
            .style("opacity", 1);
          div.transition().duration(500).style("opacity", 0);
        }
      });
  });

  // Create window
  svg
    .append("rect")
    .attr("x", 0)
    .attr("y", 10)
    .attr("width", 745)
    .attr("height", 460)
    .attr("fill", "transparent")
    .attr("stroke", "white");
}

function createSlider(uniqueYears, x, y, svgLineChart, maxY) {
  var sliderRange = d3
    .sliderBottom()
    .min(d3.min(uniqueYears))
    .max(d3.max(uniqueYears))
    .width(300)
    .tickFormat(d3.format(""))
    .ticks(5)
    .default([0, d3.max(uniqueYears)])
    .step(1)
    .fill("rgb(230,230,250)")
    .on("onchange", (val) => {
      d3.select("p#value-range").text(
        "Year Range: " + val.map(d3.format("")).join("-")
      );
      range_years = sliderRange.value();
    })
    .on("end", (val) => {
      range_years = sliderRange.value();
      updateMap();
      updateMatrix(mouseClick);
      updateBoxplot(mouseClick, targetSelected, attackSelected);
      opacityChart(x, svgLineChart, true);
    });

  var gRange = d3
    .select("div#slider-range")
    .append("svg")
    .attr("width", 370)
    .attr("height", 50)
    .append("g")
    .attr("transform", "translate(30, 7)");
  gRange.call(sliderRange);

  d3.select("p#value-range").text(
    "Year Range: " + sliderRange.value().map(d3.format("")).join("-")
  );
}
function opacityChart(x, svgLineChart, rangeUpdated) {
  let duration = rangeUpdated ? 200 : 0;

  svgLineChart
    .selectAll(".opacityYear")
    .style("opacity", 0.9)
    .transition()
    .duration(duration)
    .style("opacity", 0)
    .remove();

  svgLineChart
    .append("rect")
    .attr("width", x(range_years[0]) - x(1970))
    .attr("height", 215)
    .attr("x", x(1970) - 5)
    .attr("y", -5)
    .attr("fill", "#222222")
    .attr("class", "opacityYear")
    .style("opacity", 0)
    .transition()
    .duration(duration)
    .style("opacity", 0.9);
  svgLineChart
    .append("rect")
    .attr("width", x(2017) - x(range_years[1]))
    .attr("height", 215)
    .attr("x", x(range_years[1]) + 5)
    .attr("y", -5)
    .attr("fill", "#222222")
    .attr("class", "opacityYear")
    .style("opacity", 0)
    .transition()
    .duration(duration)
    .style("opacity", 0.9);
}

function drawIfNoCases() {
  d3.select('#vi4')
    .append("rect")
    .attr("x", 55)
    .attr("y", 20)
    .attr("width", 670)
    .attr("height", 210)
    .attr("fill", "#222222")
    .attr("class", "opacityBoxplot")
    .style("opacity", 0)
    .transition()
    .duration(200)
    .style("opacity", 1)

    d3.select('#vi4')
    .append('text')
    .attr("class", "opacityBoxplot")
    .attr("x", 160)
    .attr("y", 150)
    .text("No Cases to Preview")
    .style("font-size", "50px")
    .style("fill", "white")
}

function unDraw(){
  d3.selectAll('.opacityBoxplot')
  .transition()
  .duration(200)
  .style("opacity", 0)
  .remove()
}

function createLineChart(id) {
  var div1 = d3
    .select("body")
    .append("div")
    .attr("class", "tooltip div1")
    .style("opacity", 0);

  var div2 = d3
    .select("body")
    .append("div")
    .attr("class", "tooltip div2")
    .style("opacity", 0);

  //Create the svg
  const svg = d3
    .select(id)
    .append("g")
    .attr("id", "gLineChart")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  //Load the data
  d3.json("globalterrorism.json").then(function (data) {
    let years = data.map((d) => d.iyear);
    years.push(1993);
    let uniqueYears = [...new Set(years)].sort();

    //Create the x axis.domain([0
    var x = d3
      .scalePoint()
      .domain(Array.from(uniqueYears))
      .range([0, width + 40]);

    // Add the X Axis
    svg
      .append("g")
      .attr("class", "gXAxis")
      .attr("transform", "translate(0," + height / 2 + ")")
      .call(d3.axisBottom(x).tickValues(x.domain().filter((d, i) => !(i % 5))))
      .selectAll("text")
      .style("text-anchor", "end")
      .attr("dx", "-1em")
      .attr("dy", "-0.5em")
      .attr("transform", "rotate(-90)");

    let countYearOccurences = [];
    for (let i = 0; i < uniqueYears.length; i++) {
      countYearOccurences.push(getOccurrence(years, uniqueYears[i]));
    }

    //Create the y axis
    var y = d3
      .scaleLinear()
      .domain([0, d3.max(countYearOccurences)])
      .range([height / 2, 0]);

    //Add the y Axis
    svg
      .append("g")
      .attr("class", "gYAxis")
      .call(d3.axisLeft(y).tickFormat((x) => (x > 1000 ? x / 1000 + "k" : x)));

    

    //Create the line
    var line = svg
      .append("path")
      .datum(uniqueYears)
      .attr("class", "lineChart")
      .attr("fill", "none")
      .attr("stroke", "white")
      .attr("stroke-width", 1.5)
      .attr(
        "d",
        d3
          .line()
          .defined(function (d, i) {
            return uniqueYears[i] !== 1993;
          })
          .x(function (d, i) {
            return x(uniqueYears[i]);
          })
          .y(function (d, i) {
            return y(countYearOccurences[i]);
          })
      );

    //Create the dots in the line
    var dots = svg
      .selectAll("circle")
      .data(uniqueYears)
      .join("circle")
      .attr("class", "circleCount")
      .attr("cx", function (d, i) {
        return x(uniqueYears[i]);
      })
      .attr("cy", function (d, i) {
        return y(countYearOccurences[i]);
      })
      .filter(function (d, i) {
        return countYearOccurences[i] !== 0;
      })
      .attr("r", 2)
      .style("fill", "white")
      .style("stroke", "white");

    svg
      .selectAll(".circleCount")
      .on("mouseover", function (event, d) {
        let index;
        for (let i = 0; i < uniqueYears.length; i++) {
          if (d === uniqueYears[i]) {
            index = i;
          }
        }
        div1.transition().duration(200).style("opacity", 0.8);
        div1
          .html("Cases in " + d + ": " + "<br/>" + countYearOccurences[index])
          .style("left", event.pageX + 2 + "px")
          .style("top", event.pageY - 43 + "px");
      })
      .on("mouseout", function (d) {
        div1.transition().duration(200).style("opacity", 0);
      });

    //Create the dots representing death
    let deaths = [];
    for (let i = 0; i < uniqueYears.length; i++) {
      let kills = 0;
      for (let j = 0; j < data.length; j++) {
        if (data[j].iyear === uniqueYears[i]) {
          kills += data[j].nkill;
        }
      }
      deaths.push({ year: uniqueYears[i], nkills: kills });
    }

    let pointsNumber = [];
    for (let i = 0; i < uniqueYears.length; i++) {
      pointsNumber.push({
        year: uniqueYears[i],
        points: Math.ceil(deaths[i].nkills / 1000),
      });
    }

    for (let i = 0; i < pointsNumber.length; i++) {
      for (let j = 0; j < pointsNumber[i].points; j++) {
        svg
          .append("circle")
          .attr("class", "circleValues purplePoints" + pointsNumber[i].year)
          .attr("cx", x(pointsNumber[i].year))
          .attr(
            "cy",
            y(
              ((j + 1) * d3.max(countYearOccurences)) / 22 -
                d3.max(countYearOccurences) / 22
            )
          )
          .attr("r", 3)
          .style("fill", "rgb(160, 0, 0)")
          .style("stroke", "rgb(160, 0, 0)")
          .style("opacity", 1)
          .on("mouseover", (event, d) =>
            handleMouseOver(pointsNumber, i, event, div2, deaths)
          )
          .on("mouseleave", (event, d) =>
            handleMouseLeave(pointsNumber, i, div2)
          );
      }
    }

    //Create the dots info
    svg
      .append("circle")
      .attr("cx", x(1970))
      .attr("cy", height / 2 + 53)
      .attr("r", 3)
      .style("fill", "rgb(160, 0, 0)");
    svg
      .append("text")
      .attr("x", x(1970) + 5)
      .attr("y", height / 2 + 53)
      .text("~1000 deaths")
      .style("fill", "white")
      .style("font-size", "10px")
      .attr("alignment-baseline", "middle");

    //Create the x-axis info
    svg
      .append("text")
      .attr("x", width / 2)
      .attr("y", height / 2 + 45)
      .text("Year")
      .style("fill", "white")
      .style("font-size", "15px")
      .attr("alignment-baseline", "middle");

    //Create the y-axis info
    svg
      .append("text")
      .attr("x", width / 2 - 400)
      .attr("y", height / 4 - 110)
      .text("Cases")
      .style("fill", "white")
      .style("font-size", "15px")
      .attr("alignment-baseline", "middle")
      .attr("dx", "-1em")
      .attr("dy", "-0.5em")
      .attr("transform", "rotate(-90)");

    //Missing 1993 info
    svg
      .append("text")
      .attr("x", x(1993) - 5)
      .attr("y", y(0))
      .text("*")
      .style("fill", "white")
      .style("font-size", "20px")
      .attr("alignment-baseline", "middle");
    svg
      .append("text")
      .attr("x", x(2010))
      .attr("y", height / 2 + 53)
      .text("*Missing data from 1993")
      .style("fill", "white")
      .style("font-size", "10px")
      .attr("alignment-baseline", "middle");

    d3.select("#vi1").on("click", function (d) {
      var selectedOption = d3.select("#selectButton").property("value");
      updateLineChart();
      updateMatrix(mouseClick);
      updateBoxplot(mouseClick, targetSelected, attackSelected);
    });

    d3.select("#selectButton").on("change", function (d) {
      // recover the option that has been chosen
      var selectedOption = d3.select(this).property("value");
      updateLineChart();
      updateMatrix(selectedOption);
      updateBoxplot(selectedOption, targetSelected, attackSelected);

      // run the updateChart function with this selected option
      if (selectedOption !== "Select a country") {
        d3.select("#vi1")
          .selectAll(".Country")
          .transition()
          .duration(200)
          .style("opacity", 0.4)
          .style("stroke", "transparent");
        d3.selectAll(".Country")
          .filter((d) => d.properties.name === selectedOption)
          .transition()
          .duration(200)
          .style("opacity", 1)
          .style("stroke", "white");
        d3.selectAll(".map").transition().duration(200).style("opacity", 0.8);
        let countries = data.map((d) => d.country_txt);
        d3.selectAll(".map")
          .html(
            "Number of cases in " +
              selectedOption +
              ":<br/>" +
              getOccurrenceCountry(countries, selectedOption)
          )
          .style(
            "left",
            d3
              .select("." + selectedOption)
              .node()
              .getBoundingClientRect().left + "px"
          )
          .style(
            "top",
            d3
              .select("." + selectedOption)
              .node()
              .getBoundingClientRect().top + "px"
          );
      } else {
        d3.select("#vi1")
          .selectAll(".Country")
          .transition()
          .duration(200)
          .style("opacity", 1)
          .style("stroke", "transparent");
        d3.selectAll(".map").transition().duration(200).style("opacity", 0);
      }
      mouseClick = selectedOption;
    });

    createSlider(uniqueYears, x, y, svg, d3.max(countYearOccurences));
  });
  // Create window
  svg
    .append("rect")
    .attr("x", -50)
    .attr("y", -10)
    .attr("width", 745)
    .attr("height", 250)
    .attr("fill", "transparent")
    .attr("stroke", "white");
}

function getOccurrenceCountry(array, value) {
  return array.filter((v) => v === value).length;
}

function getOccurrence(array, value) {
  return value !== 1993 ? array.filter((v) => v === value).length : 0;
}

function updateLineChart() {
  div1 = d3.select(".div1");
  div2 = d3.select(".div2");
  svg = d3.select("#vi2").select("g");
  line = d3.selectAll(".lineChart");
  dots = d3.selectAll(".circleCount");

  d3.json("globalterrorism.json").then(function (data) {
    let years = data.map((d) => d.iyear);
    years.push(1993);
    let uniqueYears = [...new Set(years)].sort();

    var x = d3
      .scalePoint()
      .domain(Array.from(uniqueYears))
      .range([0, width + 40]);

    // Create new data with the selection?
    var dataFilter =
      mouseClick === "Select a country"
        ? data
        : data.filter((d) => d.country_txt === mouseClick);
    var targetFilter =
      targetSelected === "Select the Target Type"
        ? dataFilter
        : dataFilter.filter((d) => d.targtype1_txt === targetSelected);
    var attackFilter =
      attackSelected === "Select the Attack Type"
        ? targetFilter
        : targetFilter.filter((d) => d.attacktype1_txt === attackSelected);

    let yearsPerCountry = attackFilter.map((d) => d.iyear);
    yearsPerCountry.push(1993);

    let countYearOccurencesPerCountry = [];
    for (let i = 0; i < uniqueYears.length; i++) {
      countYearOccurencesPerCountry.push(
        getOccurrence(yearsPerCountry, uniqueYears[i])
      );
    }

    let deaths = [];

    if (mouseClick === "Select a country") {
      for (let i = 0; i < uniqueYears.length; i++) {
        let kills = 0;
        for (let j = 0; j < attackFilter.length; j++) {
          if (attackFilter[j].iyear === uniqueYears[i]) {
            kills += attackFilter[j].nkill;
          }
        }
        deaths.push({ year: uniqueYears[i], nkills: kills });
      }
    } else {
        for (let i = 0; i < uniqueYears.length; i++) {
          let kills = 0;
          for (let j = 0; j < attackFilter.length; j++) {
            if (
              attackFilter[j].country_txt === mouseClick &&
              attackFilter[j].iyear === uniqueYears[i]
            ) {
              kills += attackFilter[j].nkill;
            }
          }
          deaths.push({ year: uniqueYears[i], nkills: kills });
        }
    }

    let pointsNumberPerCountry = [];
    for (let i = 0; i < uniqueYears.length; i++) {
      pointsNumberPerCountry.push({
        year: uniqueYears[i],
        points: Math.ceil(deaths[i].nkills / 1000),
      });
    }

    var y = d3
      .scaleLinear()
      .domain([0, d3.max(countYearOccurencesPerCountry)])
      .range([height / 2, 0]);

    svg
      .selectAll(".gYAxis")
      .transition()
      .duration(2000)
      .call(d3.axisLeft(y).tickFormat((x) => (x >= 1000 ? x / 1000 + "k" : x)));

    d3.selectAll("circle.circleValues")
      .transition()
      .duration(1000)
      .style("opacity", 0)
      .remove();

    for (let i = 0; i < pointsNumberPerCountry.length; i++) {
      for (let j = 0; j < pointsNumberPerCountry[i].points; j++) {
        svg
          .append("circle")
          .attr(
            "class",
            "circleValues purplePoints" + pointsNumberPerCountry[i].year
          )
          .attr("cx", x(pointsNumberPerCountry[i].year))
          .attr(
            "cy",
            y(
              ((j + 1) * d3.max(countYearOccurencesPerCountry)) / 22 -
                d3.max(countYearOccurencesPerCountry) / 22
            )
          )
          .attr("r", 3)
          .style("fill", "rgb(160, 0, 0)")
          .style("stroke", "rgb(160, 0, 0)")
          .style("opacity", 1)
          .on("mouseover", (event, d) =>
            handleMouseOver(pointsNumberPerCountry, i, event, div2, deaths)
          )
          .on("mouseleave", (event, d) =>
            handleMouseLeave(pointsNumberPerCountry, i, div2)
          );
      }
    }

    // Give these new data to update line
    line
      .datum(uniqueYears)
      .transition()
      .duration(1000)
      .attr(
        "d",
        d3
          .line()
          .defined(function (d, i) {
            return uniqueYears[i] !== 1993;
          })
          .x(function (d, i) {
            return x(uniqueYears[i]);
          })
          .y(function (d, i) {
            return y(countYearOccurencesPerCountry[i]);
          })
      );
    dots
      .data(uniqueYears)
      .transition()
      .duration(1000)
      .attr("cx", function (d, i) {
        if (i >= 23) {
          return x(uniqueYears[i + 1]);
        } else {
          return x(uniqueYears[i]);
        }
      })
      .attr("cy", function (d, i) {
        if (i >= 23) {
          return y(countYearOccurencesPerCountry[i + 1]);
        } else {
          return y(countYearOccurencesPerCountry[i]);
        }
      });

    svg
      .selectAll(".circleCount")
      .on("mouseover", function (event, d) {
        let index;
        let year;
        for (let i = 0; i < uniqueYears.length; i++) {
          if (i >= 23) {
            if (d === uniqueYears[i]) {
              year = d + 1;
              index = i + 1;
            }
          } else {
            if (d === uniqueYears[i]) {
              year = d;
              index = i;
            }
          }
        }
        div1.transition().duration(200).style("opacity", 0.8);
        div1
          .html(
            "Cases in " +
              year +
              ": " +
              "<br/>" +
              countYearOccurencesPerCountry[index]
          )
          .style("left", event.pageX + 2 + "px")
          .style("top", event.pageY - 43 + "px");
      })
      .on("mouseout", function (d) {
        div1.transition().duration(200).style("opacity", 0);
      });
    opacityChart(x, svg, false);
  });
}

function handleMouseOver(pointNumbers, pos, event, div2, deathsPerYear) {
  d3.selectAll("circle.circleValues")
    .transition()
    .duration(200)
    .style("opacity", 0.3)
    .style("stroke", "transparent");
  d3.selectAll(".purplePoints" + pointNumbers[pos].year)
    .transition()
    .duration(200)
    .style("opacity", 1)
    .style("stroke", "transparent");
  div2.transition(pointNumbers[pos].year).duration(200).style("opacity", 0.8);
  div2
    .html(
      "Total deaths in " +
        pointNumbers[pos].year +
        ":" +
        "<br>" +
        deathsPerYear[pos].nkills +
        "<br/>"
    )
    .style("left", event.pageX + 2 + "px")
    .style("top", event.pageY - 43 + "px");
}

function handleMouseLeave(pointNumbers, pos, div2) {
  d3.selectAll("circle.circleValues")
    .transition()
    .duration(200)
    .style("opacity", 1)
    .style("stroke", "transparent");
  d3.selectAll(".purplePoints" + pointNumbers[pos].year)
    .transition()
    .duration(200)
    .style("stroke", "transparent")
    .style("opacity", 1);
  div2.transition().duration(200).style("opacity", 0);
}

function createBoxplot(id) {
  var div = d3
    .select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);
  // append the svg object to the body of the page
  var svg = d3
    .select(id)
    .append("svg")
    .append("g")
    .attr("transform", "translate(" + (margin.left +20) + "," + margin.top + ")");

  d3.json("globalterrorism.json").then(function (data) {
    let quartersPerYear = [];
    let years = data.map((d) => d.iyear);
    //years.push(1993);
    let uniqueYears = [...new Set(years)].sort();

    //Create the array with the years and the quarters
    for (let i = 0; i < uniqueYears.length; i++) {
      let quarter = [];
      for (let j = 0; j < 4; j++) {
        quarter[j] = 0;
        quartersPerYear["." + uniqueYears[i]] = quarter;
      }
    }

    //Populate dictionary
    for (let i = 0; i < uniqueYears.length; i++) {
      for (let j = 0; j < data.length; j++) {
        if ("." + data[j].iyear === "." + uniqueYears[i]) {
          quartersPerYear["." + uniqueYears[i]][data[j].trimester - 1] += 1;
        }
      }
    }
    var quarter1 = [];
    var quarter2 = [];
    var quarter3 = [];
    var quarter4 = [];


    for (let i = 0; i < uniqueYears.length; i++) {
      quarter1.push(quartersPerYear["." + uniqueYears[i]][0]);
      quarter2.push(quartersPerYear["." + uniqueYears[i]][1]);
      quarter3.push(quartersPerYear["." + uniqueYears[i]][2]);
      quarter4.push(quartersPerYear["." + uniqueYears[i]][3]);
    }


    // Compute summary statistics used for the box:
    var qsum1 = quarter1.reduce((partialSum, a) => partialSum + a, 0);
    var qsum2 = quarter2.reduce((partialSum, a) => partialSum + a, 0);
    var qsum3 = quarter3.reduce((partialSum, a) => partialSum + a, 0);
    var qsum4 = quarter4.reduce((partialSum, a) => partialSum + a, 0);

    var q11 = d3.quantile(quarter1, 0.25);
    var median1 = d3.quantile(quarter1, 0.5);
    var q31 = d3.quantile(quarter1, 0.75);
    var interQuantileRange1 = q31 - q11;
    var min1 =
      q11 - 1.5 * interQuantileRange1 > 0 ? q11 - 1.5 * interQuantileRange1 : 0;
    var max1 = q31 + 1.5 * interQuantileRange1;

    var q12 = d3.quantile(quarter2, 0.25);
    var median2 = d3.quantile(quarter2, 0.5);
    var q32 = d3.quantile(quarter2, 0.75);
    var interQuantileRange2 = q32 - q12;
    var min2 =
      q12 - 1.5 * interQuantileRange2 > 0 ? q12 - 1.5 * interQuantileRange2 : 0;
    var max2 = q32 + 1.5 * interQuantileRange2;

    var q13 = d3.quantile(quarter3, 0.25);
    var median3 = d3.quantile(quarter3, 0.5);
    var q33 = d3.quantile(quarter3, 0.75);
    var interQuantileRange3 = q33 - q13;
    var min3 =
      q13 - 1.5 * interQuantileRange3 > 0 ? q13 - 1.5 * interQuantileRange3 : 0;
    var max3 = q33 + 1.5 * interQuantileRange3;

    var q14 = d3.quantile(quarter4, 0.25);
    var median4 = d3.quantile(quarter4, 0.5);
    var q34 = d3.quantile(quarter4, 0.75);
    var interQuantileRange4 = q34 - q14;
    var min4 =
      q14 - 1.5 * interQuantileRange4 > 0 ? q14 - 1.5 * interQuantileRange4 : 0;
    var max4 = q34 + 1.5 * interQuantileRange4;

    // Build X scales and axis:
    const x = d3
      .scaleBand()
      .domain([1, 2, 3, 4])
      .range([0, width ]);
    svg
      .append("g")
      .attr("transform", `translate(0, ${height / 1.7 + 10})`)
      .call(d3.axisBottom(x));

    // Add Y axis
    const y = d3
      .scaleLinear()
      .domain([
        0,
        d3.max([
          d3.max(quarter1),
          d3.max(quarter2),
          d3.max(quarter3),
          d3.max(quarter4),
        ]),
      ])
      .range([height / 1.7 + 10, 10]);
    svg.append("g").attr("class", "boxplotY").call(d3.axisLeft(y));

    plot1(x, y, min1, max1, q11, q31, median1, svg, quarter1, div, uniqueYears, qsum1);
    plot2(x, y, min2, max2, q12, q32, median2, svg, quarter2, div, uniqueYears, qsum2);
    plot3(x, y, min3, max3, q13, q33, median3, svg, quarter3, div, uniqueYears, qsum3);
    plot4(x, y, min4, max4, q14, q34, median4, svg, quarter4, div, uniqueYears, qsum4);
  });
  // Create window
  svg
    .append("rect")
    .attr("x", -70)
    .attr("y", -10)
    .attr("width", 745)
    .attr("height", 250)
    .attr("fill", "transparent")
    .attr("stroke", "white");
  
  svg
    .append("text")
    .attr("x", width / 2 - 425)
    .attr("y", height / 4 - 128)
    .text("Cases")
    .style("fill", "white")
    .style("font-size", "15px")
    .attr("alignment-baseline", "middle")
    .attr("dx", "-1em")
    .attr("dy", "-0.5em")
    .attr("transform", "rotate(-90)");

    svg
    .append("text")
    .attr("x", width / 2 - 30)
    .attr("y", height/2 + 60)
    .text("Trimester")
    .style("fill", "white")
    .style("font-size", "15px")
}

function updateBoxplot(selectedGroup, selectTargetType, selectAttackType) {
  var div = d3
    .select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

  d3.json("globalterrorism.json").then(function (data) {
    var countryFilter =
      selectedGroup === "Select a country"
        ? data
        : data.filter((d) => d.country_txt === selectedGroup);
    var countriesPerYear = countryFilter.filter(
      (d) => d.iyear >= range_years[0] && d.iyear <= range_years[1]
    );
    var targetFilter =
      selectTargetType === "Select the Target Type"
        ? countriesPerYear
        : countriesPerYear.filter((d) => d.targtype1_txt === selectTargetType);
    var attackFilter =
      selectAttackType === "Select the Attack Type"
        ? targetFilter
        : targetFilter.filter((d) => d.attacktype1_txt === selectAttackType);

    let quartersPerYear = [];
    let years = attackFilter.map((d) => d.iyear);

    //years.push(1993);
    let uniqueYears = [...new Set(years)].sort();

    //Create the array with the years and the quarters
    for (let i = 0; i < uniqueYears.length; i++) {
      let quarter = [];
      for (let j = 0; j < 4; j++) {
        quarter[j] = 0;
        quartersPerYear["." + uniqueYears[i]] = quarter;
      }
    }

    //Populate dictionary
    for (let i = 0; i < uniqueYears.length; i++) {
      for (let j = 0; j < attackFilter.length; j++) {
        if ("." + attackFilter[j].iyear === "." + uniqueYears[i]) {
          if (
            attackFilter[j].country_txt === selectedGroup ||
            selectedGroup === "Select a country"
          ) {
            quartersPerYear["." + uniqueYears[i]][
              attackFilter[j].trimester - 1
            ] += 1;
          }
        }
      }
    }

    var quarter1 = [];
    var quarter2 = [];
    var quarter3 = [];
    var quarter4 = [];


    for (let i = 0; i < uniqueYears.length; i++) {
      quarter1.push(quartersPerYear["." + uniqueYears[i]][0]);
      quarter2.push(quartersPerYear["." + uniqueYears[i]][1]);
      quarter3.push(quartersPerYear["." + uniqueYears[i]][2]);
      quarter4.push(quartersPerYear["." + uniqueYears[i]][3]);
    }

    quarter1 = quarter1.sort(d3.ascending);
    quarter2 = quarter2.sort(d3.ascending);
    quarter3 = quarter3.sort(d3.ascending);
    quarter4 = quarter4.sort(d3.ascending);

    var qsum1 = quarter1.reduce((partialSum, a) => partialSum + a, 0);
    var qsum2 = quarter2.reduce((partialSum, a) => partialSum + a, 0);
    var qsum3 = quarter3.reduce((partialSum, a) => partialSum + a, 0);
    var qsum4 = quarter4.reduce((partialSum, a) => partialSum + a, 0);
    // Compute summary statistics used for the box:
    var q11 = d3.quantile(quarter1, 0.25);
    var median1 = d3.quantile(quarter1, 0.5);
    var q31 = d3.quantile(quarter1, 0.75);
    var interQuantileRange1 = q31 - q11;
    var min1 =
      q11 - 1.5 * interQuantileRange1 > 0 ? q11 - 1.5 * interQuantileRange1 : 0;
    var max1 = q31 + 1.5 * interQuantileRange1;

    var q12 = d3.quantile(quarter2, 0.25);
    var median2 = d3.quantile(quarter2, 0.5);
    var q32 = d3.quantile(quarter2, 0.75);
    var interQuantileRange2 = q32 - q12;
    var min2 =
      q12 - 1.5 * interQuantileRange2 > 0 ? q12 - 1.5 * interQuantileRange2 : 0;
    var max2 = q32 + 1.5 * interQuantileRange2;

    var q13 = d3.quantile(quarter3, 0.25);
    var median3 = d3.quantile(quarter3, 0.5);
    var q33 = d3.quantile(quarter3, 0.75);
    var interQuantileRange3 = q33 - q13;
    var min3 =
      q13 - 1.5 * interQuantileRange3 > 0 ? q13 - 1.5 * interQuantileRange3 : 0;
    var max3 = q33 + 1.5 * interQuantileRange3;

    var q14 = d3.quantile(quarter4, 0.25);
    var median4 = d3.quantile(quarter4, 0.5);
    var q34 = d3.quantile(quarter4, 0.75);
    var interQuantileRange4 = q34 - q14;
    var min4 =
      q14 - 1.5 * interQuantileRange4 > 0 ? q14 - 1.5 * interQuantileRange4 : 0;
    var max4 = q34 + 1.5 * interQuantileRange4;

    // Build X scales and axis:
    const x = d3
      .scaleBand()
      .domain([1, 2, 3, 4])
      .range([0, width]);

    // Add Y axis
    const y = d3
      .scaleLinear()
      .domain([
        0,
        d3.max([
          d3.max(quarter1),
          d3.max(quarter2),
          d3.max(quarter3),
          d3.max(quarter4),
          max1,
          max2,
          max3,
          max4,
        ]),
      ])
      .range([height / 1.7 + 10, 10]);
    d3.selectAll(".boxplotY").transition().duration(200).call(d3.axisLeft(y));

    //update 1st plot
    plotUpdate("_one", x(2) / 2, quarter1, q11, median1, q31, min1, max1, qsum1);
    plotUpdate(
      "_two",
      x(3) / 2 + x(3) / 4,
      quarter2,
      q12,
      median2,
      q32,
      min2,
      max2,
      qsum2
    );
    plotUpdate(
      "_three",
      x(3) + x(3) / 4,
      quarter3,
      q13,
      median3,
      q33,
      min3,
      max3,
      qsum3
    );
    plotUpdate(
      "_four",
      x(4) + x(3) / 4,
      quarter4,
      q14,
      median4,
      q34,
      min4,
      max4,
      qsum4
    );

    function plotUpdate(txt, num, quarter, q1, median, q3, min, max, qsum) {
      d3.selectAll("circle.tri" + txt)
        .transition()
        .duration(200)
        .style("opacity", 0)
        .remove();
      for (let i = 0; i < quarter.length; i++) {
        if (quarter[i] > max) {
          d3.select("#vi4")
            .select("svg")
            .select("g")
            .append("circle")

            .attr("class", "tri" + txt)
            .attr("cx", num)
            .attr("cy", y(quarter[i]))
            .attr("r", 4)
            .attr("fill", "rgb(160, 0, 0)")
            .attr("stroke", "white")
            .style("opacity", 0)
            .on("mousemove", function (event, d) {
              div.style("opacity", 0.8);
              div
                .html(
                  "Year: " + uniqueYears[i] + "<br/>" + "Cases: " + quarter[i]
                )
                .style("left", event.pageX + "px")
                .style("top", event.pageY + "px");
            })
            .on("mouseleave", function (event, d) {
              div.style("opacity", 0);
            })
            .transition()
            .duration(200)
            .style("opacity", 1);
        }
      }

      d3.selectAll("line.tri_main" + txt)
        .transition()
        .duration(200)
        .attr("y1", y(min))
        .attr("y2", y(max));

      d3.selectAll("rect.tri" + txt)
        .transition()
        .duration(200)
        .attr("y", y(q3))
        .attr("height", y(q1) - y(q3));

      d3.select("#vi4")
        .selectAll("rect.tri" + txt)
        .on("mousemove", function (event, d) {
          div.style("opacity", 0.8);
          div
            .html(
              "Max: " +
                max +
                "<br/>" +
                "<br/>" +
                "Q3: " +
                q3 +
                "<br/>" +
                "<br/>" +
                "Median: " +
                median +
                "<br/>" +
                "<br/>" +
                "Q1: " +
                q1 +
                "<br/>" +
                "<br/>" +
                "Min: " +
                min +
                "<br/>" +
                "<br/>" +
                "Cases: " +
                qsum
            )
            .style("left", event.pageX - 90 + "px")
            .style("top", event.pageY - 210 +"px");
         })
        .on("mouseleave", function (event, d) {
          div.style("opacity", 0);
        });

      d3.selectAll("line.tri" + txt)
        .data([min, median, max])
        .transition()
        .duration(200)
        .attr("y1", function (d) {
          return y(d);
        })
        .attr("y2", function (d) {
          return y(d);
        });
    }

    
  });
}

function plot1(
  x,
  y,
  min,
  max,
  q1,
  q3,
  median,
  svg,
  quarter1,
  div,
  uniqueYears,
  qsum1
) {
  for (let i = 0; i < quarter1.length; i++) {
    if (quarter1[i] > max) {
      svg
        .append("circle")
        .attr("class", "tri_one")
        .attr("cx", x(2) / 2)
        .attr("cy", y(quarter1[i]))
        .attr("r", 4)
        .attr("fill", "rgb(160, 0, 0)")
        .attr("stroke", "white")
        .on("mousemove", function (event, d) {
          div.style("opacity", 0.8);
          div
            .html("Year: " + uniqueYears[i] + "<br/>" + "Cases: " + quarter1[i])
            .style("left", event.pageX + "px")
            .style("top", event.pageY + "px");
        })
        .on("mouseleave", function (event, d) {
          div.style("opacity", 0);
        });
    }
  }

  // Show the main vertical line
  svg
    .append("line")
    .attr("class", "tri_main_one")
    .attr("x1", x(2) / 2)
    .attr("x2", x(2) / 2)
    .attr("y1", y(min))
    .attr("y2", y(max))
    .attr("stroke", "white");

  // Show the box
  svg
    .append("rect")
    .attr("class", "tri_one")
    .attr("x", x(2) / 4)
    .attr("y", y(q3))
    .attr("height", y(q1) - y(q3))
    .attr("width", x(2) / 2)
    .attr("stroke", "white")
    .style("fill", "rgb(160, 0, 0)")
    .style("opacity", 1)
    .on("mousemove", function (event, d) {
      div.style("opacity", 0.8);
      div
        .html(
          "Max: " +
            max +
            "<br/>" +
            "<br/>" +
            "Q3: " +
            q3 +
            "<br/>" +
            "<br/>" +
            "Median: " +
            median +
            "<br/>" +
            "<br/>" +
            "Q1: " +
            q1 +
            "<br/>" +
            "<br/>" +
            "Min: " +
            min +
            "<br/>" +
            "<br/>" +
            "Cases: " +
            qsum1
        )
        .style("left", event.pageX - 90 + "px")
        .style("top", event.pageY - 210 +"px");
    })
    .on("mouseleave", function (event, d) {
      div.style("opacity", 0);
    });

  // show median, min and max horizontal lines
  svg
    .selectAll("toto")
    .data([min, median, max])
    .enter()
    .append("line")
    .attr("class", "tri_one")
    .attr("x1", x(2) / 4)
    .attr("x2", x(2) / 4 + x(2) / 2)
    .attr("y1", function (d) {
      return y(d);
    })
    .attr("y2", function (d) {
      return y(d);
    })
    .attr("stroke", "white");
}

function plot2(
  x,
  y,
  min,
  max,
  q1,
  q3,
  median,
  svg,
  quarter2,
  div,
  uniqueYears,
  qsum2
) {
  for (let i = 0; i < quarter2.length; i++) {
    if (quarter2[i] > max) {
      svg
        .append("circle")
        .attr("class", "tri_two")
        .attr("cx", x(3) / 2 + x(3) / 4)
        .attr("cy", y(quarter2[i]))
        .attr("r", 4)
        .attr("fill", "rgb(160, 0, 0)")
        .attr("stroke", "white")
        .on("mousemove", function (event, d) {
          div.style("opacity", 0.8);
          div
            .html("Year: " + uniqueYears[i] + "<br/>" + "Cases: " + quarter2[i])
            .style("left", event.pageX + "px")
            .style("top", event.pageY + "px");
        })
        .on("mouseleave", function (event, d) {
          div.style("opacity", 0);
        });
    }
  }
  // Show the main vertical line
  svg
    .append("line")
    .attr("class", "tri_main_two")
    .attr("x1", x(3) / 2 + x(3) / 4)
    .attr("x2", x(3) / 2 + x(3) / 4)
    .attr("y1", y(min))
    .attr("y2", y(max))
    .attr("stroke", "white");

  // Show the box
  svg
    .append("rect")
    .attr("class", "tri_two")
    .attr("x", x(3) / 2 + x(2) / 4)
    .attr("y", y(q3))
    .attr("height", y(q1) - y(q3))
    .attr("width", x(2) / 2)
    .attr("stroke", "white")
    .style("fill", "rgb(160, 0, 0)")
    .style("opacity", 1)
    .on("mousemove", function (event, d) {
      div.style("opacity", 0.8);
      div
        .html(
          "Max: " +
            max +
            "<br/>" +
            "<br/>" +
            "Q3: " +
            q3 +
            "<br/>" +
            "<br/>" +
            "Median: " +
            median +
            "<br/>" +
            "<br/>" +
            "Q1: " +
            q1 +
            "<br/>" +
            "<br/>" +
            "Min: " +
            min + 
            "<br/>" +
            "<br/>" +
            "Cases: " +
            qsum2
        )
        .style("left", event.pageX - 90 + "px")
        .style("top", event.pageY - 210 +"px");
    })
    .on("mouseleave", function (event, d) {
      div.style("opacity", 0);
    });

  // show median, min and max horizontal lines
  svg
    .selectAll("toto")
    .data([min, median, max])
    .enter()
    .append("line")
    .attr("class", "tri_two")
    .attr("x1", x(3) / 2 + x(2) / 4)
    .attr("x2", x(3) / 2 + (3 * x(2)) / 4)
    .attr("y1", function (d) {
      return y(d);
    })
    .attr("y2", function (d) {
      return y(d);
    })
    .attr("stroke", "white");
}

function plot3(
  x,
  y,
  min,
  max,
  q1,
  q3,
  median,
  svg,
  quarter3,
  div,
  uniqueYears,
  qsum3
) {
  for (let i = 0; i < quarter3.length; i++) {
    if (quarter3[i] > max) {
      svg
        .append("circle")
        .attr("class", "tri_three")
        .attr("cx", x(3) + x(3) / 4)
        .attr("cy", y(quarter3[i]))
        .attr("r", 4)
        .attr("fill", "rgb(160, 0, 0)")
        .attr("stroke", "white")
        .on("mousemove", function (event, d) {
          div.style("opacity", 0.8);
          div
            .html("Year: " + uniqueYears[i] + "<br/>" + "Cases: " + quarter3[i])
            .style("left", event.pageX + "px")
            .style("top", event.pageY + "px");
        })
        .on("mouseleave", function (event, d) {
          div.style("opacity", 0);
        });
    }
  }
  // Show the main vertical line
  svg
    .append("line")
    .attr("class", "tri_main_three")
    .attr("x1", x(3) + x(3) / 4)
    .attr("x2", x(3) + x(3) / 4)
    .attr("y1", y(min))
    .attr("y2", y(max))
    .attr("stroke", "white");

  // Show the box
  svg
    .append("rect")
    .attr("class", "tri_three")
    .attr("x", x(3) + x(2) / 4)
    .attr("y", y(q3))
    .attr("height", y(q1) - y(q3))
    .attr("width", x(2) / 2)
    .attr("stroke", "white")
    .style("fill", "rgb(160, 0, 0)")
    .style("opacity", 1)
    .on("mousemove", function (event, d) {
      div.style("opacity", 0.8);
      div
        .html(
          "Max: " +
            max +
            "<br/>" +
            "<br/>" +
            "Q3: " +
            q3 +
            "<br/>" +
            "<br/>" +
            "Median: " +
            median +
            "<br/>" +
            "<br/>" +
            "Q1: " +
            q1 +
            "<br/>" +
            "<br/>" +
            "Min: " +
            min +
            "<br/>" +
            "<br/>" +
            "Cases: " +
            qsum3
        )
        .style("left", event.pageX - 90 + "px")
        .style("top", event.pageY - 210 +"px");
    })
    .on("mouseleave", function (event, d) {
      div.style("opacity", 0);
    });

  // show median, min and max horizontal lines
  svg
    .selectAll("toto")
    .data([min, median, max])
    .enter()
    .append("line")
    .attr("class", "tri_three")
    .attr("x1", x(3) + x(2) / 4)
    .attr("x2", x(3) + (3 * x(2)) / 4)
    .attr("y1", function (d) {
      return y(d);
    })
    .attr("y2", function (d) {
      return y(d);
    })
    .attr("stroke", "white");
}

function plot4(
  x,
  y,
  min,
  max,
  q1,
  q3,
  median,
  svg,
  quarter4,
  div,
  uniqueYears,
  qsum4
) {
  for (let i = 0; i < quarter4.length; i++) {
    if (quarter4[i] > max) {
      svg
        .append("circle")
        .attr("class", "tri_four")
        .attr("cx", x(4) + x(3) / 4)
        .attr("cy", y(quarter4[i]))
        .attr("r", 4)
        .attr("fill", "rgb(160, 0, 0)")
        .attr("stroke", "white")
        .on("mousemove", function (event, d) {
          div.style("opacity", 0.8);
          div
            .html("Year: " + uniqueYears[i] + "<br/>" + "Cases: " + quarter4[i])
            .style("left", event.pageX + "px")
            .style("top", event.pageY + "px");
        })
        .on("mouseleave", function (event, d) {
          div.style("opacity", 0);
        });
    }
  }
  // Show the main vertical line
  svg
    .append("line")
    .attr("class", "tri_main_four")
    .attr("x1", x(4) + x(3) / 4)
    .attr("x2", x(4) + x(3) / 4)
    .attr("y1", y(min))
    .attr("y2", y(max))
    .attr("stroke", "white");

  // Show the box
  svg
    .append("rect")
    .attr("class", "tri_four")
    .attr("x", x(4) + x(2) / 4)
    .attr("y", y(q3))
    .attr("height", y(q1) - y(q3))
    .attr("width", x(2) / 2)
    .attr("stroke", "white")
    .style("fill", "rgb(160, 0, 0)")
    .style("opacity", 1)
    .on("mousemove", function (event, d) {
      div.style("opacity", 0.8);
      div
        .html(
          "Max: " +
            max +
            "<br/>" +
            "<br/>" +
            "Q3: " +
            q3 +
            "<br/>" +
            "<br/>" +
            "Median: " +
            median +
            "<br/>" +
            "<br/>" +
            "Q1: " +
            q1 +
            "<br/>" +
            "<br/>" +
            "Min: " +
            min +
            "<br/>" +
            "<br/>" +
            "Cases: " +
            qsum4
        )
        .style("left", event.pageX - 90 + "px")
        .style("top", event.pageY - 210 +"px");
    })
    .on("mouseleave", function (event, d) {
      div.style("opacity", 0);
    });

  // show median, min and max horizontal lines
  svg
    .selectAll("toto")
    .data([min, median, max])
    .enter()
    .append("line")
    .attr("class", "tri_four")
    .attr("x1", x(4) + x(2) / 4)
    .attr("x2", x(4) + (3 * x(2)) / 4)
    .attr("y1", function (d) {
      return y(d);
    })
    .attr("y2", function (d) {
      return y(d);
    })
    .attr("stroke", "white");
}

function createMatrix(id) {
  // append the svg object to the body of the page
  const svg = d3
    .select(id)
    .append("svg")
    .append("g")
    .attr("transform", `translate(${margin.left + 160}, ${margin.top})`);

  //Read the data
  d3.json("globalterrorism.json").then(function (data) {
    // Labels of row and columns -> unique identifier of the column called 'group' and 'variable'
    const myGroups = Array.from(
      new Set(data.map((d) => d.targtype1_txt))
    ).sort();
    const myVars = Array.from(
      new Set(data.map((d) => d.attacktype1_txt))
    ).sort();
    const attackPerTarget = [];

    //Create dictionary
    let attackType = [];
    for (let i = 0; i < myVars.length; i++) {
      let targetType = [];
      for (let j = 0; j < myGroups.length; j++) {
        targetType[myGroups[j]] = 0;
        attackType[myVars[i]] = targetType;
      }
    }
    //Populate dictionary
    for (let i = 0; i < myVars.length; i++) {
      for (let j = 0; j < data.length; j++) {
        if (data[j].attacktype1_txt === myVars[i]) {
          attackType[myVars[i]][data[j].targtype1_txt] += 1;
        }
      }
    }

    //create a list with all the data ready to use in the construction of the squares
    for (let i = 0; i < myVars.length; i++) {
      for (let j = 0; j < myGroups.length; j++) {
        attackPerTarget.push({
          attackType: myVars[i],
          targetType: myGroups[j],
          value: attackType[myVars[i]][myGroups[j]],
          id: ["x" + i, "y" + j],
        });
      }
    }

    // Build X scales and axis:
    const x = d3
      .scaleBand()
      .range([0, width - 110])
      .domain(myGroups)
      .padding(0.05);
    svg
      .append("g")
      .style("font-size", 12)
      .attr("transform", `translate(0, ${height - 80})`)
      .call(d3.axisBottom(x).tickSize(0))
      .selectAll("text")
      .style("text-anchor", "end")
      .attr("dx", "-1em")
      .attr("dy", "-0.5em")
      .attr("transform", "rotate(-90)");

    // Build Y scales and axis:
    const y = d3
      .scaleBand()
      .range([height - 80, 10])
      .domain(myVars)
      .padding(0.05);
    svg.append("g").style("font-size", 12).call(d3.axisLeft(y).tickSize(0));

    // Build color scale
    const myColor = d3
      .scaleSequential()
      .domain([0, 3000])
      .interpolator(d3.interpolate("rgb(230,230,250)", "rgb(189, 0, 0)"));

    var tooltipMatrix = d3
      .select("body")
      .append("div")
      .attr("class", "tooltip matrix")
      .style("opacity", 0);

    var xHighligthed;
    var yHighlighted;

    // Three function that change the tooltip when user hover / move / leave a cell
    const mouseover = function (event, d) {
      if (
        (yHighlighted === undefined && xHighligthed === undefined) ||
        (yHighlighted === "Select the Target Type" &&
          xHighligthed === "Select the Attack Type") ||
        (yHighlighted === undefined &&
          xHighligthed === "Select the Attack Type") ||
        (yHighlighted === "Select the Target Type" &&
          xHighligthed === undefined)
      ) {
        d3.selectAll("rect." + d.id[0]).style("opacity", 1);
        d3.selectAll("." + d.id[1]).style("opacity", 1);
        d3.select(this).style("stroke", "white").style("opacity", 1);
      } else {
        d3.select(this).style("stroke", "white").style("opacity", 1);
      }
      tooltipMatrix.style("opacity", 1);
    };
    const mousemove = function (event, d) {
      tooltipMatrix
        .html("The exact value of<br>this cell is: " + d.value)
        .style("left", event.x + 20 + "px")
        .style("top", event.y + "px")
        .style("opacity", 0.8);
    };
    const mouseleave = function (event, d) {
      if (
        (yHighlighted === undefined && xHighligthed === undefined) ||
        (yHighlighted === "Select the Target Type" &&
          xHighligthed === "Select the Attack Type") ||
        (yHighlighted === undefined &&
          xHighligthed === "Select the Attack Type") ||
        (yHighlighted === "Select the Target Type" &&
          xHighligthed === undefined)
      ) {
        d3.selectAll("rect." + d.id[0]).style("opacity", 0.8);
        d3.selectAll("." + d.id[1]).style("opacity", 0.8);
        d3.select(this).style("stroke", "none").style("opacity", 0.8);
      } else {
        if (d.id[1] !== yHighlighted && d.id[0] !== xHighligthed) {
          d3.select(this).style("stroke", "none").style("opacity", 0.2);
        }
        d3.select(this).style("stroke", "none");
      }
      tooltipMatrix.style("opacity", 0);
    };

    var unclick = ["Select the Target Type", "Select the Attack Type"];
    var clicked = false;
    const matrixMouseClick = function (event, d) {
      if (unclick[0] === d.id[0] && unclick[1] === d.id[1]) {
        d3.select("#selectTargetType").property("value", "Select the Target Type");
        d3.select("#selectAttackType").property("value", "Select the Attack Type");
        d3.selectAll("rect.matrix")
          .transition()
          .duration(500)
          .style("opacity", 0.8);
        
        yHighlighted = "Select the Target Type";
        xHighligthed = "Select the Attack Type";
        unclick = ["Select the Target Type", "Select the Attack Type"];
        clicked = false
      } else {
        unclick = d.id;
        d3.select("#selectTargetType").property("value", d.targetType);
        d3.select("#selectAttackType").property("value", d.attackType);

        d3.selectAll("rect.matrix")
          .transition()
          .duration(500)
          .style("opacity", 0.2);

        d3.selectAll("rect." + d.id[1])
          .transition()
          .duration(500)
          .style("opacity", 1);
        yHighlighted = d.id[1];

        d3.selectAll("rect." + d.id[0])
          .transition()
          .duration(500)
          .style("opacity", 1);
        xHighligthed = d.id[0];
        if(d.value === 0){
          clicked = true;
        }
      }
      targetSelected = d3.select("#selectTargetType").property("value");
      attackSelected = d3.select("#selectAttackType").property("value");
      updateMap();
      updateLineChart();
      if(d.value === 0){
        if(!clicked){
          updateBoxplot(mouseClick, targetSelected, attackSelected);
          unDraw();
        }else{
          drawn = true;
          drawIfNoCases();
        }
      }else{
        if(drawn){
          updateBoxplot(mouseClick, targetSelected, attackSelected);
          unDraw();
          drawn = false;
        } else {
          updateBoxplot(mouseClick, targetSelected, attackSelected);
        }
      }
    };

    // add the squares
    svg
      .selectAll()
      .data(attackPerTarget)
      .join("rect")
      .attr("class", (d) => {
        return "matrix " + d.id[0] + " " + d.id[1];
      })
      .attr("x", function (d, i) {
        return x(d.targetType);
      })
      .attr("y", function (d, i) {
        return y(d.attackType);
      })
      .attr("rx", 4)
      .attr("ry", 4)
      .attr("width", x.bandwidth())
      .attr("height", y.bandwidth())
      .style("fill", function (d, i) {
        return myColor(d.value);
      })
      .style("stroke-width", 4)
      .style("stroke", "none")
      .style("opacity", 0.8)
      .on("mouseover", mouseover)
      .on("mousemove", mousemove)
      .on("mouseleave", mouseleave)
      .on("click", matrixMouseClick);

    d3.select("#selectTargetType").on("change", function (d) {
      var selectedOption = d3.select(this).property("value");
      targetSelected = selectedOption;
      var copy;
      if (selectedOption !== "Select the Target Type") {
        d3.selectAll("rect.matrix")
          .transition()
          .duration(500)
          .style("opacity", 0.2);
        if (xHighligthed) {
          d3.selectAll("rect." + xHighligthed)
            .transition()
            .duration(500)
            .style("opacity", 1);
        }
        for (let i = 0; i < attackPerTarget.length; i++) {
          if (selectedOption === attackPerTarget[i].targetType) {
            d3.selectAll("rect." + attackPerTarget[i].id[1])
              .transition()
              .duration(500)
              .style("opacity", 1);
            copy = attackPerTarget[i].id[1];
            unclick[1] = copy;
            yHighlighted = attackPerTarget[i].id[1];
            break;
          }
        }
      } else {
        yHighlighted = selectedOption;
        if (
          xHighligthed !== "Select the Attack Type" &&
          xHighligthed !== undefined
        ) {
          d3.selectAll("rect.matrix")
            .transition()
            .duration(500)
            .style("opacity", 0.2);
          d3.selectAll("rect." + xHighligthed)
            .transition()
            .duration(500)
            .style("opacity", 1);
        } else {
          d3.selectAll("rect.matrix")
            .transition()
            .duration(500)
            .style("opacity", 0.8);
        }
        unclick[1] = selectedOption;
      }
      updateMap();
      updateBoxplot(mouseClick, targetSelected, attackSelected);
      updateLineChart();
    });

    d3.select("#selectAttackType").on("change", function (d) {
      var selectedOption = d3.select(this).property("value");
      attackSelected = selectedOption;
      var copy;
      if (selectedOption !== "Select the Attack Type") {
        d3.selectAll("rect.matrix")
          .transition()
          .duration(500)
          .style("opacity", 0.2);
        if (yHighlighted) {
          d3.selectAll("rect." + yHighlighted)
            .transition()
            .duration(500)
            .style("opacity", 1);
        }
        for (let i = 0; i < attackPerTarget.length; i++) {
          if (selectedOption === attackPerTarget[i].attackType) {
            d3.selectAll("rect." + attackPerTarget[i].id[0])
              .transition()
              .duration(500)
              .style("opacity", 1);
            copy = attackPerTarget[i].id[0];
            unclick[0] = copy;
            xHighligthed = attackPerTarget[i].id[0];
            break;
          }
        }
      } else {
        xHighligthed = selectedOption;
        if (
          yHighlighted !== "Select the Target Type" &&
          yHighlighted !== undefined
        ) {
          d3.selectAll("rect.matrix")
            .transition()
            .duration(500)
            .style("opacity", 0.2);
          d3.selectAll("rect." + yHighlighted)
            .transition()
            .duration(500)
            .style("opacity", 1);
        } else {
          d3.selectAll("rect.matrix")
            .transition()
            .duration(500)
            .style("opacity", 0.8);
        }
        unclick[0] = selectedOption;
      }
      updateMap();
      updateBoxplot(mouseClick, targetSelected, attackSelected);
      updateLineChart();
    });
  });
  // create legend
  var linearScale = d3.scaleLinear().domain([0, 100]).range([0, 100]);
  var sequentialScale = d3
    .scaleSequential()
    .domain([0, 45])
    .interpolator(d3.interpolate("rgb(230,230,250)", "rgb(189, 0, 0)"));
  var myData = d3.range(0, 100);
  function legend(d) {
    d3.select(this)
      .selectAll("rect")
      .data(myData)
      .join("rect")
      .attr("x", function (d) {
        return linearScale(d) - 170;
      })
      .attr("y", 380)
      .attr("width", 10)
      .attr("height", 15)
      .style("fill", function (d) {
        return sequentialScale(d);
      });
  }
  svg.each(legend);
  svg
    .append("rect")
    .attr("x", -169)
    .attr("y", 380)
    .attr("width", 108)
    .attr("height", 15)
    .attr("fill", "transparent")
    .attr("stroke", "white");
  svg
    .append("text")
    .attr("x", -135)
    .attr("y", 370)
    .text("Cases")
    .style("fill", "white")
    .style("font-size", "15px");
  svg
    .append("rect")
    .attr("x", -170)
    .attr("y", 375)
    .style("fill", "white")
    .attr("width", 1)
    .attr("height", 20);
  svg
    .append("text")
    .attr("x", -173)
    .attr("y", 370)
    .text("0")
    .style("fill", "white")
    .style("font-size", "10px");
  svg
    .append("rect")
    .attr("x", -61)
    .attr("y", 375)
    .style("fill", "white")
    .attr("width", 1)
    .attr("height", 20);
  svg
    .append("text")
    .attr("x", -75)
    .attr("y", 370)
    .attr('class', 'matrixScale')
    .text("3000+")
    .style("fill", "white")
    .style("font-size", "10px");

  // Create window
  svg
    .append("rect")
    .attr("x", -210)
    .attr("y", -10)
    .attr("width", 745)
    .attr("height", 460)
    .attr("fill", "transparent")
    .attr("stroke", "white");
}

function updateMatrix(selectedOption) {
  d3.json("globalterrorism.json").then(function (data) {
    var countryFilter =
      selectedOption === "Select a country"
        ? data
        : data.filter((d) => d.country_txt === selectedOption);
    let countriesPerYear = countryFilter.filter(
      (d) => d.iyear >= range_years[0] && d.iyear <= range_years[1]
    );

    const myGroups = Array.from(
      new Set(data.map((d) => d.targtype1_txt))
    ).sort();
    const myVars = Array.from(
      new Set(data.map((d) => d.attacktype1_txt))
    ).sort();
    const attackPerTarget = [];

    const x = d3
      .scaleBand()
      .range([0, width - 110])
      .domain(myGroups)
      .padding(0.05);

    // Build Y scales and axis:
    const y = d3
      .scaleBand()
      .range([height - 80, 10])
      .domain(myVars)
      .padding(0.05);

    
    //Create dictionary
    let attackType = [];
    for (let i = 0; i < myVars.length; i++) {
      let targetType = [];
      for (let j = 0; j < myGroups.length; j++) {
        targetType[myGroups[j]] = 0;
        attackType[myVars[i]] = targetType;
      }
    }
    //Populate dictionary
    for (let i = 0; i < myVars.length; i++) {
      for (let j = 0; j < countriesPerYear.length; j++) {
        if (countriesPerYear[j].attacktype1_txt === myVars[i]) {
          attackType[myVars[i]][countriesPerYear[j].targtype1_txt] += 1;
        }
      }
    }

    //create a list with all the data ready to use in the construction of the squares
    for (let i = 0; i < myVars.length; i++) {
      for (let j = 0; j < myGroups.length; j++) {
        attackPerTarget.push({
          attackType: myVars[i],
          targetType: myGroups[j],
          value: attackType[myVars[i]][myGroups[j]],
          id: ["x" + i, "y" + j],
        });
      }
    }

    console.log(attackPerTarget)
    var colorScale = 0;
    for (let i = 0; i < attackPerTarget.length; i++) {
      if(colorScale < attackPerTarget[i].value){
        colorScale = attackPerTarget[i].value
      }
    }

    // Build color scale
    const myColor = d3
      .scaleSequential()
      .domain([0,  3000])
      .interpolator(d3.interpolate("rgb(230,230,250)", "rgb(189, 0, 0)"));


    d3.select("#vi3")
      .selectAll("rect.matrix")
      .data(attackPerTarget)
      .transition()
      .duration(300)
      .style("fill", function (d, i) {
        return myColor(d.value);
      });
  });
}
