// constants for height, width, and margin sizes
const MAX_WIDTH = Math.max(1200, window.innerWidth);
const MAX_HEIGHT = 720;
const margin = {top: 40, right: 100, bottom: 40, left: 175};

// constants for individual graph dimensions
let graph_1_width = (MAX_WIDTH / 2) - 10, graph_1_height = 350;
let graph_2_width = MAX_WIDTH, graph_2_height = 600;
let graph_3_width = (MAX_WIDTH / 2) - 10, graph_3_height = 400;

// SVG object for graph 1
let svg = d3.select("#graph1")
    .append("svg")
    .attr("width", graph_1_width)     
    .attr("height", graph_1_height)     
    .append("g")
    .attr("transform", "translate(" + margin.left + " ," + margin.top + ")");    

// Set up reference to count SVG group
let countRef = svg.append("g");

// Comparators for sorting data
const comparator = (a, b) => { 
    return (parseInt(a.year) - parseInt(b.year)) * -1
}
const comparator2 = (a, b) => { 
    return (parseInt(a.year) - parseInt(b.year))
}
// Load in pre-processed csv with columns year, count
d3.csv("data/football_by_year.csv").then(function(data) {
    /* 
        Sort data in descending order by year, get data from the last 11 years, 
        sort in ascending order (for display purposes), and remove 2020
    */
    data = data.sort(comparator).slice(0, 11).sort(comparator2).slice(0, 10)


    // Create a linear scale for the y axis (number of games)
    let y = d3.scaleLinear()
        .domain([0, d3.max(data, function(d) {return d.count})])
        .range([0, graph_1_height - margin.top - margin.bottom - 100]);

    // Create a scale band for the x axis (year)
    let x = d3.scaleBand()
        .domain(data.map(function(d) {return d.year}))
        .range([0, graph_1_width - margin.left - margin.right])
        .padding(0.1);  

    // Add an axis along the bottom of the graph containing years
    svg.append("g")
        .attr("transform", "translate(0, " +  (graph_1_height - margin.top - margin.bottom) + ")")
        .call(d3.axisBottom(x));


    let bars = svg.selectAll("rect").data(data);

    // Define color scale
    let color = d3.scaleOrdinal()
        .domain(data.map(function(d) { return parseInt(d["year"])}))
        .range(d3.quantize(d3.interpolateHcl("#dda0dd", "#9678b6"), 10));


    // Render elements
    bars.enter()
        .append("rect")
        .merge(bars)
        // select color based on defined scale (along x-axis)
        .attr("fill", function(d) { return color(parseInt(d['year'])) }) 
        // place bars in correct place 
        .attr("y", function(d) {return (graph_1_height - y(parseInt(d.count))) - 80})
        .attr("x", function(d) { return x(d['year'])})      
        // set bar height based on number of games        
        .attr("height", function(d) {return y(parseInt(d.count))})
        .attr("width",  x.bandwidth());        

    let counts = countRef.selectAll("text").data(data);

    // Render text elements corresponding to each count above each bar
    counts.enter()
        .append("text")
        .merge(counts)
        .attr("y", function(d) {return (graph_1_height - y(parseInt(d.count))) - 100})      
        .attr("x", function(d) {return x(d.year) + 13})      
        .style("text-anchor", "start")
        .text(function(d) {return d.count});           

    // Add x-axis label
    svg.append("text")
        .attr("transform", "translate(" + 300 + " , " + 310 + ")")
        .style("text-anchor", "middle")
        .text("Year");

    // Add y-axis label, rotated so that it is vertical
    svg.append("text")
        .attr("transform", "translate(" + -25 + " , " +  150 + "), rotate(270)")      
        .style("text-anchor", "middle")
        .text("Number of Games");

    // Add chart title
    svg.append("text")
        .attr("transform", "translate(" + 300 + " , " + 0 + ")")       
        .style("text-anchor", "middle")
        .style("font-size", 15)
        .text("Number of Football Games by Year");
    
});

// SVG object for graph 2
let svg2 = 
    d3.select("#graph2")
    .append("svg")
    .attr("width", graph_2_width)     
    .attr("height", graph_2_height)    
    .append("g")
    .attr("transform", "translate(" + margin.left + " ," + margin.top + ")");    

// projection to generate map
var projection = d3.geoNaturalEarth()
    .scale(180, 180)

// locations to place on map
var topten = [
    {lat: -10.81, long: -52.97, country: "Brazil", win: 63.7, rank: 1}, //brazil
    {lat: 40.30, long: -3.55, country: "Spain", win: 58.5, rank: 2}, //spain
    {lat: 51.52, long: 9.92, country: "Germany", win: 58.5, rank: 3}, //germany
    {lat: 54.24, long: -2.37, country: "England", win: 56.7, rank: 4}, //england
    {lat: 32.5, long: 54.29, country: "Iran", win: 54.5, rank: 5}, // iran
    {lat: 49.74, long: 15.33, country: "Czech Republic", win: 53.9, rank: 6}, //czech republic
    {lat: -37.07, long: -64.85, country: "Argentina", win: 53.7, rank: 7}, //argentina
    {lat: 44.44, long: 15.73, country: "Croatia", win: 53.5, rank: 8}, //croatia
    {lat: 42.77, long: 12.49, country: "Italy", win: 52.9, rank: 9}, //italy
    {lat: -21.4, long: 165.46, country: "New Caledonia", win: 52.9, rank: 10}, //new caledonia
]

// load in json file with map data and add to SVG
d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson").then(function(data) {
    svg2.append("g")
        .selectAll("path")
        .data(data.features)
        .enter().append("path")
            .attr("fill", "#c0c0c0") // set map fill color
            .attr("d", d3.geoPath()
                .projection(projection))
    // add circles to SVG representing each data point
    svg2.selectAll("test")
        .data(topten)
        .enter()
        .append("circle")
            .attr("id", function(d) {return d.country})
            // set circle location based on latitude, longitude, and projection function
            .attr("cx", function(d) {return projection([d.long, d.lat])[0]}) 
            .attr("cy", function(d) {return projection([d.long, d.lat])[1]})
            // set circle radius
            .attr("r", 10)
            // make circles slightly transparent
            .attr("fill-opacity", 0.8)
            // set circle border size
            .attr("stroke-width", 2)
            // set circle color
            .attr("fill", "#966fd6")
            // set border color
            .attr("stroke", "#000000")
            // set tooltip attributes
            .on("mouseover", function(d) {
                // use data from point to get tooltip content
                var countrytext = "<p><b>" + d.country + "</b></p>"
                var wintext = "<p>win pct: " +  d.win + "%</p>"
                var ranktext = "<p>rank: " + d.rank + "</p>"
                // set opacity to 1 to make tooltip visible on hover and render html element
                return tooltip.style("opacity", "1").html(countrytext + wintext + ranktext)})
            // tooltip will move on mouse move
            .on("mousemove", function(){return tooltip.style("top", d3.mouse(this)[1]+500+"px").style("left", d3.mouse(this)[0]+150+"px")})
            // set opacity back to 0 when mouse moves off of circle to make tooltip disappear
            .on("mouseout", function(){return tooltip.style("opacity", "0");})
    
    // tooltip styling
    var tooltip = d3.select("#graph2")
        .append("div")
            .style("position", "absolute")
            // set default opacity to 0 so that tooltip is not visible until hover
            .style("opacity", "0")
            // set tooltip border so that it doesn't float weirdly on the page
            .style("border", "1px solid black")
            // set tooltip background color
            .style("background-color", "white")
            // add some padding to the tooltip so that text isn't crowded
            .style("padding-top", "5px")
            // set min width to avoid weird looking tooltips
            .style("min-width", "160px")
            // align text to the center
            .style("text-align", "center")
            // add a slight shadow
            .style("box-shadow", "2px 2px 3px black")
            // set thickness of border
            .style("border-radius", "5px")
            // set line height so that spacing isn't weird
            .style("line-height", "14px")
    
    // add chart title
    svg2.append("text")
        .attr("x", 500)
        .attr("y", -20)
        .style("text-anchor", "middle")
        .style("font-size", 15)
        .text("Top 10 Nations By Win Percentage");
    
    // add a small chart description to make use clear to the user
    svg2.append("text")
        .attr("transform", "translate(" + 500 + " , " + 520 + ")")
        .style("text-anchor", "middle")
        .style("font-style", "italic")
        .text("mouse over each datapoint to see country name, win %, and rank");

});




// CSV files for data based on win percentage and RPI
let filenames = ["data/wc_win_pcts.csv", "data/wc_rpi.csv"];

// Set up SVG for graph 3
let svg3 = d3.select("#graph3")
    .append("svg")
    .attr("width", graph_3_width)     
    .attr("height", graph_3_height)     
    .append("g")
    .attr("transform", "translate(" + margin.left + " ," + margin.top + ")"); 

// Create a linear scale for the x axis (metric)
let x3 = d3.scaleLinear()
    .range([0, graph_3_width - margin.left - margin.right]);

// Create a scale band for the y axis (nation)
let y3 = d3.scaleBand()
    .range([0, graph_3_height - margin.top - margin.bottom - 50])
    .padding(0.1); 

let countRef3 = svg3.append("g");

// Set up reference to x axis label 
let x_axis_label = svg3.append("g");

// Set up x axis text -- text will change based on metric
let x_axis_text = svg3.append("text")
    .attr("transform", "translate(" + 300 + " , " + 300 + ")")       
    .style("text-anchor", "middle");

// Add y-axis text, which stays consistent
svg3.append("text")
    .attr("transform", "translate(" + -100 + " , " +  150 + "), rotate(270)")          
    .style("text-anchor", "middle")
    .text("Nation");

// Add chart title, which we'll also add text to later
let title = svg3.append("text")
    .attr("transform", "translate(" + 300 + " , " + -5 + ")")  
    .style("text-anchor", "middle")
    .style("font-size", 15);

// Add description text to explain metrics, which we'll also change later
let description = svg3.append("text")
    .attr("transform", "translate(" + 300 + ", " + 340 + ")")
    .style("text-anchor", "middle")
    .style("font-style", "italic")


// Set data based on which attribute is being considered
function setData(index, attr) {
    // Get the right file and load data
    d3.csv(filenames[index]).then(function(data) {

        // Update the x axis domain with the max count of the provided data
        x3.domain([0, d3.max(data, function(d) {return parseFloat(d[attr]).toFixed(2)})]);

        // Update the y axis domain with desired teams
        y3.domain(data.map(function(d) {return d.team}));

        // Render x-axis label
        x_axis_label.call(d3.axisLeft(y3).tickSize(0).tickPadding(10));

        // Set up color scale (same as we used in graph 1!)
        let color3 = d3.scaleOrdinal()
            .domain(data.map(function(d) { return d.team }))
            .range(d3.quantize(d3.interpolateHcl("#dda0dd", "#9678b6"), 10));

        let bars3 = svg3.selectAll("rect").data(data);

        // Render bars
        bars3.enter()
            .append("rect")
            .merge(bars3)
            // set bar color 
            .attr("fill", function(d) { return color3(d.team) }) 
            // position bars
            .attr("x", x3(0))
            .attr("y", function(d) { return y3(d.team)})
            // set width of bar based on metric (using attr to make sure it's the right one)               
            .attr("width", function(d) { return x3(parseFloat(d[attr]).toFixed(2))})
            .attr("height",  y3.bandwidth());        

        
        let counts3 = countRef3.selectAll("text").data(data);

        // Render each team's metric stat next to bars
        counts3.enter()
            .append("text")
            .merge(counts3)
            .attr("x", function(d) {return x3(parseFloat(d[attr]).toFixed(2)) + 10})       
            .attr("y", function(d) {return y3(d.team) + 15})       
            .style("text-anchor", "start")
            .text(function(d) {return parseFloat(d[attr]).toFixed(2)});           
        
        // create descriptions / labels based on which chart we're rendering
        let axisDescription = attr == "pct" ? "* win percent - wins/games in the last 2 World Cups" : "* relative percentage index - weighted computation of win percent & opponent strength"
        let metric = attr == "pct" ? "Win Percent" : "Relative Percentage Index"
        x_axis_text.text(metric);
        description.text(axisDescription)
        title.text("Top 10 Nations by World Cup " + metric);
    });
}


// On page load, render the barplot with win % data
setData(0, "pct");
