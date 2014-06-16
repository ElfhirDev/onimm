/**
 * 2014 © Onisep - tous droits réservés - version 1.2
 * 
 * Created by <jta@onisep.fr> 2014-04-14
 * Last update on 2014-05-06 by <jta@onisep.fr>
 *
 * Script aiming to render the mind map for a job
 *
 */

// Be sure d3.min.js is called before

"use strict";

function Onimm(id, met_id, data_uri, historic) {

	// internal object
	var onimm = {};

	// TODO : rassembler ici des settings
	onimm.vars = {
		id : "#"+id,
		data_uri : data_uri,
		used_data: [],
		x_coordinates : [],
		y_coordinates : [],
		xCentral: 0,
		yCentral: 0,
		width : 800,
		half_width : 400,
		height : 600,
		half_height : 300,
		radius: 20,
		coordination_color: "#C9D800",
		collaboration_color: "#558DB4",
		coordinated: {},
		is_coordinated: {},
		collaboration: {},
		specialisation: {},
		is_specialisation: {},
		totalNodes : 0,
		isZoom : null,
		isNodeCentralX: false,
		isNodeCentralY: false,
		positionSlide:0,
		new_y : 0,
		new_x : 0,
		current_height_modale: 0,
		historic : historic,
		csKeyFld : [],
		stroke_colors : []
	};

	/**
	 * create svg elements, load data from xml, start all listener
	 */
	onimm.init = function() {

		// Start D3 zoom and drag behavior at line 483
		onimm.init_behavior();

		// Create the main SVG element container
		onimm.svg = d3.select(onimm.vars.id).append("svg:svg")
			.attr("width", onimm.vars.width)
			.attr("height", onimm.vars.height)
			.attr("align", "center")
			.style("border", "1px solid black")
			.attr("id", id + "svg-");

		/* ---- Define markers for design the bonds ---- */
		// mid of bonds
		onimm.marker_handshake = onimm.svg.append("svg:defs")
			.append("svg:marker")
				.attr("id", "handshake").attr("markerWidth", 64).attr("markerHeight", 49)
				.attr("refx", 0).attr("refy", 0).attr("orient", "auto").attr("style","overflow:visible");

		onimm.marker_handshake.append("svg:path")
			.attr("d", "M-19,2 -19,-2 -18.5,-2 -18.5,2 Z M-8,2 -8,-2 -7.5,-2 -7.5,2 Z M -8.9,1.4 -13,2.5 -13,2.2 -11.5,2 -12,-1 -15,0 -13,-2.5 -9,-1 Z M -17.5,2 -17.0,2.3 -13,1.4 -13.1,0.7 -16.4,1.0 -16.4,0 -14.3,-2.6 -16,-2.4 -17.6,-1.1 Z")
			.attr("style", "fill:"+onimm.vars.collaboration_color+"; stroke:"+onimm.vars.collaboration_color+"; stroke-width:0.5px")
			.attr("transform", "translate(-20,0) scale(0.4)")

		// onimm.marker_handshake.append('svg:polygon')
		// 	.attr("points","-10,0 -5,3 -5,-3")
		// 	.attr("style", "fill:"+onimm.vars.collaboration_color+";fill-opacity:1");
		

		// Create sub-container of Bond(s), James Bond
		onimm.bond_container = onimm.svg.append("g")
			.attr("transform", "translate(" + onimm.vars.half_width + "," + onimm.vars.half_height + ")")
			.attr("class", "g-bond-container-");

		// Create sub-container of other elements
		onimm.container = onimm.svg.append("g")
			.attr("transform", "translate(" + onimm.vars.half_width + "," + onimm.vars.half_height + ")")
			.attr("class", "g-container-");

		// Load our resources
		d3.xml(data_uri, "application/xml", function(error, xml) {

			// DEBUG of D3 when import data
			if (error) return console.warn(error);

			// custom xml to json because it's better
			onimm.vars.data = onimm.xmlToJson(xml);
			onimm.vars.data = onimm.vars.data.CARTE_HEURISTIQUE.METIER.record;

			// Get arrays only for the job at the center and for convenience define arrays for bond relation
			for (var a = 0, l = onimm.vars.data.length; a<l; a++) {
				if (onimm.vars.data[a].MET_ID["#text"] === met_id) {	
					onimm.vars.used_data.push(onimm.vars.data[a])			
					onimm.vars.coordinated = onimm.vars.data[a].Liens_metiers_supervise;
					onimm.vars.is_coordinated = onimm.vars.data[a].Liens_metiers_est_supervise;
					onimm.vars.collaboration = onimm.vars.data[a].Liens_metiers_collabore;
				}
			}

			for (var k = 0, m = onimm.vars.data.length ; k<m; k++) {

				if (onimm.vars.coordinated.METIER.hasOwnProperty("record")) {
					if ($.isArray(onimm.vars.coordinated.METIER.record)) {
						for (var j = 0, l = onimm.vars.coordinated.METIER.record.length; j<l ; j++) {
							if (onimm.vars.data[k].MET_ID["#text"] == onimm.vars.coordinated.METIER.record[j].MET_MET_ID['#text']) {
								onimm.vars.used_data.push(onimm.vars.data[k]);
							}
						}
					}
					else {
						if (onimm.vars.data[k].MET_ID["#text"] == onimm.vars.coordinated.METIER.record.MET_MET_ID['#text']) {
							onimm.vars.used_data.push(onimm.vars.data[k]);
						}
					}
				}

				if (onimm.vars.is_coordinated.METIER.hasOwnProperty("record")) {
					if ($.isArray(onimm.vars.is_coordinated.METIER.record)) {
						for (var j = 0, l = onimm.vars.is_coordinated.METIER.record.length; j<l; j++) {
							if (onimm.vars.data[k].MET_ID["#text"] == onimm.vars.is_coordinated.METIER.record[j].MET_MET_ID['#text']) {
								onimm.vars.used_data.push(onimm.vars.data[k]);
							}
						}
					}
					else {
						if (onimm.vars.data[k].MET_ID["#text"] == onimm.vars.is_coordinated.METIER.record.MET_MET_ID['#text']) {
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


			onimm.jobs = onimm.container.selectAll("g")
				.data(onimm.vars.data);

			onimm.jobs = onimm.jobs.enter().append("svg:g")
				.attr("class", function(d){return "draggable jobs";})
				.attr("csKeyFld", function(d) {
					onimm.vars.csKeyFld.push(d.MET_DOMAINE["#text"]);
					return d.MET_DOMAINE["#text"];
				});

			onimm.vars.totalNodes = onimm.jobs.size();

			onimm.circles = onimm.jobs.append("svg:circle")
				.attr("class", "circle")
				.attr("r", onimm.vars.radius)
				.attr("cx", function(d,i) {
					onimm.vars.x_coordinates.push(onimm.init_x_coordinates(d,i));
					return d.x = onimm.init_x_coordinates(d,i);
				})
				.attr("cy", function(d,i) {
					onimm.vars.y_coordinates.push(onimm.init_y_coordinates(d,i));
					return d.y = onimm.init_y_coordinates(d,i);
				})
				.attr("csKeyFld", function(d) {
					onimm.vars.csKeyFld.push(d.MET_DOMAINE["#text"]);
					return d.MET_DOMAINE["#text"];
				})
				.style("stroke", function(d,i) {
					onimm.vars.stroke_colors.push(onimm.init_color_node(d));
					return onimm.init_color_node(d);
				})
				.attr("color_node", function(d,i) {
					return onimm.init_color_node(d);
				});

			//console.dir(onimm.vars.stroke_color);

			onimm.circles.data(onimm.vars.data);

			onimm.jobs_text = onimm.jobs.append("svg:foreignObject")
				.attr("class", "jobs-text-foreignObject")
				.attr("width", 150)
				.attr("height", 100)
				.attr("x", function(d,i) {
					return d.x = onimm.vars.x_coordinates[i] - 3*onimm.vars.radius;
				})
				.attr("y", function(d,i) {
					if (i==0) {
						return d.y = onimm.vars.y_coordinates[i] + 1.2*onimm.vars.radius;
					}
					else return d.y = onimm.vars.y_coordinates[i] + 0.6*onimm.vars.radius;
				})
				.append("xhtml:body").attr("class", "jobs-text-body")
					.html(function(d,i) {
						return "<p class='jobs-text'>"+d.CSLABELFLD["#text"]+ "  " + d.MET_ID["#text"] +"</p>";
					});

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

			onimm.bubble.data(onimm.vars.data);

			onimm.jobs.call(onimm.vars.drag);
			onimm.svg.call(onimm.vars.zoom);

			onimm.set_legend();
	
			onimm.init_bonds(onimm.vars.data);

			d3.select(".bubble-body")
				.html("<img class='bubble-info-icon' src='./img/bubble-info.png'>");

			// Set legend again when clicking on help
			d3.select(".bubble-info-icon").on("dblclick", function(d,i) {});

			d3.select(".bubble-info-icon").on("click", function(d,i) {
				onimm.display_info_job(d, i, onimm.vars.data);
			});

			onimm.jobs.on("click", function(d,i) {
				onimm.move_to_node(d,i,onimm.vars.data);
			});

			onimm.set_historic();

			// Add first hist_node
			if (onimm.vars.historic.length < 1) {
				var node_hist = {
					name : onimm.vars.data[0].CSLABELFLD["#text"],
					met_id : met_id,
					met_domaine : onimm.vars.csKeyFld[0],
					stroke_color :  onimm.vars.stroke_colors[0],
					stroke_colors : onimm.vars.stroke_colors,
					x : 20,
					y : 20 + 30*onimm.vars.historic.length
				};

				onimm.vars.historic.push(node_hist);
			}

			// Historic is udpdated after building all nodes
			// Adding new node only if it is not already in historic
			if (onimm.vars.historic.length > 1) {
				for (var i = 0, l = onimm.vars.historic.length; i < l-1; i++) {
					if (onimm.vars.historic[i].met_id === onimm.vars.historic[l-1].met_id) {
						onimm.vars.historic.pop();
						break;
					}
				}

				// Only display 3 nodes of historic
				if (onimm.vars.historic.length > 5) {
					var shifted = onimm.vars.historic.shift();
					onimm.vars.historic[onimm.vars.historic.length-1].y = shifted.y;
				}
			}

			onimm.update_historic(met_id);

			console.dir(onimm.vars.historic);

		}); // End d3.json(uri, met_id, function)
	};

	/* -----------------------------------------------------=== methods ===---------------------------------------- */

	/** color circle stroke based on the fonction of the job
	 */
	onimm.init_color_node = function(d) {
		
		if (d.MET_DOMAINE["#text"] == "102892") {
			return '#15C06F';
		}

		if (d.MET_DOMAINE["#text"] == "100174") {
			return '#FF6FEF';
		}

		if (d.MET_DOMAINE["#text"] == "102876") {
			return "#B2FF48";
		}

		if (d.MET_DOMAINE["#text"] == "100154") {
			return '#9A82FF';
		}

		if (d.MET_DOMAINE["#text"] == "100158") {
			return '#FD6A8B';
		}

		if (d.MET_DOMAINE["#text"] == "100156") {
			return '#488BFE';
		}

		if (d.MET_DOMAINE["#text"] == "102869") {
			return '#BAB3FF';
		}

		if (d.MET_DOMAINE["#text"] == "100145") {
			return '#FCD919';
		}

		// ---
		// if (d.MET_DOMAINE["#text"] == "1001") {
		// 	return '#33DDD0';
		// }

		// if (d.MET_DOMAINE["#text"] == "1001") {
		// 	return '#FD4F84';
		// }

		// if (d.MET_DOMAINE["#text"] == "1001") {
		// 	return '#BAB3FF';
		// }

		// if (d.MET_DOMAINE["#text"] == "1001") {
		// 	return '#7DCAFE';
		// }

		// if (d.MET_DOMAINE["#text"] == "1001") {
		// 	return '#D3FFC1';
		// }

		// if (d.MET_DOMAINE["#text"] == "100") {
		// 	return '#FDD580';
		// }

		// if (d.MET_DOMAINE["#text"] == "100") {
		// 	return '#91ACE6';
		// }

		// if (d.MET_DOMAINE["#text"] == "100") {
		// 	return '#FCA145';
		// }

		else {
			return '#000000';
		}

	};

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
		d3.select(this).select('.jobs-text-foreignObject')
			.attr("x", d3.event.x - 3*onimm.vars.radius)
			.attr("y", d3.event.y + 0.6*onimm.vars.radius)
			.on("mousedown", function() { d3.event.stopPropagation(); });
		d3.select(this).select('.bubble-foreignObject')
			.attr("x", d3.event.x - onimm.vars.radius).attr("y", d3.event.y - onimm.vars.radius)

		d.x = d3.event.x;
		d.y = d3.event.y;

		if(d.MET_ID["#text"] === met_id) {
			for(var a = 0, l = onimm.vars.totalNodes; a<l; a++) {
				d3.select("#bond-"+a)
					.attr("d", "M "+d3.event.x+","+d3.event.y+" C 0,0 0,0 "+ onimm.vars.x_coordinates[a]+","+ onimm.vars.y_coordinates[a] +"");
				if (onimm.bonds[a][0][0].attributes[3].nodeValue === d.MET_ID["#text"]) {
					onimm.vars.x_coordinates[onimm.bonds[a][0][0].attributes[2].nodeValue] = d3.event.x;
					onimm.vars.y_coordinates[onimm.bonds[a][0][0].attributes[2].nodeValue] = d3.event.y;
					onimm.vars.xCentral = d3.event.x;
					onimm.vars.yCentral = d3.event.y;
				}
			}
			d3.select(this).select('.bubble-foreignObject')
				.attr("x", d3.event.x - 10 - onimm.vars.radius).attr("y", d3.event.y - 10 - onimm.vars.radius);
			d3.select(this).select('.jobs-text-foreignObject')
				.attr("y", d3.event.y + 10 +onimm.vars.radius);

		}
		else {
			for (var a = 0, l = onimm.vars.totalNodes; a<l; a++) {
				if (onimm.bonds[a][0][0].attributes[3].nodeValue === d.MET_ID["#text"]) {
					onimm.vars.x_coordinates[a] = d3.event.x;
					onimm.vars.y_coordinates[a] = d3.event.y;
					d3.select("#bond-"+a)
						.attr("d", "M"+ onimm.vars.xCentral+","+onimm.vars.yCentral +"C 0,0 0,0 "+ onimm.vars.x_coordinates[a]+","+ onimm.vars.y_coordinates[a] +"");
				}
			}
		}
	};

	onimm.dragged_modale = function(d) {
		d3.select('.info-job-foreignObject')
			.attr("x", d3.event.x -100)
			.attr("y", d3.event.y -180);
	};

	onimm.dragended = function(d) {
		d3.select(this).classed("dragging", false);
	};

	onimm.set_legend = function() {
		onimm.container_legend = onimm.svg.append("svg:g")
			.attr("class","g-container-legend");

		onimm.rect_legend = onimm.container_legend.append("svg:rect")
			.attr("x", 0.80*onimm.vars.width)
			.attr("y", 0.05*onimm.vars.half_height)
			.attr("width", 0.17*onimm.vars.width)
			.attr("height", 0.35*onimm.vars.height)
			.style("fill", "rgba(255,255,255,1)");

		onimm.legend_1 = onimm.container_legend.append("svg:line")
			.attr("class", function(d,i) {return "bond"})
			.attr("x1", 0.85*onimm.vars.width)
			.attr("y1", 0.1*onimm.vars.half_height)
			.attr("x2", 0.92*onimm.vars.width)
			.attr("y2", 0.1*onimm.vars.half_height)
			.attr("stroke-width","5").attr("stroke", onimm.vars.coordination_color);

		onimm.legend_1_text = onimm.container_legend.append("svg:foreignObject")
			.attr("class", "jobs-text-foreignObject")
			.attr("width", 120)
			.attr("height", 100)
			.attr("x", 0.81*onimm.vars.width)
			.attr("y", 0.12*onimm.vars.half_height)
			.append("xhtml:body").attr("class", "jobs-text-body")
				.html(function(d,i) {
					return "<p class='text-legend'>Coordination</p>";
				});

		onimm.legend_2 = onimm.container_legend.append("svg:line")
			.attr("class", function(d,i) {return "bond"})
			.attr("x2", 0.85*onimm.vars.width)
			.attr("y2", 0.30*onimm.vars.half_height)
			.attr("x1", 0.90*onimm.vars.width)
			.attr("y1", 0.30*onimm.vars.half_height)
			.attr("stroke-width","5").attr("stroke", onimm.vars.collaboration_color).attr("stroke-dasharray", "5,10");

		// onimm.legend_2.attr("marker-end", "url(#handshake)");

		onimm.marker_handshake_legend = onimm.container_legend.append("svg:path")
			.attr("d", "M-19,2 -19,-2 -18.5,-2 -18.5,2 Z M-8,2 -8,-2 -7.5,-2 -7.5,2 Z M -8.9,1.4 -13,2.5 -13,2.2 -11.5,2 -12,-1 -15,0 -13,-2.5 -9,-1 Z M -17.5,2 -17.0,2.3 -13,1.4 -13.1,0.7 -16.4,1.0 -16.4,0 -14.3,-2.6 -16,-2.4 -17.6,-1.1 Z")
			.attr("style", "fill:"+onimm.vars.collaboration_color+"; stroke:"+onimm.vars.collaboration_color+"; stroke-width:0.5px");

		onimm.marker_handshake_legend.attr("transform", "scale(1.8) translate("+1.06*onimm.vars.half_width+","+0.084*onimm.vars.height+")");


		onimm.legend_2_text = onimm.container_legend.append("svg:foreignObject")
			.attr("class", "jobs-text-foreignObject")
			.attr("width", 120)
			.attr("height", 100)
			.attr("x", 0.81*onimm.vars.width)
			.attr("y", 0.32*onimm.vars.half_height)
			.append("xhtml:body").attr("class", "jobs-text-body")
				.html(function(d,i) {
					return "<p class='text-legend'>Collaboration</p>";
				});

		onimm.legend_3_text = onimm.container_legend.append("svg:foreignObject")
			.attr("class", "jobs-text-foreignObject")
			.attr("width", 120)
			.attr("height", 100)
			.attr("x", 0.81*onimm.vars.width)
			.attr("y", 0.40*onimm.vars.half_height)
			.append("xhtml:body").attr("class", "jobs-text-body")
				.html(function(d,i) {
					return "<p class='instruction-legend'>Cliquez sur le noeud central pour avoir des informations</p>"
						+"<p class='instruction-legend'>Cliquez sur les autres noeuds pour naviguer vers eux.</p>";
				});

		onimm.legend_leave = onimm.createForeignObject(onimm.container_legend, "legend-close", 30, 30, onimm.vars.width-40, 0);
		onimm.createImg(onimm.legend_leave, "legend-close-icon", "./img/close-icon.png");

		onimm.legend_leave.on("click", function(d) {
			onimm.close_legend();
			onimm.set_legend_helper();
		});
	};

	onimm.set_historic = function() {
		onimm.container_historic = onimm.svg.append("svg:g")
			.attr("transform", "translate(-150,0)")
			.attr("class", "g-container-historic");

		onimm.historic_image = onimm.createForeignObject(onimm.container_historic, "historic-image", 30, 30, 0.21*onimm.vars.width, 10);
		onimm.createImg(onimm.historic_image, "historic-icon", "./img/historic-icon.png");

		onimm.historic_title = onimm.container_historic.append("svg:foreignObject")
			.attr("class", "historic-title-foreignObject")
			.attr("width", 120)
			.attr("height", 100)
			.attr("x", 0.25*onimm.vars.width)
			.attr("y", 0.001*onimm.vars.half_height)
			.append("xhtml:body").attr("class", "historic-title-body")
				.html(function(d,i) {
					return "<p class='historic-title'>Historique</p>";
				});


	};

	onimm.close_legend = function() {
		onimm.container_legend.remove();
	};

	onimm.close_historic = function() {
		onimm.container_historic.remove();
	};

	onimm.set_legend_helper = function() {
		onimm.help_legend_container = onimm.svg.append("svg:g").attr("id", "g-help-text");
		onimm.help_legend = onimm.help_legend_container.append("svg:foreignObject")
			.attr("class", "help-text-foreignObject")
			.attr("width", 50)
			.attr("height", 50)
			.attr("x", 0.90*onimm.vars.width)
			.attr("y", 0.05*onimm.vars.half_height)
			.append("xhtml:body").attr("class", "help-text-body")
				.html(function(d,i) {
					return "<p class='help-text-legend'>Aide</p>";
				});	

		// Set legend again when clicking on help
		onimm.help_legend.on("click", function(d) {
			onimm.help_legend_container.remove();
			onimm.set_legend();
		});
	};

	onimm.set_historic_helper = function() {
		onimm.historic_helper_container = onimm.svg.append("svg:g").attr("id", "g-historic-text");
		onimm.historic_helper = onimm.historic_helper_container.append("svg:foreignObject")
			.attr("class", "historic-text-foreignObject")
			.attr("width", 100)
			.attr("height", 50)
			.attr("x", 20)
			.attr("y", 0.05*onimm.vars.half_height)
			.append("xhtml:body").attr("class", "historic-text-body")
				.html(function(d,i) {
					return "<p class='historic-text'>Historique</p>";
				});	

		// Set historic again when clicking on historique
		// onimm.historic_helper.on("click", function(d) {
		// 	onimm.historic_helper_container.remove();
		// 	onimm.set_historic();
		// });
	};

	onimm.update_historic = function(new_met_id) {

		onimm.hist_nodes = onimm.container_historic.selectAll(".hist-nodes")
			.data(onimm.vars.historic);

		onimm.hist_nodes = onimm.hist_nodes.enter().append("svg:g")
			.classed("hist-nodes", function(d) {return d;})
			.attr("hist", function(d,i) {return i;})

		//console.dir(onimm.vars.historic);

		onimm.hist_nodes.append("svg:circle")
			.attr("class", "circle hist-nodes-bubbles")
			.attr("r", 0.5*onimm.vars.radius)
			.attr("cx", function(d,i) {
				return 180;
			})
			.attr("cy", function(d,i) {
				return 30 + 1.5*onimm.vars.historic[i]["y"];
			})
			.attr("met_domaine", function(d,i) {
				return onimm.vars.historic[i]["met_domaine"];
			})
			.attr("met_id", function(d,i) {
				return onimm.vars.historic[i]["met_id"];
			})
			.style("stroke", function(d,i) {
				return onimm.vars.historic[i]["stroke_color"];
			});

		onimm.text_hist_nodes = onimm.hist_nodes.append("svg:foreignObject")
			.attr("class", "hist-nodes-foreignObject")
			.attr("width", 160)
			.attr("height", 80)
			.attr("x", function(d,i) {
				return 170;
			})
			.attr("y", function(d,i) {
				return 10 + 1.5*onimm.vars.historic[i]["y"];
			})
			.attr("met_domaine", function(d,i) {
				return onimm.vars.historic[i]["met_domaine"];
			})
			.attr("met_id", function(d,i) {
				return onimm.vars.historic[i]["met_id"];
			})
			.append("xhtml:body").attr("class", "hist-nodes-text-body")
				.html(function(d,i) {
					return "<div class='hist-nodes-div'>"
					+"<p class='hist-nodes-text'>"+d.name+"</p>";
				});

		d3.selectAll(".hist-nodes-text-body").each(function(d,i) {
			d3.select(this)
				.attr("met_domaine", function(d,i) {
					return onimm.vars.historic[i]["met_domaine"];
				})
				.attr("met_id", function(d,i) {
					return onimm.vars.historic[i]["met_id"];
				});
		});

		onimm.bubble_hist_nodes = onimm.hist_nodes.append("svg:foreignObject")
			.attr("class", "bubble-hist-nodes")
			.attr("width", onimm.vars.radius)
			.attr("height", onimm.vars.radius)
			.attr("x", function(d,i) {
				return 170;
			})
			.attr("y", function(d,i) {
				return 20 + 1.5*onimm.vars.historic[i]["y"];
			})
			.append("xhtml:body").attr("class", "bubble-body")
				.html("<img class='bubble-' src='./img/bubble-hist.png'>");


		d3.selectAll(".hist-nodes-text-body").each(function(d,i) {
			if (d.met_id == met_id) {
				d3.select(this).style("font-weight", "bold");
			}
		});

		// Click on historic node will change the central node
		onimm.hist_nodes.on("click", function(d,i) {
			
			//console.dir(d);
			//console.dir(onimm.vars.data);

			d3.selectAll(".g-bond-container-").transition().duration(200)
				.style("opacity", 0);

			d3.selectAll(".jobs").transition().duration(750)
				.attr("transform", function(d,i) {
					return "translate("+onimm.vars.x_coordinates[i]+","+onimm.vars.y_coordinates[i]+")";
				});

			// Change node with historic
			$("#onimm-svg-").fadeOut(1000, function() {
				$("#onimm-svg-").remove();
				Onimm("onimm-", onimm.vars.data[0].MET_ID["#text"], "./data/carte_heuristique.xml", onimm.vars.historic);
			});
		});



	};

	// TODO :The location is sometimes not appropriate
	onimm.display_info_job = function(d, i , data) {

		d3.select(".bubble-info-icon").on("click", function() {});

		onimm.container.transition()
			.duration(750)
			.attr("transform","translate(80,300)");

		onimm.bond_container.transition()
			.duration(750)
			.attr("transform","translate(80,300)");

		d3.selectAll(".g-container-historic").transition().duration(200)
			.style("opacity", 0);

		var content = "";
		for (var j = 0, l = data[i].Thesaurus.CSTM_T.record.length; j<l; j++) {
			if (data[i].MET_DOMAINE["#text"] === data[i].Thesaurus.CSTM_T.record[j].DKEY["#text"]) {
				onimm.info_job = onimm.container.append("svg:foreignObject");

				onimm.info_job.transition()
					.duration(1000).ease('linear')
					.attr("class","info-job-foreignObject")
					.attr("width", 500).attr("height", 400)
					.attr("x", 50)
					.attr("y", -150);

				onimm.info_job
					.append("xhtml:body").attr("class", "info-job-body")
					.append("div")
					.attr("class", "info-job")
					.html("<img class='modale-close-icon' src='./img/close-icon.png'>"
						+"<p class='modale-h4'>Informations</p>"
						+"<p class='info-job-text'>Métier ayant une "+data[i].Thesaurus.CSTM_T.record[j].CSLABELFLD["#text"]+".</p>");
			}
		}


		for (var k = 0, m = data[i].Thesaurus.CSTM_T.record.length; k<m; k++) {
			if (data[i].MET_CATEGORIE_SOCIO_PRO["#text"] === data[i].Thesaurus.CSTM_T.record[k].DKEY["#text"]) {
				content = d3.select(".info-job").html();
				d3.select(".info-job").html(content
					+"<p class='info-job-text'><em>Statut</em> : "+data[i].Thesaurus.CSTM_T.record[k].CSLABELFLD["#text"]+"</p>");
			}
		}

		content = d3.select(".info-job").html();
		d3.select(".info-job").html(content
			+"<p class='info-job-text'><em>Niveaux d'étude</em> : "+data[i].Niveaux_d_étude_requis.NIVEAU_ETUDE.record.CSLABELFLD["#text"]+"</p>");

		var centre_interets = data[i].MET_CENTRE_INTERET["#text"].split("/");

		content = d3.select(".info-job").html();
		d3.select(".info-job").html(content
			+"<p class='info-job-text'><em>Intérêt(s)</em> : </p><p class='info-job-text-interet'>");

		for (var v = 0 , q = data[i].Thesaurus.CSTM_T.record.length; v<q; v++) {
			for (var u = 0, p = centre_interets.length; u<p; u++) {
				if (centre_interets[u] == data[i].Thesaurus.CSTM_T.record[v].DKEY["#text"]) {
					content = d3.select(".info-job-text-interet").html();
					d3.select(".info-job-text-interet").html(content
						+data[i].Thesaurus.CSTM_T.record[v].CSLABELFLD["#text"]+" - ");
				}
			}
		}

		content = d3.select(".info-job").html();
		d3.select(".info-job").html(content);

		content = d3.select(".info-job").html();
		d3.select(".info-job").html(content
			+"<p class='info-job-more'>Cliquez ici pour "
			+"<a target='_blank' href='http://www.onisep.fr/http/redirection/metier/identifiant/"+data[i].MET_ID['#text']+"'>en savoir plus</a></p>");

		// +"<img class='bubble-triangle-icon' src='./img/bubble-triangle.png'>");
		
		d3.select(".modale-close-icon").on("dblclick", function() {});

		d3.select(".modale-close-icon").on("click", function() {
			d3.select(".info-job-foreignObject").remove();

			onimm.container.transition()
				.duration(750)
				.attr("transform","translate(400,300)");

			onimm.bond_container.transition()
				.duration(750)
				.attr("transform","translate(400,300)");

			d3.selectAll(".g-container-historic").transition().duration(400)
				.style("opacity", 1);

			d3.select(".bubble-info-icon").on("click", function(d,i) {
				onimm.display_info_job(d, i, onimm.vars.data);
			});

		});

		onimm.vars.drag_modale = d3.behavior.drag()
			.on("dragstart", onimm.dragstarted)
			.on("drag", onimm.dragged_modale)
			.on("dragend", onimm.dragended);

		d3.select(".info-job-foreignObject").call(onimm.vars.drag_modale);

	};

	onimm.hide_info_hover_node = function(d,i) {
		d3.selectAll(".info-hover-foreignObject").remove();
	}

	
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
	 * Create bonds with color, marker, text
	 */
	onimm.init_bonds = function(data) {
		
		// set bonds coordinates and load array
		onimm.bonds = [];
		for (var a = 0, l = onimm.vars.totalNodes; a<l; a++) {
			if (data[a].MET_ID["#text"] !== met_id){
				onimm.bonds[a] = onimm.bond_container.append("path")
					.attr("class", function(d,i) {return "bond"})
					.attr("id", function(d,i) {return "bond-"+a})
					.attr("num", function(d,i) {return a})
					.attr("met_id", function(d,i) {return data[a].MET_ID["#text"]})
					.attr("fill", "none").attr("stroke-width", "5").attr("stroke", "none")
					.attr("d", "M 0,0 0,0 0,0 "+onimm.vars.x_coordinates[a]+","+onimm.vars.y_coordinates[a]+"");
			}
			else {		
				onimm.bonds[a] = onimm.bond_container.append("path")
					.attr("class", function(d,i) {return "active-bond"})
					.attr("id", function(d,i) {return "bond_"+a})
					.attr("num", function(d,i) {return a})
					.attr("met_id", function(d,i) {return data[a].MET_ID["#text"]})
					.attr("fill", "none").attr("stroke-width", "5").attr("stroke", "none")
					.attr("d", "M 0,0 0,0 0,0 "+onimm.vars.x_coordinates[a]+","+onimm.vars.y_coordinates[a]+"")
				
				// For active node, we get the data
				onimm.vars.coordinated = data[a].Liens_metiers_supervise;
				onimm.vars.is_coordinated = data[a].Liens_metiers_est_supervise;
				onimm.vars.collaboration = data[a].Liens_metiers_collabore;

				// The circle must be a little bit larger
				d3.select("circle").attr("r", onimm.vars.radius+10);
				onimm.jobs.attr("class", function(d,i) { 
					if (i==0) {
						return "active-node draggable jobs";
					}
					else return "draggable jobs";
				});
				
				d3.select(".bubble-foreignObject")
					.attr('width', function(d,i) {
						if (i==0) {
							return 2*onimm.vars.radius+20;
						}
					})
					.attr('height', function(d,i) {
						if (i==0) {
							return 2*onimm.vars.radius+20;
						}
					})
					.attr('x', function(d,i) {
						if (i==0) {
							return -onimm.vars.radius-10;
						}
					})
					.attr('y', function(d,i) {
						if (i==0) {
							return -onimm.vars.radius-10;
						}
					});
			}
		}

		for (var b = 0, le = onimm.vars.totalNodes; b<le; b++) {

			if (onimm.bonds[b].classed("active-bond", true)) {
				// Since the record in xml may be an array we have to test
				if (onimm.vars.coordinated.METIER.record != undefined) {
					if ($.isArray(onimm.vars.coordinated.METIER.record)) {
						for (var j = 0, l = onimm.vars.coordinated.METIER.record.length; j<l ; j++) {
							if (data[b].MET_ID["#text"] == onimm.vars.coordinated.METIER.record[j].MET_MET_ID['#text']) {
								onimm.bonds[b].attr("stroke", onimm.vars.coordination_color);
							}
						}
					}
					else {
						if (data[b].MET_ID["#text"] == onimm.vars.coordinated.METIER.record.MET_MET_ID['#text']) {
							onimm.bonds[b].attr("stroke", onimm.vars.coordination_color);
						}
					}
				}

				if (onimm.vars.is_coordinated.METIER.record != undefined) {
					if ($.isArray(onimm.vars.is_coordinated.METIER.record)) {
						for (var j = 0, l = onimm.vars.is_coordinated.METIER.record.length; j<l; j++) {
							if (data[b].MET_ID["#text"] == onimm.vars.is_coordinated.METIER.record[j].MET_MET_ID['#text']) {
								onimm.bonds[b].attr("stroke", onimm.vars.coordination_color)
							}
						}
					}
					else {
						if (data[b].MET_ID["#text"] == onimm.vars.is_coordinated.METIER.record.MET_MET_ID['#text']) {
							onimm.bonds[b].attr("stroke", onimm.vars.coordination_color);
						}
					}	
				}

				if (onimm.vars.collaboration.METIER.record != undefined) {
					if ($.isArray(onimm.vars.collaboration.METIER.record)) {
						for (var j = 0, l = onimm.vars.collaboration.METIER.record.length; j<l; j++) {
							if (data[b].MET_ID["#text"] == onimm.vars.collaboration.METIER.record[j].MET_MET_ID['#text']) {
								onimm.bonds[b].attr("stroke", onimm.vars.collaboration_color)
								.attr("stroke-dasharray", "5,17")
								.attr("marker-end", "url(#handshake)");
							}
						}
					}
					else {
						if (data[b].MET_ID["#text"] == onimm.vars.collaboration.METIER.record.MET_MET_ID['#text']) {
							onimm.bonds[b].attr("stroke", onimm.vars.collaboration_color)
							.attr("stroke-dasharray", "5,17")
							.attr("marker-end", "url(#handshake)");
						}
					}
				}
			}// end if isActive
		}// end for
	};


	// TODO 
	/**
	 * Changing to other node
	 * @param  d3.selection d the previous clicked node
	 * @param  integer i the number of the element
	 * @param  big json data onimm.vars.data from xml
	 */
	onimm.move_to_node = function(e,j,data) {
		if (j != 0 ) {

			var node_hist = {
				name : e.CSLABELFLD["#text"],
				met_id : e.MET_ID["#text"],
				met_domaine : e.MET_DOMAINE["#text"],
				stroke_color :  onimm.init_color_node(e),
				stroke_colors : onimm.vars.stroke_color,
				x : 20,
				y : 20 + 30*onimm.vars.historic.length
			};

			onimm.vars.historic.push(node_hist);

			d3.selectAll(".g-bond-container-").transition().duration(200)
				.style("opacity", 0);

			d3.selectAll(".jobs").transition().duration(750)
				.attr("transform", function(d,i) {
					return "translate("+onimm.vars.x_coordinates[i]+","+onimm.vars.y_coordinates[i]+")";
				});

			// Change node with historic
			$("#onimm-svg-").fadeOut(1000, function() {
				$("#onimm-svg-").remove();
				Onimm("onimm-", e.MET_ID["#text"], "./data/carte_heuristique.xml", onimm.vars.historic);
			});
		}
	};

	onimm.createForeignObject = function(container, name, width, height, x, y) {

		onimm[""+name] = container.append("svg:foreignObject")
			.attr("class", name+"-foreignObject")
			.attr("width", width)
			.attr("height", height)
			.attr("x", x)
			.attr("y", y)
			.append("xhtml:body").attr("class", name+"-body");

		return onimm[""+name];
	};

	onimm.createImg = function(container, name, url) {
		container.html("<img class='"+name+"' src='"+url+"'>");
		return container;
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
	//console.log(onimm.vars.historic);

	return onimm;
};

// Let it go !
// onimm = Onimm("onimm_", "10183", "./data/carte_heuristique.xml");

// DEBUG
//console.dir(onimm);
