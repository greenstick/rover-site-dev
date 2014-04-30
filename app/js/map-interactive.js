/*
Data-Driven Choropleth Prototype Object
@Params: object                 -   (object,    required)
         object.geoData         -   (geoJSON,   required)   Draws Choropleth
         object.coreData        -   (JSON,      required)   Data to be Bound to Choropleth
         object.wrapper         -   (string,    optional)
         object.container       -   (string,    optional)
         object.projection      -   (string,    optional)   See options: https://github.com/mbostock/d3/wiki/Geo-Projections
         object.stroke          -   (string,    optional)
         object.stroke-width    -   (string,    optional)
         object.width           -   (number,    optional)
         object.height          -   (number,    optional)
         object.scale           -   (number,    optional)
         object.translateX      -   (number,    optional)
         object.translateY      -   (number,    optional)
         object.layers          -   (number,    optional)   Number of Color Layers - CSS Dependent
         object.pathClass       -   (string,    optional)   Name of CSS Class for Land Masses
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
        map.chronoCache,

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

        map.bucket = function (value, max, min, layers, color) {
            var bucket  = d3.scale.quantize().domain([max, min]).range(d3.range(layers).map(function (i) {
                 return color + "-" + i + "-" + layers;
            }));
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
                    //Create Array of Value
                    for (var i = 0; i < data[filter].countries.length; i++) {
                        arr.push(data[filter].countries[i][chrono])
                    };
                    //Set Max & Min
                    var max     = Math.max.apply(null, arr),
                        min     = Math.min.apply(null, arr);
                    //Loop Through Values and Set Fill
                    for (var i = 0; i < data[filter].countries.length; i++) {
                        if (data[filter].countries[i][chrono] != null) {
                            // console.log(data[filter].countries[i].id);
                            d3.select('#' + data[filter].countries[i].id).attr('class', function (d) {
                                return map.bucket(data[filter].countries[i][chrono], max, min, map.layers, data[filter].color) + " " + map.pathClass;
                            });
                        }
                    };
                });
                this.currentFilter = filter;
            //Execute Callback
            typeof callback == 'function' ? callback() : void(0);
        },

        //Toggle Between Present or Future & Set Cache
        map.chronology = function () {
            var cache;
                this.chronoCache === "present" ? cache = "future" : cache = "present";
                this.chronoCache = cache;
            return this.chronoCache;
        }
};

/*
Public Methods
*/

//Draws Map and Sets Initial Filter
Choropleth.prototype.init = function () {
    this.draw();
    //Sets Default Filter
    this.filter('wealthDistribution', this.chronology());
};
//Triggered By Filter Selection
Choropleth.prototype.updateFilter = function (filter) {
    this.filter(filter, this.chronoCache);
};
Choropleth.prototype.updateChronology = function (chrono) {
    this.filter(this.currentFilter, this.chronology());
};

/*
Instantiation
*/

var choropleth = new Choropleth({
    "geoData"      :   "js/json/world-data.json",
    "coreData"     :   "js/json/core-data.json",
    "wrapper"      :   "#map-wrapper",
    "container"    :   "#map-container",
    "strokeWidth"  :   "0px",
    "stroke"       :   "azure",
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

$('.filter').on("click", function (e) {
    var filter = e.currentTarget.id;
    choropleth.updateFilter(filter);
});
$('.chronology').on("click", function (e) {
    choropleth.updateChronology();
});