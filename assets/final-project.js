"use strict";



define('final-project/app', ['exports', 'ember', 'final-project/resolver', 'ember-load-initializers', 'final-project/config/environment'], function (exports, _ember, _resolver, _emberLoadInitializers, _environment) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });


  var App = _ember.default.Application.extend({
    modulePrefix: _environment.default.modulePrefix,
    podModulePrefix: _environment.default.podModulePrefix,
    Resolver: _resolver.default
  });

  (0, _emberLoadInitializers.default)(App, _environment.default.modulePrefix);

  exports.default = App;
});
define('final-project/components/line-chart', ['exports', 'ember', 'd3-scale', 'd3-axis', 'd3-selection', 'd3-array', 'd3-shape', 'd3-collection'], function (exports, _ember, _d3Scale, _d3Axis, _d3Selection, _d3Array, _d3Shape, _d3Collection) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = _ember.default.Component.extend({
    groupBy: "make",
    rollup: "comb08",
    filter: "",
    rollupPretty: { "comb08": "MPG", "displ": "Displacement in Liters" },

    init: function init() {
      var _this = this;

      this._super.apply(this, arguments);
      this.margin = { top: 20, right: 40, bottom: 30, left: 40 };
      this.width = 900 - this.margin.left - this.margin.right;
      this.height = 500 - this.margin.top - this.margin.bottom;

      this.x = (0, _d3Scale.scaleBand)().range([30, this.width]).padding(0.5);

      this.y = (0, _d3Scale.scaleLinear)().range([this.height, 0]);

      this.yRight = (0, _d3Scale.scaleLinear)().range([this.height, 0]);

      this.line = (0, _d3Shape.line)().x(function (d) {
        return _this.x(d.key);
      }).y(function (d) {
        return _this.y(d.value);
      });

      this.lineRight = (0, _d3Shape.line)().x(function (d) {
        return _this.x(d.key);
      }).y(function (d) {
        return _this.yRight(d.value);
      });

      this.updateAxes();
    },
    updateAxes: function updateAxes() {
      this.xAxis = (0, _d3Axis.axisBottom)(this.x).tickFormat(function (d) {
        return d.toString().slice(-2);
      });
      this.yAxis = (0, _d3Axis.axisLeft)(this.y).ticks(10, 's');
      this.yRightAxis = (0, _d3Axis.axisRight)(this.yRight).ticks(10, 's');
    },
    didInsertElement: function didInsertElement() {
      this._super.apply(this, arguments);

      var svg = (0, _d3Selection.select)("#" + this.get("chartId")).attr("width", this.width + this.margin.left + this.margin.right * 3).attr("height", this.height + this.margin.top + this.margin.bottom).append("g").attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");

      svg.append("g").attr("class", "x axis").attr("transform", "translate(0," + this.height + ")").call(this.xAxis);

      svg.append("g").attr("class", "y axis").call(this.yAxis);

      if (this.get("secondRollup")) {
        svg.append("g").attr("class", "y right-axis").attr("transform", "translate( " + (this.width + 30) + ", 0 )").call(this.yRightAxis);
      }

      this.updateChart();
    },
    didUpdateAttrs: function didUpdateAttrs() {
      this._super.apply(this, arguments);
      this.updateChart();
    },
    updateChart: function updateChart() {
      var rawData = this.get('data');

      if (!rawData) return;

      var filter = this.get("filter");
      var modelFilter = this.get("modelFilter");
      var data = void 0;

      if (modelFilter && modelFilter !== "_none_") {
        data = rawData.filterBy("model", modelFilter);
      } else {
        data = filter ? rawData.filterBy("make", filter) : rawData;
      }
      var secondYearlyRollup = void 0;

      var rollup = this.get("rollup");
      var secondRollup = this.get("secondRollup");
      var groupBy = this.get("groupBy");

      var yearlyRollup = (0, _d3Collection.nest)().key(function (d) {
        return d[groupBy];
      }).key(function (d) {
        return d.year;
      }).rollup(function (d) {
        return (0, _d3Array.mean)(d, function (car) {
          return +car[rollup];
        });
      }).entries(data);

      this.x.domain(data.map(function (d) {
        return d.year;
      }));

      this.y.domain([0, (0, _d3Array.max)(yearlyRollup, function (d) {
        return (0, _d3Array.max)(d.values, function (c) {
          return c.value;
        });
      })]);

      if (secondRollup) {
        secondYearlyRollup = (0, _d3Collection.nest)().key(function (d) {
          return d[groupBy];
        }).key(function (d) {
          return d.year;
        }).rollup(function (d) {
          return (0, _d3Array.mean)(d, function (car) {
            return +car[secondRollup];
          });
        }).entries(data);
        this.yRight.domain([0, (0, _d3Array.max)(secondYearlyRollup, function (d) {
          return (0, _d3Array.max)(d.values, function (c) {
            return c.value;
          });
        })]);
      }

      this.updateAxes();

      var svg = (0, _d3Selection.select)("#" + this.get("chartId")).select("g");

      svg.select(".x.axis").call(this.xAxis);

      svg.select(".y.axis").call(this.yAxis);

      if (secondRollup) {
        svg.select(".y.right-axis").call(this.yRightAxis);
      }

      if (secondRollup) {
        this.drawLines(svg, "rollup1", this.y, this.line, yearlyRollup, false, "MPG");
        this.drawLines(svg, "rollup2", this.yRight, this.lineRight, secondYearlyRollup, true, "Displ.");
      } else {
        this.drawLines(svg, "rollup1", this.y, this.line, yearlyRollup);
      }

      var annotation = this.get("annotation");

      if (annotation) {
        this.addAnnotation(svg, annotation);
      }

      svg.append("text").attr("text-anchor", "middle") // this makes it easy to centre the text as the transform is applied to the anchor
      .attr("font-size", "10px").attr("transform", "translate(" + 15 + "," + this.height / 2 + ")rotate(-90)") // text is drawn off the screen top left, move down and out and rotate
      .text(this.get("rollupPretty")[rollup]);

      if (secondRollup) {
        svg.append("text").attr("text-anchor", "middle") // this makes it easy to centre the text as the transform is applied to the anchor
        .attr("font-size", "10px").attr("transform", "translate(" + (this.width + 15) + "," + this.height / 2 + ")rotate(90)") // text is drawn off the screen top left, move down and out and rotate
        .text("Displacement in Liters");
      }

      svg.append("text").attr("font-size", "10px").attr("text-anchor", "middle") // this makes it easy to centre the text as the transform is applied to the anchor
      .attr("transform", "translate(" + this.width / 2 + "," + (this.height - 10) + ")") // centre below axis
      .text("Year");
    },


    annotations: {
      honda: { "y": 0, "x": 729, text: "Honda's average MPG peaks with the Fit EV" },
      dodge: { "y": 0, "x": 798, text: "Dodge's displacement peaks with a dip in average MPG" }
    },

    drawLines: function drawLines(svg, name, fy, yLine, data) {
      var _this2 = this;

      var dotted = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : false;
      var label = arguments.length > 6 && arguments[6] !== undefined ? arguments[6] : "";

      var color = (0, _d3Scale.scaleOrdinal)(_d3Scale.schemeCategory20);

      var lines = svg.selectAll("." + name).data(data);

      var make = lines.enter().append("g");

      var path = make.append("path") // enter
      .attr("class", name).attr("fill", "none").attr("stroke", function (d) {
        return color(d.key);
      }).attr("stroke-linejoin", "round").attr("stroke-linecap", "round").attr("stroke-width", 2).attr("d", function (d) {
        return yLine(d.values);
      });
      var merge = path.merge(lines).attr("fill", "none").attr("stroke", function (d) {
        return color(d.key);
      }).attr("stroke-linejoin", "round").attr("stroke-linecap", "round").attr("stroke-width", 2).attr("d", function (d) {
        return yLine(d.values);
      });

      if (dotted) {
        merge.attr("stroke-dasharray", "3,3");
      }

      var txt = make.append("text").datum(function (d) {
        return { id: d.key, value: d.values[d.values.length - 1] };
      }).attr("transform", function (d) {
        return "translate(" + _this2.x(d.value.key) + "," + fy(d.value.value) + ")";
      }).attr("x", 3).attr("dy", "0.35em").attr("font-size", "11px").attr("fill", function (d) {
        return color(d.id);
      });

      if (label) {

        svg.append("path").attr("fill", "none").attr("stroke", "#1f77b4").attr("stroke-width", 1).attr("d", 'M ' + this.width / 4 * 2 + ' ' + this.height * .9 + ' L ' + (this.width / 4 * 2 + 50) + ' ' + this.height * .9);

        svg.append("text").attr("font-size", "11px").attr("dx", this.width / 4 * 2 + 60).attr("dy", this.height * .9 + 2.5).text("MPG");

        svg.append("path").attr("fill", "none").attr("stroke", "#1f77b4").attr("stroke-width", 1).attr("d", 'M ' + this.width / 4 + ' ' + this.height * .9 + ' L ' + (this.width / 4 + 50) + ' ' + this.height * .9).attr("stroke-dasharray", "3,3");

        svg.append("text").attr("font-size", "11px").attr("dx", this.width / 4 + 60).attr("dy", this.height * .9 + 2.5).text("Displacement");
      } else {
        txt.text(function (d) {
          return d.id;
        });
      }
    },
    addAnnotation: function addAnnotation(svg, name) {
      var a = this.get("annotations")[name];

      svg.append("circle").attr("r", 10).attr("fill", "none").attr("stroke", "gray").attr("stroke-width", 2).attr("cy", 0).attr("stroke-dasharray", "3,3").attr("cx", a.x);

      svg.append("path").attr("fill", "none").attr("stroke", "black").attr("stroke-width", 1).attr("d", 'M ' + (a.x - 15) + ' ' + a.y + ' L ' + (a.x - 85) + ' ' + a.y);

      svg.append("text").attr("font-size", "11px").attr("text-anchor", "end").attr("dx", a.x - 90).attr("dy", a.y + 2.5).text(a.text);
    }
  });
});
define('final-project/components/welcome-page', ['exports', 'ember-welcome-page/components/welcome-page'], function (exports, _welcomePage) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _welcomePage.default;
    }
  });
});
define('final-project/components/zf-accordion-menu', ['exports', 'ember-cli-foundation-6-sass/components/zf-accordion-menu'], function (exports, _zfAccordionMenu) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _zfAccordionMenu.default;
    }
  });
});
define('final-project/components/zf-accordion', ['exports', 'ember-cli-foundation-6-sass/components/zf-accordion'], function (exports, _zfAccordion) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _zfAccordion.default;
    }
  });
});
define('final-project/components/zf-callout', ['exports', 'ember-cli-foundation-6-sass/components/zf-callout'], function (exports, _zfCallout) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _zfCallout.default;
    }
  });
});
define('final-project/components/zf-drilldown-menu', ['exports', 'ember-cli-foundation-6-sass/components/zf-drilldown-menu'], function (exports, _zfDrilldownMenu) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _zfDrilldownMenu.default;
    }
  });
});
define('final-project/components/zf-dropdown-menu', ['exports', 'ember-cli-foundation-6-sass/components/zf-dropdown-menu'], function (exports, _zfDropdownMenu) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _zfDropdownMenu.default;
    }
  });
});
define('final-project/components/zf-dropdown', ['exports', 'ember-cli-foundation-6-sass/components/zf-dropdown'], function (exports, _zfDropdown) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _zfDropdown.default;
    }
  });
});
define('final-project/components/zf-magellan', ['exports', 'ember-cli-foundation-6-sass/components/zf-magellan'], function (exports, _zfMagellan) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _zfMagellan.default;
    }
  });
});
define('final-project/components/zf-off-canvas', ['exports', 'ember-cli-foundation-6-sass/components/zf-off-canvas'], function (exports, _zfOffCanvas) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _zfOffCanvas.default;
    }
  });
});
define('final-project/components/zf-orbit', ['exports', 'ember-cli-foundation-6-sass/components/zf-orbit'], function (exports, _zfOrbit) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _zfOrbit.default;
    }
  });
});
define('final-project/components/zf-reveal', ['exports', 'ember-cli-foundation-6-sass/components/zf-reveal'], function (exports, _zfReveal) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _zfReveal.default;
    }
  });
});
define('final-project/components/zf-slider', ['exports', 'ember-cli-foundation-6-sass/components/zf-slider'], function (exports, _zfSlider) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _zfSlider.default;
    }
  });
});
define('final-project/components/zf-tabs', ['exports', 'ember-cli-foundation-6-sass/components/zf-tabs'], function (exports, _zfTabs) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _zfTabs.default;
    }
  });
});
define('final-project/components/zf-tooltip', ['exports', 'ember-cli-foundation-6-sass/components/zf-tooltip'], function (exports, _zfTooltip) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _zfTooltip.default;
    }
  });
});
define('final-project/controllers/application', ['exports', 'ember', 'd3-request', 'd3-collection'], function (exports, _ember, _d3Request, _d3Collection) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = _ember.default.Controller.extend({
    make: "Chevrolet",
    carModel: "_none_",

    init: function init() {
      var _this = this;

      this._super.apply(this, arguments);
      (0, _d3Request.csv)('vehicles-trim.csv').get(function (r) {
        return _this.set("data", r);
      });
    },


    makeOptions: _ember.default.computed("data", function () {
      var data = this.get("data");

      if (data) {
        return data.uniqBy("make").map(function (c) {
          return c.make;
        });
      } else {
        return [];
      }
    }),

    currentTarget: _ember.default.computed("make", "carModel", function () {
      var model = this.get("carModel");
      return model && model !== "_none_" ? model : this.get("make");
    }),

    modelOptions: _ember.default.computed("data", "make", function () {
      var data = this.get("data");
      var make = this.get("make");

      if (data && make) {
        var filtered = data.filterBy("make", make);

        var rollup = (0, _d3Collection.nest)().key(function (d) {
          return d.model;
        }).key(function (d) {
          return d.year;
        }).entries(filtered);

        return rollup.filter(function (r) {
          return r.values.length > 1;
        }).map(function (c) {
          return c.key;
        });
      } else {
        return [];
      }
    }),

    actions: {
      updateMake: function updateMake(e) {
        this.set("make", e.target.value);
        this.set("carModel", "_none_");
      },
      updateModel: function updateModel(e) {
        this.set("carModel", e.target.value);
      }
    }
  });
});
define('final-project/helpers/app-version', ['exports', 'ember', 'final-project/config/environment', 'ember-cli-app-version/utils/regexp'], function (exports, _ember, _environment, _regexp) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.appVersion = appVersion;
  var version = _environment.default.APP.version;
  function appVersion(_) {
    var hash = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    if (hash.hideSha) {
      return version.match(_regexp.versionRegExp)[0];
    }

    if (hash.hideVersion) {
      return version.match(_regexp.shaRegExp)[0];
    }

    return version;
  }

  exports.default = _ember.default.Helper.helper(appVersion);
});
define('final-project/helpers/pluralize', ['exports', 'ember-inflector/lib/helpers/pluralize'], function (exports, _pluralize) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = _pluralize.default;
});
define('final-project/helpers/singularize', ['exports', 'ember-inflector/lib/helpers/singularize'], function (exports, _singularize) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = _singularize.default;
});
define('final-project/initializers/app-version', ['exports', 'ember-cli-app-version/initializer-factory', 'final-project/config/environment'], function (exports, _initializerFactory, _environment) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  var _config$APP = _environment.default.APP,
      name = _config$APP.name,
      version = _config$APP.version;
  exports.default = {
    name: 'App Version',
    initialize: (0, _initializerFactory.default)(name, version)
  };
});
define('final-project/initializers/container-debug-adapter', ['exports', 'ember-resolver/resolvers/classic/container-debug-adapter'], function (exports, _containerDebugAdapter) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = {
    name: 'container-debug-adapter',

    initialize: function initialize() {
      var app = arguments[1] || arguments[0];

      app.register('container-debug-adapter:main', _containerDebugAdapter.default);
      app.inject('container-debug-adapter:main', 'namespace', 'application:main');
    }
  };
});
define('final-project/initializers/data-adapter', ['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = {
    name: 'data-adapter',
    before: 'store',
    initialize: function initialize() {}
  };
});
define('final-project/initializers/ember-data', ['exports', 'ember-data/setup-container', 'ember-data'], function (exports, _setupContainer) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = {
    name: 'ember-data',
    initialize: _setupContainer.default
  };
});
define('final-project/initializers/export-application-global', ['exports', 'ember', 'final-project/config/environment'], function (exports, _ember, _environment) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.initialize = initialize;
  function initialize() {
    var application = arguments[1] || arguments[0];
    if (_environment.default.exportApplicationGlobal !== false) {
      var theGlobal;
      if (typeof window !== 'undefined') {
        theGlobal = window;
      } else if (typeof global !== 'undefined') {
        theGlobal = global;
      } else if (typeof self !== 'undefined') {
        theGlobal = self;
      } else {
        // no reasonable global, just bail
        return;
      }

      var value = _environment.default.exportApplicationGlobal;
      var globalName;

      if (typeof value === 'string') {
        globalName = value;
      } else {
        globalName = _ember.default.String.classify(_environment.default.modulePrefix);
      }

      if (!theGlobal[globalName]) {
        theGlobal[globalName] = application;

        application.reopen({
          willDestroy: function willDestroy() {
            this._super.apply(this, arguments);
            delete theGlobal[globalName];
          }
        });
      }
    }
  }

  exports.default = {
    name: 'export-application-global',

    initialize: initialize
  };
});
define('final-project/initializers/injectStore', ['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = {
    name: 'injectStore',
    before: 'store',
    initialize: function initialize() {}
  };
});
define('final-project/initializers/store', ['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = {
    name: 'store',
    after: 'ember-data',
    initialize: function initialize() {}
  };
});
define('final-project/initializers/transforms', ['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = {
    name: 'transforms',
    before: 'store',
    initialize: function initialize() {}
  };
});
define('final-project/initializers/zf-widget', ['exports', 'ember-cli-foundation-6-sass/initializers/zf-widget'], function (exports, _zfWidget) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _zfWidget.default;
    }
  });
  Object.defineProperty(exports, 'initialize', {
    enumerable: true,
    get: function () {
      return _zfWidget.initialize;
    }
  });
});
define("final-project/instance-initializers/ember-data", ["exports", "ember-data/instance-initializers/initialize-store-service"], function (exports, _initializeStoreService) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = {
    name: "ember-data",
    initialize: _initializeStoreService.default
  };
});
define('final-project/resolver', ['exports', 'ember-resolver'], function (exports, _emberResolver) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = _emberResolver.default;
});
define('final-project/router', ['exports', 'ember', 'final-project/config/environment'], function (exports, _ember, _environment) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });


  var Router = _ember.default.Router.extend({
    location: _environment.default.locationType,
    rootURL: _environment.default.rootURL
  });

  Router.map(function () {});

  exports.default = Router;
});
define('final-project/services/ajax', ['exports', 'ember-ajax/services/ajax'], function (exports, _ajax) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _ajax.default;
    }
  });
});
define("final-project/templates/application", ["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.HTMLBars.template({ "id": "PRGMH4fV", "block": "{\"statements\":[[0,\"  \"],[11,\"div\",[]],[15,\"class\",\"nav-container\"],[13],[0,\"\\n    \"],[11,\"div\",[]],[15,\"class\",\"top-bar-right\"],[13],[0,\"\\n\"],[6,[\"zf-magellan\"],null,[[\"data-animation-duration\",\"data-deep-linking\",\"data-animation-easing\",\"class\"],[\"1000\",false,\"swing\",\"vertical menu align-right\"]],{\"statements\":[[0,\"        \"],[11,\"li\",[]],[13],[11,\"a\",[]],[15,\"href\",\"#first\"],[13],[0,\"MPG\"],[14],[14],[0,\"\\n        \"],[11,\"li\",[]],[13],[11,\"a\",[]],[15,\"href\",\"#second\"],[13],[0,\"Displacement\"],[14],[14],[0,\"\\n        \"],[11,\"li\",[]],[13],[11,\"a\",[]],[15,\"href\",\"#third\"],[13],[0,\"Explore\"],[14],[14],[0,\"\\n\"]],\"locals\":[]},null],[0,\"    \"],[14],[0,\"\\n  \"],[14],[0,\"\\n\\n  \"],[11,\"section\",[]],[15,\"id\",\"first\"],[15,\"data-magellan-target\",\"first\"],[13],[0,\"\\n    \"],[11,\"br\",[]],[13],[14],[11,\"br\",[]],[13],[14],[0,\"\\n    \"],[11,\"div\",[]],[15,\"class\",\"row\"],[13],[0,\"\\n      \"],[11,\"div\",[]],[15,\"class\",\"small-10 columns\"],[13],[0,\"\\n          \"],[11,\"h5\",[]],[13],[0,\"Top Auto Maker's Average Combined MPG by Year\"],[14],[0,\"\\n          \"],[1,[33,[\"line-chart\"],null,[[\"chartId\",\"data\",\"rollup\",\"annotation\"],[\"combined-mpg\",[28,[\"data\"]],\"comb08\",\"honda\"]]],false],[0,\"\\n      \"],[14],[0,\"\\n      \"],[11,\"div\",[]],[15,\"class\",\"small-2 columns\"],[13],[0,\"\\n\\n        \"],[11,\"h6\",[]],[13],[0,\"Fuel Economy of major Car Brands in America\"],[14],[0,\"\\n        \"],[11,\"a\",[]],[15,\"data-open\",\"essayModal\"],[15,\"class\",\"button\"],[13],[0,\"Click here to for essay\"],[14],[0,\"\\n        \"],[11,\"p\",[]],[13],[0,\"\\n          In the chart on the left we can see that of the major manufacturers\\n          sold in the U.S. Japanese manufacturers tend to perform better than U.S.\\n          manufacturers.  As we will see in the next slide there is another measure\\n          that strongly correlates with fuel economy...\\n        \"],[14],[0,\"\\n\\n\"],[6,[\"zf-reveal\"],null,[[\"id\"],[\"essayModal\"]],{\"statements\":[[0,\"          \"],[11,\"h4\",[]],[13],[0,\"Final Project Essay\"],[14],[0,\"\\n          \"],[11,\"p\",[]],[13],[0,\"\\n            The following visual narrative does not have any particularly\\n            interesting conclusions, but I hope it serves as a good example of a\\n            martini glass hybrid structure.\\n          \"],[14],[0,\"\\n          \"],[11,\"p\",[]],[13],[0,\"\\n            Following the martini glass structure, the user is presented with a\\n            couple of static scenes that simply set the story for the user to\\n            explore more in the final scene.\\n          \"],[14],[0,\"\\n          \"],[11,\"p\",[]],[13],[0,\"\\n            The first 2 scenes setup the story by showing an explanation the two\\n            parameters the user will be able to change with triggers later on.\\n            There are also some annotations to highlight what the captions for each\\n            scene are trying to convey. A \\\"Next\\\" button is provided at the end\\n            of the caption to move the user to the next scene.  A small\\n            navigation menu is tied to the right side to help orient the user as\\n            to where they are in the narrative.\\n          \"],[14],[0,\"\\n          \"],[11,\"p\",[]],[13],[0,\"\\n            An annotation is added on the first scene to help explain and\\n            already large gap in fuel efficiency from Honda.  On the next scene\\n            the axes are different so the first annotation is cleared and a new\\n            annotation is used to help tie the point being made in this caption\\n            to the previous scene.  All annotations are cleared for the final\\n            scene where the user can explore on their own.\\n          \"],[14],[0,\"\\n          \"],[11,\"p\",[]],[13],[0,\"\\n            In the final exploration scene the user can trigger parameter\\n            changes using the select menus to chose the manufacturer and\\n            optionally the make they want\\n            to compare displacement and fuel economy for.  The title of the\\n            chart is updated as the user makes a selection, as well as the update\\n            to the chart, to help provide feedback to the user as they change\\n            parameters.\\n          \"],[14],[0,\"\\n          \"],[11,\"p\",[]],[13],[0,\"\\n            A brief caption is also provided in the final scene to explain which\\n            triggers and parameters are available to the user.  Hopefully the\\n            design is obvious but it doesn't hurt to provide extra guidance when\\n            it doesn't clutter the scene.\\n          \"],[14],[0,\"\\n\\n          \"],[11,\"p\",[]],[13],[0,\"\\n            Thank you for reviewing my project!\\n          \"],[14],[0,\"\\n\\n          \"],[11,\"br\",[]],[13],[14],[0,\"\\n          \"],[11,\"p\",[]],[13],[0,\"\\n            \"],[11,\"i\",[]],[13],[0,\"\\n              In light of the comments on Piazza regarding using D3 library\\n              wrappers, I wanted to clarify that I did create these charts using raw D3.\\n              I did use the Javascript framework Ember to help structure the project and\\n              manage dependencies and builds, but all D3 code was written from\\n              scratch.  You can view all of the messy raw D3 code I used for the charts on the\\n              GitHub repo if you have any questions \"],[11,\"a\",[]],[15,\"href\",\"https://github.com/wolodarsky/d3-narration/blob/master/app/components/line-chart.js\"],[13],[0,\"here\"],[14],[0,\".\\n            \"],[14],[0,\"\\n          \"],[14],[0,\"\\n\\n          \"],[11,\"button\",[]],[15,\"class\",\"close-button\"],[15,\"data-close\",\"\"],[15,\"aria-label\",\"Close reveal\"],[15,\"type\",\"button\"],[13],[0,\"\\n            \"],[11,\"span\",[]],[15,\"aria-hidden\",\"true\"],[13],[0,\"×\"],[14],[0,\"\\n          \"],[14],[0,\"\\n\"]],\"locals\":[]},null],[0,\"\\n        \"],[11,\"p\",[]],[13],[0,\"\\n\"],[6,[\"zf-magellan\"],null,[[\"data-animation-duration\",\"data-deep-linking\",\"data-animation-easing\"],[\"1000\",false,\"swing\"]],{\"statements\":[[0,\"              \"],[11,\"a\",[]],[15,\"class\",\"button\"],[15,\"href\",\"#second\"],[13],[0,\"Next\"],[14],[0,\"\\n\"]],\"locals\":[]},null],[0,\"        \"],[14],[0,\"\\n\\n\\n      \"],[14],[0,\"\\n    \"],[14],[0,\"\\n\\n  \"],[14],[0,\"\\n\\n  \"],[11,\"section\",[]],[15,\"id\",\"second\"],[15,\"data-magellan-target\",\"second\"],[13],[0,\"\\n    \"],[11,\"br\",[]],[13],[14],[11,\"br\",[]],[13],[14],[0,\"\\n    \"],[11,\"div\",[]],[15,\"class\",\"row\"],[13],[0,\"\\n      \"],[11,\"div\",[]],[15,\"class\",\"small-10 columns\"],[13],[0,\"\\n        \"],[11,\"h4\",[]],[13],[0,\"Top Auto Maker's Average Engine Displacement by Year\"],[14],[0,\"\\n        \"],[1,[33,[\"line-chart\"],null,[[\"chartId\",\"data\",\"rollup\",\"annotation\"],[\"displacement\",[28,[\"data\"]],\"displ\",\"dodge\"]]],false],[0,\"\\n      \"],[14],[0,\"\\n      \"],[11,\"div\",[]],[15,\"class\",\"small-2 columns\"],[13],[0,\"\\n        \"],[11,\"h6\",[]],[13],[0,\"Displacement Tells Another Part of the Story\"],[14],[0,\"\\n        \"],[11,\"p\",[]],[13],[0,\"\\n          In the chart on the left we see in general Japanese manufacturers tend to\\n          have smaller displacement engines across their lines as well.  As the\\n          annotation highlights, where we see an increase in displacement Dodge\\n          we can also see a dip in fuel economy in the previous\\n          chart for the same years. You\\n          can explore further in the next scene...\\n        \"],[14],[0,\"\\n        \"],[11,\"p\",[]],[13],[0,\"\\n\"],[6,[\"zf-magellan\"],null,[[\"data-animation-duration\",\"data-deep-linking\",\"data-animation-easing\"],[\"1000\",false,\"swing\"]],{\"statements\":[[0,\"            \"],[11,\"a\",[]],[15,\"class\",\"button\"],[15,\"href\",\"#third\"],[13],[0,\"Next\"],[14],[0,\"\\n\"]],\"locals\":[]},null],[0,\"        \"],[14],[0,\"\\n      \"],[14],[0,\"\\n    \"],[14],[0,\"\\n  \"],[14],[0,\"\\n\\n  \"],[11,\"section\",[]],[15,\"id\",\"third\"],[15,\"data-magellan-target\",\"third\"],[13],[0,\"\\n    \"],[11,\"br\",[]],[13],[14],[11,\"br\",[]],[13],[14],[0,\"\\n    \"],[11,\"div\",[]],[15,\"class\",\"row\"],[13],[0,\"\\n      \"],[11,\"div\",[]],[15,\"class\",\"small-10 columns\"],[13],[0,\"\\n        \"],[11,\"h4\",[]],[13],[0,\"MPG v Displacement for \"],[1,[26,[\"currentTarget\"]],false],[14],[0,\"\\n        \"],[1,[33,[\"line-chart\"],null,[[\"chartId\",\"data\",\"rollup\",\"filter\",\"secondRollup\",\"modelFilter\"],[\"combined-Toyota\",[28,[\"data\"]],\"comb08\",[28,[\"make\"]],\"displ\",[28,[\"carModel\"]]]]],false],[0,\"\\n      \"],[14],[0,\"\\n      \"],[11,\"div\",[]],[15,\"class\",\"small-2 columns\"],[13],[0,\"\\n        \"],[11,\"h6\",[]],[13],[0,\"Compare MPG and Displacement by Make and Model\"],[14],[0,\"\\n\\n        \"],[11,\"label\",[]],[13],[0,\"Manufacturer\\n          \"],[11,\"select\",[]],[16,\"onchange\",[33,[\"action\"],[[28,[null]],\"updateMake\"],null],null],[13],[0,\"\\n\"],[6,[\"each\"],[[28,[\"makeOptions\"]]],null,{\"statements\":[[0,\"              \"],[11,\"option\",[]],[16,\"value\",[34,[[28,[\"make\"]]]]],[13],[1,[28,[\"make\"]],false],[14],[0,\"\\n\"]],\"locals\":[\"make\"]},null],[0,\"          \"],[14],[0,\"\\n        \"],[14],[0,\"\\n\\n        \"],[11,\"label\",[]],[13],[0,\"Model\\n          \"],[11,\"select\",[]],[16,\"onchange\",[33,[\"action\"],[[28,[null]],\"updateModel\"],null],null],[13],[0,\"\\n            \"],[11,\"option\",[]],[15,\"value\",\"_none_\"],[13],[0,\"None\"],[14],[0,\"\\n\"],[6,[\"each\"],[[28,[\"modelOptions\"]]],null,{\"statements\":[[0,\"              \"],[11,\"option\",[]],[16,\"value\",[34,[[28,[\"make\"]]]]],[13],[1,[28,[\"make\"]],false],[14],[0,\"\\n\"]],\"locals\":[\"make\"]},null],[0,\"          \"],[14],[0,\"\\n        \"],[14],[0,\"\\n\\n\\n        \"],[11,\"p\",[]],[13],[0,\"\\n          Above you can choose a manufacturer of car and then further refine by model if\\n          desired to view the correlation between displacement and MPG.\\n        \"],[14],[0,\"\\n\\n      \"],[14],[0,\"\\n    \"],[14],[0,\"\\n  \"],[14],[0,\"\\n\\n\"],[1,[26,[\"outlet\"]],false],[0,\"\\n\"]],\"locals\":[],\"named\":[],\"yields\":[],\"hasPartials\":false}", "meta": { "moduleName": "final-project/templates/application.hbs" } });
});
define("final-project/templates/components/line-chart", ["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.HTMLBars.template({ "id": "sBF+5wdT", "block": "{\"statements\":[[11,\"svg\",[]],[16,\"id\",[26,[\"chartId\"]],null],[13],[14],[0,\"\\n\"]],\"locals\":[],\"named\":[],\"yields\":[],\"hasPartials\":false}", "meta": { "moduleName": "final-project/templates/components/line-chart.hbs" } });
});


define('final-project/config/environment', ['ember'], function(Ember) {
  var prefix = 'final-project';
try {
  var metaName = prefix + '/config/environment';
  var rawConfig = document.querySelector('meta[name="' + metaName + '"]').getAttribute('content');
  var config = JSON.parse(unescape(rawConfig));

  var exports = { 'default': config };

  Object.defineProperty(exports, '__esModule', { value: true });

  return exports;
}
catch(err) {
  throw new Error('Could not read config from meta tag with name "' + metaName + '".');
}

});

if (!runningTests) {
  require("final-project/app")["default"].create({"name":"final-project","version":"0.0.0+e48dd7d9"});
}
//# sourceMappingURL=final-project.map
