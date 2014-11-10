/**
 * 2014 © Onisep - tous droits réservés - version 1.5
 * 
 * Created by <jta@onisep.fr> 2014-04-14 (2014-06-25 for version 1.5)
 * Last update on 2014-09-26 by <jta@onisep.fr>
 *
 * Script aiming to render the mind map for a job
 *
 */

// Search for the TODO !!

// Be sure d3.min.js is called before

"use strict";

function Onimm(id, met_id, data_uri, historic) {

	// internal object
	var onimm = {};

	onimm.vars = {
		id : "#"+id,
		data_uri : data_uri,
		used_data: [],
		unused_data: [],
		met_ids : [],
		x_coordinates : [],
		y_coordinates : [],
		x_other_coordinates : [],
		y_other_coordinates : [],
		other_bonds_coordinates : [],
		xCentral: 0,
		yCentral: 0,
		width : 600,
		half_width : 400,
		height : 400,
		half_height : 300,
		radius_job: 15,
		radius_info_job: 25,
		radius_hist_job: 10,
		radius_other_job: 5,
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
		stroke_colors : [],
		other_jobs : [],
		first_level_jobs : []
	};

	onimm.vars.radius_job = 0.0375*onimm.vars.width;
	onimm.vars.radius_info_job = 0.0625*onimm.vars.width;
	onimm.vars.radius_hist_job = 0.025*onimm.vars.width;
	onimm.vars.radius_other_job = 0.0125*onimm.vars.width;

	onimm.vars.height = $(window).height();
	onimm.vars.width = $(window).width();
	onimm.vars.half_height = 0.5*onimm.vars.height;
	onimm.vars.half_width = 0.5*onimm.vars.width;


	// Change easily the coordinates of (some) elements here
	onimm.geo = {
		// Icon of a clock for history panel and the title Historic
		historic : {
			icon : {
				x : 0.28*onimm.vars.width,
				y : 0.0175*onimm.vars.height,
				width : 0.05*onimm.vars.width,
				height : 0.05*onimm.vars.width
			},
			title : {
				x : 0.33*onimm.vars.width,
				y : -0.02*onimm.vars.half_height,
				width : 0.15*onimm.vars.width,
				height : 0.15*onimm.vars.height
			},
			font_size : 0.015*onimm.vars.width
		},
		// The position of the box, icon, the line in the legend, the 3 texts ...
		legend : {
			rect : {
				x : 0.05*onimm.vars.width,
				y : 0.05*onimm.vars.width,
				width : 0.99*onimm.vars.width,
				height : 0.001*onimm.vars.height
			},
			icon : {
				x : 0.87*onimm.vars.width,
				y : 0.0275*onimm.vars.height,
				width : 0.05*onimm.vars.width,
				height :0.05*onimm.vars.width
			},
			line_legend_1 : {
				x1 : 0.81*onimm.vars.width,
				y1 : 0.22*onimm.vars.half_height,
				x2 : 0.84*onimm.vars.width,
				y2 : 0.22*onimm.vars.half_height
			},
			legend_1_text : {
				x : 0.825*onimm.vars.width,
				y : 0.15*onimm.vars.half_height,
				width : 0.15*onimm.vars.width,
				height : 0.15*onimm.vars.height
			},
			arrow_legend_1 : {
				x : 1.31*onimm.vars.half_width,
				y : 0.085*onimm.vars.height
			},
			line_legend_2 : {
				x1 : 0.81*onimm.vars.width,
				y1 : 0.35*onimm.vars.half_height,
				x2 : 0.84*onimm.vars.width,
				y2 : 0.35*onimm.vars.half_height
			},
			legend_2_text : {
				x : 0.825*onimm.vars.width,
				y : 0.285*onimm.vars.half_height,
				width : 0.15*onimm.vars.width,
				height : 0.15*onimm.vars.height
			},
			legend_3_text : {
				x : 0.79*onimm.vars.width,
				y : 0.40*onimm.vars.half_height,
				width : 0.190*onimm.vars.width
			}
		},
		// The modale window displaying information
		info_job : {
			width : 500,
			height : 480,
			x : 0.0625*onimm.vars.width,
			y : 0.005*onimm.vars.height
		}
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
			.attr("class", id + "-svg");

		/* ---- Define markers for design the bonds ---- */

		// coordination mid bonds for coordination bonds (the central jobs coordinate them)
		onimm.marker_coordinated = onimm.svg.append("svg:defs")
			.append("svg:marker")
				.attr("id", "coordinated").attr("markerWidth", 0.125*onimm.vars.width).attr("markerHeight", 0.125*onimm.vars.height)
				.attr("refx", 0).attr("refy", 0).attr("orient", "auto").attr("style","overflow:visible");

		// The "d" define the shape (triangle)
		// Change translate for moving the shape on the line
		onimm.marker_coordinated.append("svg:path")
			.attr("d", "M -18,5 -18,-5 -23,0 Z")
			.attr("style", "fill:"+onimm.vars.coordination_color+"; stroke:"+onimm.vars.coordination_color+"; stroke-width:0.5px")
			.attr("transform", "translate(-10,0) scale(0.4)");

		// coordination mid bonds for coordination bonds (the central jobs is by other one)
		onimm.marker_coordination = onimm.svg.append("svg:defs")
			.append("svg:marker")
				.attr("id", "coordination").attr("markerWidth", 0.125*onimm.vars.width).attr("markerHeight", 0.125*onimm.vars.height)
				.attr("refx", 0).attr("refy", 0).attr("orient", "auto").attr("style","overflow:visible");

		// The "d" define the shape (triangle)
		// Change translate for moving the shape on the line
		onimm.marker_coordination.append("svg:path")
			.attr("d", "M -18,5 -18,-5 -12,0 Z")
			.attr("style", "fill:"+onimm.vars.coordination_color+"; stroke:"+onimm.vars.coordination_color+"; stroke-width:0.5px")
			.attr("transform", "translate(-10,0) scale(0.4)");

		// Create sub-container of Bond(s), James Bond
		onimm.bond_container = onimm.svg.append("g")
			.attr("class", "bonds-container")
			.attr("transform", "translate(" + onimm.vars.half_width + "," + onimm.vars.half_height + ")");
			

		// Create sub-container of other elements
		onimm.container = onimm.svg.append("g")
			.attr("class", "jobs-container")
			.attr("transform", "translate(" + onimm.vars.half_width + "," + onimm.vars.half_height + ")");
			

		// TODO : Appel du fichier xml par http
		// Cross-Origin Request http://www-dev.onisep.fr/webtv/video_metier_diplome.xml
		// 
		// A noter que seul les métiers du secteur informatique/plublication/web, soit 23 métiers, sont présents.
		// A voir pour d'autres futurs métiers/secteurs de métiers avec le pôle documentaire
		d3.xml("./data/video_metier_diplome.xml", "application/xml", function(error, xml) {
			// DEBUG of D3 when import data
			if (error) return console.warn(error);
			//console.dir(xml);

			onimm.vars.video_data = xml.documentElement.children;
		});

		if (onimm.vars.video_data == undefined) {
			onimm.vars.video_data = [];
		}

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

					onimm.vars.used_data.push(onimm.vars.data[a]);
					onimm.vars.coordinated = onimm.vars.data[a].Liens_metiers_supervise;
					onimm.vars.is_coordinated = onimm.vars.data[a].Liens_metiers_est_supervise;
					onimm.vars.collaboration = onimm.vars.data[a].Liens_metiers_collabore;
				}
			}

			// The loop search and put in array used_data the job that are bond to the central job.
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

			// all_data are all the jobs (even those we don't display)
			// used_data (and then data) are only the jobs we display
			onimm.vars.all_data = onimm.vars.data;
			onimm.vars.data = onimm.vars.used_data;
			
			// We get in unused_data array the jobs we don't display in the node shape
			for (var i = 0, l = onimm.vars.all_data.length; i<l; i++) {
				var is_in_array = 0;
				for (var j = 0, m = onimm.vars.used_data.length; j<m; j++) {
					if (onimm.vars.all_data[i].MET_ID["#text"] == onimm.vars.used_data[j].MET_ID["#text"]) {
						is_in_array++;
					}
				}
				if (is_in_array == 0) {
					onimm.vars.unused_data.push(onimm.vars.all_data[i]);
				}
			}

			// All svg g element with class jobs are bound with one job data
			onimm.jobs = onimm.container.selectAll("g")
				.data(onimm.vars.data);

			// csKeyFld is the id for the MET_DOMAINE in xml
			onimm.jobs = onimm.jobs.enter().append("svg:g")
				.attr("class", function(d){return "is-draggable jobs";})
				.attr("csKeyFld", function(d) {
					onimm.vars.csKeyFld.push(d.MET_DOMAINE["#text"]);
					return d.MET_DOMAINE["#text"];
				})
				.attr("met_id", function(d) {
					onimm.vars.met_ids.push(d.MET_ID["#text"]);
					return d.MET_ID["#text"];
				});

			onimm.vars.totalNodes = onimm.jobs.size();

			// The circles for the jobs ; color are compute by init_color_node, which depends on the colors chosen by
			// the Studio graphique or Pôle documentaire.
			onimm.circles = onimm.jobs.append("svg:circle")
				.attr("class", "jobs-circle")
				.attr("r", onimm.vars.radius_job)
				.attr("cx", function(d,i) {
					onimm.vars.x_coordinates.push(1.3*onimm.init_x_coordinates(d,i));
					return d.x = 1.3*onimm.init_x_coordinates(d,i);
				})
				.attr("cy", function(d,i) {
					onimm.vars.y_coordinates.push(1.3*onimm.init_y_coordinates(d,i));
					return d.y = 1.3*onimm.init_y_coordinates(d,i);
				})
				.attr("csKeyFld", function(d) {
					onimm.vars.csKeyFld.push(d.MET_DOMAINE["#text"]);
					return d.MET_DOMAINE["#text"];
				})
				.style("fill", function(d,i) {
					onimm.vars.stroke_colors.push(onimm.init_color_node(d));
					return onimm.init_color_node(d);
				})
				.attr("color_node", function(d,i) {
					return onimm.init_color_node(d);
				});

			onimm.circles.data(onimm.vars.data);

			// The texts below the jobs
			onimm.jobs_text = onimm.jobs.append("svg:foreignObject")
				.attr("class", "jobs-text-foreignObject")
				.attr("width", 0.215*onimm.vars.width)
				//.attr("height", 100)
				.attr("x", function(d,i) {
					return d.x = onimm.vars.x_coordinates[i] - 3*onimm.vars.radius_job;
				})
				.attr("y", function(d,i) {
					if (i==0) {
						return d.y = onimm.vars.y_coordinates[i] + 1.5*onimm.vars.radius_job;
					}
					else return d.y = onimm.vars.y_coordinates[i] + 0.8*onimm.vars.radius_job;
				})
				.append("xhtml:body").attr("class", "jobs-text-body")
					.html(function(d,i) {
						return "<p class='jobs-text'>"+d.CSLABELFLD["#text"]+"</p>";
					});

			// The font size is compute after
			d3.selectAll(".jobs-text").style("font-size", 0.012*onimm.vars.width+"px");

			// Set jobs-text-foreignObject height to be what we need, not more nor less
			var jobs_text_height = [];
			$(".jobs-text").each(function(index, element) {
				jobs_text_height.push(1.3*$(element).outerHeight());
			});
			d3.selectAll(".jobs-text-foreignObject").attr("height", function(d,i) {
				return jobs_text_height[i];
			});

			// Load for each jobs an bubble.flat.png image
			onimm.bubble = onimm.jobs.append("svg:foreignObject")
				.attr("class", "bubble-foreignObject")
				.attr("width", 2*onimm.vars.radius_job)
				.attr("height", 2*onimm.vars.radius_job)
				.attr("x", function(d,i) {
					return onimm.vars.x_coordinates[i] - onimm.vars.radius_job;
				})
				.attr("y", function(d,i) {
					return onimm.vars.y_coordinates[i] - onimm.vars.radius_job;
				})
				.append("xhtml:body").attr("class", "bubble-body")
					.html("<img class='bubble' src='./img/bubble-flat.png'>");

			onimm.bubble.data(onimm.vars.data);

			// For the THIRD TODO, Other_jobs
			onimm.vars.first_level_jobs[0] = onimm.vars.met_ids;
			onimm.vars.first_level_jobs[1] = onimm.vars.x_coordinates;
			onimm.vars.first_level_jobs[2] = onimm.vars.y_coordinates;

			//console.dir(onimm.vars.first_level_jobs);

			// Since moving the jobs and zooming is un-useful, and buggy on tablet, do not use !
			// onimm.jobs.call(onimm.vars.drag);
			// onimm.svg.call(onimm.vars.zoom);

			// New Legend at the bottom (totally different from set_legent() of embed-onimm.js file !!)
			onimm.init_legend();

			// Set the size of Legend at the bottom
			onimm.setup_legend();

			onimm.init_bonds(onimm.vars.data);

			d3.select(".bubble-body")
				.html("<img class='bubble-info-icon' src='./img/bubble-info-flat.png'>");

			// Set legend again when clicking on help
			d3.select(".bubble-info-icon").on("dblclick", function(d,i) {});
			d3.select(".bubble-info-icon").on("click", function(d,i) {
				onimm.display_info_job(d, i, onimm.vars.data);
			});

			// INDEPENDANT : VIDEO
			
				// Play button for displaying video
				onimm.play_video_button = onimm.createForeignObject(onimm.container, "play-video-button", 0.0275*onimm.vars.width, 0.0275*onimm.vars.width, -2*onimm.vars.radius_info_job, -1.3*onimm.vars.radius_info_job);
				onimm.createImg(onimm.play_video_button, "play-video-button-image", "./img/play-icon.png");

				// Button for text content
				onimm.text_content_button = onimm.createForeignObject(onimm.container, "text-content-button", 0.0275*onimm.vars.width, 0.0275*onimm.vars.width, 1.5*onimm.vars.radius_info_job, -1.3*onimm.vars.radius_info_job);
				onimm.createImg(onimm.text_content_button, "text-content-button-image", "./img/text-icon.png");

				// Button displaying icon for "special statut" as Indépendant, Intermittent, Libéral, Artisan ...
				onimm.special_statut_button = onimm.createForeignObject(onimm.container, "special-statut", 0.0275*onimm.vars.width, 0.0275*onimm.vars.width, -0.30*onimm.vars.radius_info_job, -2*onimm.vars.radius_info_job);
				onimm.createImg(onimm.special_statut_button, "special-statut-button-image", "./img/special-statut-icon.png");

				$(".play-video-button-image, .text-content-button-image, .special-statut-button-image").css({"width":20+"px"});

				for (var i = 0, l = onimm.vars.data[0].Thesaurus.CSTM_T.record.length; i<l; i++) {

					if ("100215" != onimm.vars.data[0].MET_CATEGORIE_SOCIO_PRO["#text"]) {
						d3.select(".special-statut-button-image").style("display", "block");
						break;
					}
				}

				if ($.isArray(onimm.vars.video_data)) {
					for (var i = 0, l = onimm.vars.video_data.length; i<l; i++) {

						// If a video exist for the central job
						if (onimm.vars.video_data[i].attributes[0].value == onimm.vars.data[0].MET_ID["#text"]) {
							d3.select(".play-video-button-image").style("display", "block");
							break;
						}
						else {
							d3.select(".play-video-button-image").style("display", "none");
						}
					}
				}

				onimm.play_video_button.on("click", function() {
					onimm.display_video(0, onimm.vars.data);
				});

				onimm.text_content_button.on("click", function(d) {
					onimm.display_info_job(d, 0, onimm.vars.data);
				});

				onimm.special_statut_button.on("click", function() {
					//onimm.display_statut(0, onimm.vars.data);
					onimm.display_info_job(1, 0, onimm.vars.data);
				});

			// INDEPENDANT

			onimm.bubble.on("dblclick", function(d,i) {});
			onimm.bubble.on("click", function(d,i) {
				if (d3.event.defaultPrevented) return;
				onimm.move_to_node(d,i,onimm.vars.data);
			});

			// onimm.jobs.on("dblclick", function(d,i) {});
			// onimm.jobs.on("click", function(d,i) {
			// 	onimm.move_to_node(d,i,onimm.vars.data);
			// });

			// Set historic svg elements
			onimm.set_historic();

			// Add the first hist_node to historic array (i.e the first loaded with the page)
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

				// Only display 5 nodes of historic
				if (onimm.vars.historic.length > 5) {
					var shifted = onimm.vars.historic.shift();
					onimm.vars.historic[onimm.vars.historic.length-1].y = shifted.y;
				}
			}

			onimm.update_historic(met_id);

			onimm.other_jobs();

			onimm.init_other_bonds();

			onimm.resize();

			//console.dir(onimm.vars.other_bonds_coordinates);

			onimm.init_orientation();

			window.addEventListener('orientationchange', onimm.handle_orientation);

		}); // End d3.json(uri, met_id, function)
	};

	/* -----------------------------------------------------=== methods ===---------------------------------------- */

	/** color circle stroke based on the fonction of the job
	 * Onisep studio should chose the color when the time will come ;
	 * The list of domaine/fonction should be completed
	 */
	onimm.init_color_node = function(d) {
		
		// fonction exploitation
		if (d.MET_DOMAINE["#text"] == "102892") {
			return '#15C06F';
		}
		// fonction maintenance
		if (d.MET_DOMAINE["#text"] == "100174") {
			return '#FF6FEF';
		}
		// fonction marketing
		if (d.MET_DOMAINE["#text"] == "102876") {
			return "#B2FF48";
		}
		// fonction information - communication
		if (d.MET_DOMAINE["#text"] == "100154") {
			return '#9A82FF';
		}
		// fonction conception
		if (d.MET_DOMAINE["#text"] == "100158") {
			return '#FD6A8B';
		}
		// fonction création artistique
		if (d.MET_DOMAINE["#text"] == "100156") {
			return '#488BFE';
		}
		// fonction études développement informatique
		if (d.MET_DOMAINE["#text"] == "102869") {
			return '#BAB3FF';
		}
		// fonction conseil, audit, expertise
		if (d.MET_DOMAINE["#text"] == "100145") {
			return '#FCD919';
		}

		// TODO : get the id of MET_DOMAINE and chose a color that match it
		// Voir avec le pôle documentaire.
		// Rallonger la légende en conséquence ?
		// 
		// fonction adminsitrative
		if (d.MET_DOMAINE["#text"] == "1001") {
			return '#33DDD0';
		}
		// fonction animation
		if (d.MET_DOMAINE["#text"] == "1001") {
			return '#FD4F84';
		}
		// fonction achats approvisionnement
		if (d.MET_DOMAINE["#text"] == "1001") {
			return '#BAB3FF';
		}
		// fonction administratin des ventes
		if (d.MET_DOMAINE["#text"] == "1001") {
			return '#7DCAFE';
		}
		// fonction distribution
		if (d.MET_DOMAINE["#text"] == "1001") {
			return '#D3FFC1';
		}
		// fonction import-export
		if (d.MET_DOMAINE["#text"] == "100") {
			return '#FDD580';
		}
		// fonction marketing
		if (d.MET_DOMAINE["#text"] == "100") {
			return '#91ACE6';
		}
		// fonction technico commercial
		if (d.MET_DOMAINE["#text"] == "100") {
			return '#FCA145';
		}
		// fonction vente
		if (d.MET_DOMAINE["#text"] == "100") {
			return '#FCA145';
		}
		// fonction développement agricole
		if (d.MET_DOMAINE["#text"] == "100") {
			return '#FCA145';
		}
		// fonction études développement BTP
		if (d.MET_DOMAINE["#text"] == "100") {
			return '#FCA145';
		}
		// fonction études développement industriel
		if (d.MET_DOMAINE["#text"] == "100") {
			return '#FCA145';
		}
		// fonction conduite de projet
		if (d.MET_DOMAINE["#text"] == "100") {
			return '#FCA145';
		}
		// fonction contrôle
		if (d.MET_DOMAINE["#text"] == "100") {
			return '#FCA145';
		}
		// fonction essais
		if (d.MET_DOMAINE["#text"] == "100") {
			return '#FCA145';
		}
		// fonction mesure, analyse
		if (d.MET_DOMAINE["#text"] == "100") {
			return '#FCA145';
		}
		// fonction direction commerciale
		if (d.MET_DOMAINE["#text"] == "100") {
			return '#FCA145';
		}
		// fonction direction technique
		if (d.MET_DOMAINE["#text"] == "100") {
			return '#FCA145';
		}

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

	// The zoom- functions are called if onimm.svg.call(onimm.vars.zoom); line 382 is not commented, but I think
	// it is buggy
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
	// The drag'n'drop- functions are called if onimm.jobs.call(onimm.vars.drag); line 381 is not commented, but I think
	// it is buggy
	onimm.dragstarted = function(d) {
		d3.event.sourceEvent.stopPropagation();
		d3.select(this).classed("is-dragging", true);
	};

	// Admitted the dragged element is a svg group g with internal circle and text,
	// we change its coordinate, and it is a bit complex, but it works
	onimm.dragged = function(d) {
		d3.select(this).select('.jobs-circle').attr("cx", d3.event.x ).attr("cy", d3.event.y);
		//d3.select(this).attr("transform", "translate("+ d3.event.x +","+ d3.event.y +")");
		d3.select(this).select('.jobs-text-foreignObject')
			.attr("x", d3.event.x - 3*onimm.vars.radius_job)
			.attr("y", d3.event.y + 0.6*onimm.vars.radius_job)
			.on("mousedown", function() { d3.event.stopPropagation(); });
		d3.select(this).select('.bubble-foreignObject')
			.attr("x", d3.event.x - onimm.vars.radius_job).attr("y", d3.event.y - onimm.vars.radius_job)

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
				.attr("x", d3.event.x - 10 - onimm.vars.radius_job).attr("y", d3.event.y - 10 - onimm.vars.radius_job);
			d3.select(this).select('.jobs-text-foreignObject')
				.attr("y", d3.event.y + 10 +onimm.vars.radius_job);

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
		var moveX = d3.event.x - onimm.vars.half_width;
		var moveY = d3.event.y - 0.5*onimm.vars.half_height;
		d3.select('.info-job-container').attr("transform","translate("+ moveX +","+ moveY+")");
	};

	onimm.dragended = function(d) {
		d3.select(this).classed("is-dragging", false);
	};

	onimm.init_legend = function() {

		onimm.container_legend = onimm.svg.append("svg:g")
			.attr("class","legend-container");

		onimm.legend_fo = onimm.container_legend.append("svg:foreignObject").attr("class","legend-foreignObject");
	
		onimm.legend_body = onimm.legend_fo
			.append("xhtml:body").attr("class", "legend-body")
				.html(function(d,i) {
					return "<div class='legend-div'></div>";
				});

		onimm.legend_div = d3.select('.legend-div');

		onimm.legend_image = onimm.createForeignObject(
			onimm.container_legend,
			"legend-image",
			0.05*onimm.vars.width,
			0.05*onimm.vars.width,
			0.99*onimm.vars.width,
			0.001*onimm.vars.height
		);
		onimm.createImg(onimm.legend_image, "legend-image", "./img/legend-icon.png");

		onimm.legend_1 = onimm.container_legend.append("svg:line")
			.attr("class", function(d,i) {return "legend-1-line bond"})
			.attr("stroke-width","5").attr("stroke", onimm.vars.coordination_color)

		onimm.legend_1_text_fo = onimm.container_legend.append("svg:foreignObject")
			.attr("class", "legend-text-foreignObject legend-1-text");

		onimm.legend_1_text = onimm.legend_1_text_fo.append("xhtml:body").attr("class", "legend-text-body")
				.html(function(d,i) {
					return "<p class='legend-text'>Coordonne</p>";
				});

		onimm.marker_coordinated_legend = onimm.container_legend.append("svg:path")
			.attr("d", "M -18,10 -18,-10 -28,0 Z")
			.attr("style", "fill:"+onimm.vars.coordination_color+"; stroke:"+onimm.vars.coordination_color+"; stroke-width:0.5px");


		onimm.legend_2 = onimm.container_legend.append("svg:line")
			.attr("class", function(d,i) {return "legend-2-line bond"})
			.attr("stroke-width","5").attr("stroke", onimm.vars.collaboration_color)

		onimm.legend_2_text_fo = onimm.container_legend.append("svg:foreignObject")
			.attr("class", "legend-text-foreignObject legend-2-text");

		onimm.legend_2_text = onimm.legend_2_text_fo.append("xhtml:body").attr("class", "legend-text-body")
				.html(function(d,i) {
					return "<p class='legend-text'>Collaboration</p>";
				});

		onimm.legend_3_text_fo = onimm.container_legend.append("svg:foreignObject")
			.attr("class", "legend-instructions-foreignObject");

		onimm.legend_3_text = onimm.legend_3_text_fo.append("xhtml:body").attr("class", "legend-instructions-body")
				.html(function(d,i) {
					return "<p class='legend-instructions'>Cliquez sur le noeud central pour avoir des informations</p>";
				});

		onimm.legend_4_text_fo = onimm.container_legend.append("svg:foreignObject")
			.attr("class", "legend-instructions-foreignObject");

		onimm.legend_4_text = onimm.legend_4_text_fo.append("xhtml:body").attr("class", "legend-instructions-body")
				.html(function(d,i) {
					return "<p class='legend-instructions'>Cliquez sur les autres noeuds pour naviguer vers eux.</p>";
				});
				

		d3.selectAll(".legend-text").style({
			"margin": "0 0 0 12px"
		});

		onimm.legend_leave = onimm.createForeignObject(onimm.container_legend, "legend-close", 0.05*onimm.vars.width, 0.05*onimm.vars.width, 0.965*onimm.vars.width, 0);
		onimm.createImg(onimm.legend_leave, "legend-close-icon", "./img/close-icon.png");

		onimm.legend_leave.on("click", function(d) {
			onimm.close_legend();
			onimm.set_legend_helper();
		});

	};

	// Create the svg elements for the legend
	onimm.setup_legend = function() {
		
		// Basic BUT cross-browser test for knowing if we are displaying Landscape/Portrait mode
		var screen_orientation = ($(window).width() > $(window).height())? 90 : 0;

			switch(screen_orientation) {
				case 90: // Landscape
					onimm.legend_fo.attr("x", 0).attr("y", 0.999*onimm.vars.height)
						.attr("width", 1*onimm.vars.width).attr("height", 0.07*onimm.vars.height);

					$(".legend-body, .legend-div").width(onimm.legend_fo.attr("width"));
					$(".legend-body, .legend-div").height(onimm.legend_fo.attr("height"));
					$(".legend-body").css({"margin":"11px"});

					d3.selectAll(".legend-text").style("font-size", 0.014*onimm.vars.width+"px");
					d3.selectAll(".legend-instructions").style("font-size", 0.009*onimm.vars.width+"px");

					onimm.legend_1
						.attr("x1", 0.1*onimm.vars.width)
						.attr("y1", 1.035*onimm.vars.height)
						.attr("x2", 0.15*onimm.vars.width)
						.attr("y2", 1.035*onimm.vars.height);

					onimm.legend_1_text_fo
						.attr("width", 0.15*onimm.vars.width)
						.attr("height", 0.2*onimm.vars.height)
						.attr("x", 0.17*onimm.vars.width)
						.attr("y", 1.023*onimm.vars.height);

					onimm.legend_2
						.attr("x1", 0.3*onimm.vars.width)
						.attr("y1", 1.035*onimm.vars.height)
						.attr("x2", 0.35*onimm.vars.width)
						.attr("y2", 1.035*onimm.vars.height);

					onimm.legend_2_text_fo
						.attr("width", 0.15*onimm.vars.width)
						.attr("height", 0.2*onimm.vars.height)
						.attr("x", 0.36*onimm.vars.width)
						.attr("y", 1.023*onimm.vars.height);

					onimm.marker_coordinated_legend.attr("transform", "scale(1.5) translate("+0.08*onimm.vars.width+","+0.69*onimm.vars.height+")");

					onimm.legend_3_text_fo
						.attr("width", 0.15*onimm.vars.width)
						.attr("height", 0.23*onimm.vars.height)
						.attr("x", 0.55*onimm.vars.width)
						.attr("y", 1.01*onimm.vars.height);

					onimm.legend_4_text_fo
						.attr("width", 0.15*onimm.vars.width)
						.attr("height", 0.23*onimm.vars.height)
						.attr("x", 0.75*onimm.vars.width)
						.attr("y", 1.01*onimm.vars.height);

					d3.select('.legend-image-foreignObject')
						.attr("x", 0.01*onimm.vars.width)
						.attr("y", 1.018*onimm.vars.height);

					d3.select('.legend-close-foreignObject')
						.attr("x", 0.990*onimm.vars.width)
						.attr("y", 0.985*onimm.vars.height);

				break;

				case 0: // Portrait
					
					onimm.legend_fo.attr("x", 10).attr("y", 0.85*onimm.vars.height)
						.attr("width", 1*onimm.vars.width).attr("height", 0.07*onimm.vars.height);

					$(".legend-body, .legend-div").width(onimm.legend_fo.attr("width"));
					$(".legend-body, .legend-div").height(onimm.legend_fo.attr("height"));
					$(".legend-body").css({"margin":"11px"});

					d3.selectAll(".legend-text").style("font-size", 0.014*onimm.vars.width+"px");
					d3.selectAll(".legend-instructions").style("font-size", 0.009*onimm.vars.width+"px");

					onimm.legend_1
						.attr("x1", 0.1*onimm.vars.width)
						.attr("y1", 0.885*onimm.vars.height)
						.attr("x2", 0.15*onimm.vars.width)
						.attr("y2", 0.885*onimm.vars.height);

					onimm.legend_1_text_fo
						.attr("width", 0.15*onimm.vars.width)
						.attr("height", 0.2*onimm.vars.height)
						.attr("x", 0.17*onimm.vars.width)
						.attr("y", 0.885*onimm.vars.height);

					onimm.legend_2
						.attr("x1", 0.3*onimm.vars.width)
						.attr("y1", 0.885*onimm.vars.height)
						.attr("x2", 0.35*onimm.vars.width)
						.attr("y2", 0.885*onimm.vars.height);

					onimm.legend_2_text_fo
						.attr("width", 0.15*onimm.vars.width)
						.attr("height", 0.2*onimm.vars.height)
						.attr("x", 0.36*onimm.vars.width)
						.attr("y", 0.885*onimm.vars.height);

					onimm.marker_coordinated_legend.attr("transform", "scale(1.5) translate("+0.08*onimm.vars.width+","+0.71*onimm.vars.height+")");

					onimm.legend_3_text_fo
						.attr("width", 0.15*onimm.vars.width)
						.attr("height", 0.2*onimm.vars.height)
						.attr("x", 0.55*onimm.vars.width)
						.attr("y", 0.88*onimm.vars.height);

					onimm.legend_4_text_fo
						.attr("width", 0.15*onimm.vars.width)
						.attr("height", 0.2*onimm.vars.height)
						.attr("x", 0.75*onimm.vars.width)
						.attr("y", 0.88*onimm.vars.height);

					d3.select('.legend-image-foreignObject')
						.attr("x", 0.020*onimm.vars.width)
						.attr("y", 0.875*onimm.vars.height);

					d3.select('.legend-close-foreignObject')
						.attr("x", 0.990*onimm.vars.width)
						.attr("y", 0.835*onimm.vars.height);

				break;

				default:
				break;
			}
	};

	/**
	 * Set element of historic
	 *
	 */
	onimm.set_historic = function() {
		onimm.container_historic = onimm.svg.append("svg:g")
			.attr("class", "historic-container")
			.attr("transform", "translate("+-0.5*onimm.vars.width+",0)");
			

		onimm.historic_image = onimm.createForeignObject(onimm.container_historic, "historic-image", 0.05*onimm.vars.width, 0.05*onimm.vars.width, 0.28*onimm.vars.width, 0.0175*onimm.vars.height);
		onimm.createImg(onimm.historic_image, "historic-image", "./img/historic-icon.png");

		onimm.historic_title = onimm.container_historic.append("svg:foreignObject")
			.attr("class", "historic-title-foreignObject")
			.attr("width", 0.15*onimm.vars.width)
			.attr("height", 0.15*onimm.vars.height)
			.attr("x", 0.33*onimm.vars.width)
			.attr("y", 0.03*onimm.vars.half_height)
			.append("xhtml:body").attr("class", "historic-title-body")
				.html(function(d,i) {
					return "<p class='historic-title'>Historique</p>";
				});

		// helper
		onimm.get_historic = onimm.svg.append("svg:g")
			.attr("class", "get-historic-container")
			.attr("transform", "translate("+-0.25*onimm.vars.width+",0)");
			

		onimm.historic_image = onimm.createForeignObject(onimm.get_historic, "get-historic-image", 0.05*onimm.vars.width, 0.05*onimm.vars.width, 0.28*onimm.vars.width, 0.0175*onimm.vars.height);
		onimm.createImg(onimm.historic_image, "get-historic-image", "./img/historic-icon.png");

		onimm.get_historic_title = onimm.get_historic.append("svg:foreignObject")
			.attr("class", "get-historic-title-foreignObject")
			.attr("width", 0.15*onimm.vars.width)
			.attr("height", 0.15*onimm.vars.height)
			.attr("x", 0.33*onimm.vars.width)
			.attr("y", 0.03*onimm.vars.half_height)
			.append("xhtml:body").attr("class", "get-historic-title-body")
				.html(function(d,i) {
					return "<p class='get-historic-title'>Historique</p>";
				});

		onimm.get_helper_historic = function() {
			onimm.container_historic.transition().duration(500).attr("transform", "translate("+-0.25*onimm.vars.width+",0)");
			onimm.get_historic.transition().duration(500).attr("transform", "translate("+-0.5*onimm.vars.width+",0)");

			onimm.historic_title.on("click", function() {
				onimm.remove_helper_historic();
			});
		};

		onimm.remove_helper_historic = function() {
			onimm.container_historic.transition().duration(500).attr("transform", "translate("+-0.5*onimm.vars.width+",0)");
			onimm.get_historic.transition().duration(500).attr("transform", "translate("+-0.25*onimm.vars.width+",0)");
		};

		onimm.get_historic.on("click", function() {
			onimm.get_helper_historic();
		});

	};

	onimm.close_legend = function() {
		onimm.container_legend.attr("transform", "translate("+ 0.045*$(window).width() +","+100+")");
	};

	onimm.close_historic = function() {
		onimm.container_historic.remove();
	};

	onimm.set_legend_helper = function() {

		onimm.help_legend_container = onimm.svg.append("svg:g").attr("class", "help");
		onimm.help_legend_fo = onimm.help_legend_container.append("svg:foreignObject")
			.attr("class", "help-text-foreignObject");

		onimm.help_legend = onimm.help_legend_fo
			.append("xhtml:body").attr("class", "help-text-body")
				.html(function(d,i) {
					return "<p class='help-text-legend'>Aide</p>";
				});

		// Basic BUT cross-browser test for knowing if we are displaying Landscape/Portrait mode
		var screen_orientation = ($(window).width() > $(window).height())? 90 : 0;

		onimm.vars.height = $(window).height();
		onimm.vars.width = $(window).width();
		onimm.vars.half_height = 0.5*onimm.vars.height;
		onimm.vars.half_width = 0.5*onimm.vars.width;

		switch(screen_orientation) {
			case 90: // Landscape
				onimm.help_legend_fo
					.attr("width", 0.05175*onimm.vars.width)
					.attr("height", 0.095*onimm.vars.height)
					.attr("x", 0.1*onimm.vars.width)
					.attr("y", 0.9*onimm.vars.height);
			break;

			case 0: // Portrait
				onimm.help_legend_fo
					.attr("width", 0.05175*onimm.vars.width)
					.attr("height", 0.095*onimm.vars.height)
					.attr("x", 0.1*onimm.vars.width)
					.attr("y", 0.78*onimm.vars.height);
			break;

			default:
			break;
		}

		d3.select(".help-text-legend").style({
			"font-size":"18px"
		});

		// Set legend again when clicking on help
		onimm.help_legend.on("click", function(d) {
			onimm.help_legend_container.remove();
			onimm.container_legend.attr("transform", "scale(0.9) translate("+ 0.045*onimm.vars.width +","+-5+")");
		});
	};


	/**
	 * Add g svg elements for each jobs visited, since the first,
	 * with click handler.
	 */
	onimm.update_historic = function(new_met_id) {

		onimm.hist_nodes = onimm.container_historic.selectAll(".hist-nodes")
			.data(onimm.vars.historic);

		onimm.hist_nodes = onimm.hist_nodes.enter().append("svg:g")
			.classed("hist-nodes", function(d) {return d;})
			.attr("hist", function(d,i) {return i;});

		onimm.hist_nodes.append("svg:circle")
			.attr("class", "hist-circle")
			.attr("r", 0.5*onimm.vars.radius_hist_job)
			.attr("cx", function(d,i) {
				return 0.29*onimm.vars.width;
			})
			.attr("cy", function(d,i) {
				return 0.05*onimm.vars.height + 1.5*onimm.vars.historic[i]["y"];
			})
			.attr("met_domaine", function(d,i) {
				return onimm.vars.historic[i]["met_domaine"];
			})
			.attr("met_id", function(d,i) {
				return onimm.vars.historic[i]["met_id"];
			})
			.style("fill", function(d,i) {
				return onimm.vars.historic[i]["stroke_color"];
			});

		onimm.text_hist_nodes = onimm.hist_nodes.append("svg:foreignObject")
			.attr("class", "hist-nodes-foreignObject")
			.attr("width", 0.2*onimm.vars.width)
			.attr("height", 0.13*onimm.vars.height)
			.attr("x", function(d,i) {
				return 0.29*onimm.vars.width;
			})
			.attr("y", function(d,i) {
				return 0.04*onimm.vars.height + 1.5*onimm.vars.historic[i]["y"];
			})
			.attr("met_domaine", function(d,i) {
				return onimm.vars.historic[i]["met_domaine"];
			})
			.attr("met_id", function(d,i) {
				return onimm.vars.historic[i]["met_id"];
			})
			.append("xhtml:body").attr("class", "hist-nodes-body")
				.html(function(d,i) {
					return "<div class='hist-nodes-div'>"
					+"<p class='hist-nodes-text'>"+d.name+"</p>";
				});

		d3.selectAll(".hist-nodes-text").style("font-size", 0.012*onimm.vars.width+"px");

		// Set hist-nodes-foreignObject height to be what we need, not more nor less
		var hist_nodes_text_height = [];
		$(".hist-nodes-text").each(function(index, element) {
			hist_nodes_text_height.push(1.2*$(element).outerHeight());
		});
		d3.selectAll(".hist-nodes-foreignObject").attr("height", function(d,i) {
			return hist_nodes_text_height[i];
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

		// Set bold style for the current jobs/nodes we are displaying at the center
		d3.selectAll(".hist-nodes-body").each(function(d,i) {
			if (d.met_id == met_id) {
				d3.select(this).style("font-weight", "bold");
			}
		});

		// Click on historic node will change the central node
		onimm.hist_nodes.on("click", function(d,i) {

			d3.selectAll(".bonds-container").transition().duration(200)
				.style("opacity", 0);

			d3.selectAll(".jobs").transition().duration(750)
				.attr("transform", function(d,i) {
					return "translate("+onimm.vars.x_coordinates[i]+","+onimm.vars.y_coordinates[i]+")";
				});

			// Change node with historic
			$(".onimm-svg").fadeOut(600, function() {
				$(".onimm-svg").remove();
				Onimm("onimm", d.met_id, "./data/carte_heuristique.xml", onimm.vars.historic);
			});
		});



	};

	/**
	 *  Display info about the central jobs we click on.
	 *  Prevent other click and do some animation
	 */
	onimm.display_info_job = function(d, i , data) {

		d3.select(".bubble-info-icon").on("click", function() {});

		d3.selectAll(".historic-container").transition().duration(200)
			.style("opacity", 0.1);

		d3.selectAll(".other-jobs-container").transition().duration(200)
			.style("opacity", 0.1);

		d3.selectAll(".jobs-container").transition().duration(200)
			.style("opacity", 0.8);

		d3.selectAll(".bonds-container").transition().duration(200)
			.style("opacity", 0.3);

		d3.select(".other-bonds-container").transition().duration(200)
				.style("opacity", 0.1);

		var content = "";

		// The content will be build progressively
		for (var j = 0, l = data[i].Thesaurus.CSTM_T.record.length; j<l; j++) {
			if (data[i].MET_DOMAINE["#text"] === data[i].Thesaurus.CSTM_T.record[j].DKEY["#text"]) {
				onimm.info_job = onimm.svg.append("svg:g").attr("class","info-job-container").append("svg:foreignObject");

				d3.select(".info-job-container").attr("transform", "translate("+0+","+0.5*onimm.vars.half_height+")");

				onimm.info_job.transition()
					.duration(1000).ease('linear')
					.attr("class","info-job-foreignObject")
					.attr("width", 700).attr("height", 500)
					.attr("x", 0.24*onimm.vars.width)
					.attr("y", -0.2*onimm.vars.height);

				onimm.info_job
					.append("xhtml:body").attr("class", "info-job-body")
					.append("div")
					.attr("class", "info-job")
					.html("<div class='info-close'><img class='info-close-icon' src='./img/close-icon.png'></div>"
						+"<p class='info-job-title'>Informations</p>"
						+"<p class='info-job-text'>Métier ayant une "+data[i].Thesaurus.CSTM_T.record[j].CSLABELFLD["#text"]+".</p>");
			}
		}

		
		content = d3.select(".info-job").html();
		d3.select(".info-job").html(content
				+"<p class='info-job-text'><em>Résumé</em> : ");

		if ($.isArray(data[0].Formats_courts.METIER_FORMAT_COURT.record)) {
			for (var j = 0, m = data[i].Formats_courts.METIER_FORMAT_COURT.record.length; j<m; j++) {
				if ($.isArray(data[0].Formats_courts.METIER_FORMAT_COURT.record[j].XMLCONTENT.record)) {
					for (var k = 0, n = data[i].Formats_courts.METIER_FORMAT_COURT.record[j].XMLCONTENT.record.length; k<n; k++) {
						if ($.isArray(data[i].Formats_courts.METIER_FORMAT_COURT.record[j].XMLCONTENT.record[k].XC_XML.METFOR_DESCRIPTIF.synth.p)) {
							for (var e = 0, f = data[i].Formats_courts.METIER_FORMAT_COURT.record[j].XMLCONTENT.record[k].XC_XML.METFOR_DESCRIPTIF.synth.p.length; e<f; e++) {
								content = d3.select(".info-job").html();
								d3.select(".info-job").html(content
								+data[i].Formats_courts.METIER_FORMAT_COURT.record[j].XMLCONTENT.record[k].XC_XML.METFOR_DESCRIPTIF.synth.p[e]["#text"] + "  ");
							}
						}
						else {
							content = d3.select(".info-job").html();
							d3.select(".info-job").html(content
							+data[i].Formats_courts.METIER_FORMAT_COURT.record[j].XMLCONTENT.record[k].XC_XML.METFOR_DESCRIPTIF.synth.p["#text"] + "  ");
						}
					}
				}
				else {
					
					if (data[i].Formats_courts.METIER_FORMAT_COURT.record[j].XMLCONTENT.record.XC_XML.METFOR_DESCRIPTIF != undefined) {
						if ($.isArray(data[i].Formats_courts.METIER_FORMAT_COURT.record[j].XMLCONTENT.record.XC_XML.METFOR_DESCRIPTIF.synth.p)) {
							for (var e = 0, f = data[i].Formats_courts.METIER_FORMAT_COURT.record[j].XMLCONTENT.record.XC_XML.METFOR_DESCRIPTIF.synth.p.length; e<f; e++) {
								content = d3.select(".info-job").html();
								d3.select(".info-job").html(content
								+data[i].Formats_courts.METIER_FORMAT_COURT.record[j].XMLCONTENT.record.XC_XML.METFOR_DESCRIPTIF.synth.p[e]["#text"] + "  ");
							}
						}
						else {
							content = d3.select(".info-job").html();
							d3.select(".info-job").html(content
							+data[i].Formats_courts.METIER_FORMAT_COURT.record[j].XMLCONTENT.record.XC_XML.METFOR_DESCRIPTIF.synth.p["#text"] + "  ");
						}
					}
				}
			}
		}
		else {
			if ($.isArray(data[0].Formats_courts.METIER_FORMAT_COURT.record.XMLCONTENT.record)) {
				for (var k = 0, n = data[i].Formats_courts.METIER_FORMAT_COURT.record.XMLCONTENT.record.length; k<n; k++) {
					if ($.isArray(data[i].Formats_courts.METIER_FORMAT_COURT.record.XMLCONTENT.record[k].XC_XML.METFOR_DESCRIPTIF.synth.p)) {
						for (var e = 0, f = data[i].Formats_courts.METIER_FORMAT_COURT.record.XMLCONTENT.record[k].XC_XML.METFOR_DESCRIPTIF.synth.p.length; e<f; e++) {
							content = d3.select(".info-job").html();
							d3.select(".info-job").html(content
							+data[i].Formats_courts.METIER_FORMAT_COURT.record.XMLCONTENT.record[k].XC_XML.METFOR_DESCRIPTIF.synth.p[e]["#text"] + "  ");
						}
					}
					else {
						content = d3.select(".info-job").html();
						d3.select(".info-job").html(content
						+data[i].Formats_courts.METIER_FORMAT_COURT.record.XMLCONTENT.record[k].XC_XML.METFOR_DESCRIPTIF.synth.p["#text"] + "  ");
					}
				}
			}
			else {
				if ($.isArray(data[i].Formats_courts.METIER_FORMAT_COURT.record.XMLCONTENT.record.XC_XML.METFOR_DESCRIPTIF.synth.p)) {
					for (var e = 0, f = data[i].Formats_courts.METIER_FORMAT_COURT.record.XMLCONTENT.record.XC_XML.METFOR_DESCRIPTIF.synth.p.length; e<f; e++) {
						content = d3.select(".info-job").html();
						d3.select(".info-job").html(content
						+data[i].Formats_courts.METIER_FORMAT_COURT.record.XMLCONTENT.record.XC_XML.METFOR_DESCRIPTIF.synth.p[e]["#text"] + "  ");
					}
				}
				else {
					content = d3.select(".info-job").html();
					d3.select(".info-job").html(content
					+data[i].Formats_courts.METIER_FORMAT_COURT.record.XMLCONTENT.record.XC_XML.METFOR_DESCRIPTIF.synth.p["#text"] + "  ");
				}
			}
		}

		content = d3.select(".info-job").html();
			d3.select(".info-job").html(content
				+"<p class='info-job-text'><em>Statut</em> : ");

		for (var k = 0, m = data[i].Thesaurus.CSTM_T.record.length; k<m; k++) {
			if (data[i].Thesaurus.CSTM_T.record[k].MFR["#text"] == "Statut") {
				content = d3.select(".info-job").html();
				d3.select(".info-job").html(content
					+data[i].Thesaurus.CSTM_T.record[k].CSLABELFLD["#text"] + "  ");
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
						+data[i].Thesaurus.CSTM_T.record[v].CSLABELFLD["#text"]+"  ");
				}
			}
		}

		content = d3.select(".info-job").html();
		d3.select(".info-job").html(content);

		content = d3.select(".info-job").html();
		d3.select(".info-job").html(content
			+"<p class='info-job-more'>Cliquez ici pour "
			+"<a target='_blank' href='http://www.onisep.fr/http/redirection/metier/identifiant/"+data[i].MET_ID['#text']+"'>en savoir plus</a></p>");

		d3.selectAll(".info-job-foreignObject")
			.attr("height", 0.1*$(".info-job").outerHeight());

		d3.select(".info-close").on("dblclick", function() {});

		d3.select(".info-close").on("click", function() {
			onimm.close_modale_window();
		});

		d3.select(".bubble-info-icon").on("dblclick", function() {});

		d3.select(".bubble-info-icon").on("click", function() {
			onimm.close_modale_window();
		});

		onimm.vars.drag_modale = d3.behavior.drag()
			.on("dragstart", onimm.dragstarted)
			.on("drag", onimm.dragged_modale)
			.on("dragend", onimm.dragended);

		d3.select(".info-job-container").call(onimm.vars.drag_modale);

	};

	onimm.close_modale_window = function() {
		d3.select(".info-job-container").remove();

			d3.selectAll(".jobs-container").transition().duration(200)
				.style("opacity", 1);

			d3.selectAll(".bonds-container").transition().duration(200)
				.style("opacity", 1);


			d3.selectAll(".historic-container").transition().duration(400)
				.style("opacity", 1);

			d3.selectAll(".other-jobs-container").transition().duration(400)
				.style("opacity", 1);

			d3.select(".bubble-info-icon").on("click", function(d,i) {
				onimm.display_info_job(d, i, onimm.vars.data);
			});

	};

	onimm.display_video = function(i, data) {

		for (var i = 0, l = onimm.vars.video_data.length; i<l; i++) {
			if (onimm.vars.video_data[i].attributes[0].value == onimm.vars.data[0].MET_ID["#text"]) {

				d3.select(".bubble-info-icon").on("click", function() {});

				d3.selectAll(".historic-container").transition().duration(200)
					.style("opacity", 0);

				d3.selectAll(".other-jobs-container").transition().duration(200)
					.style("opacity", 0);

				d3.selectAll(".jobs-container").transition().duration(200)
					.style("opacity", 0.5);

				d3.selectAll(".bonds-container").transition().duration(200)
					.style("opacity", 0.5);

				var content = "";
				
				onimm.info_job = onimm.svg.append("svg:g").attr("class","info-job-container").append("svg:foreignObject");

				d3.select(".info-job-container").attr("transform", "translate("+0.2*onimm.vars.width+","+0.3*onimm.vars.half_height+")");

				onimm.info_job.transition()
					.duration(1000).ease('linear')
					.attr("class","info-job-foreignObject")
					.attr("width", 500).attr("height", 500)
					.attr("x", 0.0625*onimm.vars.width)
					.attr("y", -0,25*onimm.vars.height);

				onimm.info_job
					.append("xhtml:body").attr("class", "info-job-body")
					.append("div")
					.attr("class", "info-job")
					.html("<div class='info-close'><img class='info-close-icon' src='./img/close-icon.png'></div>"
						+onimm.vars.video_data[i].children[0].textContent);

				d3.select(".info-close").on("dblclick", function() {});

				d3.select(".info-close").on("click", function() {
					onimm.close_modale_window();
				});

				d3.select(".bubble-info-icon").on("dblclick", function() {});

				d3.select(".bubble-info-icon").on("click", function() {
					onimm.close_modale_window();
				});

				onimm.vars.drag_modale = d3.behavior.drag()
					.on("dragstart", onimm.dragstarted)
					.on("drag", onimm.dragged_modale)
					.on("dragend", onimm.dragended);

				d3.select(".info-job-container").call(onimm.vars.drag_modale);

			}
		}
	};


	onimm.display_statut = function(i, data) {
		var content = "";

		onimm.info_job = onimm.svg.append("svg:g").attr("class","info-job-container").append("svg:foreignObject");

		d3.select(".info-job-container").attr("transform", "translate("+0+","+0.5*onimm.vars.half_height+")");

		onimm.info_job.transition()
			.duration(1000).ease('linear')
			.attr("class","info-job-foreignObject")
			.attr("width", 500).attr("height", 280)
			.attr("x", 0.0625*onimm.vars.width)
			.attr("y", -0,25*onimm.vars.height);

		onimm.info_job
			.append("xhtml:body").attr("class", "info-job-body")
			.append("div")
			.attr("class", "info-job")
			.html("<div class='info-close'><img class='info-close-icon' src='./img/close-icon.png'></div>");


		for (var k = 0, m = data[i].Thesaurus.CSTM_T.record.length; k<m; k++) {
			if (data[i].Thesaurus.CSTM_T.record[k].MFR["#text"] == "Statut") {

				content = d3.select(".info-job").html();
				d3.select(".info-job").html(content
					+"<p class='info-job-text'><em>Statut</em> : "+data[i].Thesaurus.CSTM_T.record[k].CSLABELFLD["#text"]+"</p>");
			}
		}

		d3.select(".info-close").on("dblclick", function() {});

		d3.select(".info-close").on("click", function() {
			onimm.close_modale_window();
		});

		d3.select(".bubble-info-icon").on("dblclick", function() {});

		d3.select(".bubble-info-icon").on("click", function() {
			onimm.close_modale_window();
		});

		onimm.vars.drag_modale = d3.behavior.drag()
			.on("dragstart", onimm.dragstarted)
			.on("drag", onimm.dragged_modale)
			.on("dragend", onimm.dragended);

		d3.select(".info-job-container").call(onimm.vars.drag_modale);

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
			y_coordinates = 0.3*(onimm.vars.height*Math.sin((i)*(2*Math.PI)/(onimm.vars.totalNodes - 1)));
			return y_coordinates;
		}
		else if (d.MET_ID["#text"] !== met_id && true === onimm.vars.isNodeCentralY) {
			y_coordinates = 0.3*(onimm.vars.height*Math.sin((i-1)*(2*Math.PI)/(onimm.vars.totalNodes - 1)));	
			return y_coordinates;
		}
	};

	// TODO other_jobs
	// When it's okay for x, go for y
	onimm.new_init_x_coordinates_other_jobs = function(d, i) {
		var x;
		i++; // We don't care about the central job

		// we loop through the jobs of the first level, and we will check if their met_id equals the "neighbour met_id" of the other_jobs array
		// For the person who will continue here : good luck ; use the force, use onimm.vars.other_jobs and onimm.vars.first_level_jobs
		// If there is equality, we have to set the x coordinates as near as possible of the first_level_jobs that is tested and good.
		// 
		//  It must be a formula as : x_coordinates = radius*(onimm.vars.height*Math.cos((i)*(2*Math.PI)/(number of second_level_jobs)));
		// and Math.sin for y
		for (var j = 0, le = onimm.vars.first_level_jobs[0].length; j<le; j++) {
			
			if (onimm.vars.first_level_jobs[0][j] == onimm.vars.other_jobs[0][i]) {
				//console.log(" a " + onimm.vars.first_level_jobs[0][j] + "  " + onimm.vars.other_jobs[0][i]);
			}
		}

	};

	/**
	 * Initiate x and y coordinates for the other_jobs, rendering
	 * an arc. It's a bit complex and it takes account of all case : when we have 1,2, ... 8 jobs.
	 * Displaying other jobs without hiding something is difficult ; Sometimes only one, sometimes
	 * only 2 are displaying (because the text is displaying at the right and for other reasons)
	 * When x = 20000, it means that the elements will be displayed but far far away, in some galaxy ...
	 */
	onimm.x_coordinates_other_jobs = function(d,i) {
		var x;
		i++;
		if (1 == onimm.vars.totalNodes-1) {
			if (i < 4) {
				x = onimm.vars.x_coordinates[1] + (2.4*onimm.vars.radius_job)*Math.cos((i-3)*(2*Math.PI/10));
				onimm.vars.other_bonds_coordinates[0][i-1] = onimm.vars.x_coordinates[1];
			}
			else {
				x = 20000;
			}
		}
		if (2 == onimm.vars.totalNodes-1) {
			if (i < 4) {
				x = onimm.vars.x_coordinates[1] + (2.4*onimm.vars.radius_job)*Math.cos((i-3)*(2*Math.PI/10));
				onimm.vars.other_bonds_coordinates[0][i-1] = onimm.vars.x_coordinates[1];
			}
			else if (i > 3 && i < 6) {
				x = onimm.vars.x_coordinates[2] + (2.4*onimm.vars.radius_job)*Math.cos((i-6)*(2*Math.PI/12));
				onimm.vars.other_bonds_coordinates[0][i-1] = onimm.vars.x_coordinates[2];
			}
			else {
				x = 20000;
			}
		}
		if (3 == onimm.vars.totalNodes-1) {
			if (i < 4) {
				x = onimm.vars.x_coordinates[1] + (2.4*onimm.vars.radius_job)*Math.cos((i-3)*(2*Math.PI/10));
				onimm.vars.other_bonds_coordinates[0][i-1] = onimm.vars.x_coordinates[1];
			}
			else if (i > 3 && i < 6) {
				x = onimm.vars.x_coordinates[2] + (2.4*onimm.vars.radius_job)*Math.cos((i-6)*(2*Math.PI/12));
				onimm.vars.other_bonds_coordinates[0][i-1] = onimm.vars.x_coordinates[2];
			}
			else if (i > 6 && i < 9) {
				x = onimm.vars.x_coordinates[3] + (2.4*onimm.vars.radius_job)*Math.cos((i-9)*(2*Math.PI/12));
				onimm.vars.other_bonds_coordinates[0][i-1] = onimm.vars.x_coordinates[3];
			}
			else {
				x = 20000;
			}
		}
		if (4 == onimm.vars.totalNodes-1) {
			if (i < 4) {
				x = onimm.vars.x_coordinates[1] + (2.4*onimm.vars.radius_job)*Math.cos((i-3)*(2*Math.PI/10));
				onimm.vars.other_bonds_coordinates[0][i-1] = onimm.vars.x_coordinates[1];
			}
			else if (i > 3 && i < 6) {
				x = onimm.vars.x_coordinates[2] + (2.4*onimm.vars.radius_job)*Math.cos((i-6)*(2*Math.PI/12));
				onimm.vars.other_bonds_coordinates[0][i-1] = onimm.vars.x_coordinates[2];
			}
			else if (i > 6 && i < 9) {
				x = onimm.vars.x_coordinates[3] + (2.4*onimm.vars.radius_job)*Math.cos((i-9)*(2*Math.PI/12));
				onimm.vars.other_bonds_coordinates[0][i-1] = onimm.vars.x_coordinates[3];
			}
			else if (i > 9 && i < 12) {
				x = onimm.vars.x_coordinates[4] + (2.4*onimm.vars.radius_job)*Math.cos((i-12)*(2*Math.PI/12));
				onimm.vars.other_bonds_coordinates[0][i-1] = onimm.vars.x_coordinates[4];
			}
			else {
				x = 20000;
			}
			
		}
		if (5 == onimm.vars.totalNodes-1) {
			if (i < 4) {
				x = onimm.vars.x_coordinates[1] + (2.4*onimm.vars.radius_job)*Math.cos((i-3)*(2*Math.PI/10));
				onimm.vars.other_bonds_coordinates[0][i-1] = onimm.vars.x_coordinates[1];
			}
			else if (i > 3 && i < 6) {
				x = onimm.vars.x_coordinates[2] + (2.4*onimm.vars.radius_job)*Math.cos((i-6)*(2*Math.PI/12));
				onimm.vars.other_bonds_coordinates[0][i-1] = onimm.vars.x_coordinates[2];
			}
			else if (i > 6 && i < 9) {
				x = onimm.vars.x_coordinates[3] + (2.4*onimm.vars.radius_job)*Math.cos((i-8)*(2*Math.PI/14));
				onimm.vars.other_bonds_coordinates[0][i-1] = onimm.vars.x_coordinates[3];
			}
			else if (i > 9 && i < 12) {
				x = onimm.vars.x_coordinates[4] + (2.4*onimm.vars.radius_job)*Math.cos((i-12)*(2*Math.PI/12));
				onimm.vars.other_bonds_coordinates[0][i-1] = onimm.vars.x_coordinates[4];
			}
			else if (i > 12 && i < 15) {
				x = onimm.vars.x_coordinates[5] + (2.4*onimm.vars.radius_job)*Math.cos((i-15)*(2*Math.PI/12));
				onimm.vars.other_bonds_coordinates[0][i-1] = onimm.vars.x_coordinates[5];
			}
			else {
				x = 20000;
			}
			
		}
		if (6 == onimm.vars.totalNodes-1) {
			if (i < 4) {
				x = onimm.vars.x_coordinates[1] + (2.4*onimm.vars.radius_job)*Math.cos((i-3)*(2*Math.PI/10));
				onimm.vars.other_bonds_coordinates[0][i-1] = onimm.vars.x_coordinates[1];
			}
			else if (i > 3 && i < 6) {
				x = onimm.vars.x_coordinates[2] + (2.4*onimm.vars.radius_job)*Math.cos((i-6)*(2*Math.PI/12));
				onimm.vars.other_bonds_coordinates[0][i-1] = onimm.vars.x_coordinates[2];
			}
			else if (i > 6 && i < 9) {
				x = onimm.vars.x_coordinates[3] + (2.4*onimm.vars.radius_job)*Math.cos((i-9)*(2*Math.PI/12));
				onimm.vars.other_bonds_coordinates[0][i-1] = onimm.vars.x_coordinates[3];
			}
			else if (i > 9 && i < 12) {
				x = onimm.vars.x_coordinates[4] + (2.4*onimm.vars.radius_job)*Math.cos((i-12)*(2*Math.PI/12));
				onimm.vars.other_bonds_coordinates[0][i-1] = onimm.vars.x_coordinates[4];
			}
			else if (i > 12 && i < 15) {
				x = onimm.vars.x_coordinates[5] + (2.4*onimm.vars.radius_job)*Math.cos((i-15)*(2*Math.PI/12));
				onimm.vars.other_bonds_coordinates[0][i-1] = onimm.vars.x_coordinates[5];
			}
			else if (i > 15 && i < 18) {
				x = onimm.vars.x_coordinates[6] + (2.4*onimm.vars.radius_job)*Math.cos((i-18)*(2*Math.PI/12));
				onimm.vars.other_bonds_coordinates[0][i-1] = onimm.vars.x_coordinates[6];
			}
			else {
				x = 20000;
			}
			
		}
		if (7 == onimm.vars.totalNodes-1) {
			if (i < 4) {
				x = onimm.vars.x_coordinates[1] + (2.4*onimm.vars.radius_job)*Math.cos((i-3)*(2*Math.PI/10));
				onimm.vars.other_bonds_coordinates[0][i-1] = onimm.vars.x_coordinates[1];
			}
			else if (i > 3 && i < 6) {
				x = onimm.vars.x_coordinates[2] + (2.4*onimm.vars.radius_job)*Math.cos((i-5)*(2*Math.PI/12));
				onimm.vars.other_bonds_coordinates[0][i-1] = onimm.vars.x_coordinates[2];
			}
			else if (i > 6 && i < 9) {
				x = onimm.vars.x_coordinates[3] + (2.4*onimm.vars.radius_job)*Math.cos((i-8)*(2*Math.PI/12));
				onimm.vars.other_bonds_coordinates[0][i-1] = onimm.vars.x_coordinates[3];
			}
			else if (i > 9 && i < 12) {
				x = onimm.vars.x_coordinates[4] + (2.4*onimm.vars.radius_job)*Math.cos((i-9)*(2*Math.PI/12));
				onimm.vars.other_bonds_coordinates[0][i-1] = onimm.vars.x_coordinates[4];
			}
			else if (i > 12 && i < 15) {
				x = onimm.vars.x_coordinates[5] + (2.4*onimm.vars.radius_job)*Math.cos((i-14)*(2*Math.PI/12));
				onimm.vars.other_bonds_coordinates[0][i-1] = onimm.vars.x_coordinates[5];
			}
			else if (i > 15 && i < 18) {
				x = onimm.vars.x_coordinates[6] + (2.4*onimm.vars.radius_job)*Math.cos((i-18)*(2*Math.PI/12));
				onimm.vars.other_bonds_coordinates[0][i-1] = onimm.vars.x_coordinates[6];
			}
			else if (i > 18 && i < 21) {
				x = onimm.vars.x_coordinates[7] + (2.4*onimm.vars.radius_job)*Math.cos((i-21)*(2*Math.PI/12));
				onimm.vars.other_bonds_coordinates[0][i-1] = onimm.vars.x_coordinates[7];
			}
			else {
				x = 20000;
			}
		}
		if (8 == onimm.vars.totalNodes-1) {
			if (i < 4) {
				x = onimm.vars.x_coordinates[1] + (2.4*onimm.vars.radius_job)*Math.cos((i-3)*(2*Math.PI/10));
				onimm.vars.other_bonds_coordinates[0][i-1] = onimm.vars.x_coordinates[1];
			}
			else if (i > 3 && i < 6) {
				x = onimm.vars.x_coordinates[2] + (2.4*onimm.vars.radius_job)*Math.cos((i-5)*(2*Math.PI/12));
				onimm.vars.other_bonds_coordinates[0][i-1] = onimm.vars.x_coordinates[2];
			}
			else if (i > 6 && i < 9) {
				x = onimm.vars.x_coordinates[3] + (2.4*onimm.vars.radius_job)*Math.cos((i-8)*(2*Math.PI/12));
				onimm.vars.other_bonds_coordinates[0][i-1] = onimm.vars.x_coordinates[3];
			}
			else if (i > 9 && i < 12) {
				x = onimm.vars.x_coordinates[4] + (2.4*onimm.vars.radius_job)*Math.cos((i-10)*(2*Math.PI/12));
				onimm.vars.other_bonds_coordinates[0][i-1] = onimm.vars.x_coordinates[4];
			}
			else if (i > 12 && i < 15) {
				x = onimm.vars.x_coordinates[5] + (2.4*onimm.vars.radius_job)*Math.cos((i-15)*(2*Math.PI/12));
				onimm.vars.other_bonds_coordinates[0][i-1] = onimm.vars.x_coordinates[5];
			}
			else if (i > 15 && i < 18) {
				x = onimm.vars.x_coordinates[6] + (2.4*onimm.vars.radius_job)*Math.cos((i-18)*(2*Math.PI/12));
				onimm.vars.other_bonds_coordinates[0][i-1] = onimm.vars.x_coordinates[6];
			}
			else if (i > 18 && i < 21) {
				x = onimm.vars.x_coordinates[7] + (2.4*onimm.vars.radius_job)*Math.cos((i-21)*(2*Math.PI/12));
				onimm.vars.other_bonds_coordinates[0][i-1] = onimm.vars.x_coordinates[7];
			}
			else if (i > 21 && i < 24) {
				x = onimm.vars.x_coordinates[8] + (2.4*onimm.vars.radius_job)*Math.cos((i-24)*(2*Math.PI/12));
				onimm.vars.other_bonds_coordinates[0][i-1] = onimm.vars.x_coordinates[8];
			}
			else {
				x = 20000;
			}
		}
		if (9 == onimm.vars.totalNodes-1) {
			x = 20000;
		}
		
		return x;
	};
	onimm.y_coordinates_other_jobs = function(d,i) {
		var y;
		i++;

		if (1 == onimm.vars.totalNodes-1) {
			if (i < 4) {
				y = onimm.vars.y_coordinates[1] + (2.4*onimm.vars.radius_job)*Math.sin((i-3)*(2*Math.PI/10));
				onimm.vars.other_bonds_coordinates[1][i-1] = onimm.vars.y_coordinates[1];
			}
			else {
				y = 20000;
			}
		}
		if (2 == onimm.vars.totalNodes-1) {
			if (i < 4) {
				y = onimm.vars.y_coordinates[1] + (2.4*onimm.vars.radius_job)*Math.sin((i-3)*(2*Math.PI/10));
				onimm.vars.other_bonds_coordinates[1][i-1] = onimm.vars.y_coordinates[1];
			}
			else if (i > 3 && i < 6) {
				y = onimm.vars.y_coordinates[2] + (2.4*onimm.vars.radius_job)*Math.sin((i-6)*(2*Math.PI/12));
				onimm.vars.other_bonds_coordinates[1][i-1] = onimm.vars.y_coordinates[2];
			}
			else {
				y = 20000;
			}
		}
		if (3 == onimm.vars.totalNodes-1) {
			if (i < 4) {
				y = onimm.vars.y_coordinates[1] + (2.4*onimm.vars.radius_job)*Math.sin((i-3)*(2*Math.PI/10));
				onimm.vars.other_bonds_coordinates[1][i-1] = onimm.vars.y_coordinates[1];
			}
			else if (i > 3 && i < 6) {
				y = onimm.vars.y_coordinates[2] + (2.4*onimm.vars.radius_job)*Math.sin((i-6)*(2*Math.PI/12));
				onimm.vars.other_bonds_coordinates[1][i-1] = onimm.vars.y_coordinates[2];
			}
			else if (i > 6 && i < 9) {
				y = onimm.vars.y_coordinates[3] + (2.4*onimm.vars.radius_job)*Math.sin((i-9)*(2*Math.PI/12));
				onimm.vars.other_bonds_coordinates[1][i-1] = onimm.vars.y_coordinates[3];
			}
			else {
				y = 20000;
			}
		}
		if (4 == onimm.vars.totalNodes-1) {
			if (i < 4) {
				y = onimm.vars.y_coordinates[1] + (2.4*onimm.vars.radius_job)*Math.sin((i-3)*(2*Math.PI/10));
				onimm.vars.other_bonds_coordinates[1][i-1] = onimm.vars.y_coordinates[1];
			}
			else if (i > 3 && i < 6) {
				y = onimm.vars.y_coordinates[2] + (2.4*onimm.vars.radius_job)*Math.sin((i-6)*(2*Math.PI/12));
				onimm.vars.other_bonds_coordinates[1][i-1] = onimm.vars.y_coordinates[2];
			}
			else if (i > 6 && i < 9) {
				y = onimm.vars.y_coordinates[3] + (2.4*onimm.vars.radius_job)*Math.sin((i-9)*(2*Math.PI/12));
				onimm.vars.other_bonds_coordinates[1][i-1] = onimm.vars.y_coordinates[3];
			}
			else if (i > 9 && i < 12) {
				y = onimm.vars.y_coordinates[4] + (2.4*onimm.vars.radius_job)*Math.sin((i-12)*(2*Math.PI/12));
				onimm.vars.other_bonds_coordinates[1][i-1] = onimm.vars.y_coordinates[4];
			}
			else {
				y = 20000;
			}
			
		}
		if (5 == onimm.vars.totalNodes-1) {
			if (i < 4) {
				y = onimm.vars.y_coordinates[1] + (2.4*onimm.vars.radius_job)*Math.sin((i-3)*(2*Math.PI/10));
				onimm.vars.other_bonds_coordinates[1][i-1] = onimm.vars.y_coordinates[1];
			}
			else if (i > 3 && i < 6) {
				y = onimm.vars.y_coordinates[2] + (2.4*onimm.vars.radius_job)*Math.sin((i-6)*(2*Math.PI/12));
				onimm.vars.other_bonds_coordinates[1][i-1] = onimm.vars.y_coordinates[2];
			}
			else if (i > 6 && i < 9) {
				y = onimm.vars.y_coordinates[3] + (2.4*onimm.vars.radius_job)*Math.sin((i-8)*(2*Math.PI/14));
				onimm.vars.other_bonds_coordinates[1][i-1] = onimm.vars.y_coordinates[3];
			}
			else if (i > 9 && i < 12) {
				y = onimm.vars.y_coordinates[4] + (2.4*onimm.vars.radius_job)*Math.sin((i-12)*(2*Math.PI/12));
				onimm.vars.other_bonds_coordinates[1][i-1] = onimm.vars.y_coordinates[4];
			}
			else if (i > 12 && i < 15) {
				y = onimm.vars.y_coordinates[5] + (2.4*onimm.vars.radius_job)*Math.sin((i-15)*(2*Math.PI/12));
				onimm.vars.other_bonds_coordinates[1][i-1] = onimm.vars.y_coordinates[5];
			}
			else {
				y = 20000;
			}
			
		}
		if (6 == onimm.vars.totalNodes-1) {
			if (i < 4) {
				y = onimm.vars.y_coordinates[1] + (2.4*onimm.vars.radius_job)*Math.sin((i-3)*(2*Math.PI/10));
				onimm.vars.other_bonds_coordinates[1][i-1] = onimm.vars.y_coordinates[1];
			}
			else if (i > 3 && i < 6) {
				y = onimm.vars.y_coordinates[2] + (2.4*onimm.vars.radius_job)*Math.sin((i-6)*(2*Math.PI/12));
				onimm.vars.other_bonds_coordinates[1][i-1] = onimm.vars.y_coordinates[2];
			}
			else if (i > 6 && i < 9) {
				y = onimm.vars.y_coordinates[3] + (2.4*onimm.vars.radius_job)*Math.sin((i-9)*(2*Math.PI/12));
				onimm.vars.other_bonds_coordinates[1][i-1] = onimm.vars.y_coordinates[3];
			}
			else if (i > 9 && i < 12) {
				y = onimm.vars.y_coordinates[4] + (2.4*onimm.vars.radius_job)*Math.sin((i-12)*(2*Math.PI/12));
				onimm.vars.other_bonds_coordinates[1][i-1] = onimm.vars.y_coordinates[4];
			}
			else if (i > 12 && i < 15) {
				y = onimm.vars.y_coordinates[5] + (2.4*onimm.vars.radius_job)*Math.sin((i-15)*(2*Math.PI/12));
				onimm.vars.other_bonds_coordinates[1][i-1] = onimm.vars.y_coordinates[5];
			}
			else if (i > 15 && i < 18) {
				y = onimm.vars.y_coordinates[6] + (2.4*onimm.vars.radius_job)*Math.sin((i-18)*(2*Math.PI/12));
				onimm.vars.other_bonds_coordinates[1][i-1] = onimm.vars.y_coordinates[6];
			}
			else {
				y = 20000;
			}
			
		}
		if (7 == onimm.vars.totalNodes-1) {
			if (i < 4) {
				y = onimm.vars.y_coordinates[1] + (2.4*onimm.vars.radius_job)*Math.sin((i-3)*(2*Math.PI/10));
				onimm.vars.other_bonds_coordinates[1][i-1] = onimm.vars.y_coordinates[1];
			}
			else if (i > 3 && i < 7) {
				y = onimm.vars.y_coordinates[2] + (2.4*onimm.vars.radius_job)*Math.sin((i-5)*(2*Math.PI/12));
				onimm.vars.other_bonds_coordinates[1][i-1] = onimm.vars.y_coordinates[2];
			}
			else if (i > 6 && i < 10) {
				y = onimm.vars.y_coordinates[3] + (2.4*onimm.vars.radius_job)*Math.sin((i-8)*(2*Math.PI/12));
				onimm.vars.other_bonds_coordinates[1][i-1] = onimm.vars.y_coordinates[3];
			}
			else if (i > 9 && i < 13) {
				y = onimm.vars.y_coordinates[4] + (2.4*onimm.vars.radius_job)*Math.sin((i-9)*(2*Math.PI/12));
				onimm.vars.other_bonds_coordinates[1][i-1] = onimm.vars.y_coordinates[4];
			}
			else if (i > 12 && i < 15) {
				y = onimm.vars.y_coordinates[5] + (2.4*onimm.vars.radius_job)*Math.sin((i-14)*(2*Math.PI/12));
				onimm.vars.other_bonds_coordinates[1][i-1] = onimm.vars.y_coordinates[5];
			}
			else if (i > 14 && i < 17) {
				y = onimm.vars.y_coordinates[6] + (2.4*onimm.vars.radius_job)*Math.sin((i-17)*(2*Math.PI/12));
				onimm.vars.other_bonds_coordinates[1][i-1] = onimm.vars.y_coordinates[6];
			}
			else if (i > 16 && i < 19) {
				y = onimm.vars.y_coordinates[7] + (2.4*onimm.vars.radius_job)*Math.sin((i-19)*(2*Math.PI/12));
				onimm.vars.other_bonds_coordinates[1][i-1] = onimm.vars.y_coordinates[7];
			}
			else {
				y = 20000;
			}
		}
		if (8 == onimm.vars.totalNodes-1) {
			if (i < 4) {
				y = onimm.vars.y_coordinates[1] + (2.4*onimm.vars.radius_job)*Math.sin((i-3)*(2*Math.PI/10));
				onimm.vars.other_bonds_coordinates[1][i-1] = onimm.vars.y_coordinates[1];
			}
			else if (i > 3 && i < 7) {
				y = onimm.vars.y_coordinates[2] + (2.4*onimm.vars.radius_job)*Math.sin((i-5)*(2*Math.PI/12));
				onimm.vars.other_bonds_coordinates[1][i-1] = onimm.vars.y_coordinates[2];
			}
			else if (i > 6 && i < 10) {
				y = onimm.vars.y_coordinates[3] + (2.4*onimm.vars.radius_job)*Math.sin((i-8)*(2*Math.PI/12));
				onimm.vars.other_bonds_coordinates[1][i-1] = onimm.vars.y_coordinates[3];
			}
			else if (i > 9 && i < 13) {
				y = onimm.vars.y_coordinates[4] + (2.4*onimm.vars.radius_job)*Math.sin((i-10)*(2*Math.PI/12));
				onimm.vars.other_bonds_coordinates[1][i-1] = onimm.vars.y_coordinates[4];
			}
			else if (i > 12 && i < 15) {
				y = onimm.vars.y_coordinates[5] + (2.4*onimm.vars.radius_job)*Math.sin((i-15)*(2*Math.PI/12));
				onimm.vars.other_bonds_coordinates[1][i-1] = onimm.vars.y_coordinates[5];
			}
			else if (i > 14 && i < 17) {
				y = onimm.vars.y_coordinates[6] + (2.4*onimm.vars.radius_job)*Math.sin((i-17)*(2*Math.PI/12));
				onimm.vars.other_bonds_coordinates[1][i-1] = onimm.vars.y_coordinates[6];
			}
			else if (i > 16 && i < 19) {
				y = onimm.vars.y_coordinates[7] + (2.4*onimm.vars.radius_job)*Math.sin((i-19)*(2*Math.PI/12));
				onimm.vars.other_bonds_coordinates[1][i-1] = onimm.vars.y_coordinates[7];
			}
			else if (i > 19 && i < 22) {
				y = onimm.vars.y_coordinates[8] + (2.4*onimm.vars.radius_job)*Math.sin((i-22)*(2*Math.PI/12));
				onimm.vars.other_bonds_coordinates[1][i-1] = onimm.vars.y_coordinates[8];
			}
			else {
				y = 20000;
			}
		}
		if (9 == onimm.vars.totalNodes-1) {
			y = 20000;
		}

		return y;
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
					.attr("d", "M 0,0 "+onimm.vars.x_coordinates[a]+","+onimm.vars.y_coordinates[a]+"");
			}
			else {		
				onimm.bonds[a] = onimm.bond_container.append("path")
					.attr("class", function(d,i) {return "is-active-bond"})
					.attr("id", function(d,i) {return "bond_"+a})
					.attr("num", function(d,i) {return a})
					.attr("met_id", function(d,i) {return data[a].MET_ID["#text"]})
					.attr("fill", "none").attr("stroke-width", "5").attr("stroke", "none")
					.attr("d", "M 0,0 "+onimm.vars.x_coordinates[a]+","+onimm.vars.y_coordinates[a]+"")
				
				// For active node, we get the data
				onimm.vars.coordinated = data[a].Liens_metiers_supervise;
				onimm.vars.is_coordinated = data[a].Liens_metiers_est_supervise;
				onimm.vars.collaboration = data[a].Liens_metiers_collabore;

				// The circle must be a little bit larger
				d3.select(".jobs-circle").attr("r", onimm.vars.radius_job+10);
				onimm.jobs.attr("class", function(d,i) { 
					if (i==0) {
						return "is-active-jobs is-draggable jobs";
					}
					else return "is-draggable jobs";
				});
				
				d3.select(".bubble-foreignObject")
					.attr('width', function(d,i) {
						if (i==0) {
							return 2*onimm.vars.radius_job+20;
						}
					})
					.attr('height', function(d,i) {
						if (i==0) {
							return 2*onimm.vars.radius_job+20;
						}
					})
					.attr('x', function(d,i) {
						if (i==0) {
							return -onimm.vars.radius_job-10;
						}
					})
					.attr('y', function(d,i) {
						if (i==0) {
							return -onimm.vars.radius_job-10;
						}
					});
			}
		}

		for (var b = 0, le = onimm.vars.totalNodes; b<le; b++) {

			if (onimm.bonds[b].classed("is-active-bond", true)) {
				// Since the record in xml may be an array we have to test
				if (onimm.vars.coordinated.METIER.record != undefined) {
					if ($.isArray(onimm.vars.coordinated.METIER.record)) {
						for (var j = 0, l = onimm.vars.coordinated.METIER.record.length; j<l ; j++) {
							if (data[b].MET_ID["#text"] == onimm.vars.coordinated.METIER.record[j].MET_MET_ID['#text']) {
								onimm.bonds[b].attr("stroke", onimm.vars.coordination_color)
									//.attr("stroke-dasharray", "5,17")
									.attr("marker-end", "url(#coordination)");

								onimm.bonds[b].attr("class","is-active-bond bond coordination");
							}
						}
					}
					else {
						if (data[b].MET_ID["#text"] == onimm.vars.coordinated.METIER.record.MET_MET_ID['#text']) {
							onimm.bonds[b].attr("stroke", onimm.vars.coordination_color)
								//.attr("stroke-dasharray", "5,17")
								.attr("marker-end", "url(#coordination)");

							onimm.bonds[b].attr("class","is-active-bond bond coordination");
						}
					}
				}

				if (onimm.vars.is_coordinated.METIER.record != undefined) {
					if ($.isArray(onimm.vars.is_coordinated.METIER.record)) {
						for (var j = 0, l = onimm.vars.is_coordinated.METIER.record.length; j<l; j++) {
							if (data[b].MET_ID["#text"] == onimm.vars.is_coordinated.METIER.record[j].MET_MET_ID['#text']) {
								onimm.bonds[b].attr("stroke", onimm.vars.coordination_color)
									//.attr("stroke-dasharray", "5,17")
									.attr("marker-end", "url(#coordinated)");

								onimm.bonds[b].attr("class","is-active-bond bond coordinated");
							}
						}
					}
					else {
						if (data[b].MET_ID["#text"] == onimm.vars.is_coordinated.METIER.record.MET_MET_ID['#text']) {
							onimm.bonds[b].attr("stroke", onimm.vars.coordination_color)
								//.attr("stroke-dasharray", "5,17")
								.attr("marker-end", "url(#coordinated)");

							onimm.bonds[b].attr("class","is-active-bond bond coordinated");
						}
					}	
				}

				if (onimm.vars.collaboration.METIER.record != undefined) {
					if ($.isArray(onimm.vars.collaboration.METIER.record)) {
						for (var j = 0, l = onimm.vars.collaboration.METIER.record.length; j<l; j++) {
							if (data[b].MET_ID["#text"] == onimm.vars.collaboration.METIER.record[j].MET_MET_ID['#text']) {
								onimm.bonds[b].attr("stroke", onimm.vars.collaboration_color)
								//.attr("stroke-dasharray", "5,17");
								
								onimm.bonds[b].attr("class","is-active-bond bond collaboration");
							}
						}
					}
					else {
						if (data[b].MET_ID["#text"] == onimm.vars.collaboration.METIER.record.MET_MET_ID['#text']) {
							onimm.bonds[b].attr("stroke", onimm.vars.collaboration_color)
							//.attr("stroke-dasharray", "5,17");
							
							onimm.bonds[b].attr("class","is-active-bond bond collaboration");
						}
					}
				}
			}// end if isActive
		}// end for
	};

	/**
	 * Changing to other node
	 * @param  d3.selection d the previous clicked node
	 * @param  integer i the number of the element
	 * @param  big json data onimm.vars.data from xml
	 */
	onimm.move_to_node = function(e,j,data) {
		if (j != 0 ) {

			//onimm.jobs.on("click", function(d,i) {});

			var node_hist = {
				name : e.CSLABELFLD["#text"],
				met_id : e.MET_ID["#text"],
				met_domaine : e.MET_DOMAINE["#text"],
				stroke_color :  onimm.init_color_node(e),
				stroke_colors : onimm.vars.stroke_color,
				x : 0.025*onimm.vars.width,
				y : 0.0333*onimm.vars.height + 30*onimm.vars.historic.length
			};

			onimm.vars.historic.push(node_hist);

			d3.selectAll(".bonds-container").transition().duration(200)
				.style("opacity", 0);

			d3.selectAll(".jobs").transition().duration(750)
				.attr("transform", function(d,i) {
					return "translate("+onimm.vars.x_coordinates[i]+","+onimm.vars.y_coordinates[i]+")";
				});

			d3.select(".other-jobs-container").transition().duration(200)
				.style("opacity", 0);
			d3.select(".other-bonds-container").transition().duration(200)
				.style("opacity", 0);

			// Change node with historic
			$(".onimm-svg").fadeOut(600, function() {
				$(".onimm-svg").remove();
				Onimm("onimm", e.MET_ID["#text"], "./data/carte_heuristique.xml", onimm.vars.historic);
			});
		}
	};

	onimm.other_jobs = function() {

		onimm.vars.other_bonds_coordinates[0] = [];
		onimm.vars.other_bonds_coordinates[1] = [];
		onimm.vars.other_bonds_coordinates[2] = onimm.vars.x_other_coordinates;
		onimm.vars.other_bonds_coordinates[3] = onimm.vars.y_other_coordinates;

		onimm.vars.other_jobs[0] = []; //index
		onimm.vars.other_jobs[1] = []; //jobs associated with index

		// TODO : Pour les jobs de seconds niveaux, les affichés s'ils sont reliés à un des jobs de premiers niveaux (et pas déjà présent, tout en évitant les doublons)
		// Le tri est fait, onimm.vars.other_jobs contient les métiers de seconds niveaux à afficher
		// Reste à faire le positionnement, voir onimm.x_coordinates_other_jobs et son pendant y.
		// For each jobs first level (about 1 to 8 jobs)
		for (var i = 1, le = onimm.vars.used_data.length; i<le ; i++) {

			// For each jobs second level
			for (var k = 0, m = onimm.vars.unused_data.length ; k<m; k++) {

				// We look in each jobs first level if there is/are Jobs relation (here is coordination) : 
				if (onimm.vars.used_data[i].Liens_metiers_supervise.METIER.hasOwnProperty("record")) {

					// then a test if record is array or not
					if ($.isArray(onimm.vars.used_data[i].Liens_metiers_supervise.METIER.record)) {

						// if record is an array, we loop through it
						for (var j = 0, l = onimm.vars.used_data[i].Liens_metiers_supervise.METIER.record.length; j<l ; j++) {
			
							// If a job matches, we add it and we save also 
							if (onimm.vars.unused_data[k].MET_ID["#text"] == onimm.vars.used_data[i].Liens_metiers_supervise.METIER.record[j].MET_MET_ID['#text']) {
								onimm.vars.other_jobs[1].push(onimm.vars.unused_data[k]);
								onimm.vars.other_jobs[0].push(onimm.vars.used_data[i].MET_ID["#text"]);
							}
						}
					}
					else {
						if (onimm.vars.unused_data[k].MET_ID["#text"] == onimm.vars.used_data[i].Liens_metiers_supervise.METIER.record.MET_MET_ID['#text']) {
							onimm.vars.other_jobs[1].push(onimm.vars.unused_data[k]);
							onimm.vars.other_jobs[0].push(onimm.vars.used_data[i].MET_ID["#text"]);
						}
					}
				}

				if (onimm.vars.used_data[i].Liens_metiers_est_supervise.METIER.hasOwnProperty("record")) {
					if ($.isArray(onimm.vars.used_data[i].Liens_metiers_est_supervise.METIER.record)) {
						for (var j = 0, l = onimm.vars.used_data[i].Liens_metiers_est_supervise.METIER.record.length; j<l; j++) {
							if (onimm.vars.unused_data[k].MET_ID["#text"] == onimm.vars.used_data[i].Liens_metiers_est_supervise.METIER.record[j].MET_MET_ID['#text']) {
								onimm.vars.other_jobs[1].push(onimm.vars.unused_data[k]);
								onimm.vars.other_jobs[0].push(onimm.vars.used_data[i].MET_ID["#text"]);
							}
						}
					}
					else {
						if (onimm.vars.unused_data[k].MET_ID["#text"] == onimm.vars.used_data[i].Liens_metiers_est_supervise.METIER.record.MET_MET_ID['#text']) {
							onimm.vars.other_jobs[1].push(onimm.vars.unused_data[k]);
							onimm.vars.other_jobs[0].push(onimm.vars.used_data[i].MET_ID["#text"]);
						}
					}	
				}


				if (onimm.vars.used_data[i].Liens_metiers_collabore.METIER.hasOwnProperty("record")) {
					if ($.isArray(onimm.vars.used_data[i].Liens_metiers_collabore.METIER.record)) {
						for (var j = 0, l = onimm.vars.used_data[i].Liens_metiers_collabore.METIER.record.length; j<l; j++) {
							if (onimm.vars.used_data[i].MET_ID['#text'] == onimm.vars.used_data[i].Liens_metiers_collabore.METIER.record[j].MET_MET_ID['#text']) {
								onimm.vars.other_jobs[1].push(onimm.vars.unused_data[k]);
								onimm.vars.other_jobs[0].push(onimm.vars.used_data[i].MET_ID["#text"]);
							}
						}
					}
					else {
						if (onimm.vars.unused_data[k].MET_ID["#text"] == onimm.vars.used_data[i].Liens_metiers_collabore.METIER.record.MET_MET_ID['#text']) {
							onimm.vars.other_jobs[1].push(onimm.vars.unused_data[k]);
							onimm.vars.other_jobs[0].push(onimm.vars.used_data[i].MET_ID["#text"]);
						}
					}
				}
			}
		}

		// onimm.vars.other_jobs contains the second level jobs
		//console.dir(onimm.vars.other_jobs[1]);

		onimm.container_other_jobs = onimm.svg.append("svg:g")
			.attr("class", "other-jobs-container")
			.attr("transform", "translate(" + onimm.vars.half_width + "," + onimm.vars.half_height + ")");

		onimm.other_jobs = onimm.container_other_jobs.selectAll(".other-jobs")
			.data(onimm.vars.other_jobs[1]);

		onimm.other_jobs = onimm.other_jobs.enter().append("svg:g")
			.classed("other-jobs", function(d) {return d;})
			.attr("other_jobs", function(d,i) {return i;});


		// TODO other_jobs
		// Go to onimm.new_init_x_coordinates_other_jobs
		// and then replace onimm.x_coordinates_other_jobs(d,i) with the new
		// Do it also for y, fot text_other_jobs below
		// 
		onimm.circle_other_jobs = onimm.other_jobs.append("svg:circle")
			.attr("class", "other-jobs-circle")
			.attr("r", onimm.vars.radius_other_job)
			.attr("cx", function(d,i) {
				onimm.vars.x_other_coordinates.push(onimm.x_coordinates_other_jobs(d,i));
				return onimm.x_coordinates_other_jobs(d,i);
			})
			.attr("cy", function(d,i) {
				onimm.vars.y_other_coordinates.push(onimm.y_coordinates_other_jobs(d,i));
				return onimm.y_coordinates_other_jobs(d,i);
			})
			.style("stroke", function(d,i) {
				return "rgba(0,0,0,0.6)";
			});

		onimm.circle_other_jobs.selectAll('.other-jobs-circle')
			.data(onimm.vars.other_jobs[1]);

			onimm.text_other_jobs = onimm.other_jobs.append("svg:foreignObject").data(onimm.vars.other_jobs[1]);
			onimm.text_other_jobs
				.attr("class", "other-jobs-text-foreignObject")
				.attr("width", 0.25*onimm.vars.width)
				//.attr("height", 0.13333*onimm.vars.height)
				.attr("x", function(d,i) {
					return onimm.x_coordinates_other_jobs(d,i) + 15;
				})
				.attr("y", function(d,i) {
					return onimm.y_coordinates_other_jobs(d,i) - 18 ;
				})
				.append("xhtml:body").attr("class", "other-jobs-text-body")
					.html(function(d,i) {
						return "<p class='other-jobs-text'>"+d.CSLABELFLD["#text"]+"</p>";
					});

			// Set jobs-text-foreignObject height to be what we need, not more nor less
			var other_jobs_text_height = [];
			$(".other-jobs-text").each(function(index, element) {
				other_jobs_text_height.push(1.75*$(element).outerHeight());
			});
			d3.selectAll(".other-jobs-text-foreignObject").attr("height", function(d,i) {
				return other_jobs_text_height[i];
			});

			onimm.other_jobs.on("click", function(d,i) {
				onimm.move_to_node(d,i,onimm.vars.unused_data);
			});

		$('.other-jobs-container').insertBefore('.bonds-container');
	};

	onimm.init_other_bonds = function() {

		onimm.container_other_bonds = onimm.svg.append("svg:g")
			.attr("class", "other-bonds-container")
			.attr("transform", "translate(" + onimm.vars.half_width + "," + onimm.vars.half_height + ")");

		for (var a = 0, l = onimm.vars.x_other_coordinates.length; a<l; a++) {

			if (onimm.vars.other_bonds_coordinates[0][a] != undefined && onimm.vars.other_bonds_coordinates[1][a] != undefined) {
				onimm.container_other_bonds.append("path")
					.attr("class", function(d,i) {return "other-bond"})
					.attr("id", function(d,i) {return "other-bond-"+a})
					.attr("num", function(d,i) {return a})
					.attr("stroke-width", "1").attr("stroke", onimm.vars.coordination_color)
					.attr("d", "M "+onimm.vars.other_bonds_coordinates[0][a]+","+onimm.vars.other_bonds_coordinates[1][a]+" "+onimm.vars.x_other_coordinates[a]+","+onimm.vars.y_other_coordinates[a]+"");
			}
		}

		$('.other-bonds-container').insertBefore('.other-jobs-container');
	};

	onimm.resize = function() {
		
		d3.select(".onimm-svg").attr("width", $(window).width()).attr("height", $(window).height());

		//d3.select(".onimm-svg").attr("transform", "scale("+ 0.5*$(window).width()/$(window).height()  +")");
		
		onimm.container.attr("transform", "scale(0.9) translate(" + 0.5*$(window).width() + "," + 0.5*$(window).height() + ")");
		onimm.container_other_jobs.attr("transform", "scale(0.9) translate(" + 0.5*$(window).width() + "," + 0.5*$(window).height() + ")");
		onimm.container_other_bonds.attr("transform", "scale(0.9) translate(" + 0.5*$(window).width() + "," + 0.5*$(window).height() + ")");
		onimm.bond_container.attr("transform", "scale(0.9) translate(" + 0.5*$(window).width() + "," + 0.5*$(window).height() + ")");

		onimm.container_legend.attr("transform", "scale(0.9) translate(" + 0.045*$(window).width() + "," + 0*$(window).height() + ")");

	};

	onimm.handle_orientation = function(event) {

		// Basic BUT cross-browser test for knowing if we are displaying Landscape/Portrait mode
		var screen_orientation = ($(window).width() > $(window).height())? 90 : 0;

		switch(screen_orientation) {
			case 90: // Landscape (from Portrait to Landscape)

				$(".onimm-container").css("transform", "rotate(0deg)");

				onimm.vars.height = $(window).height();
				onimm.vars.width = $(window).width();

				onimm.vars.half_width = 0.5*onimm.vars.width;
				onimm.vars.half_height = 0.5*onimm.vars.height;

				onimm.svg.attr("width", onimm.vars.width).attr("height", onimm.vars.height);

				onimm.container_legend.attr("transform", "scale(0.9) translate(" + 0.045*$(window).width() + "," + -0.2*$(window).height() + ")");
				onimm.container.attr("transform", "scale(0.9) translate(" + 0.5*$(window).width() + "," + 0.5*$(window).height() + ")");
				onimm.container_other_jobs.attr("transform", "scale(0.9) translate(" + 0.5*$(window).width() + "," + 0.5*$(window).height() + ")");
				onimm.container_other_bonds.attr("transform", "scale(0.9) translate(" + 0.5*$(window).width() + "," + 0.5*$(window).height() + ")");
				onimm.bond_container.attr("transform", "scale(0.9) translate(" + 0.5*$(window).width() + "," + 0.5*$(window).height() + ")");

				break;

			case 0: // Portrait (from Landscape to Portrait)

				$(".onimm-container").css("transform", "rotate(90deg)");

				onimm.vars.height = $(window).width();
				onimm.vars.width = $(window).height();

				onimm.vars.half_width = 0.5*onimm.vars.width;
				onimm.vars.half_height = 0.5*onimm.vars.height;

				onimm.svg.attr("width", onimm.vars.width).attr("height", onimm.vars.height);

				onimm.container_legend.attr("transform", "scale(0.8) translate(" + 0.045*$(window).width() + "," + 0.25*$(window).height() + ")");
				onimm.container.attr("transform", "scale(0.9) translate(" + 0.5*$(window).width() + "," + 0.5*$(window).height() + ")");
				onimm.container_other_jobs.attr("transform", "scale(0.9) translate(" + 0.5*$(window).width() + "," + 0.5*$(window).height() + ")");
				onimm.container_other_bonds.attr("transform", "scale(0.9) translate(" + 0.5*$(window).width() + "," + 0.5*$(window).height() + ")");
				onimm.bond_container.attr("transform", "scale(0.9) translate(" + 0.5*$(window).width() + "," + 0.5*$(window).height() + ")");


				break;

			default:
				break;
		}

	};

	onimm.init_orientation = function(event) {

		// Basic BUT cross-browser test for knowing if we are displaying Landscape/Portrait mode
		var screen_orientation = ($(window).width() > $(window).height())? 90 : 0;

		switch(screen_orientation) {
			case 90: // Landscape

				break;
			case 0: // Portrait
				
				$(".onimm-container").css("transform", "rotate(90deg)");
				var temp;
				temp = onimm.vars.width;
				onimm.vars.width = onimm.vars.height;
				onimm.vars.height = temp;

				onimm.vars.half_width = 0.5*onimm.vars.width;
				onimm.vars.half_height = 0.5*onimm.vars.height;

				onimm.svg.attr("width", onimm.vars.width).attr("height", onimm.vars.height);

				d3.selectAll(".jobs-circle")
					.attr("cx", function(d,i) {
						return 0.7*onimm.vars.x_coordinates[i];
					})
					.attr("cy" , function(d,i) {
						return 0.7*onimm.vars.y_coordinates[i];
					});

				d3.selectAll(".bubble-foreignObject")
					.attr("x", function(d,i) {
						if(i==0) {
							return 0.7*onimm.vars.y_coordinates[i] -0.85*onimm.vars.radius_info_job;
						}
						else {
							return 0.7*onimm.vars.x_coordinates[i] - 1*onimm.vars.radius_job;
						}
					})
					.attr("y" , function(d,i) {
						if(i==0) {
							return 0.7*onimm.vars.y_coordinates[i] - 0.85*onimm.vars.radius_info_job;
						}
						else {
							return 0.7*onimm.vars.y_coordinates[i] - 1*onimm.vars.radius_job;
						}
					});

				d3.selectAll(".jobs-text-foreignObject")
					.attr("x", function(d,i) {
						return 0.7*onimm.vars.x_coordinates[i] -3*onimm.vars.radius_job;
					})
					.attr("y" , function(d,i) {
						return 0.7*onimm.vars.y_coordinates[i] +1.5*onimm.vars.radius_job;
					});


				d3.selectAll(".bond")
					.attr("d", function(d,i) {
						return "M 0,0 "+0.7*onimm.vars.x_coordinates[i+1]+","+0.7*onimm.vars.y_coordinates[i+1]+" ";
					});

				d3.selectAll(".other-jobs-circle")
					.attr("cx", function(d,i) {
						return 0.7*onimm.vars.other_bonds_coordinates[2][i];
					})
					.attr("cy", function(d,i) {
						return 0.7*onimm.vars.other_bonds_coordinates[3][i];
					});

				d3.selectAll(".other-jobs-text-foreignObject")
					.attr("x", function(d,i) {
						return 0.7*onimm.vars.other_bonds_coordinates[2][i] + 15;
					})
					.attr("y", function(d,i) {
						return 0.7*onimm.vars.other_bonds_coordinates[3][i] - 8;
					});


				d3.selectAll(".other-bond")
					.attr("d", function(d,i) {

						if (undefined != onimm.vars.other_bonds_coordinates[0][i]) {
							//console.log(i +"   " +onimm.vars.other_bonds_coordinates[0][i]);
							return "M "+0.7*onimm.vars.other_bonds_coordinates[0][i]+","+0.7*onimm.vars.other_bonds_coordinates[1][i]+" "+0.7*onimm.vars.other_bonds_coordinates[2][i]+","+0.7*onimm.vars.other_bonds_coordinates[3][i]+"";
						}
						else if (undefined != onimm.vars.other_bonds_coordinates[0][i+1]) {
							//console.log(i +"   " +onimm.vars.other_bonds_coordinates[0][i+1]);
							return "M "+0.7*onimm.vars.other_bonds_coordinates[0][i+1]+","+0.7*onimm.vars.other_bonds_coordinates[1][i+1]+" "+0.7*onimm.vars.other_bonds_coordinates[2][i+1]+","+0.7*onimm.vars.other_bonds_coordinates[3][i+1]+"";
						}
						else if (undefined != onimm.vars.other_bonds_coordinates[0][i+2]) {
							//console.log(i +"   " +onimm.vars.other_bonds_coordinates[0][i+2]);
							return "M "+0.7*onimm.vars.other_bonds_coordinates[0][i+2]+","+0.7*onimm.vars.other_bonds_coordinates[1][i+2]+" "+0.7*onimm.vars.other_bonds_coordinates[2][i+2]+","+0.7*onimm.vars.other_bonds_coordinates[3][i+2]+"";
						}
						
					});

				break;

			default:
			break;
		}

	};

	// create foreignObject easily
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

	// create img easily for svg foreignObject
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
