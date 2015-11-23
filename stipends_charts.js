/*
* Author: Nicholas Hunt-Walker
* Median Hourly Wage Source: http://www.bls.gov/oes/
* Average City Rent for 1 BR Source: http://www.rentjungle.com/; http://www.city-data.com/ (median gross rent); http://www.deptofnumbers.com/ (median gross rent); http://www.trulia.com/ (eyeballed)
	https://www.walkscore.com/ (eyeballed)
* Newark, Tuscaloosa, Oakland, Stony Brook, Fairbanks, Orono, Durham, Kingston, Morgantown, Laramie - city-data
* Athens - deptofnumbers
* Manoa - trulia
* Amherst - walkscore
* US Median Gross Rent: 905 from dept of numbers
*/
// set up basic chart attributes
var margin = {top: 20, right: 5, bottom: 30, left: 70},
	width = 800,
    chart_width = width - margin.left - margin.right,
    chart_height = 500 - margin.top - margin.bottom,
    max_salary = 40000,
    min_salary = 10000,
    min_rent = 150,
    max_rent = 1200;

// select the chart and set the chart width
// and chart height
var	chart = d3.select("#figure_container")
		.attr("width", chart_width + margin.left + margin.right)
		.attr("height", chart_height + margin.top + margin.bottom)
		.append("g")
		.attr("transform", "translate("+margin.left+","+margin.top+")"),

// set range of the x-axis to span the full width 
// of the chart frame
	x = d3.scale.linear()
		.range([0, chart_width]),
// similarly for the y-axis
	y = d3.scale.linear()
		.range([chart_height, 0]);

// main plot tip box
tip_box = chart.append("rect")
	.attr("id", "tip_box")
	.attr("x",chart_width - 200)
	.attr("y",0)
	.attr("width", 200)
	.attr("height", 100)
	.style({
		"fill": "gray",
		"opacity": "0.5"
	});

tip_text1 = chart.append("text")
	.attr("dy",".5em")
	.attr("x", chart_width - 190)
	.attr("y", 30)
	.text("To see info about each bar,");

tip_text2 = chart.append("text")
	.attr("dy",".5em")
	.attr("x", chart_width - 190)
	.attr("y", 50)
	.text("run your mouse over it!");

tip_text3 = chart.append("text")
	.attr("dy",".5em")
	.attr("x", chart_width - 190)
	.attr("y", 70)
	.text("");

// set up the info box
d3.select("#ak-blog-post")
	.insert("div", "#primary")
		.attr("id","options_and_info")
		.style("width", "100%")
		.style("overflow", "hidden");

d3.select("#options_and_info")
	.append("div")
		.attr("id","infobox")
		.style({
			"width": "33%",
			"height": "350px",
			"float": "left"
		});
		
// set up the schools list
d3.select("#options_and_info")
	.append("div")
		.attr("id","schools_list")
		.style({
			"width": "33%",
			"height": "350px",
			"float": "left"
		});

// set up the options box
d3.select("#options_and_info")
	.append("div")
		.attr("id","options")
		.style({
			"width": "33%",
			"height": "350px",
			"float": "left"
		});

// define my incoming data file
var	infile = "http://rationalwhimsy.com/wp-content/uploads/2015/09/school_stipends.csv";
// var	infile = "school_stipends.csv";

// read data from CSV
function draw_raw_chart(){
	tip_box.transition()
		.duration(1000)
		.attr("transform","translate(0,0)")
		.ease("cubic");

	tip_text1.transition()
		.duration(1000)
		.attr("transform","translate(0,0)")
		.text("To see info about any bar,")
		.ease("cubic");

	tip_text2.transition()
		.duration(1000)
		.attr("transform","translate(0,0)")
		.ease("cubic");

	tip_text3.text("");

	// set up chart axes
	var yAxis = d3.svg.axis()
		.scale(y)
		.orient("left")
		.ticks(10, "$");

	the_data = d3.csv(infile, 
	// for every data row d, assign values to attributes
	function(d) {
	return {
		school: d.School,
		ta_min: +d.TA_Min,
		ta_max: +d.TA_Max,
		ra_min: +d.RA_Min,
		ra_max: +d.RA_Max,
		year: d.Year,
		comment: d.Comment,
		source: d.Source,
		locale: d.Host_City_State,
		med_hr: +d.Median_Hourly,
		avg_rent: +d.Avg_Rent,
		diff_source: d.Diff_Source
	};}, 
	// having read the data, set the y-domain from zero
	// to the maximum value we want.
	function(err, data) {
		x.domain([
			0, chart_width
		]);
		y.domain([
			0, max_salary
		]);

		var bar_width = chart_width/data.length;

		// start making the individual bars
		var bar = chart.selectAll("g")
			.data(data)
			// create a "group" for each bar
			.enter().append("g").attr("class","bar_wrap")
			// make bar go vertical
			.attr("transform", function(d, ii){
				return "translate("+ (ii * bar_width) +",0)";
			});

		// insert the bars
		bar.append("rect")
			.attr("id", function(d, ii){
				return "bar"+ii;
			}).attr("name", function(d, ii){
				return "school"+ii;
			})
			.attr("class", "bar")
			.attr("y", chart_height)
			.attr("height", 0)
			.attr("width", bar_width - 1)
			//.style({"fill":"green"});
			.classed("greenbar", true);
			
		
		// transition the bars into visibility
		var the_bars = d3.selectAll("rect.bar");
		the_bars.transition()
			.delay(function(d,ii){
				return ii*30;
			})
			.attr("y", function(d) {return y(d.ta_min); })
			.attr("height", function(d) {return chart_height - y(d.ta_min); })
			.ease("elastic");


		// insert the y-axis
		chart.append("g")
			.attr("class", "axis y_axis")
			.call(yAxis)
		.append("text")
			.attr("transform", "rotate(-90)")
			    .attr("y", 6)
			    .attr("dy", ".71em")
			    .style("text-anchor", "end")
			    .text("Salary ($)");

		// insert the x-label
		chart.append("g")
			.attr("class", "x_label axis_label")
			.append("text")
				.attr("transform", "translate("+(chart_width/2)+","+(chart_height + 10 + margin.bottom/2)+")")
				.style("text-anchor", "middle")
				.text("Public Universities");

		// highlighting
		d3.selectAll("g rect.bar")
			.on("mouseover", function(d){
				d3.select("#infobox #infobox_inner1")
					.html(infobox_fill(d));
				d3.selectAll("rect").classed("active_bar", false);
				d3.select(this)
					//.style({
						//"fill":"orange"
					//});
					.classed("active_bar", true);
			})
			.on("mouseout", function(){
				d3.select(this)
					//.style({
						//"fill":"green"
					//});
					.classed("active_bar", false);

			});

		// Extra informative lines
		var bar_delay = the_bars[0].length*30;

		// make the average salary line
		var avg_salary = function(){
			salaries = getData(d3.selectAll(".bar"));
			sum = 0;
			for (var ii=0; ii<salaries.length; ii++){
				sum += salaries[ii];
			}

			return sum/salaries.length;
		};

		var num = avg_salary();
		var avg_line = chart.append("rect")
			.attr("id","average")
			.attr("class","guide")
			.attr("x",0)
			.attr("y", y(num))
			.attr("height", 1)
			.attr("width", 0)
			.attr("fill","black");

		avg_line.transition()
			.delay(bar_delay + 50)
				.attr("width", chart_width)
				.duration(1000);

		// make the poverty line
		var poverty = 11770; // single person household; source: http://aspe.hhs.gov/poverty/15poverty.cfm
		var pov_line = chart.append("rect")
			.attr("id", "poverty")
			.attr("class","guide")
			.attr("x",0)
			.attr("y", y(poverty))
			.attr("height", 1)
			.attr("width", 0)
			.attr("fill","red");

		pov_line.transition()
			.delay(bar_delay + 1050)
				.attr("width", chart_width)
				.duration(1000);

		// make the median individual income line
		var individual = 28829; // source: http://www.census.gov/hhes/www/income/data/index.html
		var individual_line = chart.append("rect")
			.attr("id", "individual")
			.attr("class","guide")
			.attr("x",0)
			.attr("y", y(individual))
			.attr("height", 1)
			.attr("width", 0)
			.attr("fill","blue");

		individual_line.transition()
			.delay(bar_delay + 2050)
				.attr("width", chart_width)
				.duration(1000);

	});
};
draw_raw_chart();

function draw_rent_chart(){
	tip_box.transition()
		.duration(1000)
		.attr("transform","translate(-"+(chart_width-230)+",0)")
		.ease("cubic");

	tip_text1.transition()
		.duration(1000)
		.attr("transform","translate(-"+(chart_width-250)+",0)")
		.text("To see info about")
		.ease("cubic");

	tip_text2.transition()
		.duration(1000)
		.attr("transform","translate(-"+(chart_width-250)+",0)")
		.text("any point, run your")
		.ease("cubic");

	tip_text3.transition()
		.duration(1000)
		.attr("transform","translate(-"+(chart_width-250)+",0)")
		.text("mouse over it!")
		.ease("cubic");

	// this chart should be average rent/2 vs 30% of TA minimum
	// set up chart axes
	var yAxis = d3.svg.axis()
		.scale(y)
		.orient("left")
		.ticks(10, "$");

	var xAxis = d3.svg.axis()
		.scale(x)
		.orient("bottom")
		.ticks(10, "$");

	point_data = d3.csv(infile, 
	// for every data row d, assign values to attributes
	function(d) {
	return {
		school: d.School,
		ta_min: +d.TA_Min,
		ta_max: +d.TA_Max,
		ra_min: +d.RA_Min,
		ra_max: +d.RA_Max,
		year: d.Year,
		comment: d.Comment,
		source: d.Source,
		locale: d.Host_City_State,
		med_hr: +d.Median_Hourly,
		avg_rent: +d.Avg_Rent,
		diff_source: d.Diff_Source
	};}, 
	// having read the data, set the y-domain from zero
	// to the maximum value we want.
	function(err, data) {
		y.domain([
			min_rent,max_rent
		]);

		x.domain([
			min_rent,max_rent
		]);

		// set width of circles that will be points
		var pt_rad = 7.5;

		// start making the individual points
		var points = chart.selectAll("g")
			.data(data)
			// create a "group" for each point
			.enter().append("g")
			.attr("class","point_wrap");

		// insert the points
		points.append("circle")
			.attr("id", function(d, ii){
				return "point"+ii;
			})
			.attr("class", "point")
			.attr("r", 0)
			.attr("cx", function(d){
				var xval = 0.25*d.ta_min/12;
				return x(xval)+margin.left;
			})
			.attr("cy", function(d){
				var yval = 0.5*d.avg_rent;
				return y(yval);
			})
			.attr("name", function(d, ii){
				return "school"+ii;
			})
			.style({
				"stroke":"black"
			})
			.classed("greenpt", true);

		the_points = d3.selectAll("circle.point");
		the_points.transition()
			.delay(function(d,ii){
				return ii*60;
			})
			.attr("r", pt_rad)
			.ease("elastic");

		// insert the x-axis
		chart.append("g")
			.attr("class", "axis x_axis")
			.attr("transform","translate(0,"+(chart_height)+")")
			.call(xAxis)
		.append("text")
			.attr("transform","translate("+chart_width+","+(-10)+")")			
			    .attr("y", 6)
			    .attr("dy", "0em")
			    .style("text-anchor", "end")
			    .text("25% of Monthly Salary ($)");
	

		// insert the y-axis
		chart.append("g")
			.attr("class", "axis y_axis")
			.call(yAxis)
		.append("text")
			.attr("transform", "rotate(-90)")
			    .attr("y", 6)
			    .attr("dy", ".71em")
			    .style("text-anchor", "end")
			    .text("Half Average 2 BR Rent ($)");

		// highlighting
		d3.selectAll("g circle.point")
			.on("mouseover", function(d){
				d3.select("#infobox #infobox_inner1")
					.html(infobox_fill(d));

				d3.selectAll("circle").classed("active_bar", false);
				d3.select(this)
					/*.style({
						"fill":"orange"
					})*/
					.classed("active_pt", true);
			})
			.on("mouseout", function(){
				d3.select(this)
					/*.style({
						"fill":"green"
					})*/
					.classed("active_pt", false);

			});

		// make a 1-1 line
		line_data = [];
		for (var ii = min_rent; ii < max_rent+00; ii+=100){
			line_data.push({xval: ii, yval: ii});
		}

		var line_func = d3.svg.line()
			.x(function(d) {
				return x(d.xval);
			})
			.y(function(d) {
				return y(d.yval);
			})
			.interpolate('basis');

		var plot_line = function(line_data, color){ // function for plotting any line
		chart.append('svg:path')
			.attr("d", line_func(line_data))
			.attr('stroke', "#CCC") // line color
			.attr('stroke-width', 2) // line width
			.attr('class','diag_line guide')
			.attr('fill', 'none');
		};
		plot_line(line_data);
		
		/*var thinbox1 = chart.append("rect") // traces the X-axis only
			.attr("x", margin.left)
			.attr("y", margin.bottom)
			.attr("width", 1)
			.attr("height", chart_height - margin.bottom)
			.attr("fill", "teal")
			.attr("opacity","0");
	
		var thinbox2 = chart.append("rect") // traces the X-axis only
			.attr("x", 0)
			.attr("y", margin.bottom)
			.attr("height", 1)
			.attr("width", chart_width)
			.attr("fill", "teal")
			.attr("opacity","0");


		var emptycirc = chart.append("circle") // pinpoints where on graph line we are
			.attr("cx", margin.left)
			.attr("cy", 0)
			.attr("r", 10)
			.attr("fill", "none")
			.attr("stroke", "blue")
			.attr("opacity","0");

		chart.on("mousemove", function(){
		position = d3.mouse(this);
		xpos = position[0];
		ypos = position[1];
		
		thinbox1.attr("x",xpos).attr("opacity", "1");
		thinbox2.attr("y",ypos).attr("opacity", "1");
	
		emptycirc.attr("cx",xpos).attr("cy", ypos).attr("opacity","1");
	});
	
	chart.on("mouseout", function(){
		thinbox1.attr("opacity", "0");
		thinbox2.attr("opacity", "0");
		emptycirc.attr("opacity", "0");
});*/

	});	
};
// draw_rent_chart();

function list_infobox(){
	var list_data = d3.csv(infile,
	function(d) {
		return {
			school: d.School,
			ta_min: +d.TA_Min,
			ta_max: +d.TA_Max,
			ra_min: +d.RA_Min,
			ra_max: +d.RA_Max,
			year: d.Year,
			comment: d.Comment,
			source: d.Source,
			locale: d.Host_City_State,
			med_hr: +d.Median_Hourly,
			avg_rent: +d.Avg_Rent,
			diff_source: d.Diff_Source
		};
	}, 
	// data has been read. Now fill infobox_inner2 with data.
	function(err, data) {
		var school_list = d3.select("#list_inner");
		var rows = school_list.selectAll("div")
			.data(data)
			// create a "group" for each point
			.enter().append("div")
				.style({
					"opacity" : "0"
				})
			.attr("id", function(d, ii){
				return "school"+ii;
			})
			.attr("name", function(d, ii){
				return "school"+ii;
			});
				
		rows.on("mouseover",function(){
					d3.select(this).style({
						"background-color":"#D64C37",
						"color":"white"
					});
				}).on("mouseout", function(){
					d3.select(this).style({
						"background-color":"",
						"color":""
					
					});
				}).on("click", function(d){
					var name = d3.select(this).attr("name");
					d3.selectAll("rect").classed("active_bar", false);
					d3.selectAll("circle").classed("active_pt", false);
					d3.select("rect[name='"+name+"']").classed("active_bar", true);
					d3.select("circle[name='"+name+"']").classed("active_pt", true);
					d3.select("#infobox #infobox_inner1").html(infobox_fill(d));
				});
			
		rows.html(function(d){
			return d.school;
		});
		rows.transition()
			.delay(function(d,ii){
				return ii*100;
			})
			.style({
				"opacity":"1"
			}).ease("cubic");
			
		// relate to chart
		
	});
	
}
list_infobox();

/**************************************************
* Setup functions
***************************************************/
// This is for formatting money with commas
// Sourced from: http://stackoverflow.com/questions/149055/how-can-i-format-numbers-as-money-in-javascript
Number.prototype.formatMoney = function(c, d, t){
var n = this, 
    c = isNaN(c = Math.abs(c)) ? 2 : c, 
    d = d == undefined ? "." : d, 
    t = t == undefined ? "," : t, 
    s = n < 0 ? "-" : "", 
    i = parseInt(n = Math.abs(+n || 0).toFixed(c)) + "", 
    j = (j = i.length) > 3 ? j % 3 : 0;
   return s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
 };

// function for reformating city/state text
function format_city_state(loc_str){
	var 	split_me = loc_str.split(" "),
		output = split_me[0];

	if (split_me.length > 2) {
		for (var ii=1; ii<split_me.length-1; ii++){
			output += " "+split_me[ii];
		}
		output += ", "+split_me[ii];
	} else {
		output += ", "+split_me[1];
	}

	return output;

};

// function for filling the info box with data
function infobox_fill(data){
	var output = "<p><span class='title'>School:</span><br /><span class='info_content'> "+data.school+"</span></p>";
	output += "<p><span class='title'>City, State:</span><br /><span class='info_content'> "+format_city_state(data.locale)+"</span></p>";
	output += "<p><span class='title'>TA Annual Minimum:</span><br /><span class='info_content'> $"+data.ta_min.formatMoney(2)+"</span></p>";
	output += "<p><span class='title'>Avg 2 Bedroom Rent:</span><br /><span class='info_content'> $"+data.avg_rent.formatMoney(2)+"</span></p>";
	output += "<p><span class='title'>Term:</span><br /><span class='info_content'> "+data.year+"</span></p>";
	output += "<p><span class='title'>State Median Hourly Wage:</span><br /><span class='info_content'> $"+data.med_hr.formatMoney(2)+" per hour ($"+(data.med_hr*40*52).formatMoney(2)+" Full Time Annual)</span></p>";
	output += "<p><span class='title'>"+make_url(data.source, "Data source")+"</span> (opens in a new tab)</span></p>";

	var diff = data.ta_min - data.med_hr*40*52;
	if (diff < 0){
		output += "<p><span class='title'>Difference between TA Minimum <br/>and State Median:</span><br /><span class='info_content'> <span class='diff neg'>$"+diff.formatMoney(2)+"</span></span></p>";
	} else {
		output += "<p><span class='title'>Difference between TA Minimum <br/>and State Median:</span><br /><span class='info_content'> <span class='diff pos'>$"+diff.formatMoney(2)+"</span></span></p>";
	}

	if (data.comment != "  None  "){
		output += "<p><span class='title'>Note:</span><br /><span class='info_content'> "+data.comment+"</span></p>";
	}

	return output;
};

// function for making easy URLs
function make_url(link, text){
	return "<a href='"+link+"' target='_blank'>"+text+"</a>";
};

// For retrieving data from my elements
// Sourced from: https://groups.google.com/forum/#!topic/d3-js/telku2hP8ZM
function getData(sel) {
  var data = [];
  sel.each(function(d) { data.push(d.ta_min); });
  return data;
};

// entitle the info box 
d3.select("#infobox")
	.append("h4")
	.html("Info");

d3.select("#infobox")
	.append("div")
		.attr("id","infobox_inner1")
		.style({
			"max-height" : "305px",
			"overflow-y" : "scroll"
		})
		.html("Roll mouse over the bars to see data about schools");

// entitle and style the school list
d3.select("#schools_list")
	.append("h4")
	.html("Schools");

d3.select("#schools_list")
	.append("div")
		.attr("id","list_inner")
		.style({
			"max-height" : "305px",
			"overflow-y" : "scroll"
		})
// make the options box 
d3.select("#options")
	.append("h4")
	.html("Options");

var html = "<button id='raw_chart' class='disabled' disabled>Minimum Salary Chart</button>";
html += "<button id='rent_chart'>Rent Chart</button><br />";
html += "<div class='clearfix'></div>";
html += "<input type='checkbox' name='individual' id='indv_inc' class='bar_checks' checked onchange='toggle_line(this.name)'>Median Individual Income On<br/>";
html += "<input type='checkbox' name='average' id='avg_inc' class='bar_checks' checked onchange='toggle_line(this.name)'>Average TA Salary On<br/>";
html += "<input type='checkbox' name='poverty' id='pov_inc' class='bar_checks' checked onchange='toggle_line(this.name)'>Poverty Line On<br/>";


d3.select("#options")
	.append("div")
	.attr("id","bar_options")
	.html(html);

function toggle_line(line_id){
	var vis = d3.select("#"+line_id).style("visibility")
	if (vis == "visible"){
		d3.select("#"+line_id)
			.style("visibility", "hidden");
	} else if (vis == "hidden"){
		d3.select("#"+line_id)
			.style("visibility", "visible");
	}
};

d3.select("#rent_chart").on("click",function(){
	prep_chart(draw_rent_chart);
	var barchecks = document.getElementsByClassName("bar_checks");
	for (var ii=0; ii<barchecks.length; ii++){
		barchecks[ii].disabled=true;
	}
	document.getElementById("rent_chart").disabled = true;
	document.getElementById("raw_chart").disabled = false;
	jQuery("#rent_chart").addClass("disabled");
	jQuery("#raw_chart").removeClass("disabled");

});

d3.select("#raw_chart").on("click",function(){
	prep_chart(draw_raw_chart);
	var barchecks = document.getElementsByClassName("bar_checks");
	for (var ii=0; ii<barchecks.length; ii++){
		barchecks[ii].disabled=false;
	}
	document.getElementsByClassName("bar_checks").disabled = false;
	document.getElementById("raw_chart").disabled = true;
	document.getElementById("rent_chart").disabled = false;
	jQuery("#raw_chart").addClass("disabled");
	jQuery("#rent_chart").removeClass("disabled");

});


// function to transition between two charts
function prep_chart(_newfunc){
	var the_guides = d3.selectAll(".guide")
	the_guides.transition()
		.attr("width",0)
		.ease("linear")
		.remove();

	var the_bars = d3.selectAll(".bar");
	the_bars.transition()
		.delay(function(d,ii){
			return ii*5;
		})
		.attr("y", function(d) {return chart_height; })
		.attr("height", function(d) {return 0; })
		.ease("linear").remove();

	var the_bar_groups = d3.selectAll(".bar_wrap");
	the_bar_groups.remove();

	var the_points = d3.selectAll(".point");
	the_points.transition()
		.delay(function(d,ii){
			return ii*50;
		})
		.attr("r", 0)
		.ease("linear").remove();

	var the_point_groups = d3.selectAll(".point_wrap");
	the_point_groups.remove();

	var the_axes = d3.selectAll(".axis");
	the_axes.transition()
		.delay(100)
		.remove();

	var the_labels = d3.selectAll(".axis_label");
	the_labels.transition()
		.delay(100)
		.remove();
		
	setTimeout(function(){
		_newfunc();
	}, 500);
		
};

