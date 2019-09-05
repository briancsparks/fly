
const bundler                 = require('../lib/bundle-maker');
const io                      = require('socket.io-client');
const fs                      = require('fs');
const minimist                = require('minimist');
const argv                    = minimist(process.argv.slice(2));

var   disabled = false;

var   buffers       = [];
var   totalLength   = 0;


(function() {

  const path      = argv._[0] || argv.path;
  if (!path || path === '-') {
    return fromStdin();
  }

  return fromFile(path);
}());



function fromStdin() {
  process.stdin.resume();
  process.stdin.on('data', function(buf) {
    buffers.push(buf);
    totalLength += buf.length;
  });
  process.stdin.on('end', function() {
    const payload = Buffer.concat(buffers, totalLength).toString();
    send(payload);
  });
}

function fromFile(path) {
  var payload;

  if (path === 'test') {
    payload = getTest();
  }

  payload = payload || fs.readFileSync(path);
  send(payload);
}


function send(payload) {

  // const flyhost = `http://localhost:3330/fly`;
  const flyhost = `http://localhost:3330/`;

  log(`Sending to ${flyhost}:`, payload);

  const socket = io(flyhost);
  socket.on('connect', function() {
    log(`fly connected`);


    // socket.emit('data', {str: payload});

    socket.emit('viz', {str: payload}, function() {
      console.log(`Back from viz trip`);
      socket.close();
    });

  });
}


function log(...args) {
  if (disabled) { return; }
  console.log(...args);
}


function getTest() {
return `
const titleText = 'Top 10 Most Populous Countries';
const xAxisLabelText = 'Population';

const svg = d3.select('svg');

const width = +svg.attr('width');
const height = +svg.attr('height');

const render = data => {
  const xValue = d => d['population'];
  const yValue = d => d.country;
  const margin = { top: 50, right: 40, bottom: 77, left: 180 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const xScale = d3.scaleLinear()
    .domain([0, d3.max(data, xValue)])
    .range([0, innerWidth]);

  const yScale = d3.scaleBand()
    .domain(data.map(yValue))
    .range([0, innerHeight])
    .padding(0.1);

  const g = svg.append('g')
    .attr('transform', \`translate(\${margin.left},\${margin.top})\`);

  const xAxisTickFormat = number =>
    d3.format('.3s')(number)
      .replace('G', 'B');

  const xAxis = d3.axisBottom(xScale)
    .tickFormat(xAxisTickFormat)
    .tickSize(-innerHeight);

  g.append('g')
    .call(d3.axisLeft(yScale))
    .selectAll('.domain, .tick line')
      .remove();

  const xAxisG = g.append('g').call(xAxis)
    .attr('transform', \`translate(0,\${innerHeight})\`);

  xAxisG.select('.domain').remove();

  xAxisG.append('text')
      .attr('class', 'axis-label')
      .attr('y', 65)
      .attr('x', innerWidth / 2)
      .attr('fill', 'black')
      .text(xAxisLabelText);

  g.selectAll('rect').data(data)
    .enter().append('rect')
      .attr('y', d => yScale(yValue(d)))
      .attr('width', d => xScale(xValue(d)))
      .attr('height', yScale.bandwidth());

  g.append('text')
      .attr('class', 'title')
      .attr('y', -10)
      .text(titleText);
};

const dataStr =
\`country,population
China,1415046
India,1354052
United States,326767
Indonesia,266795
Brazil,210868
Pakistan,200814
Nigeria,195875
Bangladesh,166368
Russia,143965
Mexico,130759\`;

render(d3.csvParse(dataStr).map(d => ({...d, population: +d.population * 1000})));

`;
}

