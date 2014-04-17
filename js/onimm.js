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
		id : id,
		data_uri : data_uri,
		data : [],
		margin : {top: -5, right: -5, bottom: -5, left: -5},
		width : 640,
		height : 400,
		background_color : "#eee",
		stroke_color : "#111",
		totalNodes : 0,
		zoom : null
	};

	/**
	 * Init all the script
	 */
	onimm.init = function() {

		onimm.settings.zoom = d3.behavior.zoom()
			.scaleExtent([1, 10])
			.on("zoom", onimm.zoomed);

		// -------------- When dragging -----
		onimm.settings.drag = d3.behavior.drag()
			.origin(function(d) { return d; })
			.on("dragstart", onimm.dragstarted)
			.on("drag", onimm.dragged)
			.on("dragend", onimm.dragended);

		onimm.svg = d3.select(onimm.settings.id).append("svg:svg")
			.attr("width", onimm.settings.width)
			.attr("height", onimm.settings.height)
			.style("border", "1px solid black")
			.attr("id", id + "svg_")
		.append("g")
			.attr("transform", "translate(" + onimm.settings.margin.left + "," + onimm.settings.margin.right + ")")
			.call(onimm.settings.zoom);

		onimm.rect = onimm.svg.append("svg:rect")
			.attr("width", onimm.settings.width)
			.attr("height", onimm.settings.height)
			.style("fill", "none")
			.style("pointer-events", "all");

		onimm.container = onimm.svg.append("g")

		onimm.container.append("g")
			.attr("class", "x axis")
		  .selectAll("line")
			.data(d3.range(0, onimm.settings.width, 10))
		  .enter().append("line")
			.attr("x1", function(d) { return d; })
			.attr("y1", 0)
			.attr("x2", function(d) { return d; })
			.attr("y2", onimm.settings.height);

		onimm.container.append("g")
			.attr("class", "y axis")
		  .selectAll("line")
			.data(d3.range(0, onimm.settings.height, 10))
		  .enter().append("line")
			.attr("x1", 0)
			.attr("y1", function(d) { return d; })
			.attr("x2", onimm.settings.width)
			.attr("y2", function(d) { return d; });


		// Load our resources
		d3.json(data_uri, function(error, json) {

			// DEBUG
			if (error) return console.warn(error);

			onimm.settings.data = json;

			onimm.board = onimm.container.append("svg:g")
				.attr("class", "board");
				
			onimm.jobs = onimm.board.selectAll("g")
				.data(onimm.settings.data);

			onimm.jobsEnter = onimm.jobs.enter().append("svg:g")
				.attr("class", "jobs")
				.attr("class", "draggable");

			onimm.settings.totalNodes = onimm.jobsEnter.size();
				
			onimm.jobs.append("svg:circle")
					.attr("class", "circle")
					.attr("r", 20)
					.attr("cx", function(d,i) {return onimm.x_coordinates(i);})
					.attr("cy", function(d,i) {return onimm.y_coordinates(i);});
			onimm.jobs.append("svg:text")
					.attr("class", "data-text")
					.attr("x", function(d,i) {return onimm.x_coordinates(i);})
					.attr("y", function(d,i) {return onimm.y_coordinates(i);})
					.text(function(d,i) {return d.name;});
			
			onimm.jobs.call(onimm.settings.drag);
		
				

		}); // End d3.json(uri,function)
	};

	onimm.zoomed = function() {
		onimm.container.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
	};

	onimm.dragstarted = function(d) {
		d3.event.sourceEvent.stopPropagation();
		d3.select(this).classed("dragging", true);
	};

	// Admitted the dragged element is a svg group g with internal circle and text
	onimm.dragged = function(d) {
		d3.select(this).select('circle').attr("cx", d.x = d3.event.x + 0.5*onimm.settings.width).attr("cy", d.y = d3.event.y + 0.5*onimm.settings.height);
		d3.select(this).attr("transfom", "translate("+ d3.event.x + 0.5*onimm.settings.width +","+ d3.event.y + 0.5*onimm.settings.height+")");
		d3.select(this).select('text').attr("x", d.x = d3.event.x + 0.5*onimm.settings.width).attr("y", d.y = d3.event.y + 0.5*onimm.settings.height);
	};

	onimm.dragended = function(d) {
		d3.select(this).classed("dragging", false);
	};

	onimm.x_coordinates = function(i) {
		var x_coordinates = 0.5*(onimm.settings.height*Math.cos(i*(2*Math.PI)/onimm.settings.totalNodes));
		console.log("x"+i+": "+ x_coordinates);
		return x_coordinates + 0.5*onimm.settings.width;
	}

	onimm.y_coordinates = function(i) {
		var y_coordinates = 0.5*(onimm.settings.height*Math.sin(i*(2*Math.PI)/onimm.settings.totalNodes));
		console.log("y"+i+": "+ y_coordinates);
		return y_coordinates + 0.5*onimm.settings.height;
	}

	// Let it go, let it go !
	onimm.init();

	return onimm;
};

// Let it go !
onimm = Onimm("#onimm_", "http://www.jeremy-ta.fr/work/onisep/d3/data/test2.json");

// DEBUG
console.dir(onimm);

