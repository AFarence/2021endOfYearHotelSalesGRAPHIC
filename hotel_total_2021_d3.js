(function () {

    // Margin convention
    const margin = { top: 30, right: 50, bottom: 50, left: 50 }
    const width = 600 - margin.left - margin.right
    const height = 425 - margin.top - margin.bottom
  
    const svg = d3.select("#chart").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
  
    // Define colour scale
    const colorScale = d3.scaleOrdinal()
      .domain(['SalePrice'])
      .range(["#228C22"])
  
    // Set radius scale
    const radiusScale = d3.scaleSqrt()
      .domain([0, 300001])
      .range([0, 40])
  
    // Define years
    const years = [2021]
  
    // Define x axis position
    const xPositionScale = d3.scalePoint()
      .domain(years)
      .range([140, width - 110])
  
    // Create currency formatted
    var formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    });
  
    // Create tooltip
    const tooltip = d3
      .select("body")
      .append("div")
      .attr("class", "svg-tooltip")
      .style("position", "absolute")
      .style("visibility", "hidden");
    
    // Force simulation and prevent overlap
    const forceX = d3.forceX(d => xPositionScale(d.year)).strength(1)
    const forceY = d3.forceY(200).strength(1)
    const forceCollide = d3.forceCollide((d => radiusScale(d.amount) + 4))
    const simulation = d3.forceSimulation()
      .force("overlap", forceCollide)
      .force("y", forceY)
      .force("x", forceX)
      .force('charge', d3.forceManyBody().strength(-50))
  
    // Read in csv
    d3.csv("2021_hotel_sales_for_graphic.csv")
      .then(ready)
    function ready (datapoints) {
      datapoints.forEach(d => {
        d.x = xPositionScale(d.year);
        d.y = 0;
      })
  
      // Show text labels
      svg.selectAll('text')
        .data(years)
        .join('text')
        .attr('text-anchor', 'end')
        .attr('x', d => xPositionScale(d))
        .attr('dx', 20)
        .attr('dy', 0)
        .text(d => d)
  
      // Set position of circles
      svg.selectAll('circle')
        .data(datapoints)
        .join('circle')
        .attr("id", "circleBasicTooltip")
        .attr('r', d => radiusScale(d.amount))
        .attr('cx', d => xPositionScale(d.year))
        .attr('fill', d => colorScale(d.occupation_group))
        .attr('cy', 200)
        .attr('stroke', 3)
  
      // Trigger tooltip
      d3.selectAll("circle")
        .on("mouseover", function(e, d) {
          d3.select(this)
            .attr('stroke-width', '2')
            .attr("stroke", "black");
          tooltip
            .style("visibility", "visible")
            .attr('class','tooltipdiv')
            .html(`<h4>${d.PropertyName}</h4>` + 
                  `<p><strong>Address</strong>: ${d.PropertyAddress}<br />` +
                  `<p><strong>City</strong>: ${d.City}<br />` +
                  `<p><strong>Sale Price</strong>: ${d.SalePrice}<br />` +
                  `<p><strong>Square Footage</strong>: ${d.Square_Footage}<br />` +
                  `<p><strong>Units</strong>: ${d.Units}<br />` +
                  `<p><strong>Price per Sq Ft</strong>: ${d.Price_SF}<br />` +
                  `<p><strong>Price per Unit</strong>: ${d.Price_Unit}<br />` +
                  `<p><strong>Sale Date</strong>: ${d.SaleDate}<br />` +
                  `<p><strong>Buyer</strong>: ${d.Buyer}<br />` +
                  `<p><strong>Seller</strong>: ${d.Seller}<br />`);
        })
        .on("mousemove", function(e) {
          tooltip
            .style("top", e.pageY - 10 + "px")
            .style("left", e.pageX + 10 + "px");
        })
        .on("mouseout", function() {
          d3.select(this).attr('stroke-width', '0');
            tooltip.style("visibility", "hidden");
      });
  
      simulation.nodes(datapoints)
        .on('tick', ticked)
      function ticked() {
        svg.selectAll('circle')
          .attr("cx", d => d.x)
          .attr("cy", d => d.y)
        
      }
    }
  })();