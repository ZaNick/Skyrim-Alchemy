var app = angular.module('Alchemy', ['ngMaterial']);

app.controller('ctrl', ['$scope', '$http', function ($scope, $http) {
	$scope.I1 = null;
	$scope.I2 = null;
	$scope.I3 = null;

	$scope.L1 = null;
	$scope.L2 = null;
	$scope.L3 = null;
	
	$scope.effectsNumber = 1;
	
	$scope.potionsList = [];
	$scope.currMix = [];


	$http.get("ingredients.json").then(function (res) {
		$scope.ingredients = res.data;

		$scope.allCombinations = $scope.combinations($scope.ingredients, 2); // список всех возможных комбинаций ингредиентов (удачных и неудачных)
		$scope.allCombinations = $scope.allCombinations.concat(
			$scope.combinations($scope.ingredients, 3)
		); // список всех возможных комбинаций ингредиентов (удачных и неудачных)
		$scope.separate(); // удаляем ненужные зелья

		$scope.L1 = $scope.getListOfIngredients();
		console.log($scope.L1);
	});

	$scope.pickFirst = function() {
		console.log('pick 1');
		$scope.I2 = null;
		$scope.I3 = null;
		
		$scope.L2 = $scope.getListOfIngredients();
		$scope.L3 = null;

		$scope.currMix = [];
	}
	$scope.pickSecond = function() {
		console.log('pick 2');
		$scope.I3 = null;
		$scope.L3 = $scope.getListOfIngredients();
		
		$scope.currMix = $scope.mix($scope.I1, $scope.I2);
	}
	$scope.pickThird = function() {
		console.log('pick 3');
		$scope.currMix = $scope.mix($scope.I1, $scope.I2, $scope.I3);
	}
	$scope.querySearch = function (query, arr) {
		var results = query ? arr.filter( $scope.createFilterFor(query) ) : arr;
		results.sort(function(a, b){
			var x = a.name.toLowerCase();
			var y = b.name.toLowerCase();
			if (x < y) {return -1;}
			if (x > y) {return 1;}
			return 0;
		});
		return results;
	}
	$scope.createFilterFor = function(query) {
		return function filterFn(ingredient) {
			return (ingredient.name.toLowerCase().indexOf(query.toLowerCase()) !== -1);
		};
	}

	$scope.match = function(eff) {
		if(this.currMix.length > 0 && this.currMix.includes(eff)) {
			return 'match';
		}
	}
	$scope.clearTable = function() {
		$scope.I1 = null;
		$scope.I2 = null;
		$scope.I3 = null;
		$scope.L1 = $scope.getListOfIngredients();
		$scope.L2 = [];
		$scope.L3 = [];
	}

	$scope.getListOfIngredients = function() {
		let potions = [];
		let IngrIdsList = [];
		let ingredientList = [];

		if($scope.I1 == null) {
			potions = $scope.potionsList;
		} else if($scope.I2 == null) {
			potions = $scope.findPotion([$scope.I1.id]);
		} else if($scope.I3 == null) {
			potions = $scope.findPotion([$scope.I1.id, $scope.I2.id]);
		}
		console.log(potions);

		potions.forEach((potion) => {
			potion.ingredients.forEach((ingr) => {
				if($scope.I1 == null) {
					if(
						!IngrIdsList.includes(ingr) &&
						potion.effects >= $scope.effectsNumber
					) {
						IngrIdsList.push(ingr);
					}
				} else if($scope.I2 == null) {
					if(
						!IngrIdsList.includes(ingr) &&
						ingr != $scope.I1.id &&
						potion.effects >= $scope.effectsNumber &&
						$scope.canBeCombined([$scope.I1.id, ingr])
					) {
						IngrIdsList.push(ingr);
					}
				} else if($scope.I3 == null) {
					if(
						!IngrIdsList.includes(ingr) &&
						ingr != $scope.I1.id &&
						ingr != $scope.I2.id &&
						potion.effects >= $scope.effectsNumber &&
						$scope.canBeCombined([$scope.I1.id, ingr])
					) {
						IngrIdsList.push(ingr);
					}
				}
			});
		});
		
		for (const ingr of $scope.ingredients) {
			if(IngrIdsList.indexOf(ingr.id) !== -1) {
				ingredientList.push(ingr);
			}
		}
		return ingredientList;
	};
	
	$scope.findPotion = function(ids) {
		return $scope.potionsList.filter(function(potion) {
			return ids.every((val) => potion.ingredients.includes(val));
		});
	}
	$scope.canBeCombined = function(ids) {
		var found = $scope.ingredients.filter(function(ingr) {
			return ingr.id == ids[0] || ingr.id == ids[1];
		});
		if($scope.mix(found[0], found[1]).length)
			return true;
		else
			return false;
	}

	$scope.combinations = function (arr, k) {
		var i,
			subI,
			ret = [],
			sub,
			next;
		for (i = 0; i < arr.length; i++) {
			if (k === 1) {
				ret.push([arr[i]]);
			} else {
				sub = this.combinations(arr.slice(i + 1, arr.length), k - 1);
				for (subI = 0; subI < sub.length; subI++) {
					next = sub[subI];
					next.unshift(arr[i]);
					ret.push(next);
				}
			}
		}
		return ret;
	}

	$scope.separate = function () {
		for (var i = 0; i < $scope.allCombinations.length; i++) {

			var c = $scope.allCombinations[i];

			var experiment = $scope.mix(c[0], c[1], c[2]);

			if (experiment.length > 0) {
				var IngrMap = $scope.ingredients.map(function (e) {
					return e.id;
				}).indexOf(8);

				if(c[2] == undefined)
					$scope.potionsList.push({
						ingredients: [c[0].id, c[1].id],
						effects: experiment.length
					});
				else
					$scope.potionsList.push({
						ingredients: [c[0].id, c[1].id, c[2].id],
						effects: experiment.length
					});
			}
		}
		// console.log($scope.potionsList);
	}
	$scope.mix = function (i1, i2, i3) {
		if (i1 == undefined || i2 == undefined) {
			console.error('одинаковые ингредиенты');
		} else if (i1 == i2 || i1 == i3 || i2 == i3) {
			console.error('Для смешивания необходимо как минимум 2 ингредиета');
		} else {
			var effects1 = [i1.effect_1, i1.effect_2, i1.effect_3, i1.effect_4];
			var effects2 = [i2.effect_1, i2.effect_2, i2.effect_3, i2.effect_4];

			var e1_temp = effects1.filter((n) => effects2.includes(n)); // получаем массив одинаковых эффектов


			if (i3 !== undefined && i3 !== null) {
				var effects3 = [i3.effect_1, i3.effect_2, i3.effect_3, i3.effect_4];

				var e2_temp = effects1.filter((n) => effects3.includes(n)); // получаем массив одинаковых эффектов
				var e3_temp = effects2.filter((n) => effects3.includes(n)); // получаем массив одинаковых эффектов
				var ret = e1_temp.concat(e2_temp, e3_temp).filter((v, i, a) => a.indexOf(v) === i)
				/**
				 * если три ингредиента дают зелье с 1 эффектом,
				 * такой вариант пропускаем
				 */
				if (ret.length <= 1) {
					return [];
				} else {
					return ret; //объединяем массивы и удаляем дубликаты
				}
			} else {
				return e1_temp;
			}
		}
	}
}]);