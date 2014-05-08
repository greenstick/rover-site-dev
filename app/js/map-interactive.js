(function () {

/*
Utility Functions
*/

    var commaNumbers = function (number) {
        var str = number.toString().split('.');
            if (str[0].length >= 4) {
                str[0] = str[0].replace(/(\d)(?=(\d{3})+$)/g, '$1,');
            }; 
            if (str[1] && str[1].length >= 5) {
                str[1] = str[1].replace(/(\d{3})/g, '$1 ');
            };
        return str.join('.');
    };

/*
Data-Driven Choropleth Prototype Object
@Params: object                 -   (object,            required)
         object.geoData         -   (geoJSON,           required)   Draws Choropleth
         object.coreData        -   (JSON,              required)   Data to be Bound to Choropleth
         object.wrapper         -   (string,            optional)
         object.container       -   (string,            optional)
         object.projection      -   (string,            optional)   See options: https://github.com/mbostock/d3/wiki/Geo-Projections
         object.stroke          -   (string,            optional)
         object.strokeWidth     -   (string,            optional)
         object.strokeHover     -   (string,            optional)   Stroke Width on Hover
         object.width           -   (number,            optional)
         object.height          -   (number,            optional)
         object.scale           -   (number,            optional)
         object.translateX      -   (number,            optional)
         object.translateY      -   (number,            optional)
         object.layers          -   (number,            optional)   Number of Color Layers - CSS Dependent
         object.pathClass       -   (string,            optional)   Name of CSS Class for Land Masses
         object.sort            -   (string/number,     optional)   Sort of Colors - Values Accepted: 'ascending', 'asc', 1, 'descending', 'dsc', 0
         object.tooltip         =   (array,             optional)   Array of Data Binding Targets
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
            map.tooltip     =   args.tooltip        ||   false,
            map.chronoCache,  //Declaring Chronology Cache
            map.loadedData,

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
            map.svg         =   d3.select(map.container).append('svg').attr('width', '100%').attr('height', '100%').attr('viewBox', '0 0 ' + map.width + ' ' + map.height),
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

            
            //XHR Geo Data & Core Data - Deferred Objects
            map.loadData = function () {
                var map = this;
                queue().defer(d3.json, map.geoData).defer(d3.json, map.coreData).await(map.loaded);
            },

            //Once Core Data is Loaded, Draw Choropleth & Initialize First Filter
            map.loaded = function (error, geoData, coreData) {
                map.loadedData = coreData;
                map.draw(geoData);
                map.filter('wealthDistribution', 'present', map.loadedData);
                map.setEvents();
            },

            //Draw Choropleth, Then Assign IDs - Callback Optional
            map.draw = function (data, callback) {
                map.world.selectAll('path')
                    .data(data.features).enter()
                    .append('path')
                    .attr('d', map.path)
                    .attr('id', function (d) { return d.id; })
                    .attr('class', map.pathClass)
                    .attr('stroke', map.stroke)
                    .attr('stroke-width', map.strokeWidth);
                //Execute Callback
                typeof callback == 'function' ? callback() : void(0);
            },

            //Parse Filter Argument, XHR Data, Apply Quantize Function, Then Bind to Elements - Callback Optional
            map.filter = function (filter, chrono, data, callback) {
                var data = data || map.loadedData;
                // d3.json(map.coreData, function (data) {
                    var chronology = [], colors = [];
                    //Check If Map Should be Rendered Using Image or Data
                    if (data[filter].image.length) {
                        //Construct Color 
                        for (var i = 0; i < data[filter].colorClasses.length; i++) {
                            colors.push(data[filter].colorClasses[i]);
                        };
                    } else {
                        //Create Array of Data Values with Requested Chronology
                        for (var i = 0; i < data[filter].countries.length; i++) {
                            chronology.push(data[filter].countries[i][chrono]);
                        };
                        //Set Max & Min From Array
                        var max = Math.max.apply(null, chronology),
                            min = Math.min.apply(null, chronology);
                        //Loop Through Values, Bucket / Quantize Values by Appending a Dynamic CSS Class to Element with Correct ID
                        for (var i = 0; i < data[filter].countries.length; i++) {
                            //Skips Null Values, Ideally no Null Values Would Exist - They Would Be Represented by A Base Numberic Value, i.e. 0
                            if (data[filter].countries[i][chrono] != null) {
                                d3.select('#' + data[filter].countries[i].id).attr('class', function (d) {
                                    //Bucket Country Data - Searches for Specifc Layer Count and Sort Function in map.coreData Object, Otherwise Defaults to Values Set on Init
                                    var bucket = map.bucket(data[filter].countries[i][chrono], max, min, (data[filter].layers || map.layers), data[filter].color, (data[filter].sort || map.sort));
                                        //Array Holds all CSS Classes Being Used to Color Map Elements - 
                                        colors.push(bucket);
                                        return bucket + " " + map.pathClass;
                                });
                            };
                        };
                    };
                    //Generate Key
                    map.generateKey(filter, data, colors, (data[filter].sort || map.sort));
                    //Update Dropdown
                    map.dropdown(filter, data);
                // });
                //Cache Filter
                this.currentFilter = filter;
                //Execute Callback
                typeof callback == 'function' ? callback() : void(0);
            },

            //Bucketing / Quantization Function
            //Accepts Value, Range (max and min), the Number of Layers to Map to the Range, A Color (Makes Use of User Defined Gradients in CSS), and a Sort Order
            map.bucket = function (value, max, min, layers, color, sort) {
                //If Descending Sort Descending Else Default to Ascending
                var bucket = d3.scale.quantize().domain([max, min]).range(d3.range(layers).map(function (i) {
                     return (sort === "descending" || sort == "dsc" || sort === 0) ? color + "-" + (layers - (i + 1)) : color + "-" + i;
                }));
                return bucket(value);
            },

            //Seperate Unique Key Color Values and Push to keyLabels Observable Array, then Retrieve Key Filter Metric and Set to Observable
            map.generateKey = function (filter, data, array, sort) {
                var temp = [], arr = new Array(data[filter].layers), difference;
                //Reset Key Colors Observable Array
                map.keyLabels([]);
                //Create Array with Unique Color Classes Being Displayed
                for (var i = 0; i < array.length; i++) {
                    if($.inArray(array[i], temp) === -1) {
                        temp.push(array[i]);
                    };
                };
                //Set Difference Between Number of Color Classes Being Used and 
                difference = data[filter].layers - (temp.length - 1);
                //Order Temp Array to Correctly Output Color Gradient
                for (var i = 0; i < temp.length; i++) {
                    //Create Gradient Color Based on Sort Function
                    var position = (sort === "descending" || sort == "dsc" || sort === 0) ? parseInt(temp[i].split('-')[1] - (data[filter].layers)) : parseInt((data[filter].layers  - difference) - (temp[i].split('-')[1]));
                    arr.splice(position, 1, temp[i]);
                };
                //Push Unique Values to Observable Array
                for (var i = 0; i < arr.length; i++) {
                    map.keyLabels.push({color: arr[i], label: data[filter].labels[i]});
                };
                //Set Key Metric Text
                map.metric(data[filter].metric);
                //Set Callout Text
                map.description(data[filter].description.toUpperCase());
            },

            map.dropdown = function (filter, data, array) {
                //Set Selected Filter Text
                map.filterText(data[filter].title);
            },

            //Caches and Returns Selected Chronology, Sets Map Background Based on Selected Chronology
            map.chronology = function (chrono) {
                this.chronoCache = chrono || this.chronoCache;
                map.background(this.chronoCache);
                return this.chronoCache;
            },

            //Set Events Driven by Data-Bound Elements
            map.setEvents = function () {
                //Country Mouseover
                d3.selectAll('.' + map.pathClass).on('mouseover', function (e) {
                    map.bindCountryData(map.currentFilter, e.id, map.tooltip);
                });
                //Country Mouse Over     
                $('.country').on("click mouseover", function (e) {
                    $("#map-tooltip").toggleClass('active')
                        .css("position", "absolute")
                        .css("top", (e.pageY + -160) + "px")
                        .css("left", (e.pageX + -160) +"px");
                });
                //Country Mouse Out
                $('.country').on("mouseout", function (e) {
                    $("#map-tooltip").removeClass('active');
                    d3.selectAll('.' + map.pathClass).attr('stroke-width', map.strokeWidth);
                });
            },

            //Retrieve Country Data
            map.bindCountryData = function (filter, country, target) {
                var obj;
                //Retrieve Selected Country Data Object
                for (var i = 0; i < map.loadedData[filter].countries.length; i++) {
                    if (map.loadedData[filter].countries[i].id === country) {
                       obj = map.loadedData[filter].countries[i];
                       break;
                    };
                };
                //Highlight Selected Country
                d3.selectAll('.' + map.pathClass).attr('stroke-width', map.strokeWidth);
                d3.select('#' + obj.id).attr('stroke-width', map.strokeHover);
                //Loop Through Selecting Target Elements and Bind Data
                for (var i = 0; i < target.length; i++) {
                    var value;
                    if (typeof obj[target[i]] === 'number') {
                        value = commaNumbers(obj[target[i]]);
                    } else {
                        value = (obj[target[i]]).toUpperCase();
                    }; 
                    d3.select('#' + map.pathClass + '-' + target[i]).text(target[i].toUpperCase() + ": " + value);
                };
            };
    };

/*
Public Methods
*/

    //Draws Map and Sets Initial Filter
    Choropleth.prototype.init = function () {
        this.loadData();
        this.setEvents();
    };

    //Triggered by Filter Selection
    Choropleth.prototype.updateFilter = function (filter) {
        this.filter(filter, this.chronoCache || 'present');
    };

    //Triggered by Chronology Toggle
    Choropleth.prototype.updateChronology = function (chrono) {
        this.filter(this.currentFilter, this.chronology(chrono));
    };

/*
Instantiation
*/

    var choropleth = new Choropleth({
        "geoData"      :   "js/json/world-data.json",
        "coreData"     :   "js/json/core-data.json",
        "wrapper"      :   "#map-wrapper",
        "container"    :   "#map-container",
        "stroke"       :   "rgba(0, 0, 0, .8)",
        "strokeWidth"  :   "0px",
        "strokeHover"  :   "1px",
        "scale"        :   "1.2",
        "projection"   :   "mercator",
        "width"        :   1298,
        "height"       :   730,
        "translateX"   :   64,
        "translateY"   :   152,
        "tooltip"      :   ["country", "present", "future"]
    });

/*
Apply Bindings & Initialize
*/

    //Apply Bindings
    ko.applyBindings(choropleth);
    //Initialize
    choropleth.init();


/*
Event Bindings
*/
    //Exit Map Intro Modal
    $('#map-intro .exit').on("click", function () {
        $('#map-intro').fadeOut();
    });
    //Drop Down Click & Mouseover
    $('.dropdown').on("click mouseover", function () {
        $(this).addClass('active');
    });
    //Drop Down Mouseout
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

}(jQuery, d3, ko));