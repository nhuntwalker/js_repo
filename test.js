var nyears = 40,
    rate = 10,
    princ = 0,
    contr = 450,
    nsteps = nyears*12;


interest = function(principal, rate, years, contr) {
  N_comp = 12.; // Compounded monthly
  rate = rate/100.;
  N = (years*N_comp);
  total = [principal];
  deposits = [principal];

  for (ii = 0; ii < N; ii++) {
    newtot = (Math.pow(1+rate/N_comp, ii+1))*principal + contr*(Math.pow(1 + rate/N_comp,ii+1)-1.)/(rate/N_comp);
    total.push(newtot/1000)
  };

  return total
};

var lineData = [], lineData2 = [];
var timeSteps = [];
for (var ii = 0; ii < nsteps + 1; ii++) {
  timeSteps.push(ii);
}
var totals = interest(princ, rate, nyears, contr),
  totals2 = interest(princ, 7, nyears, contr);

for (var ii = 0; ii < nsteps; ii++) {
  lineData.push({x: timeSteps[ii], y: totals[ii]});
  lineData2.push({x: timeSteps[ii], y: totals2[ii]})
};

// Set up the visualization parameters
var vis = d3.select("#figure_container"), // select the svg element
  width = 600, 
  height = 400,
  margins = {top: 20, right: 20, bottom: 20, left: 100},

// Set the scale and range of the axes. Remember that the horizontal
// axis starts at the left side, so start that svg range at the left
// margin. Have it go not the full width, but up to the right margin
  xRange = d3.scale.linear()
    .range([margins.left, width - margins.right])
    .domain([d3.min(lineData, function(d){
      return d.x;
    }), d3.max(lineData, function(d) {
      return d.x;
    })]),

// The vertical axis starts at the top and goes down
  yRange = d3.scale.linear()
    .range([height - margins.top, margins.bottom])
    .domain([d3.min(lineData, function(d){
      return d.y;
    }), d3.max(lineData, function(d) {
      return d.y;
    })]),

  xAxis = d3.svg.axis()
    .scale(xRange)
    .tickSize(5) // So every 5 increments we should get a major tick mark
    .tickSubdivide(true), //enables minor ticks

  yAxis = d3.svg.axis()
    .scale(yRange)
    .tickSize(5)
    .orient('left') // Want to put this on the left since it's the y-axis
    .tickSubdivide(true);

// Place the axes on the figure
vis.append('svg:g')
  .attr('class', 'axis--x')
  .attr('transform', 'translate(0,' + (height - margins.bottom) + ')')
  .call(xAxis);

vis.append('svg:g')
  .attr('class', 'axis--y')
  .attr('transform', 'translate('+ (margins.left) +', 0)')
  .call(yAxis);

// Create the line generator function
var lineFunc = d3.svg.line()
  .x(function(d) {
    return xRange(d.x);
  })
  .y(function(d) {
    return yRange(d.y);
  })
  .interpolate('basis');

// Add the line to the doc
vis.append('svg:path')
  .attr('d', lineFunc(lineData)) // This is where you add the data
  .attr('stroke', 'blue') // line color
  .attr('stroke-width', 2) // line width
  .attr('fill', 'none');

vis.append('svg:path')
  .attr('d', lineFunc(lineData2)) // This is where you add the data
  .attr('stroke', 'green') // line color
  .attr('stroke-width', 2) // line width
  .attr('fill', 'none');
