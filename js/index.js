var width = window.innerWidth - 100,
    height = window.innerHeight - 100,
    origin = {
      x: 50,
      y: 25
    },
    scaler = (width - 1) / 2 / Math.PI,
    colors = ["#2c7bb6", "#00a6ca","#00ccbc","#90eb9d","#ffff8c","#f9d057","#f29e2e","#e76818","#d7191c"];




var force = d3.forceSimulation();

var svg = d3.select(".root")
          .append("svg")
          .attr("width", width)
          .attr("height", height)
          
var map = svg.append("g")
          .attr("class", "map")

var projection = d3.geoMercator()
                .scale(125)
                .translate([width/2, height/2])
                .rotate([origin.x, origin.y])


var λ = d3.scaleLinear()
        .domain([-width, width])
        .range([-180, 180])

var φ = d3.scaleLinear()
        .domain([-height, height])
        .range([90, -90]);

var path = d3.geoPath().projection(projection);

var tip = d3.select("body")
    .append("foreignObject")
      .attr("class", "tooltip")
      .style("position", "absolute")
      .style("z-index", "10")
      .style("visibility", "hidden");    

setTimeout(() =>{
  $.getJSON('https://d3js.org/world-110m.v1.json', (data) => {
  $.getJSON('https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/meteorite-strike-data.json', (meteors) => {
    
    var drag = d3.drag()
              .on("drag", dragged);
    var zoom = d3.zoom()
              .scaleExtent([1, 8])
              .on("zoom", zoomed);  
    
    var z = d3.scaleQuantile()
      .range(colors)
      .domain(d3.extent(meteors.features, (d) => { return d.properties.mass; }))
    
    var w = d3.scaleQuantize()
      .range([1, 3])
      .domain(d3.extent(meteors.features, (d) => { return d.properties.mass; }))
    
    map.selectAll("path")
      .data(topojson.feature(data, data.objects.countries).features)
    .enter().append("path")
      .attr("d", path)
      .attr("fill", "white")
      .attr("stroke", "black")
        .call(drag)
        .call(zoom)


    var impacts = svg.append("g");
                impacts.selectAll("path")
              .data(meteors.features)
              .enter().append("circle")
              .attr("r", (d) => { return w(d.properties.mass) })
              .style("fill", (d) => { return z(d.properties.mass) })
              .attr("opacity", "0.7")
              .attr("cx", d => projection([d.properties.reclong, d.properties.reclat])[0])
              .attr("cy", d => projection([d.properties.reclong, d.properties.reclat])[1])
              .on("mouseover", (d) => {
                    var date = new Date(d.properties.year);
                    var year = date.getFullYear();
                    tip.html("<p>Name: " + d.properties.name + "</p><p>Mass: " + d.properties.mass + "</p><p>Year: " + year +"</p>");
                  return tip.style("visibility", "visible");
                  })
              .on("mousemove", () => {
                return tip.style("top", (d3.event.pageY-150)+ "px").style("left",(d3.event.pageX-150)+ "px");
                })
              .on("mouseout", () => {
                return tip.style("visibility", "hidden");
        });

    
    
    function dragged(d) {
      var r = {
          x: λ((d.x = d3.event.x)),
          y: φ((d.y = d3.event.y))
      };
      projection.rotate([origin.x + r.x, origin.y + r.y]);
      update(svg, path);
    }

    function zoomed() {
      projection
          map.attr("transform", d3.event.transform);
          impacts.attr("transform", d3.event.transform);
      
    }
    
    function update(svg, path) {
      svg.selectAll('path').attr('d', path);
      svg.selectAll('circle').attr("cx", d => projection([d.properties.reclong, d.properties.reclat])[0])
                          .attr("cy", d => projection([d.properties.reclong, d.properties.reclat])[1]);
      
    };

    $(".loading-container").hide();
    $(".headers").show();
  })
  

});
  
}, 1500)
