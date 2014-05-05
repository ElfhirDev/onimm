/**
 * 2014 © Onisep - tous droits réservés - version 1.1
 * 
 * Created by <jta@onisep.fr> 2014-04-14
 * Last update on 2014-05-05 by <jta@onisep.fr>
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

	onimm.vars = {
		id : "#"+id,
		data_uri : data_uri,
		x_coordinates : [],
		y_coordinates : [],
		width : 600,
		half_width : 300,
		height : 400,
		half_height : 200,
		radius: 20,
		hierarchie_color: "#FC8C2E",
		collaboration_color: "#C9D800",
		specialisation_color: "#0D7B92",
		hierarchie: [],
		collaboration: [],
		specialisation: [],
		totalNodes : 0,
		isZoom : null,
		new_y : 0,
		new_x : 0
	};

	/**
	 * Init all the script
	 */
	onimm.init = function() {

		onimm.init_behavior();

		// Create SVG element container
		onimm.svg = d3.select(onimm.vars.id).append("svg:svg")
			.attr("width", onimm.vars.width)
			.attr("height", onimm.vars.height)
			.attr("align", "center")
			.style("border", "1px solid black")
			.attr("id", id + "svg_");

		// Create sub-container of Bond(s), James Bond
		onimm.bond_container = onimm.svg.append("g")
			.attr("transform", "translate(" + onimm.vars.half_width + "," + onimm.vars.half_height + ")")
			.attr("class", "g_bond_container_");

		// Create sub-container of other elements
		onimm.container = onimm.svg.append("g")
			.attr("transform", "translate(" + onimm.vars.half_width + "," + onimm.vars.half_height + ")")
			.attr("class", "g_container_");

		// Load our resources
		d3.json(data_uri, function(error, json) {

			// DEBUG
			if (error) return console.warn(error);

			onimm.vars.data = json;

			onimm.jobs = onimm.container.selectAll("g")
				.data(onimm.vars.data);

			onimm.jobs = onimm.jobs.enter().append("svg:g")
				.classed("jobs", function(d){return d;})
				.classed("draggable", function(d) {return d;});

			onimm.vars.totalNodes = onimm.jobs.size();

			onimm.jobs.append("svg:circle")
				.attr("class", "circle")
				.attr("r", onimm.vars.radius)
				.attr("cx", function(d,i) {
					onimm.vars.x_coordinates.push(onimm.init_x_coordinates(d,i));
					return d.x = onimm.init_x_coordinates(d,i);
				})
				.attr("cy", function(d,i) {
					onimm.vars.y_coordinates.push(onimm.init_y_coordinates(d,i));
					return d.y = onimm.init_y_coordinates(d,i);
				});

			onimm.init_bonds();

			onimm.jobs_text = onimm.jobs.append("svg:text")
				.attr("class", "data-text")
				.attr("x", function(d,i) {
					onimm.vars.x_coordinates.push(onimm.init_x_coordinates(d,i));
					return d.x = onimm.init_x_coordinates(d,i);
				})
				.attr("y", function(d,i) {
					onimm.vars.y_coordinates.push(onimm.init_y_coordinates(d,i));
					return d.y = onimm.init_y_coordinates(d,i);
				})
				.attr("dx", "0")
				.attr("dy", function(d,i) {return (1.5*onimm.vars.radius);})
				.text(function(d,i) {return d.name})
				.call(onimm.wrap, 10*onimm.vars.radius);

			onimm.bubble = onimm.jobs.append("svg:foreignObject")
				.attr("class", "bubble-foreignObject")
				.attr("width", 2*onimm.vars.radius)
				.attr("height", 2*onimm.vars.radius)
				.attr("x", function(d,i) {return d.x = onimm.init_x_coordinates(d,i) - onimm.vars.radius;})
				.attr("y", function(d,i) {return d.y = onimm.init_y_coordinates(d,i) - onimm.vars.radius;})
					.append("xhtml:body").attr("class", "bubble-body")
						.html("<img class='bubble' src='./img/bubble.png'>");


			onimm.jobs.call(onimm.vars.drag);
			onimm.svg.call(onimm.vars.zoom);
	

			// When double click on jobs node (since simple click might be blocked)
			onimm.jobs.on("click", function(d){

				onimm.vars.zoom.on("zoom", null);
				onimm.vars.zoom = function() {};

				onimm.modale = onimm.svg.append("svg:svg");

				onimm.modale
					.attr("width", onimm.vars.width - 20)
					.attr("height", onimm.vars.height - 20)
					.attr("align", "center")
					.style("fill", "#bbb")
					.attr("id", id + "modale_");

				// -- Create container of elements -----
				onimm.modale_rect = onimm.modale.append("svg:rect")
					.attr("transform", "translate(" + 20 + "," + 20 + ")")
					.attr("width", onimm.vars.width)
					.attr("height", onimm.vars.height)
					.style("fill", "rgba(255,255,255,1)");

				// -- elastic animation ----- 
				onimm.modale_rect
					.transition().duration(1500)
					.attr("width", (onimm.vars.width-40))
					.attr("height", (onimm.vars.height-40));
					

				onimm.modale_leave = onimm.modale.append("foreignObject").attr("class","modale");

				onimm.modale_leave
					.attr("width", 30)
					.attr("height", 30)
					.attr("x", onimm.vars.width - 50)
					.attr("y", (onimm.vars.height - 380))
						.append("xhtml:body").attr("class", "modale-body")
							.html("<img class='modale-close-icon' src='./img/close-icon.png'>");

				onimm.modale_title = onimm.modale.append("svg:text");

				onimm.modale_title
					.transition().duration(3000).delay(500)
					.attr("class", "modale-title")
					.attr("x", 0.4*onimm.vars.width)
					.attr("y", 30)
					.text(d.name);


				// If we click on the close button
				onimm.modale_leave.on("click", function(d) {
					onimm.modale.remove();

					onimm.vars.zoom = d3.behavior.zoom()
						.scaleExtent([1, 1])
						.on("zoomstart", onimm.zoomstart)
						.on("zoom", onimm.zoomed)
						.on("zoomend", onimm.zoomend);

					onimm.svg.call(onimm.vars.zoom);
				});

			});

		}); // End d3.json(uri,function)
	};

	/* ------ methods ------- */

	onimm.init_behavior = function() {
		// When moving the background
		onimm.vars.zoom = d3.behavior.zoom()
			.scaleExtent([1, 1])
			.on("zoomstart", onimm.zoomstart)
			.on("zoom", onimm.zoomed)
			.on("zoomend", onimm.zoomend);

		// When dragging a node
		onimm.vars.drag = d3.behavior.drag()
			.on("dragstart", onimm.dragstarted)
			.on("drag", onimm.dragged)
			.on("dragend", onimm.dragended);
	};

	onimm.zoomstart = function(d) {
		d3.event.sourceEvent.stopPropagation();
	};

	/* TODO : interupt moving when fenetre modale */
	onimm.zoomed = function(d) {
		onimm.vars.new_x = d3.event.translate[0] + onimm.vars.half_width;
		onimm.vars.new_y = d3.event.translate[1] + onimm.vars.half_height;
		onimm.container.attr("transform", "translate(" + onimm.vars.new_x + "," + onimm.vars.new_y + ")");
		onimm.bond_container.attr("transform", "translate(" + onimm.vars.new_x + "," + onimm.vars.new_y + ")");
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
		d3.select(this).select('text').attr("x", d3.event.x).attr("y", d3.event.y)
			.on("mousedown", function() { d3.event.stopPropagation(); });
		d3.select(this).select('.bubble-foreignObject')
			.attr("x", d3.event.x - onimm.vars.radius).attr("y", d3.event.y - onimm.vars.radius)

		d.x = d3.event.x;
		d.y = d3.event.y;

		if(d.isActive === true) {
			for(var a = 1, l = onimm.vars.totalNodes; a<l; a++) {
				d3.select("#bond_"+a)
				.attr("d", "M "+d3.event.x+","+d3.event.y+" C 0,0 0,0 "+ onimm.vars.x_coordinates[a]+","+ onimm.vars.y_coordinates[a] +"");
			}
			onimm.vars.x_coordinates[0] = d3.event.x;
			onimm.vars.y_coordinates[0] = d3.event.y;
		}
		else {
			d3.select("#bond_"+ d.id +"").attr("d", "M "+ onimm.vars.x_coordinates[0] +","+ onimm.vars.y_coordinates[0] +" C 0,0 0,0 "+ d3.event.x +","+ d3.event.y +"");
			onimm.vars.x_coordinates[d.id] = d3.event.x;
			onimm.vars.y_coordinates[d.id] = d3.event.y;
		}	
	};

	onimm.dragended = function(d) {
		d3.select(this).classed("dragging", false);
	};
	
	/**
	 * Initiate the jobs position with coordinates from polar
	 * @param  {integer} i zero-based index of element
	 * @return {float} x coordinates
	 */
	onimm.init_x_coordinates = function(d,i) {
		var x_coordinates = 0;
		if(d.isActive === true) {
			return x_coordinates;
		}
		else {
			x_coordinates = 0.4*(onimm.vars.height*Math.cos((i-1)*(2*Math.PI)/(onimm.vars.totalNodes - 1)));
			return x_coordinates;
		}
	};
	onimm.init_y_coordinates = function(d,i) {
		var y_coordinates = 0;
		if(d.isActive === true) {
			return y_coordinates;
		}
		else {
			y_coordinates = 0.4*(onimm.vars.height*Math.sin((i-1)*(2*Math.PI)/(onimm.vars.totalNodes - 1)));
			return y_coordinates;
		}
	};

	/**
	 * Create bonds
	 */
	onimm.init_bonds = function() {
		onimm.bonds = [];
		for(var a = 0, l = onimm.vars.totalNodes; a<l; a++) {
			if(onimm.vars.data[a].isActive === false){

				onimm.bonds[a] = onimm.bond_container.append("path")
					.attr("class", function(d,i) {return "bond_"})
					.attr("id", function(d,i) {return "bond_"+a})
					.attr("fill", "none").attr("stroke-width", "6").attr("stroke", "none")
					.attr("d", "M 0,0 0,0 0,0 "+onimm.vars.x_coordinates[a]+","+onimm.vars.y_coordinates[a]+"");
			}
			else {		
				onimm.bonds[a] = "isActive";	// Bonds number == nodes number - 1
				onimm.hierarchie = onimm.vars.data[a].hierarchie;	
				onimm.specialisation = onimm.vars.data[a].specialisation;
				onimm.collaboration = onimm.vars.data[a].collaboration;
			}
		}
		for (var a = 0, l = onimm.vars.totalNodes; a<l; a++) {
			// node active doesn't have path svg, so no attr()
			if (onimm.bonds[a] != "isActive") {	
				// Use jQuery inArray, in future use built-in indexOf (<I.E9)
				if (-1 != $.inArray(a, onimm.hierarchie)) {
					onimm.bonds[a].attr("stroke", "#FC8C2E");
				}
				if (-1 != $.inArray(a, onimm.specialisation)) {
					onimm.bonds[a].attr("stroke", "#0D7B92");
				}
				if (-1 != $.inArray(a, onimm.collaboration)) {
					onimm.bonds[a].attr("stroke", "#C9D800");
				}
			}
		}
	}

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
