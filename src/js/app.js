App = {
	web3Provider: null,
	contracts: {},

	init: async function() {
		// Load pets.
		$.getJSON('../data.json', function(data) {
			var housesRow = $('#housesRow');
			var houseTemplate = $('#houseTemplate');

			for (i = 0; i < data.length; i++) {
				houseTemplate.find('.panel-title').text(data[i].streetname);
				houseTemplate.find('img').attr('src', data[i].image);
				housesRow.append(houseTemplate.html());
			}
		});

		return await App.initWeb3();
	},

	initWeb3: async function() {
		// Modern dapp browsers...
		if (window.ethereum) {
			App.web3Provider = window.ethereum;
			try {
				// Request account access
				await window.ethereum.enable();
			} catch (error) {
				// User denied account access...
				console.error('User denied account access');
			}
		} else if (window.web3) {
			// Legacy dapp browsers...
			App.web3Provider = window.web3.currentProvider;
		} else {
			// If no injected web3 instance is detected, fall back to Ganache
			App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
		}
		web3 = new Web3(App.web3Provider);

		return App.initContract();
	},

	initContract: function() {
		$.getJSON('Adoption.json', function(data) {
			// Get the necessary contract artifact file and instantiate it with truffle-contract
			var AdoptionArtifact = data;
			App.contracts.Adoption = TruffleContract(AdoptionArtifact);

			// Set the provider for our contract
			App.contracts.Adoption.setProvider(App.web3Provider);

			// Use our contract to retrieve and mark the adopted pets
			return App.markAdopted();
		});

		return App.bindEvents();
	},

	bindEvents: function() {
		$(document).on('click', '.btn-adopt', App.handleAdopt);
	}
};

$(function() {
	$(window).load(function() {
		App.init();
	});
});
