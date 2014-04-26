/*
Data-Driven Choropleth Prototype Object
@Params: object                 -   (object, required)
         object.geoData         -   (geoJSON, required)
         object.coreData        -   (JSON, required)
         object.wrapper         -   (string, optional)
         object.container       -   (string, optional)
         object.projection      -   (string, optional)
         object.stroke          -   (string, optional)
         object.stroke-width    -   (string, optional)
         object.width           -   (number, optional)
         object.height          -   (number, optional)
         object.scale           -   (number, optional)
         object.translateX      -   (number, optional)
         object.translateY      -   (number, optional)
*/

var Choropleth = function (args) {
    var map = this;
        //Setup Object With Args
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
        //Stores Instantiated Settings (Prior to D3 Manipulation)
        map.settings    =   {
                                geoData     : map.geoData,
                                coreData    : map.coreData,
                                wrapper     : map.wrapper,
                                container   : map.container,
                                projection  : map.projection, 
                                stroke      : map.stroke,
                                strokeWidth : map.strokeWidth,
                                width       : map.width,
                                height      : map.height,
                                scale       : map.scale,
                                translateX  : map.translateX,
                                translateY  : map.translateY
                            },
        //D3 Setup
        map.projection  =   d3.geo[map.projection](),
        map.svg         =   d3.select(map.container).append('svg').attr('width', map.width).attr('height', map.height),
        map.path        =   d3.geo.path().projection(map.projection),
        map.world       =   map.svg.append('g').attr('id', 'world').attr('transform', 'scale(' + map.scale + '), translate(' + map.translateX + ', ' + map.translateY + ')');

/*
'Private' Functions
*/

        //Draws Map
        map.draw = function (callback) {
            //XHR Geo Data, Draw, & Assign IDs
            d3.json(map.geoData, function (data) {
                    map.world.selectAll('path')
                        .data(data.features).enter()
                        .append('path')
                        .attr('d', map.path)
                        .attr('id', function (d) {
                            // console.log(d)
                            return d.properties.name;
                        })
                        .attr('stroke', map.stroke)
                        .attr('stroke-width', map.strokeWidth);
            });
            //XHR Vizualization Data, 
            d3.json(map.coreData, function (data) {
                var data = data;
                    map.world.selectAll('path')
                        .attr('class', function (d) {
                            // console.log(d);
                        });
            });

            //Execute Callback
            typeof callback == 'function' ? callback() : void(0);
        };
        //Scale Map
        map.scale = function () {

        };
};

/*
Public Functions
*/

Choropleth.prototype.init = function () {
    this.draw();
    console.log(this.settings);
};

Choropleth.prototype.update = function () {
    this.scale();
};

/*
Instantiation
*/

var mapInteractive = new Choropleth({
    "geoData"      :   "js/json/world-data.json",
    "coreData"     :   "js/json/core-data.json",
    "wrapper"      :   "#map-wrapper",
    "container"    :   "#map-container",
    "strokeWidth"  :   "0px",
    "stroke"       :   "pink",
    "scale"        :   ".9",
    "projection"   :   "mercator",
    "width"        :   980,
    "height"       :   600,
    "translateY"   :   180
});

//Initialize
mapInteractive.init();