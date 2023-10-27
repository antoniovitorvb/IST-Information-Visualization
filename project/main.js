let priceData = {}, newsData, totalData;
let pipSize, pipDigits;

const margin = { top: 10, right: 20, bottom: 20, left: 60 };

const selectorDateFormat = "%Y-%m-%d %H:%M";
const priceDateFormat = "%d.%m.%Y %H:%M:%S.%L";
const newsDateFormat = "%m/%d/%Y %H:%M:%S";

const parseSelectorDate = d3.timeParse(selectorDateFormat);
const parsePriceDate = d3.timeParse(priceDateFormat);
const parseNewsDate = d3.timeParse(newsDateFormat);

async function selectPriceData(asset, timeframe, start, end) {
    let hourlyData = await d3.csv("data/" + asset + ".csv");
    if (timeframe === "hourly") {
        return hourlyData.filter(d => {
            const date = parsePriceDate(d.Time);
            return date >= start && date <= end;
        });
    }
    const encapsulated = [];
    const timeInterval = {
        "daily": d3.timeDay,
        "weekly": d3.timeWeek,
        "monthly": d3.timeMonth
    }[timeframe];
    const grouped = d3.groups(hourlyData, d => timeInterval.floor(parsePriceDate(d.Time)));
    const formatDate = d3.timeFormat(priceDateFormat);
    grouped.forEach(group => {
        const [dateObj, values] = group;
        const dateStr = formatDate(dateObj);
        const open = values[0].Open;
        const close = values[values.length - 1].Close;
        const high = d3.max(values, d => +d.High);
        const low = d3.min(values, d => +d.Low);
        const volume = d3.sum(values, d => +d.Volume);
        const logReturn = Math.log(close / open);

        encapsulated.push({
            Time: dateStr,
            Open: open,
            Close: close,
            High: high,
            Low: low,
            Volume: volume,
            Log_Return: logReturn
        });
    });
    const atrValues = [];
    for (let i = 1; i < encapsulated.length; i++) {
        const hl = encapsulated[i].High - encapsulated[i].Low;
        const hc = Math.abs(encapsulated[i].High - encapsulated[i - 1].Close);
        const lc = Math.abs(encapsulated[i].Low - encapsulated[i - 1].Close);
        atrValues.push(Math.max(hl, hc, lc));
    }
    const atrPeriod = 14;
    for (let i = atrPeriod; i < encapsulated.length; i++) {
        encapsulated[i].ATR = d3.mean(atrValues.slice(i - atrPeriod, i));
    }
    for (let i = 19; i < encapsulated.length; i++) {
        encapsulated[i].SMA_20 = d3.mean(encapsulated.slice(i - 19, i + 1), d => d.Close);
    }
    for (let i = 49; i < encapsulated.length; i++) {
        encapsulated[i].SMA_50 = d3.mean(encapsulated.slice(i - 49, i + 1), d => d.Close);
    }
    for (let i = 19; i < encapsulated.length; i++) {
        const stdDev = d3.deviation(encapsulated.slice(i - 19, i + 1), d => d.Close);
        encapsulated[i].Upper_Bollinger_Band = encapsulated[i].SMA_20 + 2 * stdDev;
        encapsulated[i].Lower_Bollinger_Band = encapsulated[i].SMA_20 - 2 * stdDev;
    }
    return encapsulated.filter(d => {
        const date = parsePriceDate(d.Time);
        return date >= start && date <= end;
    });
}

async function selectNewsData(base, quote, impact, start, end) {
    let data = await d3.csv("data/news.csv");
    return data.filter(d => {
        const date = parseNewsDate(d.Time);
        return date >= start && date <= end && (d.Currency === base || d.Currency === quote) && d.Impact === impact;
    });
}

function mergePriceAndNewsData(asset, timeframe) {
    const timeInterval = {
        "hourly": d3.timeHour,
        "daily": d3.timeDay,
        "weekly": d3.timeWeek,
        "monthly": d3.timeMonth
    }[timeframe];
    return priceData[asset].map(price => {
        const priceTime = parsePriceDate(price.Time);
        const newsForPrice = newsData.filter(news => {
            const newsTime = parseNewsDate(news.Time);
            return timeInterval.floor(newsTime).getTime() === timeInterval.floor(priceTime).getTime();
        });
        return {
            ...price,
            News: newsForPrice
        };
    });
}

function determinePipSizeDigits(asset) {
    const averageClose = d3.mean(priceData[asset], d => +d.Close);
    if (averageClose > 2) {
        return [0.01, 3];
    } else {
        return [0.0001, 5];
    }
}

async function selectData() {
    const asset = document.getElementById("asset-selector").value;
    const assetOptions = document.getElementById("asset-selector").options;
    const timeframe = document.getElementById("timeframe-selector").value;
    const base = asset.slice(0, 3);
    const quote = asset.slice(3);
    const startDate = document.getElementById("start-date").value;
    const startTime = document.getElementById("start-time").value;
    const endDate = document.getElementById("end-date").value;
    const endTime = document.getElementById("end-time").value;
    const impact = document.getElementById("news-selector").value;
    const start = parseSelectorDate(`${startDate} ${startTime}`);
    const end = parseSelectorDate(`${endDate} ${endTime}`);
    for (let option of assetOptions) {
        priceData[option.value] = await selectPriceData(option.value, timeframe, start, end);
    }
    [pipSize, pipDigits] = determinePipSizeDigits(asset);
    newsData = await selectNewsData(base, quote, impact, start, end);
    totalData = mergePriceAndNewsData(asset, timeframe);
}

async function createDashboard() {
    await selectData();
    const width = widthGenerator("charts-section", margin);
    const xScale = xScaleGenerator(totalData, width);
    const yScales = {
        candlestick: createCandlestickChart("candlestick-chart", totalData, width, xScale),
        volume: createVolumeHistogram("volume-histogram", totalData, width, xScale),
        logReturn: createLogReturnChart("log-return-line-chart", totalData, width, xScale),
        atr: createATRChart("atr-line-chart", totalData, width, xScale)
    }
    createVerticalLine(totalData, xScale, yScales);
    toggleElement('sma20-toggle');
    toggleElement('sma50-toggle');
    toggleElement('bollinger-toggle');
    toggleElement('news-toggle');
}

async function updateDashboard() {
    await selectData();
    const width = widthGenerator("charts-section", margin);
    const xScale = xScaleGenerator(totalData, width);
    const yScales = {
        candlestick: updateCandlestickChart("candlestick-chart", totalData, width, xScale),
        volume: updateVolumeHistogram("volume-histogram", totalData, width, xScale),
        logReturn: updateLogReturnChart("log-return-line-chart", totalData, width, xScale),
        atr: updateATRChart("atr-line-chart", totalData, width, xScale)
    }
    updateVerticalLine(totalData, xScale, yScales);
    toggleElement('sma20-toggle');
    toggleElement('sma50-toggle');
    toggleElement('bollinger-toggle');
    toggleElement('news-toggle');
}
