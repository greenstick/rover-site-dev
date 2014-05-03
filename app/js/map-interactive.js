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
        map.layers      =   args.layers - 1     ||   4,
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

        //Observables
        map.metric      =   ko.observable(),
        map.keyLabels   =   ko.observableArray([]),
        map.filterText  =   ko.observable(),
        map.description =   ko.observable(),
        map.background  =   ko.observable('present'),

/*
'Private' Methods
*/
        //Bucketing / Quantization Function
        //Accepts Value, Range (max and min), the Number of Layers to Map to the Range, A Color (Makes Use of User Defined Gradients in CSS), and a Sort Order
        map.bucket = function (value, max, min, layers, color, sort) {
            //If Descending Sort Descending Else Default to Ascending
            var bucket = d3.scale.quantize().domain([max, min]).range(d3.range(layers).map(function (i) {
                 return (sort === "descending" || sort == "dsc" || sort === 0) ? color + "-" + (layers - i) : color + "-" + i;
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
            var arr = [], temp = [];
            d3.json(map.coreData, function (data) {
                //Create Array of Data Values with Requested Chronology
                for (var i = 0; i < data[filter].countries.length; i++) {
                    arr.push(data[filter].countries[i][chrono]);
                };
                //Set Max & Min From Array
                var max = Math.max.apply(null, arr),
                    min = Math.min.apply(null, arr);
                //Loop Through Values, Bucket / Quantize Values by Appending a Dynamic CSS Class to Element with Correct ID
                for (var i = 0; i < data[filter].countries.length; i++) {
                    //Skips Null Values, Ideally no Null Values Would Exist - They Would Be Represented by A Base Numberic Value, i.e. 0
                    if (data[filter].countries[i][chrono] != null) {
                        d3.select('#' + data[filter].countries[i].id).attr('class', function (d) {
                            //Bucket Country Data - Searches for Specifc Layer Count and Sort Function in map.coreData Object, Otherwise Defaults to Values Set on Init
                            var bucket = map.bucket(data[filter].countries[i][chrono], max, min, (data[filter].layers || map.layers), data[filter].color, (data[filter].sort || map.sort));
                                //Holds all CSS Classes Being Used to Color Map Elements - There Are Duplicates
                                temp.push(bucket);
                                return bucket + " " + map.pathClass;
                        });
                    };
                };
                //Generate Key
                map.generateKey(filter, data, temp);
                //Update Dropdown
                map.dropdown(filter, data);
            });
            //Cache Filter
            this.currentFilter = filter;
            //Execute Callback
            typeof callback == 'function' ? callback() : void(0);
        },

        //Seperate Unique Key Color Values and Push to keyLabels Observable Array, then Retrieve Key Filter Metric and Set to Observable
        map.generateKey = function (filter, data, array) {
            var temp = [], arr = new Array(data[filter].layers);
            //Reset Key Colors Observable Array
            map.keyLabels([]);
            //Create Array with Unique Color Class Values
            for (var i = 0; i < array.length; i++) {
                if($.inArray(array[i], temp) === -1) {
                    temp.push(array[i]);
                };
            };
            //Order Temp Array to Correctly Output Color Gradient
            for (var i = 0; i < temp.length; i++) {
                var position = parseInt(temp[i].split('-')[1]);
                arr.splice(position, 1, temp[i]);
            };
            //Push Unique Values to Observable Array
            for (var i = 0; i < arr.length; i++) {
                map.keyLabels.push({color: arr[i], label: data[filter].labels[i]});
            };
            //Set Key Metric Text
            map.metric(data[filter].metric);
            //Set Callout Text
            map.description(data[filter].description);
        },

        map.dropdown = function (filter, data, array) {
            //Set Selected Filter Text
            map.filterText(data[filter].title);
        },

        //Caches and Returns Selected Chronology
        map.chronology = function (chrono) {
            this.chronoCache = chrono || this.chronoCache;
            map.background(this.chronoCache);
            return this.chronoCache;
        };
};

/*
Public Methods
*/

//Draws Map and Sets Initial Filter
Choropleth.prototype.init = function () {
    this.draw();
};
//Triggered by Filter Selection
Choropleth.prototype.updateFilter = function (filter) {
    this.filter(filter, this.chronoCache || 'present');
};
//Triggered by Chronology Toggle
Choropleth.prototype.updateChronology = function (chrono) {
    this.filter(this.currentFilter, this.chronology(chrono));
};

var choropleth = new Choropleth({
    "geoData"      :   "js/json/world-data.json",
    "coreData"     :   "js/json/core-data.json",
    "wrapper"      :   "#map-wrapper",
    "container"    :   "#map-container",
    "strokeWidth"  :   "0px",
    "scale"        :   "1.2",
    "projection"   :   "mercator",
    "width"        :   1920,
    "height"       :   1080,
    "translateX"   :   300,
    "translateY"   :   350
});

//Apply Bindings
ko.applyBindings(choropleth);
//Initialize
choropleth.init();
//Set Filter to Default
choropleth.updateFilter('wealthDistribution', 'present');


/*
Event Bindings
*/

$('.dropdown').on("click", function () {
    if ($(this).hasClass('active')) {
        $(this).removeClass('active');
    } else {
        $(this).addClass('active');
    };
});
$('.dropdown').on("mouseout", function () {
    $(this).removeClass('active');
});
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