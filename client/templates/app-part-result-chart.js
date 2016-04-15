Template.appPartResultChart.helpers({
  thumbnail: function() {
    chase = this;
    console.log('thumbnail helper');
    console.log(chase.owner);
    return Images.findOne({"userId": chase.owner, "mainPicture": true});
  }
});

Template.appPartResultChart.onRendered(function(){

    var self = this;
    chartData = [];
    activeRound = {};

    console.log("rounds");
    self.data.rounds.forEach(function(ele, ind, arr) {
      if(ele.subCatId == self.data.activeRound) {
        activeRound = ele;
      }
    });

    self.subscribe("chartdata", self.data._id, self.data.activeRound, function() {
      chartDataColl = ChartData.find({});
      console.log("chart data coll");
      chartDataColl.forEach(function(e, i, a){
        console.log(e);
        chartData.push(e);
      });
      var margin = {top: 20, right: 30, bottom: 30, left: 40},
      width = Math.round(window.innerWidth * 0.8) - margin.left - margin.right,
      height = 100 - margin.top - margin.bottom;

      var x = d3.scale.ordinal()
        .rangeRoundBands([0, height], .1);
        // .range([height, 0]);

      var y = d3.scale.linear()
        .range([0, width]);

      var xAxis = d3.svg.axis()
        .scale(x)
        .orient("left");

      var yAxis = d3.svg.axis()
      .scale(y)
      .orient("bottom")
      .tickValues(0);

      var chart = d3.select("#chart")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      x.domain(chartData.map(function(d) { return d.userId; }));
      y.domain([0, d3.max(chartData, function(d) { return d.score; })]);

      chart.append("g")
        .attr("class", "y axis")
        .attr("transform", "translate(0," + height + ")")
        .call(yAxis)
        .append("text")
        .attr("x", 200)
        .attr("dy", "-1em")
        .style("text-anchor", "end")
        .text(activeRound.subCat);

      chart.append("g")
        .attr("class", "x axis")
        .call(xAxis);

      chart.selectAll(".bar")
        .data(chartData)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("y", function(d) { return x(d.userId); })
        .attr("x", 20)
        // .attr("x", function(d) { return x(d.name); })
        .attr("width", function(d) {
          return y(d.score); })
        //.attr("height", x.rangeBand());
        .attr("height", 20);

      chart.select(".x.axis").selectAll("text").remove();

      chart.select(".x.axis").selectAll(".tick")
                      .data(chartData)
                      .append("svg:image")
                      .attr("xlink:href", function (d) { return d.image ; })
                      .attr("width", "3em")
                      .attr("height", "3em")
                      .attr("x", -30)
                      .attr("y", -35);;

      function type(d) {
        d.value = +d.value; // coerce to number
        return d;
      };
    });

    // Meteor.call("chartData", "9NrtS8XPKP7phs6P3", "S000001", function(error, result){
    //   if(error) {
    //     throw error;
    //   }
    //   else {
    //     Session.set("chartData", result);
    //   }
    // });
    //
    // chartData = Session.get("chartData");



});
