var bought = false;
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
				houseTemplate.find('.btn-buy').attr('data-id', data[i].id);
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
			var OwnerArtifact = data;
			App.contracts.Owners = TruffleContract(OwnerArtifact);

			// Set the provider for our contract
			App.contracts.Owners.setProvider(App.web3Provider);

			// Use our contract to retrieve and mark the adopted pets
			return App.markSold();
		});

		return App.bindEvents();
	},

	bindEvents: function() {
		$(document).on('click', '.btn-view', App.handleView);
		$(document).on('click', '.btn-buy', App.handleBuy);
	},

	markSold: function(buyers, account) {
		var ownersInstance;

		App.contracts.Owners
			.deployed()
			.then(function(instance) {
				ownersInstance = instance;
				return ownersInstance.getBuyers.call();
			})
			.then(function(buyers) {
				$.getJSON('../data.json', function(data) {
					var housesRow = $('#housesRow');
					for (i = 0; i < buyers.length; i++) {
						if (buyers[i] !== '0x0000000000000000000000000000000000000000') {
							var c = $('.panel-pet').eq(i).find('button')[1];
							c.innerText = 'Sold!';
							c.disabled = true;
							bought = true;
						}
					}
				});
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
				if (bought) {
					housesRow.find('.current-owner').text('Owner: ' + data[i]['title_dataset'][0].buyer);
					housesRow.find('.prospective-buyer').text('Buyer : None');
				} else {
					housesRow.find('.current-owner').text('Owner: ' + data[i]['title_dataset'][0].seller);
					housesRow.find('.prospective-buyer').text('Buyer : ' + data[i]['title_dataset'][0].buyer);
				}
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
		var c = $(event.target);
		var cd = c.data('id');
		var houseId = parseInt(cd);
		var ownersInstance;
		web3.eth.getAccounts(function(error, accounts) {
			if (error) {
				console.log(error);
			}

			var account = accounts[0];

			App.contracts.Owners
				.deployed()
				.then(function(instance) {
					ownersInstance = instance;

					// adding house to bought blockchain
					return ownersInstance.addHouse(houseId, { from: account });
				})
				.then(function(result) {
					return App.markSold();
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
