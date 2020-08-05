//Budget Controlle Module

var budgetController = (function (){

	var expenses = function(id,description,value){
		this.id=id,
		this.description=description,
		this.value=value;
		this.percentage = -1; 
	};

	expenses.prototype.calcPercentage = function(totalIncome){
		if(totalIncome>0){

				this.percentage = Math.round((this.value/totalIncome) * 100);
		}
		else{
			this.percentage = -1;
		}
	};

	expenses.prototype.getPercentage = function(){
		return this.percentage;
	}

	var income = function(id,description,value){
		this.id=id,
		this.description=description,
		this.value=value;
	};

	var calculateTotal = function(type){
		var sum = 0;
		data.allItems[type].forEach(function(current){
			sum+=current.value;
		});
		data.totals[type] = sum;
	};

	var data = {
		allItems: {
			exp :[],
			inc :[]
		},

		totals: {
			exp: 0,
			inc: 0
		},
		budget : 0,
		Percentage : -1
	}

	return {

		addItem: function(type,des,val){

			var newItem,id;
			//create new id

			if(data.allItems[type].length === 0)
				id = 0;
			else
				id = data.allItems[type][data.allItems[type].length-1].id +1 ;
			
			if(type==='inc')
			{
				//add income item
				newItem = new income(id,des,val);
			}
			else{
				//add expense item
				newItem = new expenses(id,des,val);
			}

			//add new item into the data structure
			data.allItems[type].push(newItem);

			//return the new item 
			return newItem;
		},

		deleteItem: function(type, id){
			var ids,index;
			ids = data.allItems[type].map(function(current){
				return	ids = current.id;
			});

			index =ids.indexOf(id);

			if(index !== -1 ){
				data.allItems[type].splice(index, 1);
			}

		},

		calculateBudget : function(){

			//1. Calculate total Income and Expanses
			calculateTotal('inc');
			calculateTotal('exp');

			//2. Calculate the budget : Income - Expenses

			data.budget = data.totals.inc-data.totals.exp;

			//3. Calculate the Percentage
			if(data.totals.inc>0){
				data.Percentage = Math.round((data.totals.exp/data.totals.inc) * 100);
			}
		},

		calculatePercentages : function(){

			data.allItems.exp.forEach(function(current){
				current.calcPercentage(data.totals.inc);
			});

		},
		getPercentages : function(){

			var allPercentages = data.allItems.exp.map(function(current){
				return current.getPercentage();
			});
			return allPercentages;
		},

		getBudget : function(){
			return{
				budget : data.budget,
				totalIncome : data.totals.inc,
				totalExpenses : data.totals.exp,
				Percentage : data.Percentage
			};
		}
	};

})();


//UI Control Module


var uiController = (function() {
	var domString = {
		type: '.add__type',
		description: '.add__description',
		value: '.add__value',
		input: '.add__btn',
		incomeContainer: '.income__list',
		expenseContainer: '.expenses__list',
		budgetValue: '.budget__value',
		incomeValue: '.budget__income--value',
		expensesValue: '.budget__expenses--value',
		percentageValue: '.budget__expenses--percentage',
		container: '.container',
		percentage: '.item__percentage',
		dateLavel : '.budget__title--month'
	};

	var formatNumber = function(number , type){
			var numSplit, int, dec , sign;
			number = Math.abs(number);
			number = number.toFixed(2);

			numSplit = number.split('.');
			int = numSplit[0];

			if(int.length>3){

				int = int.substr(0, int.length-3) + ',' + int.substr(int.length-3, 3);
			}

			dec = numSplit[1]; 

			return (type === 'exp' ? '-': '+') + ' ' + int +'.' +dec;
		};

	var nodeListForEach = function(list, callback){

 				for(var i = 0 ; i<list.length ; i++){

 					//Recursive call by current value and its index Number

 					callback(list[i],i);
 				}
 		};


	return {

		getInput : function() {
			return {
				    type: document.querySelector(domString.type).value,
				    description: document.querySelector(domString.description).value,
				    value: parseFloat(document.querySelector(domString.value).value)
			};
		},

		addListItem : function(obj, type){
		var html,newHtml,element;
		//Create html string with placeholder text
		if(type==='inc'){
			element = domString.incomeContainer;
			html= '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
		}
		else if(type==='exp'){
			element = domString.expenseContainer;
			html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
		}
		//Remove the placeholder text with some actual data

		newHtml = html.replace('%id%',obj.id);
		newHtml = newHtml.replace('%description%',obj.description);
		newHtml = newHtml.replace('%value%',formatNumber(obj.value, type));

		//Insert the HTML into the DOM

		document.querySelector(element).insertAdjacentHTML('beforeend',newHtml);

		},

		deleteListItem : function(selectorID){
			var element;
			element = document.getElementById(selectorID);
			element.parentNode.removeChild(element);

		},

		clearFields : function(){

			var fields,fieldArray;
			
			fields = document.querySelectorAll(domString.description + ','  + domString.value);


			//convert List into the array
			fieldArray = Array.prototype.slice.call(fields);


			//clear the input field
			fieldArray.forEach(function(current,index,array){
				current.value = "";
			});

			//focus on the first field

			fieldArray[0].focus();
		},

		displayBudget : function(obj){

				var type;
				obj.budget >= 0 ? type = 'inc' : type = 'exp';
				document.querySelector(domString.budgetValue).textContent = formatNumber(obj.budget, type);
				document.querySelector(domString.incomeValue).textContent = formatNumber(obj.totalIncome,'inc');
				document.querySelector(domString.expensesValue).textContent = formatNumber(obj.totalExpenses, 'exp');

				if(obj.Percentage>0){
					document.querySelector(domString.percentageValue).textContent = obj.Percentage + '%';
				}
				else
				{
					document.querySelector(domString.percentageValue).textContent = '---';
				}

		},

		displayPercentages : function(percentage){

			//Its return a node list

			var field = document.querySelectorAll(domString.percentage);


			//create new foreeach function for NodeList using callback function instead of use slice method


			nodeListForEach(field, function(current,index){
				if(percentage[index]>0){
					current.textContent = percentage[index] + '%';
				}
				else{
					current.textContent = '---';
				}
			});
		},

		changeType : function(){

			var fields = document.querySelectorAll(domString.type + ',' + domString.description + ',' + domString.value);

			nodeListForEach(fields, function(current){

				current.classList.toggle('red-focus');

			});

			document.querySelector(domString.input).classList.toggle('red');

		},

		displayMonth : function(){
			var now,year;
			now = new Date();

			year = now.getFullYear();

			document.querySelector(domString.dateLavel).textContent = year ;
		}, 

		getDomString : function(){
			return domString;
		}
	};

})();


//App Control Module

var controller = (function(budget,UI){

	var setupEventListener = function(){
		var dom = UI.getDomString();
		document.querySelector(dom.input).addEventListener('click',ctrlAddItem);

		document.addEventListener('keypress',function(event){
			if(event.keycode===13||event.which===13){
				ctrlAddItem();
			}
		});

		document.querySelector(dom.container).addEventListener('click',ctrlDeleteItem);

		document.querySelector(dom.type).addEventListener('change', UI.changeType);

	};

	var updateBudget = function(){

		var Budget;
		//1. Calculate the budget	

		budget.calculateBudget(); 

		//2. Return the budget

		Budget = budget.getBudget();

		//3. Display the budget on the UI

		UI.displayBudget(Budget);

	};

	var updatePercentages = function(){

		//1. Update the Percentages

		budget.calculatePercentages();

		//2. Read Percentages from the budget controller

		var percentages = budget.getPercentages();

		//3. Update the UI

		UI.displayPercentages(percentages);
	};

	var ctrlAddItem = function(){
 
 		var input,newItem;
		//1. Get Input Data

		input = UI.getInput();
		//console.log(input);

		// Checking That the Value is Empty or Not

		if(input.description !=="" && !isNaN(input.value) && input.value > 0)
		{
			//2. Add the item to the budget Controller

			newItem= budget.addItem(input.type, input.description, input.value);

			//3. Add the item to the UI

			UI.addListItem(newItem,input.type);

			//4. Clear the input field

			UI.clearFields();

			//5. Calculate and update the Budget

			updateBudget();

			//6. Calculate and update Percentages

			updatePercentages();
		}

	};


	var ctrlDeleteItem = function(event){

		var itemId,splitId,type,id;

		itemId = event.target.parentNode.parentNode.parentNode.parentNode.id;

		if(itemId){

			splitId = itemId.split('-');
			type = splitId[0];
			id = parseInt(splitId[1]);

			//1. delete the item from the data structure

			budget.deleteItem(type,id);

			//2. delete the item from the ui

			UI.deleteListItem(itemId);

			//3. Update the budget

			updateBudget();

			//4. Calculate and update Percentages

			updatePercentages();
		}
	};
	return {
		init: function(){
			UI.displayMonth();
			UI.displayBudget({
				budget : 0,
				totalIncome : 0,
				totalExpenses : 0,
				Percentage : 0
			});

			setupEventListener();
		}
	};


})(budgetController,uiController);

controller.init();