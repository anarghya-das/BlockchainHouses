App = {
	web3Provider: null,
	contracts: {},

	init: async function() {
		// Load houses.
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
		$.getJSON('Owners.json', function(data) {
			// Get the necessary contract artifact file and instantiate it with truffle-contract
			var AdoptionArtifact = data;
			App.contracts.Owners = TruffleContract(AdoptionArtifact);

			// Set the provider for our contract
			App.contracts.Owners.setProvider(App.web3Provider);

			// Use our contract to retrieve and mark the adopted pets
			return App.markAdopted();
		});

		return App.bindEvents();
	},

	bindEvents: function() {
		$(document).on('click', '.btn-view', App.handleView);
		$(document).on('click', '.btn-buy', App.handleBuy);
	},

	markAdopted: function(adopters, account) {
		var adoptionInstance;

		App.contracts.Owners
			.deployed()
			.then(function(instance) {
				adoptionInstance = instance;

				return adoptionInstance.getAdopters.call();
			})
			.then(function(adopters) {
				for (i = 0; i < adopters.length; i++) {
					if (adopters[i] !== '0x0000000000000000000000000000000000000000') {
						$('.panel-pet').eq(i).find('button').text('Sold').attr('disabled', true);
					}
				}
			})
			.catch(function(err) {
				console.log(err.message);
			});
	},

	handleView: function(event) {
		event.preventDefault();
		$.getJSON('../data.json', function(data) {
			var housesRow = $('#housesRow');
			for (i = 0; i < data.length; i++) {
				housesRow.find('.current-owner').text('Owner: ' + data[i]['title_dataset'][0].seller);
				housesRow.find('.prospective-buyer').text('Buyer : ' + data[i]['title_dataset'][0].buyer);
				housesRow.find('.date').text('Date: ' + data[i]['title_dataset'][0].date);
				housesRow
					.find('.transcation-type')
					.text('Transaction Type: ' + data[i]['title_dataset'][0].transaction_type);
				housesRow.find('.price').text('Price: $' + data[i]['title_dataset'][0].price);
				housesRow.find('.house-info').show();
			}
		});
	},

	handleBuy: function(event) {
		event.preventDefault();
		var petId = parseInt($(event.target).data('id'));
		var adoptionInstance;
		// var name = prompt('Enter your name');
		// alert(name + ' you can buy this house!');
		web3.eth.getAccounts(function(error, accounts) {
			if (error) {
				console.log(error);
			}

			var account = accounts[0];

			App.contracts.Owners
				.deployed()
				.then(function(instance) {
					adoptionInstance = instance;

					// Execute adopt as a transaction by sending account
					return adoptionInstance.adopt(petId, { from: account });
				})
				.then(function(result) {
					return App.markAdopted();
				})
				.catch(function(err) {
					console.log(err.message);
				});
		});
	}
};

$(function() {
	$(window).load(function() {
		App.init();
	});
});
