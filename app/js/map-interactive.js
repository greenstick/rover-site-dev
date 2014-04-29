/*
Data-Driven Choropleth Prototype Object
@Params: object                 -   (object,    required)
         object.geoData         -   (geoJSON,   required)   Draws Choropleth
         object.coreData        -   (JSON,      required)   Renders Data to Choropleth
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

        map.bucket = function (value, max, min, layers) {
            var bucket = d3.scale.quantize().domain([max, min]).range(d3.range(layers)).map(function (i) {
                 return "quantize" + i + "-" + layers;
            });
            console.log(bucket(value));
            return bucket(value);
        },

        //XHR Geo Data, Draw Choropleth, Then Assign IDs - Callback Optional
        map.draw = function (callback) {
            d3.json(map.geoData, function (data) {
                    map.world.selectAll('path')
                        .data(data.features).enter()
                        .append('path')
                        .attr('d', map.path)
                        .attr('id', function (d) {
                            return d.id;
                        })
                        .attr('stroke', map.stroke)
                        .attr('stroke-width', map.strokeWidth);
            });
            //Execute Callback
            typeof callback == 'function' ? callback() : void(0);
        },

        //Parse Filter Argument, XHR Data, Apply Quantize Function, Then Bind to Elements - Callback Optional
        map.filter = function (filter, callback) {
            //Parse Filter String
            var split   =   filter.split('_'),
                filter  =   split[0],
                chrono  =   split[1],
                arr     =   [];

                d3.json(map.coreData, function (data) {
                    //Create Array of Value
                    for (var i = 0; i < data[filter].length; i++) {
                        arr.push(data[filter][i][chrono])
                    };
                    //Set Max & Min
                    var max     = Math.max.apply(null, arr),
                        min     = Math.min.apply(null, arr);
                    //Loop Through Values and Set Fill
                    for (var i = 0; i < data[filter].length; i++) {
                        d3.select('#' + data[filter][i].id).attr('class', function (d) {
                            console.log(data[filter][i][chrono])
                            return map.bucket(data[filter][i][chrono], max, min, map.layers);
                        });
                    };
                });
                //Execute Callback
                typeof callback == 'function' ? callback() : void(0);
        },

        //Scale Map
        map.scale = function () {

        };
};

/*
Public Methods
*/

//Draws Map and Sets Initial Filter
Choropleth.prototype.init = function () {
    this.draw();
    //Sets Default Filter
    this.filter('wealthDistribution_now');
};
//Scales Map to Browser
Choropleth.prototype.update = function () {
    this.scale();
};
//Triggered By Filter Selection
Choropleth.prototype.filter = function (filter) {
    this.filter(filter);
};

/*
Instantiation
*/

var choropleth = new Choropleth({
    "geoData"      :   "js/json/world-data.json",
    "coreData"     :   "js/json/core-data.json",
    "wrapper"      :   "#map-wrapper",
    "container"    :   "#map-container",
    "strokeWidth"  :   "1px",
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
    choropleth.filter(filter);
});