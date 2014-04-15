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
		width : 640,
		height : 400,
		background_color : "#eee",
		stroke_color : "#111"
	};

	/**
	 * Init all the script
	 */
	onimm.init = function() {

		// Load our resources
		d3.json(data_uri, function(error, json) {

			// DEBUG
			if (error) return console.warn(error);

			// TODO : Parse, prepare the data in Array for D3
			onimm.settings.data = json;

			// For testing
			var tempData = ['1', '2', '3', '4', '5', '6', '7'];

			// TODO : isolate these instructions in appropriate function for a clean code
			onimm.svgContainer = d3.select(onimm.settings.id).append("svg:svg")
					.attr("width", onimm.settings.width)
					.attr("height", onimm.settings.height)
					.style("border", "1px solid black")
					.attr("id", id + "svg_");

			onimm.job_update = onimm.svgContainer.selectAll("circle").data(tempData);
			onimm.job_enter = onimm.svgContainer.selectAll("circle").data(tempData).enter().append("svg:circle");
			onimm.job_exit = onimm.svgContainer.selectAll("circle").data(tempData).exit().append("svg:circle");

			onimm.circle_attributes = onimm.job_update
				.attr("cx", 50)
				.attr("cy", 50)
				.attr("r", 15)
				.style("fill", "#aef221");

			onimm.job_enter_attributes = onimm.job_enter
				.attr("cx", function(d) {return d*40;})
				.attr("cy", function(d) {return d*45;})
				.attr("r", 20)
				.style("fill", "#ff400d");

			onimm.job_exit_attributes = onimm.job_exit
				.attr("cx", 50)
				.attr("cy", 50)
				.attr("r", 15)
				.style("fill", "#34bc51");

			// updating nodes with data
			onimm.job_update.text(
				function(d,i) {
					return d;
				});

			// adding nodes for new data
			onimm.job_enter.append("p")
					.attr("class", "datas")
					.text(
						function(d,i) {
							return d;
						});

			// instruction for nodes removed
			// onimm.exit

		}); // End d3.json(uri,function)
	};

	// Let it go, let it go !
	onimm.init();

	return onimm;
};

// Let it go !
onimm = Onimm("#onimm_", "http://www.jeremy-ta.fr/work/onisep/d3/data/test2.json");

// DEBUG
//console.dir(onimm);

