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
		data : {},
		background_color : "#eee",
		stroke_color : "#111"
	};

	/**
	 * Init all the script
	 */
	onimm.init = function() {
		onimm.data_setup(onimm.settings.data_uri);
	
	};

	/**
	 * Get the data from json or xml,
	 * and eventually do the conversion.
	 */
	onimm.data_setup = function(data_uri) {
		d3.json(data_uri, function() {
			onimm.display_setup();
		});
	};

	/**
	 * Setup svg, layout, depending on initial
	 * data setup by data_setup
	 */
	onimm.display_setup = function(data) {
		onimm.svg = d3.select(onimm.settings.id).append("svg:svg")
		.attr("width", 1280)
		.attr("height", 720);
	};

	return onimm;
};

// Let it go !
onimm = Onimm("#onimm_", "./data/test2.json");

// DEBUG
console.dir(onimm);
console.dir(onimm.settings)

