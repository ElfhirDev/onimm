/**
 * 2014 © Onisep - tous droits réservés - version 1.1
 * 
 * Created by <jta@onisep.fr> 2014-04-14
 * Last update on 2014-19-05 by <jta@onisep.fr>
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
		positionSlide:0,
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

			for (var k = 0, m = onimm.vars.data.length ; k<m; k++) {

				//console.log("k : " + k + "  " + onimm.vars.data[k].MET_ID["#text"] + "  " + onimm.vars.collaboration.METIER.record[0].MET_MET_ID['#text']);
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

			//console.dir(onimm.vars.data);

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

			onimm.jobs_text = onimm.jobs.append("svg:foreignObject")
				.attr("class", "jobs-text-foreignObject")
				.attr("width", 120)
				.attr("height", 60)
				.attr("x", function(d,i) {
					return d.x = onimm.vars.x_coordinates[i] - 3*onimm.vars.radius;
				})
				.attr("y", function(d,i) {
					return d.y = onimm.vars.y_coordinates[i] + 0.6*onimm.vars.radius;
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
					.attr("id", id + "modale_");

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
						.append("xhtml:body").attr("class", "modale-body")
							.attr("width", (onimm.vars.width-40))
							.attr("height", (onimm.vars.height-40));

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
					"width": (onimm.vars.width-46)
				});

				// Keydown arrow control for testing
				$(".modale-container").ready(function() {
					$(document).bind("keydown.modale", function(event) {
						onimm.keydownlistener(event);
					});
				});

				onimm.modale_leave = onimm.modale.append("svg:foreignObject").attr("class","modale-close-foreignObject");

				onimm.modale_leave
					.attr("width", 30)
					.attr("height", 30)
					.attr("x", onimm.vars.width - 30)
					.attr("y", 0)
						.append("xhtml:body").attr("class", "modale-close-body")
							.html("<img class='modale-close-icon' src='./img/close-icon.png'>");

				// If we click on the close button
				onimm.modale_leave.on("click", function(d) {
					
					$(".modale-container").unbind("keydown.modale", false);

					onimm.vars.positionSlide = 0;
					$(".modale-overflow").css("left", "0px");
					$(".modale-div").css("top", "0px");

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
		}
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

	// Create bonds
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
	};

	// Content of modale window
	onimm.init_modale_window = function(data) {

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

		// TODO : itsimp et ses multiples formes.
		// slide 4 Accès au métier
		modale_window += div_modale+"<h2 class='modale-h2 modale-text'>"+data.CSLABELFLD['#text']+"</h2>";
		modale_window += "<h3 class='modale-h3 modale-text'>Accès au métier</h3>";

		modale_window += "<h4 class='modale-h4 modale-text'>Accès au métier</h4>";

		for (var i = 0, l = data.XML.XMLCONTENT.record.length; i<l; i++) {
			if (data.XML.XMLCONTENT.record[i].XC_XML.hasOwnProperty("MET_ACCES_DESCRIPTIF") && data.XML.XMLCONTENT.record[i] != undefined) {
				if (data.XML.XMLCONTENT.record[i].XC_XML.MET_ACCES_DESCRIPTIF.p.accr_p != undefined) {
					modale_window += "<p class='modale-bloc-p modale-text'>" +data.XML.XMLCONTENT.record[i].XC_XML.MET_ACCES_DESCRIPTIF.p.accr_p["#text"]+ "</p>";
				}
				if (data.XML.XMLCONTENT.record[i].XC_XML.MET_ACCES_DESCRIPTIF.p["#text"] != undefined) {
					modale_window += "<p class='modale-bloc-p modale-text'>" +data.XML.XMLCONTENT.record[i].XC_XML.MET_ACCES_DESCRIPTIF.p["#text"]+ "</p>";
				}
				if (data.XML.XMLCONTENT.record[i].XC_XML.MET_ACCES_DESCRIPTIF.inter != undefined) {
					for (var j = 0, m = data.XML.XMLCONTENT.record[i].XC_XML.MET_ACCES_DESCRIPTIF.inter.length; j<m; j++) {
						modale_window += "<p class='modale-bloc-p modale-text'>" +data.XML.XMLCONTENT.record[i].XC_XML.MET_ACCES_DESCRIPTIF.inter[j]["#text"]+ "</p>";
						modale_window += "<p class='modale-bloc-p modale-text'>";
						if (data.XML.XMLCONTENT.record[i].XC_XML.MET_ACCES_DESCRIPTIF.liste != undefined) {
							if ($.isArray(data.XML.XMLCONTENT.record[i].XC_XML.MET_ACCES_DESCRIPTIF.liste[j].itsimp)) {
								for (var k = 0, n = data.XML.XMLCONTENT.record[i].XC_XML.MET_ACCES_DESCRIPTIF.liste[j].itsimp.length; k<n; k++) {
									modale_window += "<em class='modale-em'>"+data.XML.XMLCONTENT.record[i].XC_XML.MET_ACCES_DESCRIPTIF.liste[j].itsimp[k].em["#text"]+"</em>";
									modale_window += data.XML.XMLCONTENT.record[i].XC_XML.MET_ACCES_DESCRIPTIF.liste[j].itsimp[k]["#text"];
								}
							}
							else {
								modale_window += "<em class='modale-em'>"+data.XML.XMLCONTENT.record[i].XC_XML.MET_ACCES_DESCRIPTIF.liste[j].itsimp.em["#text"]+"</em>";
								modale_window += data.XML.XMLCONTENT.record[i].XC_XML.MET_ACCES_DESCRIPTIF.liste[j].itsimp["#text"];
							}
						}
						modale_window += "</p>";
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
				if (data.XML.XMLCONTENT.record[i].XC_XML.MET_REFERENCES_DESCRIPTIF.liste_adr != undefined) {
					modale_window += "<h5 class='modale-h5'>Ressources utiles</h5>";
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

		//
		//for (var i = 0, l = data.Thesaurus.CSTM_T.record.length; i<l; i++) {
		//	modale_window += "<p class='modale-bloc-p'>"+data.Thesaurus.CSTM_T.record[i].CSLABELFLD['#text']+"</p>";
		//}
		// for (var i = 0, l = 3; i<l; i++) {
		// 	if(data.XML.XMLCONTENT.record[0].XC_XML.hasOwnProperty("MET_CONDITION_DESCRIPTIF")) {
		// 		modale_window += "<p>" +data.XML.XMLCONTENT.record[0].XC_XML.MET_CONDITION_DESCRIPTIF.p[i]["#text"]+ "</p>";
		// 	}
		// 	if(data.XML.XMLCONTENT.record[0].XC_XML.hasOwnProperty("MET_VIE_PRO_DESCRIPTIF")) {
		// 		modale_window += "<p>" +data.XML.XMLCONTENT.record[0].XC_XML.MET_VIE_PRO_DESCRIPTIF.p[i]["#text"]+ "</p>";
		// 	}
		// 	if(data.XML.XMLCONTENT.record[0].XC_XML.hasOwnProperty("MET_REFERENCES_DESCRIPTIF")) {
		// 		modale_window += "<p>" +data.XML.XMLCONTENT.record[0].XC_XML.MET_REFERENCES_DESCRIPTIF.p[i]["#text"]+ "</p>";
		// 	}
		// 	if(data.XML.XMLCONTENT.record[0].XC_XML.hasOwnProperty("MET_COMPETENCE_DESCRIPTIF")) {
		// 		modale_window += "<p>" +data.XML.XMLCONTENT.record[0].XC_XML.MET_COMPETENCE_DESCRIPTIF.p[i]["#text"]+ "</p>";
		// 	}
		// 	if(data.XML.XMLCONTENT.record[0].XC_XML.hasOwnProperty("MET_ACCES_DESCRIPTIF")) {
		// 		modale_window += "<p>" +data.XML.XMLCONTENT.record[0].XC_XML.MET_ACCES_DESCRIPTIF.p[i]["#text"]+ "</p>";
		// 	}
		// }
	
		return modale_window;
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
onimm = Onimm("onimm_", "10183", "./data/carte_heuristique.xml");

// DEBUG
//console.dir(onimm);
