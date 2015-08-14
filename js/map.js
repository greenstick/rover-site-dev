////////////////////////////////////////////////////////////////////////////////////////////////////////

/*
Map Interactive View Model
*/

////////////////////////////////////////////////////////////////////////////////////////////////////////

(function () {

/*
Utility Functions
*/

    //Pretties up Numbers With Some Nice Commas
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
Data-Driven Choropleth Prototype Object Parameter Map
@Params: object                     -   (object,            required)
         object.geoData             -   (geoJSON,           required)   Draws Choropleth
         object.coreData            -   (JSON,              required)   Data to be Bound to Choropleth
         object.wrapper             -   (string,            optional)   Map Wrapper Element
         object.container           -   (string,            optional)   Map Container Element
         object.projection          -   (string,            optional)   See options: https://github.com/mbostock/d3/wiki/Geo-Projections
         object.stroke              -   (string,            optional)   Default Stroke Color
         object.strokeWidth         -   (string,            optional)   Default Stroke Width
         object.strokeHover         -   (string,            optional)   Stroke Width on Hover
         object.width               -   (number/string(%),  optional)   SVG Width (Accepts Number and Percentage as String)
         object.height              -   (number/string(%),  optional)   SVG Height (Accepts Number and Percentage as String)
         object.viewBoxX            -   (number,            optional)   Set SVG Viewbox X
         object.viewBoxY            -   (number,            optional)   Set SVG Viewbox Y
         object.scale               -   (number,            optional)   Scale Map g Element Y
         object.translateX          -   (number,            optional)   Translate Map g Element X
         object.translateY          -   (number,            optional)   Translate Map g Element Y
         object.layers              -   (number,            optional)   Number of Color Layers - CSS Dependent
         object.pathClass           -   (string,            optional)   Name of CSS Class for Land Masses
         object.bgPath              -   (string,            optional)   Background Image File Path
         object.bgImgType           -   (string,            optional)   Image File Format
         object.sort                -   (string/number,     optional)   Sort of Colors - Values Accepted: 'ascending', 'asc', 1, 'descending', 'dsc', or 0
         object.ttObj               -   (object,            optional)   Tool Tip Settings Object
         object.ttObj.ttElement     -   (string,            optional)   Tool Tip Element
         object.ttObj.ttClasses     -   (array,             optional)   Array of Data Binding Targets
         object.ttObj.ttOffsetX     -   (number,            optional)   Tool Tip Offset X
         object.ttObj.ttOffsetY     -   (number,            optional)   Tool Tip Offset Y
         object.ttObj.ttFollow      -   (boolean,           optional)   Whether Tool Tip Has a Fixed Position or Should Follow Mouse
         object.defaults            -   (object,            required)   Default Filter and Chronology Settings Object
         object.defaults.filter     -   (string,            required)   Default Filter - Required if Default Object is Present
         object.defaults.chronology -   (string,            required)   Default Time Frame - Required if Default Object is Present
*/

    var Choropleth = function (args) {
        var map = this;
            //Setup Prototype With Arguments
            map.geoData     =   args.geoData,
            map.coreData    =   args.coreData,
            map.wrapper     =   args.wrapper                ||   "#interactiveWrapper",
            map.container   =   args.container              ||   "#container",
            map.projection  =   args.projection             ||   "mercator",
            map.stroke      =   args.stroke                 ||   "#000000",
            map.strokeWidth =   args.strokeWidth            ||   "2px",
            map.width       =   args.width                  ||   "100%",
            map.height      =   args.height                 ||   "100%",
            map.viewBoxX    =   args.viewBoxX               ||   1020,
            map.viewBoxY    =   args.viewBoxY               ||   680,
            map.scale       =   args.scale                  ||   1,
            map.translateX  =   args.translateX             ||   0,
            map.translateY  =   args.translateY             ||   0,
            map.layers      =   args.layers - 1             ||   4,
            map.pathClass   =   args.pathClass              ||   "country",
            map.bgPath      =   args.bgPath                 ||   "../img/map-interactive/background-",
            map.bgImgType   =   args.bgImgType              ||   ".png",
            map.sort        =   args.sort                   ||   "ascending",

            //Hover Tooltip Arguments
            map.ttObj       =   args.tooltip                ||   null,
            map.ttElement   =   args.tooltip.ttElement      ||   false,
            map.ttClasses   =   args.tooltip.ttClasses      ||   false,
            map.ttOffsetX   =   args.tooltip.ttOffsetX      ||   null,
            map.ttOffsetY   =   args.tooltip.ttOffsetY      ||   null,
            map.ttFollow    =   args.tooltip.ttFollow       ||   true,

            //Default Filter & Chronology
            map.defaults    =   args.defaults,
            map.defFilter   =   args.defaults.filter,
            map.defChrono   =   args.defaults.chronology,    

            //Caches
            map.chronoCache,
            map.loadedData,

            //Stores Instantiated Settings (Prior to D3 Manipulation) - For Extensibilities Sake
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
                                    translateY      :   map.translateY,
                                    layers          :   map.layers,
                                    pathClass       :   map.pathClass,
                                    sort            :   map.sort,
                                    ttObj           :   map.ttObj,
                                    defaults        :   map.defaults
                                },

            //D3 Setup
            map.projection  =   d3.geo[map.projection](),
            map.svg         =   d3.select(map.container).append('svg').attr('width', map.width).attr('height', map.height).attr('viewBox', '0 0 ' + map.viewBoxX + ' ' + map.viewBoxY),
            map.path        =   d3.geo.path().projection(map.projection),
            map.world       =   map.svg.append('g').attr('id', 'world').attr('transform', 'scale(' + map.scale + '), translate(' + map.translateX + ', ' + map.translateY + ')'),

            //Observables
            map.metric      =   ko.observable(),
            map.keyLabels   =   ko.observableArray([]),
            map.filterText  =   ko.observable(),
            map.description =   ko.observable(),
            map.dataSource  =   ko.observable(),
            map.background  =   ko.observable(),

/*
Function Specific Methods
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
                map.filter(map.defFilter, map.defChrono, map.loadedData);
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
                var data = data || map.loadedData, chronology = [], colors = [], max, min;
                //Check If Map Should be Rendered Using Image or Data
                if (data[filter].image.length) {
                    //Construct Color 
                    for (var i = 0; i < data[filter].colorClasses.length; i++) {
                        colors.push(data[filter].colorClasses[i]);
                    };
                } else {
                    //Create Array of Data Values with Requested Chronology
                    for (var i = 0; i < data[filter].countries.length; i++) {
                        if (data[filter].countries[i][chrono] !== null) {
                            chronology.push(data[filter].countries[i][chrono]);
                        };
                    };
                    //Set Max & Min From Array
                    max = Math.max.apply(null, chronology),
                    min = Math.min.apply(null, chronology);
                    //Loop Through Values, Bucket / Quantize Values by Appending a Dynamic CSS Class to Element with Correct ID
                    for (var i = 0; i < data[filter].countries.length; i++) {
                        //Skips Null Values, Ideally no Null Values Would Exist - They Would Be Represented by A Base Numberic Value, i.e. 0
                        if (data[filter].countries[i][chrono] !== null) {
                            d3.select('#' + data[filter].countries[i].id).attr('class', function (d) {
                                //Bucket Country Data - Searches for Specifc Layer Count and Sort Function in map.coreData Object, Otherwise Defaults to Values Set on Init
                                var color = map.bucket(data[filter].countries[i][chrono], max, min, (data[filter].layers || map.layers), data[filter].color, (data[filter].sort || map.sort));
                                    //Array Holds all CSS Classes Being Used to Color Map Elements - 
                                    colors.push(color);
                                    return color + " " + map.pathClass;
                            });
                        //If Null Value, Remove Previous Color Class to Enable Default CSS Color Class
                        } else {
                            d3.select('#' + data[filter].countries[i].id).attr('class', map.pathClass);
                        };
                    };
                };
                //Generate Key
                map.generateKey(filter, chrono, data, colors, (data[filter].sort || map.sort), max, min);
                //Update Dropdown
                map.dropdown(filter, data);
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
                    // console.log("Layer " + (i + 1) + " value: " + ((((max - min) / layers) * i) + min) + " - " + ((((max - min) / layers) * (i + 1)) + min));
                    return (sort === "descending" || sort == "dsc" || sort === 0) ? color + "-" + (layers - (i + 1)) : color + "-" + i;
                }));
                return bucket(value);
            },

            //Seperate Unique Key Color Values and Push to keyLabels Observable Array, then Retrieve Key Filter Metric and Set to Observable
            map.generateKey = function (filter, chrono, data, array, sort, max, min) {
                var temp = [], arr = new Array(data[filter].layers), difference, splitValue = ((max - min) / data[filter].layers).toFixed(0);
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
                    //Order Gradient Colors Based on Sort Function
                    var position = (sort === "descending" || sort == "dsc" || sort === 0) ? parseInt(temp[i].split('-')[1] - (data[filter].layers)) : (data[filter].layers - temp[i].split('-')[1] - 1);
                    arr.splice(position, 1, temp[i]);
                };
                //Push Unique Values to Observable Array
                for (var i = 0; i < arr.length; i++) {
                    //This Was Going to be Used to Dynamically Generate The Labels
                    // map.keyLabels.push({color: arr[i], label: (min + (splitValue * i) + " - " + (min + (splitValue * (i + 1))))});
                    //The Quick Hack - Pull Labels From Array in JSON Object
                    map.keyLabels.push({color: arr[i], label: data[filter].labels[chrono][i]})
                };
                //Set Key Metric Text
                map.metric(data[filter].metric);
                //Set Callout Text
                map.description(data[filter].description.toUpperCase());
                //Set Data Source
                map.dataSource(data[filter].source.toUpperCase());
            },

            map.dropdown = function (filter, data, array) {
                //Set Selected Filter Text
                map.filterText(data[filter].title);
            },

            //Caches and Returns Selected Chronology
            map.chronology = function (chrono) {
                this.chronoCache = chrono || this.chronoCache || this.defChrono;
                return this.chronoCache;
            },

            //Sets Map Background Based on Selected Chronology or Chronology Cache or Default Chronology
            map.setBackground = function (chrono) {
                map.background(map.bgPath + (chrono || this.chronoCache || this.defChrono) + this.bgImgType);
            },

            //Place Events Driven by Data-Bound Elements Here
            map.setEvents = function () {
                if (map.tooltip !== null) {
                    //Country Mouse Over - D3
                    d3.selectAll('.' + map.pathClass).on('mouseover', function (e) {
                        map.bindCountryData(map.currentFilter, e.id, map.ttClasses);
                    });
                    //Display Tooltip on Country Mouseover
                    $('.' + map.pathClass).on("click mouseover", function (e) {
                        var pos, ttPos;
                        if (map.ttFollow === true) {
                            pos = $(map.wrapper).offset();
                            $("#" + map.ttElement).toggleClass('active')
                                .css("position", "absolute")
                                .css("left", (e.pageX + map.ttOffsetX) +"px")
                                .css("top", (e.pageY - pos.top + map.ttOffsetY) + "px");
                        } else {
                            ttPos = $('#' + map.ttElement).offset()
                            $("#" + map.ttElement).toggleClass('active')
                                .css("position", "absolute")
                                .css("left", (ttPos.left + map.ttOffsetX) +"px")
                                .css("top", (ttPos.top + map.ttOffsetY) + "px");
                        };
                    });
                    //Country Mouse Out
                    $('.' + map.pathClass).on("mouseout", function (e) {
                        $("#" + map.ttElement).removeClass('active');
                        d3.selectAll('.' + map.pathClass).attr('stroke-width', map.strokeWidth);
                    });
                };
            },

            //A Nasty Formatting Function - Hopefully I'll Have Some Time to Come Up With a More Extensible Solution
            map.formatData = function (filter, data) {
                var format = map.loadedData[filter].format, output;
                //If Format is Not Null...
                if (format != null) {
                    //And the Format is Not an Object...
                    if (typeof format !== 'object') {
                        //And the Data is a Number...
                        if (typeof data === 'number') {
                            //And the Format is Monetary
                            if (format == 'monetary') {
                                output = "$" + commaNumbers(data);
                            //Or a Percentage
                            } else if (format == 'percentage') {
                                output = data + "%";
                            //Or Just a Regular Numbers
                            } else {
                                output = commaNumbers(data);
                            };
                        //Or If The Format Is Not an Object and the Data is a String
                        } else if (typeof data === 'string') {
                            output = data.toUpperCase();
                        //If The Format Is Not an Object, String, or Number, Just Output the Unformatted Datapoint
                        } else {
                            output = data;
                        };
                    //If the Format is an Object
                    } else if (typeof format === 'object') {
                        //Which Has a Property Called Array but the Data is a String (In This Use Case, The Country Name)
                        if (format.array && typeof data === 'string') {
                            output = data.toUpperCase();
                        //Which Has a Property Called Array and the Data is Not a String
                        } else {
                            output = format.array[data - 1];
                        };
                    //If Neither of The Above Conditions are Met, Default to Regular Output
                    } else {
                        output = data;
                    };
                //If Format Is Null Output Regular Data
                } else {
                    output = data;
                };
                //And then, Finally, Return The Output
                return output;
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
                    //If Value is a Number, Format With Commas, Otherwise Set String to Upper Case
                    value = (obj[target[i]] !== null) ? this.formatData(filter, obj[target[i]]) : "N/A";
                    //Set Tool Tip Text Values to Country Data
                    d3.select('#' + map.pathClass + '-' + target[i] + " .data").text(value);
                };
            };
    };

/*
Macro Methods
*/

    //Draws Map and Sets Initial Filter
    Choropleth.prototype.init = function () {
        this.loadData();
        this.setBackground(this.chronology());
    };

    //Triggered by Filter Selection
    Choropleth.prototype.updateFilter = function (filter) {
        this.filter(filter, this.chronoCache || this.defChrono);
    };

    //Triggered by Chronology Toggle
    Choropleth.prototype.updateChronology = function (chrono) {
        this.filter(this.currentFilter, this.chronology(chrono));
        this.setBackground();
    };

/*
Instantiation
*/
    //Define Choropleth Arguments
    var arguments = {
        "geoData"      :   "js/json/world-data.json",
        "coreData"     :   "js/json/core-data.json",
        "wrapper"      :   "#map-wrapper",
        "container"    :   "#map-container",
        "stroke"       :   "rgba(0, 0, 0, .5)",
        "strokeWidth"  :   "0px",
        "strokeHover"  :   "1px",
        "scale"        :   "1.2",
        "projection"   :   "mercator",
        "viewBoxX"     :   1298,
        "viewBoxY"     :   672,
        "translateX"   :   64,
        "translateY"   :   152,
        "bgPath"       :   'img/map-interactive/background-',
        "bgImgType"    :   '.jpg',
        "tooltip"      :   {
            "ttElement"    :   "map-tooltip",
            "ttClasses"    :   ["country", "present", "future"],
            "ttOffsetX"    :   10,
            "ttOffsetY"    :   -110
        },
        "defaults"     :   {
            "filter"       :   "economicWealth",
            "chronology"   :   "present"   
        }
    },

    //New Choopleth
    choropleth = new Choropleth(arguments);

/*
Apply Bindings & Initialize
*/

    //Apply Bindings
    ko.applyBindings(choropleth, document.getElementById("map"));
    //Initialize
    choropleth.init();


/*
Event Bindings
*/

    /*
    NOT FINISHED - TO STOP EVENT BUBBLING
    */
    $('#map-tooltip').on("mouseover mouseenter mouseleave", function (e) {
        e.stopPropagation();
    });
    //Exit Map Intro Modal
    $('#map-mask .exit').on("click", function () {
        $('#map-mask').fadeOut();
    });
    //Drop Down Click & Mouseover
    $('.dropdown').on("click mouseenter", function () {
        $(this).addClass('active');
    });
    //Drop Down Mouseout
    $('.dropdown').on("mouseleave", function () {
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