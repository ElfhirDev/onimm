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

function Onimm(id, met_id, data_uri) {

	// internal object
	var onimm = {};

	onimm.vars = {
		id : "#"+id,
		data_uri : data_uri,
		used_data: [],
		x_coordinates : [],
		y_coordinates : [],
		xCentral: 0,
		yCentral: 0,
		width : 600,
		half_width : 300,
		height : 400,
		half_height : 200,
		radius: 20,
		hierarchie_color: "#FC8C2E",
		collaboration_color: "#C9D800",
		specialisation_color: "#0D7B92",
		supervised: {},
		is_supervised: {},
		collaboration: {},
		specialisation: {},
		is_specialisation: {},
		totalNodes : 0,
		isZoom : null,
		isNodeCentralX: false,
		isNodeCentralY: false,
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
		d3.xml(data_uri, "application/xml", function(error, xml) {

			// DEBUG
			if (error) return console.warn(error);

			onimm.vars.data = onimm.xmlToJson(xml);
			onimm.vars.data = onimm.vars.data.CARTE_HEURISTIQUE.METIER.record;

			// Only keep the jobs with bonds with the met_id
			// onimm.vars.unused_data = onimm.vars.data.splice(i, 1);
			
			for (var a = 0, l = onimm.vars.data.length; a<l; a++) {
				if (onimm.vars.data[a].MET_ID["#text"] === met_id) {	
					onimm.vars.used_data.push(onimm.vars.data[a])			
					onimm.vars.supervised = onimm.vars.data[a].Liens_metiers_supervise;
					onimm.vars.is_supervised = onimm.vars.data[a].Liens_metiers_est_supervise;
					onimm.vars.specialisation = onimm.vars.data[a].Liens_metiers_fils;
					onimm.vars.is_specialisation = onimm.vars.data[a].Liens_metiers_père;
					onimm.vars.collaboration = onimm.vars.data[a].Liens_metiers_collabore;
				}
			}

			// TODO : no splice ; get only data with MET_MET_ID and put in array
			for (var k = 0, m = onimm.vars.data.length ; k<m; k++) {

				// console.log("k : " + k + "  " + onimm.vars.data[k].MET_ID["#text"] + "  " + onimm.vars.collaboration.METIER.record[0].MET_MET_ID['#text']);
				//console.log(typeof(onimm.vars.data[k].MET_ID["#text"]) + "  " + typeof(onimm.vars.collaboration.METIER.record[5].MET_MET_ID['#text']))

				if (onimm.vars.supervised.METIER.hasOwnProperty("record")) {
					if ($.isArray(onimm.vars.supervised.METIER.record)) {
						for (var j = 0, l = onimm.vars.supervised.METIER.record.length; j<l ; j++) {
							if (onimm.vars.data[k].MET_ID["#text"] == onimm.vars.supervised.METIER.record[j].MET_MET_ID['#text']) {
								onimm.vars.used_data.push(onimm.vars.data[k]);
							}
						}
					}
					else {
						if (onimm.vars.data[k].MET_ID["#text"] == onimm.vars.supervised.METIER.record.MET_MET_ID['#text']) {
							onimm.vars.used_data.push(onimm.vars.data[k]);
						}
					}
				}

				if (onimm.vars.is_supervised.METIER.hasOwnProperty("record")) {
					if ($.isArray(onimm.vars.is_supervised.METIER.record)) {
						for (var j = 0, l = onimm.vars.is_supervised.METIER.record.length; j<l; j++) {
							if (onimm.vars.data[k].MET_ID["#text"] == onimm.vars.is_supervised.METIER.record[j].MET_MET_ID['#text']) {
								onimm.vars.used_data.push(onimm.vars.data[k]);
							}
						}
					}
					else {
						if (onimm.vars.data[k].MET_ID["#text"] == onimm.vars.is_supervised.METIER.record.MET_MET_ID['#text']) {
							onimm.vars.used_data.push(onimm.vars.data[k]);
						}
					}	
				}

				if (onimm.vars.specialisation.METIER.hasOwnProperty("record")) {
					if ($.isArray(onimm.vars.specialisation.METIER.record)) {
						for (var j = 0 , l = onimm.vars.specialisation.METIER.record.length; j<l; j++) {
							if (onimm.vars.data[k].MET_ID["#text"] == onimm.vars.specialisation.METIER.record[j].MET_MET_ID['#text']) {
								onimm.vars.used_data.push(onimm.vars.data[k]);
							}
						}
					}
					else {
						if (onimm.vars.data[k].MET_ID["#text"] == onimm.vars.specialisation.METIER.record.MET_MET_ID['#text']) {
							onimm.vars.used_data.push(onimm.vars.data[k]);
						}
					}
				}

				if (onimm.vars.is_specialisation.METIER.hasOwnProperty("record")) {
					if ($.isArray(onimm.vars.is_specialisation.METIER.record)) {
						for (var j = 0, l = onimm.vars.is_specialisation.METIER.record.length; j<l; j++) {
							if (onimm.vars.data[k].MET_ID["#text"] == onimm.vars.is_specialisation.METIER.record[j].MET_MET_ID['#text']) {
								onimm.vars.used_data.push(onimm.vars.data[k]);
							}
						}
					}
					else {
						if (onimm.vars.data[k].MET_ID["#text"] == onimm.vars.is_specialisation.METIER.record.MET_MET_ID['#text']) {
							onimm.vars.used_data.push(onimm.vars.data[k]);
						}
					}
				}

				if (onimm.vars.collaboration.METIER.hasOwnProperty("record")) {
					if ($.isArray(onimm.vars.collaboration.METIER.record)) {
						for (var j = 0, l = onimm.vars.collaboration.METIER.record.length; j<l; j++) {
							if (onimm.vars.data[k].MET_ID['#text'] == onimm.vars.collaboration.METIER.record[j].MET_MET_ID['#text']) {
								//console.log(onimm.vars.data[k].MET_ID['#text'] + " == " + onimm.vars.collaboration.METIER.record[j].MET_MET_ID['#text']);
								onimm.vars.used_data.push(onimm.vars.data[k]);
							}
						}
					}
					else {
						if (onimm.vars.data[k].MET_ID["#text"] == onimm.vars.collaboration.METIER.record.MET_MET_ID['#text']) {
							onimm.vars.used_data.push(onimm.vars.data[k]);
						}
					}
				}
			}

			onimm.vars.all_data = onimm.vars.data;
			onimm.vars.data = onimm.vars.used_data;

			console.dir(onimm.vars.data);

			onimm.jobs = onimm.container.selectAll("g")
				.data(onimm.vars.data);

			onimm.jobs = onimm.jobs.enter().append("svg:g")
				.classed("jobs", function(d){return (2*d + 1);})
				.classed("draggable", function(d) {return (2*d + 1);});

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

			// onimm.init_bonds();

			onimm.jobs_text = onimm.jobs.append("svg:text")
				.attr("class", "data-text")
				.attr("x", function(d,i) {
					return d.x = onimm.vars.x_coordinates[i];
				})
				.attr("y", function(d,i) {
					return d.y = onimm.vars.y_coordinates[i];
				})
				.attr("dx", "0")
				.attr("dy", function(d,i) {return (1.5*onimm.vars.radius);})
				.text(function(d,i) {
					return d.CSLABELFLD["#text"];
				})
				.call(onimm.wrap, 10*onimm.vars.radius);

			onimm.bubble = onimm.jobs.append("svg:foreignObject")
				.attr("class", "bubble-foreignObject")
				.attr("width", 2*onimm.vars.radius)
				.attr("height", 2*onimm.vars.radius)
				.attr("x", function(d,i) {
					return onimm.vars.x_coordinates[i] - onimm.vars.radius;
				})
				.attr("y", function(d,i) {
					return onimm.vars.y_coordinates[i] - onimm.vars.radius;
				})
				.append("xhtml:body").attr("class", "bubble-body")
					.html("<img class='bubble' src='./img/bubble.png'>");


			onimm.jobs.call(onimm.vars.drag);
			onimm.svg.call(onimm.vars.zoom);
	

			// When double click on jobs node (since simple click might be blocked)
			onimm.jobs.on("dblclick", function(d){

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
	
			onimm.init_bonds(onimm.vars.data);

		}); // End d3.json(uri, met_id, function)
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

		if(d.MET_ID["#text"] === met_id) {
			for(var a = 0, l = onimm.vars.totalNodes; a<l; a++) {
				d3.select("#bond_"+a)
					.attr("d", "M "+d3.event.x+","+d3.event.y+" C 0,0 0,0 "+ onimm.vars.x_coordinates[a]+","+ onimm.vars.y_coordinates[a] +"");
				if (onimm.bonds[a][0][0].attributes[3].nodeValue === d.MET_ID["#text"]) {
					onimm.vars.x_coordinates[onimm.bonds[a][0][0].attributes[2].nodeValue] = d3.event.x;
					onimm.vars.y_coordinates[onimm.bonds[a][0][0].attributes[2].nodeValue] = d3.event.y;
					onimm.vars.xCentral = d3.event.x;
					onimm.vars.yCentral = d3.event.y;
				}
			}
		}
		else {
			for (var a = 0, l = onimm.vars.totalNodes; a<l; a++) {
				if (onimm.bonds[a][0][0].attributes[3].nodeValue === d.MET_ID["#text"]) {
					onimm.vars.x_coordinates[a] = d3.event.x;
					onimm.vars.y_coordinates[a] = d3.event.y;
					d3.select("#bond_"+a)
						.attr("d", "M"+ onimm.vars.xCentral+","+onimm.vars.yCentral +"C 0,0 0,0 "+ onimm.vars.x_coordinates[a]+","+ onimm.vars.y_coordinates[a] +"");
				}
			}
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

		if(d.MET_ID["#text"] === met_id) {
			onimm.vars.isNodeCentralX = true;
			return x_coordinates;
		}
		else if (d.MET_ID["#text"] !== met_id && false === onimm.vars.isNodeCentralX) {
			x_coordinates = 0.4*(onimm.vars.height*Math.cos((i)*(2*Math.PI)/(onimm.vars.totalNodes - 1)));
			return x_coordinates;
		}
		else if (d.MET_ID["#text"] !== met_id && true === onimm.vars.isNodeCentralX) {
			x_coordinates = 0.4*(onimm.vars.height*Math.cos((i-1)*(2*Math.PI)/(onimm.vars.totalNodes - 1)));
			return x_coordinates;
		}
	};
	onimm.init_y_coordinates = function(d,i) {
		var y_coordinates = 0;

		if(d.MET_ID["#text"] === met_id) {
			onimm.vars.isNodeCentralY = true;
			return y_coordinates;
		}
		else if (d.MET_ID["#text"] !== met_id && false === onimm.vars.isNodeCentralY) {
			y_coordinates = 0.4*(onimm.vars.height*Math.sin((i)*(2*Math.PI)/(onimm.vars.totalNodes - 1)));
			return y_coordinates;
		}
		else if (d.MET_ID["#text"] !== met_id && true === onimm.vars.isNodeCentralY) {
			y_coordinates = 0.4*(onimm.vars.height*Math.sin((i-1)*(2*Math.PI)/(onimm.vars.totalNodes - 1)));	
			return y_coordinates;
		}
	};

	/**
	 * Create bonds
	 */
	onimm.init_bonds = function(data) {
		
		onimm.bonds = [];
		for (var a = 0, l = onimm.vars.totalNodes; a<l; a++) {
			if (data[a].MET_ID["#text"] !== met_id){
				//console.log(onimm.vars.data[a]);
				onimm.bonds[a] = onimm.bond_container.append("path")
					.attr("class", function(d,i) {return "bond"})
					.attr("id", function(d,i) {return "bond_"+a})
					.attr("num", function(d,i) {return a})
					.attr("met_id", function(d,i) {return data[a].MET_ID["#text"]})
					.attr("fill", "none").attr("stroke-width", "5").attr("stroke", "none")
					.attr("d", "M 0,0 0,0 0,0 "+onimm.vars.x_coordinates[a]+","+onimm.vars.y_coordinates[a]+"");
			}
			else {		
				onimm.bonds[a] = onimm.bond_container.append("path")
					.attr("class", function(d,i) {return "active_bond"})
					.attr("id", function(d,i) {return "bond_"+a})
					.attr("num", function(d,i) {return a})
					.attr("met_id", function(d,i) {return data[a].MET_ID["#text"]})
					.attr("fill", "none").attr("stroke-width", "5").attr("stroke", "none")
					.attr("d", "M 0,0 0,0 0,0 "+onimm.vars.x_coordinates[a]+","+onimm.vars.y_coordinates[a]+"")
				
				// For active node, we get all bonds	
				onimm.vars.supervised = data[a].Liens_metiers_supervise;
				onimm.vars.is_supervised = data[a].Liens_metiers_est_supervise;
				onimm.vars.specialisation = data[a].Liens_metiers_fils;
				onimm.vars.is_specialisation = data[a].Liens_metiers_père;
				onimm.vars.collaboration = data[a].Liens_metiers_collabore;
			}
		}

		for (var b = 0, le = onimm.vars.totalNodes; b<le; b++) {
			// node active doesn't have path svg, so no attr()

			if (onimm.bonds[b].classed("active_bond", true)) {

				if (onimm.vars.supervised.METIER.record != undefined) {
					if ($.isArray(onimm.vars.supervised.METIER.record)) {
						for (var j = 0, l = onimm.vars.supervised.METIER.record.length; j<l ; j++) {
							if (data[b].MET_ID["#text"] == onimm.vars.supervised.METIER.record[j].MET_MET_ID['#text']) {
								onimm.bonds[b].attr("stroke", "#0D7B92");
							}
						}
					}
					else {
						if (data[b].MET_ID["#text"] == onimm.vars.supervised.METIER.record.MET_MET_ID['#text']) {
							onimm.bonds[b].attr("stroke", "#0D7B92");
						}
					}
				}

				if (onimm.vars.is_supervised.METIER.record != undefined) {
					if ($.isArray(onimm.vars.is_supervised.METIER.record)) {
						for (var j = 0, l = onimm.vars.is_supervised.METIER.record.length; j<l; j++) {
							if (data[b].MET_ID["#text"] == onimm.vars.is_supervised.METIER.record[j].MET_MET_ID['#text']) {
								onimm.bonds[b].attr("stroke", "#C9D800");
							}
						}
					}
					else {
						if (data[b].MET_ID["#text"] == onimm.vars.is_supervised.METIER.record.MET_MET_ID['#text']) {
							onimm.bonds[b].attr("stroke", "#C9D800");
						}
					}	
				}

				if (onimm.vars.specialisation.METIER.record != undefined) {
					if ($.isArray(onimm.vars.specialisation.METIER.record)) {
						for (var j = 0 , l = onimm.vars.specialisation.METIER.record.length; j<l; j++) {
							if (data[b].MET_ID["#text"] == onimm.vars.specialisation.METIER.record[j].MET_MET_ID['#text']) {
								onimm.bonds[b].attr("stroke", "#DE0027");
							}
						}
					}
					else {
						if (data[b].MET_ID["#text"] == onimm.vars.specialisation.METIER.record.MET_MET_ID['#text']) {
							onimm.bonds[b].attr("stroke", "#DE0027");
						}
					}
				}

				if (onimm.vars.is_specialisation.METIER.record != undefined) {
					if ($.isArray(onimm.vars.is_specialisation.METIER.record)) {
						for (var j = 0, l = onimm.vars.is_specialisation.METIER.record.length; j<l; j++) {
							if (data[b].MET_ID["#text"] == onimm.vars.is_specialisation.METIER.record[j].MET_MET_ID['#text']) {
								onimm.bonds[b].attr("stroke", "#9D0D15");
							}
						}
					}
					else {
						if (data[b].MET_ID["#text"] == onimm.vars.is_specialisation.METIER.record.MET_MET_ID['#text']) {
							onimm.bonds[b].attr("stroke", "#9D0D15");
						}
					}
				}

				if (onimm.vars.collaboration.METIER.record != undefined) {
					if ($.isArray(onimm.vars.collaboration.METIER.record)) {
						for (var j = 0, l = onimm.vars.collaboration.METIER.record.length; j<l; j++) {
							if (data[b].MET_ID["#text"] == onimm.vars.collaboration.METIER.record[j].MET_MET_ID['#text']) {
								onimm.bonds[b].attr("stroke", "#558DB4");
							}
						}
					}
					else {
						if (data[b].MET_ID["#text"] == onimm.vars.collaboration.METIER.record.MET_MET_ID['#text']) {
							onimm.bonds[b].attr("stroke", "#558DB4");
						}
					}
				}

			}// end if isActive
		}// end for

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

	/* http://stackoverflow.com/questions/7769829/tool-javascript-to-convert-a-xml-string-to-json
	 * var jsonText = JSON.stringify(xmlToJson(xmlDoc)); 
	 * with xmlDoc an xml dom document 
	 */
	onimm.xmlToJson = function(xml) {
		var obj = {};
		if (xml.nodeType == 1) {
			if (xml.attributes.length > 0) {
				obj["attributes"] = {};
				for (var j = 0; j < xml.attributes.length; j++) {
					var attribute = xml.attributes.item(j);
					obj["attributes"][attribute.nodeName] = attribute.nodeValue;
				}
			}
		} else if (xml.nodeType == 3) { 
			obj = xml.nodeValue;
		}            
		if (xml.hasChildNodes()) {
			for (var i = 0; i < xml.childNodes.length; i++) {
				var item = xml.childNodes.item(i);
				var nodeName = item.nodeName;
				if (typeof (obj[nodeName]) == "undefined") {
					obj[nodeName] = onimm.xmlToJson(item);
				} else {
					if (typeof (obj[nodeName].push) == "undefined") {
						var old = obj[nodeName];
						obj[nodeName] = [];
						obj[nodeName].push(old);
					}
					obj[nodeName].push(onimm.xmlToJson(item));
				}
			}
		}
		return obj;
	}

	// Let it go, let it go !
	onimm.init();

	return onimm;
};

// Let it go !
onimm = Onimm("onimm_", "10164", "./data/carte_heuristique.xml");

// DEBUG
//console.dir(onimm);


