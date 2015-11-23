/* 
* Author: Nicholas Hunt-Walker
* 
* For simulating particles in a box
* Let's neglect collisions for now and just get the circles moving
*/
var margin = {top: 20, right: 5, bottom: 5, left: 70},
	width = 800,
	height = 500,
	chart_width = width - margin.left - margin.right,
	chart_height = height - margin.top - margin.bottom;

var	chart = d3.select("svg")
		.attr("width", chart_width + margin.left + margin.right)
		.attr("height", chart_height + margin.top + margin.bottom)
		.append("g")
		.attr("transform", "translate("+margin.left+","+margin.top+")"),
		
	x = d3.scale.linear().range([0, chart_width]),
	y = d3.scale.linear().range([chart_height, 0]);
	
var particles = [],
	radii = 10,
	v_init = 100,
	n_points = 20,
	t = 0;

function new_point(){
	var point = new Object();
	point.x = Math.random()*chart_width;
	point.y = Math.random()*chart_height;
	point.r = radii;
	point.vtot = v_init;
	point.color = "#000000";
	point.angle = Math.random()*(Math.PI);
	point.collision = 0;
	
	particles.push(point);
}
for (var ii = 0; ii < n_points; ii++) {
	new_point();
	particles[ii].name = "particle_"+ii;
	if (ii == 0) {
		particles[ii].color = "#ff0000";
	}
}


function draw_points(data){
	circle = chart.selectAll("circle").data(data).enter()
		.append("circle")
		.attr("cx", function(d, ii){return d.x})
		.attr("cy", function(d, ii){return d.y})
		.attr("r", function(d, ii){return d.r})
		.style("fill",function(d, ii){return d.color});
}

draw_points(particles);

function particle_contact(prtA, prtB){
	var xdist = prtA.x - prtB.x,
		ydist = prtA.y - prtB.y,
		dist = Math.sqrt(Math.pow(xdist,2) + Math.pow(ydist,2));
		if (dist < 2*radii) {
		//	console.log(prtA.name+" passing "+prtB.name);	
		}
}

function timestep(){
	t = 0.01;

	// for (var ii = 0; ii < particles.length; ii++) {
	for (var ii = 0; ii < particles.length-1; ii++) {
		var vy = particles[ii].vtot * Math.sin(particles[ii].angle);
		var vx = particles[ii].vtot * Math.cos(particles[ii].angle);
		
		var newx = particles[ii].x + vx*t;
		var newy = particles[ii].y + vy*t;
		
		if (newx > chart_width) {
			newx = chart_width - Math.abs(chart_width - newx);
			vx = -vx;
		}
		if (newx < 0) {
			newx = Math.abs(newx);
			vx = -vx;
		}
		if (newy > chart_height) {
			newy = chart_height - Math.abs(chart_height - newy);
			vy = -vy;
		}
		if (newy < 0) {
			newy = Math.abs(newy);
			vy = -vy;
		}
		
		particles[ii].x = newx;
		particles[ii].y = newy;
		if (vx < 0) {
			particles[ii].angle = Math.atan(vy/vx) + Math.PI;	
		} else {
			particles[ii].angle = Math.atan(vy/vx);
		}
	}
	
//	for (var ii = 1; ii < particles.length; ii++) {
	for (var ii = 0; ii < particles.length; ii++) {
		var circA = particles[ii],
			circB = particles[ii],
			cx1 = circA.x,
			cy1 = circA.y,
			cx2 = circB.x,
			cy2 = circB.y,
			kick = circA.radii,
			dist = Math.sqrt(Math.pow(cx1 - cx2, 2) + Math.pow(cy1 - cy2, 2));	
			
			if (dist < 2*radii) {
				collision_func(circA, circB);
			}
	}
	
	chart.selectAll("circle").data(particles)
		.attr("cx", function(d){
			return d.x;
		})
		.attr("cy", function(d){
			return d.y;
		})
		.style("fill", function(d){
			return d.color;
		});
	
	setTimeout(function(){
		timestep();
	}, 1);
}

function collision_func(circA, circB){
	var vA_i = circA.vtot,
		vB_i = circB.vtot,
		thetaA_i = circA.angle,
		thetaB_i = circB.angle,
		new_theta = thetaB_i + Math.PI/2;
		
	var k1 = vA_i*Math.sin(thetaA_i) + vB_i*Math.sin(thetaB_i),
		k2 = vA_i*Math.cos(thetaA_i) + vB_i*Math.cos(thetaB_i),
		k3 = Math.pow(vA_i, 2.) + Math.pow(vB_i, 2.);
		
	var a = 1.,
		b = -(Math.sin(new_theta)*k1 + Math.cos(new_theta)*k2),
		c = 0.5*(Math.pow(k1,2.) + Math.pow(k2,2.) - k3);
		
	var vB_f = pythagorean(a,b,c),
		vA_f = Math.sqrt(Math.pow(k1 - vB_f*Math.sin(new_theta), 2) + Math.pow(k2 - vB_f*Math.cos(new_theta), 2));
			
	var sinthetaA_f = (1./vA_f) * (k1 - vB_f * Math.sin(new_theta)),
		costhetaA_f = (1./vA_f) * (k2 - vB_f * Math.cos(new_theta));
	
	if (costhetaA_f > 0) {
		thetaA_f = Math.asin(sinthetaA_f);
	} else if (costhetaA_f < 0) {
		thetaA_f = Math.PI - Math.asin(sinthetaA_f);
	}
	
	circA.angle = thetaA_f;
	circB.angle = new_theta;
	
	circA.vtot = vA_f;
	circB.vtot = vB_f;
		
	console.log(total_KE());

}

function pythagorean(a, b, c){
	var x1 = (-b + Math.sqrt(Math.pow(b, 2) - 4.*a*c))/(2.*a),
		x2 = (-b - Math.sqrt(Math.pow(b, 2) - 4.*a*c))/(2.*a);
		
	return x1;
	
}

function total_KE(){
	var KE = Math.pow(particles[0].vtot, 2);
	
	for (var ii=1; ii < particles.length; ii++){
		KE += Math.pow(particles[ii].vtot, 2);
	}
	return KE
}

jQuery(document).ready(function(){
	setTimeout(function(){
		timestep();
	}, 2000);
});