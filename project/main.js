let priceData;
let newsData;

const margin = { top: 10, right: 20, bottom: 20, left: 60 };

const parseSelectorDate = d3.timeParse("%Y-%m-%d %H:%M");
const parsePriceDate = d3.timeParse("%d.%m.%Y %H:%M:%S.%L");
const parseNewsDate = d3.timeParse("%m/%d/%Y %H:%M:%S");

async function selectPriceData(asset, start, end) {
    await d3.csv("data/" + asset + ".csv").then(data => {
        priceData = data.filter(d => {
            const date = parsePriceDate(d.Time);
            return date >= start && date <= end;
        });
    });
}

async function selectNewsData(base, quote, impact, start, end) {
    await d3.csv("data/news.csv").then(data => {
        newsData = data.filter(d => {
            const date = parseNewsDate(d.Time);
            return date >= start && date <= end && (d.Currency === base || d.Currency === quote) && d.Impact === impact
        });
    });
}

async function selectData() {
    const asset = document.getElementById("asset-selector").value;
    const base = asset.slice(0, 3);
    const quote = asset.slice(3);
    const startDate = document.getElementById("start-date").value;
    const startTime = document.getElementById("start-time").value;
    const endDate = document.getElementById("end-date").value;
    const endTime = document.getElementById("end-time").value;
    const impact = document.getElementById("news-selector").value;
    const start = parseSelectorDate(`${startDate} ${startTime}`);
    const end = parseSelectorDate(`${endDate} ${endTime}`);
    await selectPriceData(asset, start, end);
    await selectNewsData(base, quote, impact, start, end);
}

async function createDashboard() {
    await selectData();
    createCandlestickChart(priceData, "candlestick-chart");
    createVolumeHistogram(priceData, "volume-histogram");
    createLogReturnChart(priceData, "log-return-line-chart");
    createATRChart(priceData, "atr-line-chart");
}

async function updateDashboard() {
    await selectData();
    updateCandlestickChart(priceData, "candlestick-chart");
    updateVolumeHistogram(priceData, "volume-histogram");
    updateLogReturnChart(priceData, "log-return-line-chart");
    updateATRChart(priceData, "atr-line-chart");
}