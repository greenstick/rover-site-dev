/*
Data-Driven Choropleth Prototype Object
@Params: object                 -   (object,            required)
         object.geoData         -   (geoJSON,           required)   Draws Choropleth
         object.coreData        -   (JSON,              required)   Data to be Bound to Choropleth
         object.wrapper         -   (string,            optional)
         object.container       -   (string,            optional)
         object.projection      -   (string,            optional)   See options: https://github.com/mbostock/d3/wiki/Geo-Projections
         object.stroke          -   (string,            optional)
         object.stroke-width    -   (string,            optional)
         object.width           -   (number,            optional)
         object.height          -   (number,            optional)
         object.scale           -   (number,            optional)
         object.translateX      -   (number,            optional)
         object.translateY      -   (number,            optional)
         object.layers          -   (number,            optional)   Number of Color Layers - CSS Dependent
         object.pathClass       -   (string,            optional)   Name of CSS Class for Land Masses
         object.sort            -   (string / number,   optional)   Sort of Colors - Values Accepted: 'ascending', 'asc', 1, 'descending', 'dsc', 0
*/

var Choropleth = function (args) {
    var map = this;
        //Setup Prototype With Arguments
        map.geoData     =   args.geoData,
        map.coreData    =   args.coreData,
        map.wrapper     =   args.wrapper        ||   "#interactiveWrapper",
        map.container   =   args.container      ||   "#container",
        map.projection  =   args.projection     ||   "mercator",
        map.stroke      =   args.stroke         ||   "#000000",
        map.strokeWidth =   args.strokeWidth    ||   "2px",
        map.width       =   args.width          ||   960,
        map.height      =   args.height         ||   680,
        map.scale       =   args.scale          ||   1,
        map.translateX  =   args.translateX     ||   0,
        map.translateY  =   args.translateY     ||   0,
        map.layers      =   args.layers         ||   5,
        map.pathClass   =   args.pathClass      ||   "country",
        map.sort        =   args.sort           ||   "ascending",
        map.chronoCache,  //Declaring Chronology Cache

        //Stores Instantiated Settings (Prior to D3 Manipulation)
        map.settings    =   {
                                geoData         :   map.geoData,
                                coreData        :   map.coreData,
                                wrapper         :   map.wrapper,
                                container       :   map.container,
                                projection      :   map.projection, 
                                stroke          :   map.stroke,
                                strokeWidth     :   map.strokeWidth,
                                width           :   map.width,
                                height          :   map.height,
                                scale           :   map.scale,
                                translateX      :   map.translateX,
                                translateY      :   map.translateY
                            },

        //D3 Setup
        map.projection  =   d3.geo[map.projection](),
        map.svg         =   d3.select(map.container).append('svg').attr('width', map.width).attr('height', map.height),
        map.path        =   d3.geo.path().projection(map.projection),
        map.world       =   map.svg.append('g').attr('id', 'world').attr('transform', 'scale(' + map.scale + '), translate(' + map.translateX + ', ' + map.translateY + ')'),

/*
'Private' Methods
*/
        //Bucketing / Quantization Function
        //Accepts Value, Range (max and min), the Number of Layers to Map to the Range, A Color (Makes Use of User Defined Gradients in CSS), and a Sort Order
        map.bucket = function (value, max, min, layers, color, sort) {
            //Sort Ascending
            if (sort === "ascending" || sort === "asc" || sort === 1) {
                var bucket  = d3.scale.quantize().domain([max, min]).range(d3.range(layers).map(function (i) {
                     return color + "-" + i + "-" + layers;
                }));
            //Sort Descending
            } else if (sort === "descending" || sort == "dsc" || sort === 0) {
                var bucket = d3.scale.quantize().domain([max, min]).range(d3.range(layers).map(function (i) {
                     return color + "-" + (layers - i) + "-" + layers;
                }));
            //Default to Ascending
            } else {
                var bucket  = d3.scale.quantize().domain([max, min]).range(d3.range(layers).map(function (i) {
                     return color + "-" + i + "-" + layers;
                }));
            };
            return bucket(value);
        },

        //XHR Geo Data, Draw Choropleth, Then Assign IDs - Callback Optional
        map.draw = function (callback) {
            d3.json(map.geoData, function (data) {
                    map.world.selectAll('path')
                        .data(data.features).enter()
                        .append('path')
                        .attr('d', map.path)
                        .attr('id', function (d) { return d.id; })
                        .attr('class', map.pathClass)
                        .attr('stroke', map.stroke)
                        .attr('stroke-width', map.strokeWidth);
            });
            //Execute Callback
            typeof callback == 'function' ? callback() : void(0);
        },

        //Parse Filter Argument, XHR Data, Apply Quantize Function, Then Bind to Elements - Callback Optional
        map.filter = function (filter, chrono, callback) {
            var arr = [];
            d3.json(map.coreData, function (data) {
                //Create Array of Data Values with Requested Chronology
                for (var i = 0; i < data[filter].countries.length; i++) {
                    arr.push(data[filter].countries[i][chrono])
                };
                //Set Max & Min From Array
                var max = Math.max.apply(null, arr),
                    min = Math.min.apply(null, arr);
                //Loop Through Values, Bucket / Quantize Values by Appending a Dynamic CSS Class to Element with Correct ID
                for (var i = 0; i < data[filter].countries.length; i++) {
                    //Skips Null Values, Ideally no Null Values Would Exist - They Would Be Represented by A Base Numberic Value, i.e. 0
                    if (data[filter].countries[i][chrono] != null) {
                        d3.select('#' + data[filter].countries[i].id).attr('class', function (d) {
                            return map.bucket(data[filter].countries[i][chrono], max, min, map.layers, data[filter].color, (data[filter].sort || map.sort)) + " " + map.pathClass;
                        });
                    }
                };
            });
            //Cache Filter
            this.currentFilter = filter;
            //Execute Callback
            typeof callback == 'function' ? callback() : void(0);
        },

        //Caches and Returns Selected Chronology
        map.chronology = function (chrono) {
            this.chronoCache = chrono || this.chronoCache;
            return this.chronoCache;
        };
};

/*
Public Methods
*/

//Draws Map and Sets Initial Filter
Choropleth.prototype.init = function () {
    this.draw();
    //Sets Default Filter & Chronology
    this.filter('wealthDistribution', this.chronology('present'));
};
//Triggered by Filter Selection
Choropleth.prototype.updateFilter = function (filter) {
    console.log(filter);
    this.filter(filter, this.chronoCache);
};
//Triggered by Chronology Toggle
Choropleth.prototype.updateChronology = function (chrono) {
    this.filter(this.currentFilter, this.chronology(chrono));
};

/*
This was an Interesting Experiment, Ran into Trouble with 'this' Referencing the 
mapUX Class Instead of the Choropleth Prototype on this.draw() & this.filter(), etc.
Idea Was to Have an Interactive Class That Inherited the Choropleth Prototype. 
*/

/*
var mapUX = function (args) {
    var ux = this;
        ux.filterElement       =   args.filterElement,
        ux.chronology          =   args.chronologyElement,
        ux.choropleth          =   args.choropleth
        return {
            initMap             :   ux.choropleth.init,
            filterMap           :   ux.choropleth.updateFilter,
            updateChronology    :   ux.choropleth.updateChronology
        };
};
*/

/*
Instantiation
*/

/*
var interactive = new mapUX ({
    filterElement       :   '.filter',
    chronologyElement   :   '.chronology',
    choropleth          :   new Choropleth({
            "geoData"       :   "js/json/world-data.json",
            "coreData"      :   "js/json/core-data.json",
            "wrapper"       :   "#map-wrapper",
            "container"     :   "#map-container",
            "strokeWidth"   :   "0px",
            "scale"         :   ".9",
            "width"         :   980,
            "height"        :   600,
            "translateX"    :   60,
            "translateY"    :   200
    })
});
*/

//Initialize Choropleth
// interactive.initMap();

/*
Instantiation
*/

var choropleth = new Choropleth({
    "geoData"      :   "js/json/world-data.json",
    "coreData"     :   "js/json/core-data.json",
    "wrapper"      :   "#map-wrapper",
    "container"    :   "#map-container",
    "strokeWidth"  :   "0px",
    "scale"        :   ".9",
    "projection"   :   "mercator",
    "width"        :   980,
    "height"       :   600,
    "translateX"   :   60,
    "translateY"   :   200
});

//Initialize
choropleth.init();

/*
Event Bindings
*/

//Filter Selection Event
$('.filter').on("click", function (e) {
    $('.filter').removeClass('active');
    $('#' + e.currentTarget.id).addClass('active');
    choropleth.updateFilter(e.currentTarget.id);
});
//Chronology Selection Event
$('.chronology').on("click", function (e) {
    $('.chronology').removeClass('active');
    $('#' + e.currentTarget.id).addClass('active');
    choropleth.updateChronology(e.currentTarget.id);
});