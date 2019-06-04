// Store our API endpoint URLs
const earthquakeDataURL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";
const boundariesDataURL = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json";

// Function to determine marker size based on magnitude
function markerSize(mag) {
    return mag * 3;
}

// Function to determine marker color based on magnitude
function markerColor(mag) {
    switch (true) {
        case (mag >= 5): return '#FF1100';
        case (mag >= 4): return '#FF5500';
        case (mag >= 3): return '#FFBB00';
        case (mag >= 2): return '#CCFF00';
        case (mag >= 1): return '#66FF00';
        case (mag < 1): return '#11FF00';
    }
}

function createFeatures(earthquakeData, boundariesData) {

    // Define a function we want to run once for each feature in the features array
    // Give each feature a popup describing the place and time of the earthquake
    function onEachFeature(feature, layer) {
        layer.bindPopup("<h3>" + feature.properties.mag + " Magnitude Quake<br>" + feature.properties.place +
            "</h3><hr><p>" + new Date(feature.properties.time) + "</p>");
    }

    // Create a GeoJSON layer containing the features array on the earthquakeData object
    // Run the onEachFeature function once for each piece of data in the array
    const earthquakes = L.geoJSON(earthquakeData, {
        onEachFeature: onEachFeature,
        pointToLayer: function (feature, latlng) {
            return L.circleMarker(latlng, {
                stroke: false,
                radius: markerSize(feature.properties.mag),
                fillColor: markerColor(feature.properties.mag),
                fillOpacity: 0.6
            });
        }
    });

    // Create a GeoJSON layer containing the features array on the boundariesData object
    const boundaries = L.geoJSON(boundariesData, {
        style: {
            "color": "#0000FF",
            "weight": 2,
            "opacity": 1
        }
    });

    // Sending our earthquakes layer to the createMap function
    createMap(earthquakes, boundaries);
}

function createMap(earthquakes, boundaries) {

    // Define satellite, streetmap, and outdoors layers
    const satellite = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 10,
        minZoom: 3,
        id: "mapbox.satellite",
        accessToken: API_KEY
    });

    const lightmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 10,
        minZoom: 3,
        id: "mapbox.light",
        accessToken: API_KEY
    });

    const outdoors = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 10,
        minZoom: 3,
        id: "mapbox.outdoors",
        accessToken: API_KEY
    });

    // Define a baseMaps object to hold our base layers
    const baseMaps = {
        "Satellite": satellite,
        "Grayscale": lightmap,
        "Outdoors": outdoors
    };

    // Create overlay object to hold our overlay layer
    const overlayMaps = {
        Earthquakes: earthquakes,
        Boundaries: boundaries
    };

    // Create our map, giving it the streetmap and earthquakes layers to display on load
    const myMap = L.map("map-id", {
        center: [0, 0],
        zoom: 3,
        layers: [satellite, boundaries, earthquakes]
    });

    // Create a layer control
    // Pass in our baseMaps and overlayMaps
    // Add the layer control to the map
    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
    }).addTo(myMap);

    // Create a legend to display information about our map
    const legend = L.control({
        position: "bottomright"
    });

    // When the layer control is added, insert a div with the class of "legend"
    legend.onAdd = function () {
        const div = L.DomUtil.create("div", "legend");
        return div;
    };

    // Add the info legend to the map
    legend.addTo(myMap);

    // Call the updateLegend function, which will... update the legend!
    updateLegend();
}

// Update the legend's innerHTML with the last updated time and station count
function updateLegend() {
    document.querySelector(".legend").innerHTML = [
        "<div class='my-legend'>",
            "<div class='legend-scale'>",
                "<ul class='legend-labels'>",
                    "<li><span style='background:#11FF00;'></span>0-1</li>",
                    "<li><span style='background:#66FF00;'></span>1-2</li>",
                    "<li><span style='background:#CCFF00;'></span>2-3</li>",
                    "<li><span style='background:#FFBB00;'></span>3-4</li>",
                    "<li><span style='background:#FF5500;'></span>4-5</li>",
                    "<li><span style='background:#FF1100;'></span>5+</li>",
                "</ul>",
            "</div>",
        "</div>"
    ].join("");
}

(async function () {
    const earthquakeData = await d3.json(earthquakeDataURL);
    const boundariesData = await d3.json(boundariesDataURL);
    // Once we get a response, send the data.features object to the createFeatures function
    createFeatures(earthquakeData.features, boundariesData.features);
})()