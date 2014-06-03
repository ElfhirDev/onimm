/**
 * 2014 © Onisep - tous droits réservés - version 1.2
 * 
 * Created by <jta@onisep.fr> 2014-04-14
 * Last update on 2014-02-06 by <jta@onisep.fr>
 *
 * Script aiming to render the mind map for a job
 *
 */

// Be sure d3.min.js is called before

"use strict";

function Onimm(id, met_id, data_uri) {

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
		current_height_modale: 0
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
			.attr("id", id + "svg_");

		/* ---- Define markers for design the bonds ---- */
		// // end of bonds
		// onimm.marker_end = onimm.svg.append("svg:defs")
		// 	.append("svg:marker")
		// 		.attr("id", "marker_arrow_end").attr("markerWidth", 10).attr("markerHeight", 10)
		// 		.attr("refx", 0).attr("refy", 0).attr("orient", "auto").attr("style","overflow:visible");

		// onimm.marker_end.append("svg:polygon")
		// 		.attr("points", "0,0 -12,3 -12,-3")
		// 		.attr("style", "fill:"+onimm.vars.collaboration_color+"; stroke:"+onimm.vars.collaboration_color+"; stroke-width:1px");
		
		// // start of bonds
		// onimm.marker_start = onimm.svg.append("svg:defs")
		// 	.append("svg:marker")
		// 		.attr("id", "marker_arrow_start").attr("markerWidth", 10).attr("markerHeight", 10)
		// 		.attr("refx", 0).attr("refy", 0).attr("orient", "auto").attr("style","overflow:visible");

		// onimm.marker_start.append("svg:polygon")
		// 		.attr("points", "0,0 12,3 12,-3")
		// 		.attr("style", "fill:"+onimm.vars.coordination_color+"; stroke:"+onimm.vars.coordination_color+"; stroke-width:1px");

		// mid of bonds
		onimm.marker_handshake = onimm.svg.append("svg:defs")
			.append("svg:marker")
				.attr("id", "handshake").attr("markerWidth", 64).attr("markerHeight", 49)
				.attr("refx", 0).attr("refy", 0).attr("orient", "auto").attr("style","overflow:visible");

		onimm.marker_handshake.append("svg:path")
			.attr("d", "M-19,2 -19,-2 -18.5,-2 -18.5,2 Z M-8,2 -8,-2 -7.5,-2 -7.5,2 Z M -8.9,1.4 -13,2.5 -13,2.2 -11.5,2 -12,-1 -15,0 -13,-2.5 -9,-1 Z M -17.5,2 -17.0,2.3 -13,1.4 -13.1,0.7 -16.4,1.0 -16.4,0 -14.3,-2.6 -16,-2.4 -17.6,-1.1 Z")
			.attr("style", "fill:"+onimm.vars.collaboration_color+"; stroke:"+onimm.vars.collaboration_color+"; stroke-width:0.5px")
			.attr("transform", "translate(-11.5,0) scale(0.7)")

		// onimm.marker_handshake.append('svg:polygon')
		// 	.attr("points","-10,0 -5,3 -5,-3")
		// 	.attr("style", "fill:"+onimm.vars.collaboration_color+";fill-opacity:1");
		

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

			//console.dir(onimm.vars.data);

			onimm.jobs = onimm.container.selectAll("g")
				.data(onimm.vars.data);

			onimm.jobs = onimm.jobs.enter().append("svg:g")
				.attr("class", function(d){return "draggable jobs";});

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

			onimm.jobs_text = onimm.jobs.append("svg:foreignObject")
				.attr("class", "jobs-text-foreignObject")
				.attr("width", 140)
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
						return "<p class='jobs-text'>"+d.CSLABELFLD["#text"]+"</p>";
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


			onimm.jobs.call(onimm.vars.drag);
			onimm.svg.call(onimm.vars.zoom);

			// Keydown arrow control for testing
			$(document).ready(function() {
				$(document).live("keydown.modale", function(event) {
					onimm.keydownlistener(event);
				});
			});

			onimm.set_legend();

			// TODO
			onimm.jobs.on("mouseenter", function(d,i) {
				var x = d3.mouse(this)[0];
       			var y = d3.mouse(this)[1];
				onimm.display_info_hover_node(d, i, onimm.vars.data, x, y);
			});

			onimm.jobs.on("mouseleave", function(d,i) {
				onimm.hide_info_hover_node(d,i);
			});

			// When double click on jobs node (since simple click might be blocked)
			onimm.jobs.on("dblclick", function(d){

				//console.dir(d);

				// Stop behavior zoom when modale window
				onimm.vars.zoom.on("zoom", null);
				onimm.vars.zoom = function() {};

				onimm.modale = onimm.svg.append("svg:svg");

				onimm.modale
					.attr("width", onimm.vars.width)
					.attr("height", onimm.vars.height)
					.attr("align", "center")
					.style("fill", "#bbb")
					.attr("id", id + "modale_"+d.MET_ID["#text"]);

				// -- Create container of elements -----
				onimm.modale_rect = onimm.modale.append("svg:rect")
					.attr("transform", "translate(" + 20 + "," + 20 + ")")
					.attr("width", onimm.vars.width)
					.attr("height", onimm.vars.height)
					.style("fill", "rgba(255,255,255,1)");

				// -- elastic animation ----- 
				onimm.modale_rect
					.attr("width", (onimm.vars.width-40))
					.attr("height", (onimm.vars.height-40));	

				onimm.modale_foreignObject = onimm.modale.append("svg:foreignObject").attr("class", "modale-foreignObject");

				// Load the content
				onimm.modale_window = onimm.modale_foreignObject
					.attr("width", (onimm.vars.width-40))
					.attr("height", (onimm.vars.height-40))
					.attr("x", function(d,i) {return 20;})
					.attr("y", function(d,i) {return 20;})
						.append("xhtml:body").attr("class", "modale-body");

				onimm.modale_content = onimm.modale_window.append("xhtml:div").attr("class", "modale-container")
				onimm.modale_overflow = onimm.modale_content
					.append("xhtml:div").attr("class", "modale-overflow")
						.html(function() { return onimm.init_modale_window(d);});

				onimm.modale_overflow.style("width", ($(".modale-div").length*(onimm.vars.width-46)+"px"))
					.style("height", (onimm.vars.height-60)+"px");

				$(".modale-container, .modale-body").css({
					"width" : (onimm.vars.width-52),
					"height": (onimm.vars.height-52)
				});

				$(".modale-div").css({
					"width": (onimm.vars.width-46),
					"height": (onimm.vars.height)
				});


				onimm.modale_leave = onimm.createForeignObject(onimm.modale, "modale-close", 30, 30, onimm.vars.width-30, 0);
				onimm.createImg(onimm.modale_leave, "modale-close-icon", "./img/close-icon.png");

				onimm.arrow_left = onimm.createForeignObject(onimm.modale, "modale-left-arrow", 28, 178, 0, onimm.vars.half_height-89);
				onimm.createImg(onimm.arrow_left, "modale-arrow-icon", "./img/arrow-left.png");

				onimm.arrow_right = onimm.createForeignObject(onimm.modale, "modale-right-arrow", 28, 178, onimm.vars.width - 30, onimm.vars.half_height-89);
				onimm.createImg(onimm.arrow_right, "modale-arrow-icon", "./img/arrow-right.png");

				onimm.arrow_down = onimm.createForeignObject(onimm.modale, "modale-down-arrow", 178, 28, onimm.vars.half_width-89, onimm.vars.height-28);
				onimm.createImg(onimm.arrow_down, "modale-arrow-icon", "./img/arrow-down.png");

				onimm.arrow_up = onimm.createForeignObject(onimm.modale, "modale-up-arrow", 178, 28, onimm.vars.half_width-89, 0);
				onimm.createImg(onimm.arrow_up, "modale-arrow-icon", "./img/arrow-up.png");

				$(".modale-left-arrow-foreignObject img").css("display","none");

				$(".modale-div").children().each(function(){
					onimm.vars.current_height_modale = onimm.vars.current_height_modale + $(this).outerHeight();
				});

				onimm.arrow_left.on("click", function(d) {
					if (onimm.vars.positionSlide > 0) {
						$(".modale-overflow").css({
							"left": parseFloat($(".modale-overflow").css("left")) + (onimm.vars.width-46) +"px"
						});
						onimm.vars.positionSlide--;
						onimm.display_arrow_navigation();
					}
				});

				onimm.arrow_right.on("click", function(d){
					if (onimm.vars.positionSlide < $(".modale-div").length-1) {
						$(".modale-overflow").css({
							"left": parseFloat($(".modale-overflow").css("left")) - (onimm.vars.width-46) +"px"
						});
						onimm.vars.positionSlide++;
						onimm.display_arrow_navigation();
					}
				});

				onimm.arrow_down.on("click", function(d) {
					if ( parseFloat($(".modale-div").css("top")) > -(onimm.vars.half_height-100)) {
						$(".modale-div").css({
							"top": parseFloat($(".modale-div").css("top"))-25+"px"
						});
					}
				});
				
				onimm.arrow_up.on("click", function(d) {
					if ( parseFloat($(".modale-div").css("top")) < 0) {
						$(".modale-div").css({
							"top": parseFloat($(".modale-div").css("top"))+25+"px"
						});
					}
				});

				// If we click on the close button
				onimm.modale_leave.on("click", function(d) {
					onimm.leave_modale(d);
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
				d3.select("#bond_"+a)
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
					d3.select("#bond_"+a)
						.attr("d", "M"+ onimm.vars.xCentral+","+onimm.vars.yCentral +"C 0,0 0,0 "+ onimm.vars.x_coordinates[a]+","+ onimm.vars.y_coordinates[a] +"");
				}
			}
		}
	};

	onimm.dragended = function(d) {
		d3.select(this).classed("dragging", false);
	};

	onimm.keydownlistener = function(event) {
		switch(event.which) {
			case 39://right
				event.preventDefault();
				if (onimm.vars.positionSlide < $(".modale-div").length-1) {
					$(".modale-overflow").css({
						"left": parseFloat($(".modale-overflow").css("left")) - (onimm.vars.width-46) +"px"
					});
					onimm.vars.positionSlide++;
				}
			break;
			case 37://left
				event.preventDefault();
				if (onimm.vars.positionSlide > 0) {
					$(".modale-overflow").css({
						"left": parseFloat($(".modale-overflow").css("left")) + (onimm.vars.width-46) +"px"
					});
					onimm.vars.positionSlide--;
				}
			break;
			case 38://up
				if ( parseFloat($(".modale-div").css("top")) < 0) {
					event.preventDefault();
					$(".modale-div").css({
						"top": parseFloat($(".modale-div").css("top"))+25+"px"
					});
				}
			break;
			case 40://down
				if ( parseFloat($(".modale-div").css("top")) > -(onimm.vars.half_height-100)) {
					event.preventDefault();
					$(".modale-div").css({
						"top": parseFloat($(".modale-div").css("top"))-25+"px"
					});
				}
			break;
			case 27://escape
				// If we click on the close button
				onimm.leave_modale();
			break;
		}
	};

	onimm.set_legend = function() {
		onimm.container_legend = onimm.svg.append("svg:g")
			.attr("class","g_container_legend");

		onimm.rect_legend = onimm.container_legend.append("svg:rect")
			.attr("x", 0.82*onimm.vars.width)
			.attr("y", 0.05*onimm.vars.half_height)
			.attr("width", 0.15*onimm.vars.width)
			.attr("height", 0.20*onimm.vars.height)
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
					return "<p class='text-legend'>Coordonination</p>";
				});

		onimm.legend_2 = onimm.container_legend.append("svg:line")
			.attr("class", function(d,i) {return "bond"})
			.attr("x2", 0.85*onimm.vars.width)
			.attr("y2", 0.30*onimm.vars.half_height)
			.attr("x1", 0.90*onimm.vars.width)
			.attr("y1", 0.30*onimm.vars.half_height)
			.attr("stroke-width","5").attr("stroke", onimm.vars.collaboration_color).attr("stroke-dasharray", "5,5");

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

		onimm.legend_leave = onimm.createForeignObject(onimm.container_legend, "legend-close", 30, 30, onimm.vars.width-40, 0);
		onimm.createImg(onimm.legend_leave, "legend-close-icon", "./img/close-icon.png");

		onimm.legend_leave.on("click", function(d) {
			onimm.close_legend();
			onimm.set_help_legend();
		});
	};

	onimm.close_legend = function() {
		onimm.container_legend.remove();
	};

	onimm.set_help_legend = function() {
		onimm.help_legend_container = onimm.svg.append("svg:g").attr("id", "g_help_text");
		onimm.help_legend = onimm.help_legend_container.append("svg:foreignObject")
			.attr("class", "help-text-foreignObject")
			.attr("width", 50)
			.attr("height", 50)
			.attr("x", 0.90*onimm.vars.width)
			.attr("y", 0.05*onimm.vars.half_height)
			.append("xhtml:body").attr("class", "help-text-body")
				.html(function(d,i) {
					return "<p class='help-text-legend'>Help</p>";
				});	

		// Set legend again when clicking on help
		onimm.help_legend.on("click", function(d) {
			onimm.help_legend_container.remove();
			onimm.set_legend();
		});
	};

	// TODO :The location is sometimes not appropriate
	onimm.display_info_hover_node = function(d, i, data, x, y) {
		d3.selectAll(".info-hover-foreignObject").remove();

		for (var j = 0, l = data.length; j<l; j++) {

			if (d.MET_DOMAINE["#text"] === d.Thesaurus.CSTM_T.record[j].DKEY["#text"]) {

				onimm.container.append("svg:foreignObject").attr("class","info-hover-foreignObject")
					.attr("width", 120).attr("height", 120)
					.attr("x", x)
					.attr("y", y)
					.append("xhtml:body").attr("class", "info-hover-body")
					.append("div")
					.attr("class", "info-hover")
					.html("<p class='info-hover-text'>"+d.Thesaurus.CSTM_T.record[j].CSLABELFLD["#text"]+"</p>");

			}			
		}
	};

	onimm.hide_info_hover_node = function(d,i) {
		d3.selectAll(".info-hover-foreignObject").remove();
	}

	// Arrow of modale window for navigating (tablette-friendly ?)
	onimm.display_arrow_navigation = function() {
		//left
		if (onimm.vars.positionSlide == 0) {
			$(".modale-left-arrow-foreignObject img").css("display","none");
		}
		else if (onimm.vars.positionSlide > 0) {
			$(".modale-left-arrow-foreignObject img").css("display","block");
		}
		//right
		if (onimm.vars.positionSlide < $(".modale-div").length-1) {
			$(".modale-right-arrow-foreignObject img").css("display","block");
		}
		else {
			$(".modale-right-arrow-foreignObject img").css("display","none");
		}
		//up and down
		if (onimm.vars.current_height_modale > 2*onimm.vars.height) {
			$(".modale-up-arrow-foreignObject img").css("display","block");
			$(".modale-down-arrow-foreignObject img").css("display","block");
		}
		else {
			$(".modale-up-arrow-foreignObject img").css("display","none");
			$(".modale-down-arrow-foreignObject img").css("display","none");
		}
	};

	onimm.leave_modale = function(d) {
		onimm.vars.positionSlide = 0;
		$(".modale-overflow").css("left", "0px");
		$(".modale-div").css("top", "0px");
		onimm.vars.current_height_modale = 0;

		onimm.modale.remove();

		if (!document.getElementById("g_help_text")){
			onimm.set_help_legend();
		}

		onimm.vars.zoom = d3.behavior.zoom()
			.scaleExtent([1, 1])
			.on("zoomstart", onimm.zoomstart)
			.on("zoom", onimm.zoomed)
			.on("zoomend", onimm.zoomend);

		onimm.svg.call(onimm.vars.zoom);
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
	 * Create bonds with color, marker, text
	 */
	onimm.init_bonds = function(data) {
		
		// set bonds coordinates and load array
		onimm.bonds = [];
		for (var a = 0, l = onimm.vars.totalNodes; a<l; a++) {
			if (data[a].MET_ID["#text"] !== met_id){
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
				
				// For active node, we get the data
				onimm.vars.coordinated = data[a].Liens_metiers_supervise;
				onimm.vars.is_coordinated = data[a].Liens_metiers_est_supervise;
				onimm.vars.collaboration = data[a].Liens_metiers_collabore;

				// The circle must be a little bit larger
				d3.select("circle").attr("r", onimm.vars.radius+10);
				onimm.jobs.attr("class", function(d,i) { 
					if (i==0) {
						return "active_node draggable jobs";
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

			if (onimm.bonds[b].classed("active_bond", true)) {
				// Since the record in xml may be an array we have to test
				if (onimm.vars.coordinated.METIER.record != undefined) {
					if ($.isArray(onimm.vars.coordinated.METIER.record)) {
						for (var j = 0, l = onimm.vars.coordinated.METIER.record.length; j<l ; j++) {
							if (data[b].MET_ID["#text"] == onimm.vars.coordinated.METIER.record[j].MET_MET_ID['#text']) {
								onimm.bonds[b].attr("stroke", onimm.vars.coordination_color);
								//.attr("marker-start", "url(#marker_arrow_start)");
							}
						}
					}
					else {
						if (data[b].MET_ID["#text"] == onimm.vars.coordinated.METIER.record.MET_MET_ID['#text']) {
							onimm.bonds[b].attr("stroke", onimm.vars.coordination_color);
							//.attr("marker-start", "url(#marker_arrow_start)");
						}
					}
				}

				if (onimm.vars.is_coordinated.METIER.record != undefined) {
					if ($.isArray(onimm.vars.is_coordinated.METIER.record)) {
						for (var j = 0, l = onimm.vars.is_coordinated.METIER.record.length; j<l; j++) {
							if (data[b].MET_ID["#text"] == onimm.vars.is_coordinated.METIER.record[j].MET_MET_ID['#text']) {
								onimm.bonds[b].attr("stroke", onimm.vars.coordination_color)
								//.attr("marker-end", "url(#marker_arrow_end)");
							}
						}
					}
					else {
						if (data[b].MET_ID["#text"] == onimm.vars.is_coordinated.METIER.record.MET_MET_ID['#text']) {
							onimm.bonds[b].attr("stroke", onimm.vars.coordination_color);
							//.attr("marker-end", "url(#marker_arrow_end)");
						}
					}	
				}

				if (onimm.vars.collaboration.METIER.record != undefined) {
					if ($.isArray(onimm.vars.collaboration.METIER.record)) {
						for (var j = 0, l = onimm.vars.collaboration.METIER.record.length; j<l; j++) {
							if (data[b].MET_ID["#text"] == onimm.vars.collaboration.METIER.record[j].MET_MET_ID['#text']) {
								onimm.bonds[b].attr("stroke", onimm.vars.collaboration_color)
								.attr("stroke-dasharray", "5,5")
								.attr("marker-end", "url(#handshake)");
							}
						}
					}
					else {
						if (data[b].MET_ID["#text"] == onimm.vars.collaboration.METIER.record.MET_MET_ID['#text']) {
							onimm.bonds[b].attr("stroke", onimm.vars.collaboration_color)
							.attr("stroke-dasharray", "5,5")
							.attr("marker-end", "url(#handshake)");
						}
					}
				}
			}// end if isActive
		}// end for
	};

	// Content of modale window
	onimm.init_modale_window = function(data) {

		onimm.close_legend();

		var modale_window = "";
		var div_modale = "<div class='modale-div'>"

		// slide 1 le métier
		modale_window += div_modale+"<h2 class='modale-h2 modale-text'>"+data.CSLABELFLD['#text']+"</h2>";
		modale_window += "<h3 class='modale-h3 modale-text'>Le métier</h3>";
		modale_window += "<h4 class='modale-h4 modale-text'>Nature du travail</h4>";

		for (var i = 0, l = data.XML.XMLCONTENT.record.length; i<l; i++) {
			if (data.XML.XMLCONTENT.record[i].XC_XML.hasOwnProperty("MET_NATURE_DESCRIPTIF") && data.XML.XMLCONTENT.record[i] != undefined) {
				for (var j = 0, m = data.XML.XMLCONTENT.record[i].XC_XML.MET_NATURE_DESCRIPTIF.p.length; j<m; j++) {
					if (data.XML.XMLCONTENT.record[i].XC_XML.MET_NATURE_DESCRIPTIF.inter[j] != undefined) {
						modale_window += "<h5 class='modale-h5 modale-text'>" +data.XML.XMLCONTENT.record[i].XC_XML.MET_NATURE_DESCRIPTIF.inter[j]["#text"]+ "</h5>";
					}
					if (data.XML.XMLCONTENT.record[i].XC_XML.MET_NATURE_DESCRIPTIF.p[j] != undefined) {
						modale_window += "<p class='modale-bloc-p modale-text'>" +data.XML.XMLCONTENT.record[i].XC_XML.MET_NATURE_DESCRIPTIF.p[j]["#text"]+ "</p>";
					}	
				}
			}
		}

		modale_window += "<h4 class='modale-h4'>Compétences requises</h4>";

		for (var i = 0, l = data.XML.XMLCONTENT.record.length; i<l; i++) {
			if (data.XML.XMLCONTENT.record[i].XC_XML.hasOwnProperty("MET_COMPETENCE_DESCRIPTIF") && data.XML.XMLCONTENT.record[i] != undefined) {
				for (var j = 0, m = data.XML.XMLCONTENT.record[i].XC_XML.MET_COMPETENCE_DESCRIPTIF.p.length; j<m; j++) {
					if (data.XML.XMLCONTENT.record[i].XC_XML.MET_COMPETENCE_DESCRIPTIF.inter[j] != undefined) {
						modale_window += "<h5 class='modale-h5 modale-text'>" +data.XML.XMLCONTENT.record[i].XC_XML.MET_COMPETENCE_DESCRIPTIF.inter[j]["#text"]+ "</h5>";
					}
					if (data.XML.XMLCONTENT.record[i].XC_XML.MET_COMPETENCE_DESCRIPTIF.p[j] != undefined) {
						modale_window += "<p class='modale-bloc-p modale-text'>" +data.XML.XMLCONTENT.record[i].XC_XML.MET_COMPETENCE_DESCRIPTIF.p[j]["#text"]+ "</p>";
					}
				}
			}
		}

		modale_window += "</div>";

		// slide 2 où l'exercer
		modale_window += div_modale+"<h2 class='modale-h2 modale-text'>"+data.CSLABELFLD['#text']+"</h2>";
		modale_window += "<h3 class='modale-h3 modale-text'>Où l'exercer ?</h3>";
		modale_window += "<h4 class='modale-h4 modale-text'>Lieux d'exercice et statuts</h4>";

		for (var i = 0, l = data.XML.XMLCONTENT.record.length; i<l; i++) {
			if (data.XML.XMLCONTENT.record[i].XC_XML.hasOwnProperty("MET_CONDITION_DESCRIPTIF") && data.XML.XMLCONTENT.record[i] != undefined) {
				for (var j = 0, m = data.XML.XMLCONTENT.record[i].XC_XML.MET_CONDITION_DESCRIPTIF.p.length; j<m; j++) {
					if (data.XML.XMLCONTENT.record[i].XC_XML.MET_CONDITION_DESCRIPTIF.inter[j] != undefined) {
						modale_window += "<h5 class='modale-h5 modale-text'>" +data.XML.XMLCONTENT.record[i].XC_XML.MET_CONDITION_DESCRIPTIF.inter[j]["#text"]+ "</h5>";
					}
					if (data.XML.XMLCONTENT.record[i].XC_XML.MET_CONDITION_DESCRIPTIF.p[j] != undefined) {
						modale_window += "<p class='modale-bloc-p modale-text'>" +data.XML.XMLCONTENT.record[i].XC_XML.MET_CONDITION_DESCRIPTIF.p[j]["#text"]+ "</p>";
					}
				}
			}
		}

		modale_window += "</div>";

		// slide 3 Carrière et Salaire
		modale_window += div_modale+"<h2 class='modale-h2 modale-text'>"+data.CSLABELFLD['#text']+"</h2>";
		modale_window += "<h3 class='modale-h3 modale-text'>Carrière et salaire</h3>";

		modale_window += "<h4 class='modale-h4 modale-text'>Salaire</h4>";

		for (var i = 0, l = data.XML.XMLCONTENT.record.length; i<l; i++) {
			if (data.XML.XMLCONTENT.record[i].XC_XML.hasOwnProperty("MET_VIE_PRO_DESCRIPTIF") && data.XML.XMLCONTENT.record[i] != undefined) {
				if (data.XML.XMLCONTENT.record[i].XC_XML.MET_VIE_PRO_DESCRIPTIF.remun.inter != undefined) {
					modale_window += "<h5 class='modale-h5 modale-text'>" +data.XML.XMLCONTENT.record[i].XC_XML.MET_VIE_PRO_DESCRIPTIF.remun.inter["#text"]+ "</h5>";
				}
				if (data.XML.XMLCONTENT.record[i].XC_XML.MET_VIE_PRO_DESCRIPTIF.remun.p != undefined) {
					if ($.isArray(data.XML.XMLCONTENT.record[i].XC_XML.MET_VIE_PRO_DESCRIPTIF.remun.p)) {
						if (data.XML.XMLCONTENT.record[i].XC_XML.MET_VIE_PRO_DESCRIPTIF.remun.p.sal != undefined) {
							modale_window += "<p class='modale-bloc-p modale-text'>" +data.XML.XMLCONTENT.record[i].XC_XML.MET_VIE_PRO_DESCRIPTIF.remun.p[0]["#text"][0]
							+ " " +data.XML.XMLCONTENT.record[i].XC_XML.MET_VIE_PRO_DESCRIPTIF.remun.p[1].sal['#text']
							+ " " +data.XML.XMLCONTENT.record[i].XC_XML.MET_VIE_PRO_DESCRIPTIF.remun.p[0]['#text'][1]+"</p>";
						}
						else {
							modale_window += "<p class='modale-bloc-p modale-text'>" +data.XML.XMLCONTENT.record[i].XC_XML.MET_VIE_PRO_DESCRIPTIF.remun.p["#text"]+ "</p>";
						}
					}
					else {
						if (data.XML.XMLCONTENT.record[i].XC_XML.MET_VIE_PRO_DESCRIPTIF.remun.p.sal != undefined) {
							modale_window += "<p class='modale-bloc-p modale-text'>" +data.XML.XMLCONTENT.record[i].XC_XML.MET_VIE_PRO_DESCRIPTIF.remun.p["#text"][0]
							+ " " +data.XML.XMLCONTENT.record[i].XC_XML.MET_VIE_PRO_DESCRIPTIF.remun.p.sal['#text']
							+data.XML.XMLCONTENT.record[i].XC_XML.MET_VIE_PRO_DESCRIPTIF.remun.p['#text'][1]+"</p>";
						}
						else {
							modale_window += "<p class='modale-bloc-p modale-text'>Pas de données.</p>";
						}
					}
				}
				if (data.XML.XMLCONTENT.record[i].XC_XML.MET_VIE_PRO_DESCRIPTIF.remun.postit != undefined) {
					if ($.isArray(data.XML.XMLCONTENT.record[i].XC_XML.MET_VIE_PRO_DESCRIPTIF.remun.p)) {
						modale_window += "<p class='modale-bloc-p modale-text'>" +data.XML.XMLCONTENT.record[i].XC_XML.MET_VIE_PRO_DESCRIPTIF.remun.postit.p["#text"][0]
						+ data.XML.XMLCONTENT.record[i].XC_XML.MET_VIE_PRO_DESCRIPTIF.remun.postit.p.exp
						+ data.XML.XMLCONTENT.record[i].XC_XML.MET_VIE_PRO_DESCRIPTIF.remun.postit.p["#text"][1] +"</p>";
					}
					else {
						modale_window += "<p class='modale-bloc-p modale-text'>" +data.XML.XMLCONTENT.record[i].XC_XML.MET_VIE_PRO_DESCRIPTIF.remun.postit.p["#text"]+"</p>";
					}
				}
			}
		}

		modale_window += "<h4 class='modale-h4 modale-text'>Intégrer le marché du travail</h4>";

		for (var i = 0, l = data.XML.XMLCONTENT.record.length; i<l; i++) {
			if (data.XML.XMLCONTENT.record[i].XC_XML.hasOwnProperty("MET_VIE_PRO_DESCRIPTIF") && data.XML.XMLCONTENT.record[i] != undefined) {
				for (var j = 0, m = data.XML.XMLCONTENT.record[i].XC_XML.MET_VIE_PRO_DESCRIPTIF.p.length; j<m; j++) {
					if (data.XML.XMLCONTENT.record[i].XC_XML.MET_VIE_PRO_DESCRIPTIF.inter[j] != undefined) {
						modale_window += "<h5 class='modale-h5 modale-text'>" +data.XML.XMLCONTENT.record[i].XC_XML.MET_VIE_PRO_DESCRIPTIF.inter[j]["#text"]+ "</h5>";
					}
					if (data.XML.XMLCONTENT.record[i].XC_XML.MET_VIE_PRO_DESCRIPTIF.p[j] != undefined) {
						modale_window += "<p class='modale-bloc-p modale-text'>" +data.XML.XMLCONTENT.record[i].XC_XML.MET_VIE_PRO_DESCRIPTIF.p[j]["#text"]+ "</p>";
					}	
				}
			}
		}

		modale_window += "</div>";

		// slide 5 Carrière et Salaire
		modale_window += div_modale+"<h2 class='modale-h2 modale-text'>"+data.CSLABELFLD['#text']+"</h2>";
		modale_window += "<h3 class='modale-h3 modale-text'>En savoir plus</h3>";
		modale_window += "<h4 class='modale-h4 modale-text'>Ressources utiles</h4>";



		for (var i = 0, l = data.XML.XMLCONTENT.record.length; i<l; i++) {
			if (data.XML.XMLCONTENT.record[i].XC_XML.hasOwnProperty("MET_REFERENCES_DESCRIPTIF") && data.XML.XMLCONTENT.record[i] != undefined) {
				modale_window += "<h5 class='modale-h5'>Ressources utiles</h5>";
				if (data.XML.XMLCONTENT.record[i].XC_XML.MET_REFERENCES_DESCRIPTIF.liste_adr != undefined) {
					if ($.isArray(data.XML.XMLCONTENT.record[i].XC_XML.MET_REFERENCES_DESCRIPTIF.liste_adr.adr)) {
						for (var j = 0, m = data.XML.XMLCONTENT.record[i].XC_XML.MET_REFERENCES_DESCRIPTIF.liste_adr.adr.length; j<m; j++) {
							modale_window += "<p class='modale-bloc-p modale-text'>";
							modale_window += data.XML.XMLCONTENT.record[i].XC_XML.MET_REFERENCES_DESCRIPTIF.liste_adr.adr[j].nom_adr['#text'] + "</p>";
							if (data.XML.XMLCONTENT.record[i].XC_XML.MET_REFERENCES_DESCRIPTIF.liste_adr.adr[j].sigle != undefined) {
								modale_window += "<p class='modale-bloc-p modale-text'>";
								modale_window += data.XML.XMLCONTENT.record[i].XC_XML.MET_REFERENCES_DESCRIPTIF.liste_adr.adr[j].sigle['#text'] + "</p>";
							}
							modale_window += "<p class='modale-bloc-p modale-text'>"
							modale_window += " " + data.XML.XMLCONTENT.record[i].XC_XML.MET_REFERENCES_DESCRIPTIF.liste_adr.adr[j].voie['#text'] + "</p>";

							modale_window += "<p class='modale-bloc-p modale-text'>";
							modale_window += " " + data.XML.XMLCONTENT.record[i].XC_XML.MET_REFERENCES_DESCRIPTIF.liste_adr.adr[j].cp['#text'];
							modale_window += " " + data.XML.XMLCONTENT.record[i].XC_XML.MET_REFERENCES_DESCRIPTIF.liste_adr.adr[j].com['#text'] + "</p>";
							modale_window += "<p class='modale-bloc-p modale-text'>";
							modale_window += data.XML.XMLCONTENT.record[i].XC_XML.MET_REFERENCES_DESCRIPTIF.liste_adr.adr[j].tel_elt['#text'] + "</p>";
							if (data.XML.XMLCONTENT.record[i].XC_XML.MET_REFERENCES_DESCRIPTIF.liste_adr.adr[j].url_elt != undefined) {
								modale_window += "<p class='modale-bloc-p modale-text'><a href='http://"+data.XML.XMLCONTENT.record[i].XC_XML.MET_REFERENCES_DESCRIPTIF.liste_adr.adr[j].url_elt['#text']+"'>";
								modale_window += data.XML.XMLCONTENT.record[i].XC_XML.MET_REFERENCES_DESCRIPTIF.liste_adr.adr[j].url_elt['#text'] + "</a></p>";
							}
						}
					}
					else {
						modale_window += "<p class='modale-bloc-p modale-text'>";
						modale_window += data.XML.XMLCONTENT.record[i].XC_XML.MET_REFERENCES_DESCRIPTIF.liste_adr.adr.nom_adr['#text'] + "</p>";
						modale_window += "<p class='modale-bloc-p modale-text'>";
						modale_window += data.XML.XMLCONTENT.record[i].XC_XML.MET_REFERENCES_DESCRIPTIF.liste_adr.adr.sigle['#text'];
						modale_window += " " + data.XML.XMLCONTENT.record[i].XC_XML.MET_REFERENCES_DESCRIPTIF.liste_adr.adr.voie['#text'] + "</p>";
						modale_window += "<p class='modale-bloc-p modale-text'>";
						modale_window += " " + data.XML.XMLCONTENT.record[i].XC_XML.MET_REFERENCES_DESCRIPTIF.liste_adr.adr.cp['#text'];
						modale_window += " " + data.XML.XMLCONTENT.record[i].XC_XML.MET_REFERENCES_DESCRIPTIF.liste_adr.adr.com['#text'] + "</p>";
						modale_window += "<p class='modale-bloc-p modale-text'>";
						modale_window += data.XML.XMLCONTENT.record[i].XC_XML.MET_REFERENCES_DESCRIPTIF.liste_adr.adr.tel_elt['#text'] + "</p>";
						modale_window += "<p class='modale-bloc-p modale-text'><a href='http://"+data.XML.XMLCONTENT.record[i].XC_XML.MET_REFERENCES_DESCRIPTIF.liste_adr.adr.url_elt['#text']+"'>";
						modale_window += data.XML.XMLCONTENT.record[i].XC_XML.MET_REFERENCES_DESCRIPTIF.liste_adr.adr.url_elt['#text'] + "</a></p>";
					}
				}

				if (data.XML.XMLCONTENT.record[i].XC_XML.MET_REFERENCES_DESCRIPTIF.liste_web != undefined) {
					if ($.isArray(data.XML.XMLCONTENT.record[i].XC_XML.MET_REFERENCES_DESCRIPTIF.liste_web.web)) {
						for (var j = 0, m = data.XML.XMLCONTENT.record[i].XC_XML.MET_REFERENCES_DESCRIPTIF.liste_web.web.length; j<m; j++) {
							if (data.XML.XMLCONTENT.record[i].XC_XML.MET_REFERENCES_DESCRIPTIF.liste_web.web[j].url_elt != undefined) {
								modale_window += "<p class='modale-bloc-p modale-text'><a href='http://"+data.XML.XMLCONTENT.record[i].XC_XML.MET_REFERENCES_DESCRIPTIF.liste_web.web[j].url_elt['#text']+"'>";
								modale_window += data.XML.XMLCONTENT.record[i].XC_XML.MET_REFERENCES_DESCRIPTIF.liste_web.web[j].url_elt['#text'] + "</a></p>";
							}
							if (data.XML.XMLCONTENT.record[i].XC_XML.MET_REFERENCES_DESCRIPTIF.liste_web.web[j].descr != undefined) {
								modale_window += "<p class='modale-bloc-p modale-text'>"+data.XML.XMLCONTENT.record[i].XC_XML.MET_REFERENCES_DESCRIPTIF.liste_web.web[j].descr.p['#text'];
								modale_window += "</p>";
							}
						}
					}
					else {
						if (data.XML.XMLCONTENT.record[i].XC_XML.MET_REFERENCES_DESCRIPTIF.liste_web.web.url_elt != undefined) {
							modale_window += "<p class='modale-bloc-p modale-text'><a href='http://"+data.XML.XMLCONTENT.record[i].XC_XML.MET_REFERENCES_DESCRIPTIF.liste_web.web.url_elt['#text']+"'>";
							modale_window += data.XML.XMLCONTENT.record[i].XC_XML.MET_REFERENCES_DESCRIPTIF.liste_web.web.url_elt['#text'] + "</a></p>";
						}
						if (data.XML.XMLCONTENT.record[i].XC_XML.MET_REFERENCES_DESCRIPTIF.liste_web.web.descr != undefined) {
							modale_window += "<p class='modale-bloc-p modale-text'>"+data.XML.XMLCONTENT.record[i].XC_XML.MET_REFERENCES_DESCRIPTIF.liste_web.web.descr.p['#text'];
							modale_window += "</p>";
						}
					}
				}
			}
		}

		modale_window += "<h4 class='modale-h4 modale-text'>Publications</h4>";

		for (var i = 0, l = data.XML.XMLCONTENT.record.length; i<l; i++) {

			if (data.XML.XMLCONTENT.record[i].XC_XML.hasOwnProperty("MET_REFERENCES_DESCRIPTIF") && data.XML.XMLCONTENT.record[i] != undefined) {
				if (data.XML.XMLCONTENT.record[i].XC_XML.MET_REFERENCES_DESCRIPTIF.liste_pub != undefined) {
					modale_window += "<h5 class='modale-h5'>Publications Onisep</h5>";
					if ($.isArray(data.XML.XMLCONTENT.record[i].XC_XML.MET_REFERENCES_DESCRIPTIF.liste_pub.liste_pub_onisep.pub_onisep)) {
						for (var j=0, m=data.XML.XMLCONTENT.record[i].XC_XML.MET_REFERENCES_DESCRIPTIF.liste_pub.liste_pub_onisep.pub_onisep.length; j<m; j++) {
							modale_window += "<p class='modale-bloc-p modale-text'>";
							modale_window += data.XML.XMLCONTENT.record[i].XC_XML.MET_REFERENCES_DESCRIPTIF.liste_pub.liste_pub_onisep.pub_onisep[j].nom_pub["#text"]+"</p>";
							modale_window += "<p class='modale-bloc-p modale-text'>Collection ";
							modale_window += data.XML.XMLCONTENT.record[i].XC_XML.MET_REFERENCES_DESCRIPTIF.liste_pub.liste_pub_onisep.pub_onisep[j].coll["#text"]
							+", "+data.XML.XMLCONTENT.record[i].XC_XML.MET_REFERENCES_DESCRIPTIF.liste_pub.liste_pub_onisep.pub_onisep[j].edit["#text"]+"</p>";
							modale_window += "<p class='modale-bloc-p modale-text'>parution ";
							modale_window += data.XML.XMLCONTENT.record[i].XC_XML.MET_REFERENCES_DESCRIPTIF.liste_pub.liste_pub_onisep.pub_onisep[j].annee["#text"]+"</p>";
						}
					}
					else {
						modale_window += "<p class='modale-bloc-p modale-text'>";
						modale_window += data.XML.XMLCONTENT.record[i].XC_XML.MET_REFERENCES_DESCRIPTIF.liste_pub.liste_pub_onisep.pub_onisep.nom_pub["#text"]+"</p>";
						modale_window += "<p class='modale-bloc-p modale-text'>Collection ";
						modale_window += data.XML.XMLCONTENT.record[i].XC_XML.MET_REFERENCES_DESCRIPTIF.liste_pub.liste_pub_onisep.pub_onisep.coll["#text"]
						+", "+data.XML.XMLCONTENT.record[i].XC_XML.MET_REFERENCES_DESCRIPTIF.liste_pub.liste_pub_onisep.pub_onisep.edit["#text"]+"</p>";
						modale_window += "<p class='modale-bloc-p modale-text'>parution ";
						modale_window += data.XML.XMLCONTENT.record[i].XC_XML.MET_REFERENCES_DESCRIPTIF.liste_pub.liste_pub_onisep.pub_onisep.annee["#text"]+"</p>";
					}
				}
			}
		}

		modale_window += "</div>";

		return modale_window;
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

	return onimm;
};

// Let it go !
// onimm = Onimm("onimm_", "10183", "./data/carte_heuristique.xml");

// DEBUG
//console.dir(onimm);
