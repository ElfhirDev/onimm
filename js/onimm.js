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
		width : 1280,
		height : 720,
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
			onimm.svg = d3.select(onimm.settings.id).append("svg:svg")
					.attr("width", onimm.settings.width)
					.attr("height", onimm.settings.height)
					.attr("id", id + "svg_")
				.append("circle")
					.attr("cx", 25)
					.attr("cy", 25)
					.attr("r", 25)
					.style("fill", "purple");


			d3.select("body").selectAll("p")
				.data(tempData)
					// updating nodes already existing
					.text(function(d) {return d;})
					// adding nodes for new data
					.enter()
					.append("p")
					.attr("class", "datas")
					.text(function(d) {return d;})
					

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

