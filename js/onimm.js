/**
 * 2014 © Onisep - tous droits réservés
 * 
 * Created by <jta@onisep.fr> 2014-04-14
 * Last update on 2014-04-14 by <jta@onisep.fr>
 *
 * Script aiming to render the mind map for a job
 *
 */

// Be sure d3.min.js is called before

"use strict";

// Onisep Mind Mapping
var onimm = onimm || {};

function Onimm(id, data_uri) {

	// internal object
	var onimm = {};

	onimm.settings = {
		id : "#"+id,
		data_uri : data_uri,
		data : [],
		margin : {top: -5, right: -5, bottom: -5, left: -5},
		width : 600,
		height : 400,
		radius:20,
		background_color : "#eee",
		stroke_color : "#111",
		totalNodes : 0,
		zoom : null,
		current : {x : 0, y : 0}
	};

	/**
	 * Init all the script
	 */
	onimm.init = function() {

		// ---- When panning the background -----
		onimm.settings.zoom = d3.behavior.zoom()
			.scaleExtent([1, 1])
			.on("zoomstart", onimm.zoomstart)
			.on("zoom", onimm.zoomed)
			.on("zoomend", onimm.zoomend);

		// -------------- When dragging -----
		onimm.settings.drag = d3.behavior.drag()
			.on("dragstart", onimm.dragstarted)
			.on("drag", onimm.dragged)
			.on("dragend", onimm.dragended);

		// ---------- Create SVG element -----
		onimm.svg = d3.select(onimm.settings.id).append("svg:svg")
			.attr("width", onimm.settings.width)
			.attr("height", onimm.settings.height)
			.attr("align", "center")
			.style("border", "1px solid black")
			.attr("id", id + "svg_");

		// -- Create container of elements -----
		onimm.container = onimm.svg.append("g")
			.attr("transform", "translate(" + 0.5*onimm.settings.width + "," + 0.5*onimm.settings.height + ")")
			.attr("class", "g_container_");


		// Load our resources
		d3.json(data_uri, function(error, json) {

			// DEBUG
			if (error) return console.warn(error);

			onimm.settings.data = json;

			onimm.jobs = onimm.container.selectAll("g")
				.data(onimm.settings.data);

			onimm.jobs_enter = onimm.jobs.enter().append("svg:g")
				.classed("jobs", function(d){return d;})
				.classed("draggable", function(d) {return d;});

			onimm.settings.totalNodes = onimm.jobs_enter.size();
				
			onimm.jobs.append("svg:circle")
					.attr("class", "circle")
					.attr("r", onimm.settings.radius)
					.attr("cx", function(d,i) {return d.x = onimm.x_coordinates(i);})
					.attr("cy", function(d,i) {return d.y = onimm.y_coordinates(i);});

			onimm.jobs_text = onimm.jobs.append("svg:text")
					.attr("class", "data-text")
					.attr("x", function(d,i) {return d.x = onimm.x_coordinates(i);})
					.attr("y", function(d,i) {return d.y = onimm.y_coordinates(i);})
					.attr("dx", "0")
					.attr("dy", function(d,i) {return (1.5*onimm.settings.radius);})
					.text(function(d,i) {return d.name})
					.call(onimm.wrap, 10*onimm.settings.radius);

			onimm.jobs.append("foreignObject")
				.attr("width", 2*onimm.settings.radius)
				.attr("height", 2*onimm.settings.radius)
				.attr("x", function(d,i) {return d.x = onimm.x_coordinates(i) - onimm.settings.radius;})
				.attr("y", function(d,i) {return d.y = onimm.y_coordinates(i) - onimm.settings.radius;})
					.append("xhtml:body").attr("class", "foreignObject")
						.html("<img class='bubble' src='./img/bubble.png'>");

			onimm.jobs.call(onimm.settings.drag);
			onimm.svg.call(onimm.settings.zoom);

		}); // End d3.json(uri,function)
	};

	onimm.zoomstart = function(d) {
		d3.event.sourceEvent.stopPropagation();
	};

	onimm.zoomed = function(d) {
		
		var new_x = d3.event.translate[0] + 0.5*onimm.settings.width;
		var new_y = d3.event.translate[1] + 0.5*onimm.settings.height;
		onimm.container.attr("transform", "translate(" + new_x + "," + new_y + ")");
	};

	onimm.zoomend = function(d) {
	};

	// ---- Drag'n'Drop elements ---
	onimm.dragstarted = function(d) {
		d3.event.sourceEvent.stopPropagation();
		d3.select(this).classed("dragging", true);
	};

	// Admitted the dragged element is a svg group g with internal circle and text
	onimm.dragged = function(d) {
		d3.select(this).select('circle').attr("cx", d3.event.x ).attr("cy", d3.event.y);
		//d3.select(this).attr("transform", "translate("+ d3.event.x +","+ d3.event.y +")");
		d3.select(this).select('text').attr("x", d3.event.x).attr("y", d3.event.y);
		d3.select(this).select('foreignObject')
			.attr("x", d3.event.x - onimm.settings.radius).attr("y", d3.event.y - onimm.settings.radius);
		d.x = d3.event.x;
		d.y = d3.event.y;
	};

	onimm.dragended = function(d) {
		d3.select(this).classed("dragging", false);
	};

	/**
	 * Initiate the jobs position with coordinates from polar
	 * @param  {integer} i zero-based index of element
	 * @return {float} x coordinates
	 */
	onimm.x_coordinates = function(i) {
		var x_coordinates = 0.4*(onimm.settings.height*Math.cos(i*(2*Math.PI)/onimm.settings.totalNodes));
		return x_coordinates;
	};
	onimm.y_coordinates = function(i) {
		var y_coordinates = 0.4*(onimm.settings.height*Math.sin(i*(2*Math.PI)/onimm.settings.totalNodes));
		return y_coordinates;
	};

	/**
	 * SVG text doesn't provide line break, so we have to use tspan
	 * This function compute the breaking based on a width given, 
	 * 3 radius
	 */
	onimm.wrap = function(text, width) {
	  text.each(function() {
	    var text = d3.select(this),
	        words = text.text().split(/\s+/).reverse(),
	        word,
	        line = [],
	        lineNumber = 0,
	        lineHeight = 0.7,
	        y = text.attr("y"),
	        dy = parseFloat(text.attr("dy")),
	        dx = parseFloat(text.attr("dx")),
	        tspan = text.text(null).append("tspan").attr("x", text.x).attr("y", text.y).attr("dy", (dy) + "");
	    while (word = words.pop()) {
	      line.push(word);
	      tspan.text(line.join(" "));
	      if (tspan.node().getComputedTextLength() > width) {
	        line.pop();
	        tspan.text(line.join(" "));
	        line = [word];
	        tspan = text.append("tspan")
	        .attr("x", text.x)
	        .attr("y", text.y)
	        .attr("dy", ++lineNumber * lineHeight + (1.2*dy) + "")
	        .attr("dx", ++lineNumber * 0.02 * width + (3*dx) + "")
	        .text(word);
	      }
	    }
	  });
	};


	// Let it go, let it go !
	onimm.init();

	return onimm;
};

// Let it go !
onimm = Onimm("onimm_", "./data/test2.json");

// DEBUG
//console.dir(onimm);

