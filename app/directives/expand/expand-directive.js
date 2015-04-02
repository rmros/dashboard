app.directive('doughnut', function(){
    return {
        restrict: 'A',
        link: function(scope, element, attrs){           
          
            var left=0;
		    var used=0;	
			var data = [
		    	{
			        value: used,
			        color: "#B3B3BC",
			        highlight:"#B3B3BC",
			        label: "USED"
			    },
			    {
			        value: left,
			        color:"#00CC00",
			        highlight: "#00CC00",
			        label: "LEFT"
			    }			    
			];
			// For a pie chart
			var ctx = $(element).get(0).getContext("2d");
			window.myDoughnut = new Chart(ctx).Doughnut(data, {responsive : true});
        }
    };
});