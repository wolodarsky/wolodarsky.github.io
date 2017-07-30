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

    init: function init() {
      var _this = this;

      this._super.apply(this, arguments);
      this.margin = { top: 20, right: 20, bottom: 30, left: 40 };
      this.width = 960 - this.margin.left - this.margin.right;
      this.height = 500 - this.margin.top - this.margin.bottom;

      this.x = (0, _d3Scale.scaleBand)().range([0, this.width]).padding(0.05);

      this.y = (0, _d3Scale.scaleLinear)().range([this.height, 0]);

      this.line = (0, _d3Shape.line)().x(function (d) {
        return _this.x(d.key);
      }).y(function (d) {
        return _this.y(d.value);
      });

      this.updateAxes();
    },
    updateAxes: function updateAxes() {
      this.xAxis = (0, _d3Axis.axisBottom)(this.x);
      this.yAxis = (0, _d3Axis.axisLeft)(this.y).ticks(10, 's');
    },
    didInsertElement: function didInsertElement() {
      this._super.apply(this, arguments);

      var svg = (0, _d3Selection.select)("#" + this.get("chartId")).attr("width", this.width + this.margin.left + this.margin.right).attr("height", this.height + this.margin.top + this.margin.bottom).append("g").attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");

      svg.append("g").attr("class", "x axis").attr("transform", "translate(0," + this.height + ")").call(this.xAxis);

      svg.append("g").attr("class", "y axis").call(this.yAxis);

      this.updateChart();
    },
    didReceiveAttrs: function didReceiveAttrs() {
      this._super.apply(this, arguments);
      this.updateChart();
    },
    updateChart: function updateChart() {
      var _this2 = this;

      var rawData = this.get('data');

      if (!rawData) return;

      var filter = this.get("filter");
      var data = filter ? rawData.filterBy("model", filter) : rawData;

      var rollup = this.get("rollup");
      var groupBy = this.get("groupBy");

      var yearlyAvgMpgByMake = (0, _d3Collection.nest)().key(function (d) {
        return d[groupBy];
      }).key(function (d) {
        return d.year;
      }).rollup(function (d) {
        return d3.mean(d, function (car) {
          return +car[rollup];
        });
      }).entries(data);

      this.x.domain(data.map(function (d) {
        return d.year;
      }));

      this.y.domain([0, (0, _d3Array.max)(yearlyAvgMpgByMake, function (d) {
        return (0, _d3Array.max)(d.values, function (c) {
          return c.value;
        });
      })]);
      this.updateAxes();

      var svg = (0, _d3Selection.select)("#" + this.get("chartId")).select("g");

      svg.select(".x.axis").call(this.xAxis);

      svg.select(".y.axis").call(this.yAxis);

      //let line = svg.selectAll(".line")
      //.data(data);

      //line.exit().remove(); // exit
      //
      //
      //debugger;

      //yearlyAvgMpgByMake.forEach( m => {

      var color = (0, _d3Scale.scaleOrdinal)(_d3Scale.schemeCategory20);

      svg.append("circle").attr("r", 10).attr("fill", "none").attr("stroke", "red").attr("stroke-width", 1).attr("cy", 100).attr("cx", 100);

      var make = svg.selectAll(".make").data(yearlyAvgMpgByMake).enter().append("g").attr("class", function (d) {
        return d.key + " make";
      });

      make.append("path") // enter
      .attr("fill", "none").attr("stroke", function (d) {
        return color(d.key);
      }).attr("stroke-linejoin", "round").attr("stroke-linecap", "round").attr("stroke-width", 2).attr("d", function (d) {
        return _this2.line(d.values);
      });
      //.merge(line) // update
      //.attr("class", "line")
      //.attr("fill", "none")
      //.attr("stroke", "steelblue")
      //.attr("stroke-linejoin", "round")
      //.attr("stroke-linecap", "round")
      //.attr("stroke-width", 1.5)
      //.attr("d", this.line);

      //});

      //const annotations = [{
      //note: { label: "Hi"},
      //x: 100, y: 100,
      //dy: 137, dx: 162,
      //subject: { radius: 50, radiusPadding: 10 }
      //}];

      //d3.annotation().annotations(annotations);
    }
  });
});
define('final-project/components/sticky-container', ['exports', 'ember', 'ember-cli-sticky/components/sticky-container'], function (exports, _ember, _stickyContainer) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = _stickyContainer.default;
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
define('final-project/controllers/application', ['exports', 'ember', 'd3-request'], function (exports, _ember, _d3Request) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = _ember.default.Controller.extend({
    init: function init() {
      var _this = this;

      this._super.apply(this, arguments);
      (0, _d3Request.csv)('vehicles-trim.csv').get(function (r) {
        return _this.set("data", r);
      });
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
define('final-project/routes/application', ['exports', 'ember'], function (exports, _ember) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = _ember.default.Route.extend({});
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
define('final-project/services/data-rows', ['exports', 'ember'], function (exports, _ember) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = _ember.default.Service.extend({});
});
define("final-project/templates/application", ["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.HTMLBars.template({ "id": "sH5X+bb6", "block": "{\"statements\":[[6,[\"sticky-container\"],null,[[\"options\"],[[28,[\"myStickyOptions\"]]]],{\"statements\":[[0,\"    \"],[11,\"div\",[]],[15,\"class\",\"top-bar-right\"],[13],[0,\"\\n\"],[6,[\"zf-magellan\"],null,[[\"data-animation-duration\",\"data-animation-easing\",\"class\"],[\"1000\",\"swing\",\"vertical menu align-right\"]],{\"statements\":[[0,\"        \"],[11,\"li\",[]],[13],[11,\"a\",[]],[15,\"href\",\"#first\"],[13],[0,\"Reveal\"],[14],[14],[0,\"\\n        \"],[11,\"li\",[]],[13],[11,\"a\",[]],[15,\"href\",\"#second\"],[13],[0,\"Accordion Menu\"],[14],[14],[0,\"\\n        \"],[11,\"li\",[]],[13],[11,\"a\",[]],[15,\"href\",\"#third\"],[13],[0,\"Accordion\"],[14],[14],[0,\"\\n\"]],\"locals\":[]},null],[0,\"    \"],[14],[0,\"\\n\"]],\"locals\":[]},null],[0,\"\\n\"],[11,\"section\",[]],[15,\"id\",\"first\"],[15,\"data-magellan-target\",\"first\"],[13],[0,\"\\n  \"],[11,\"h4\",[]],[13],[0,\"Top Auto Maker's Average Combined MPG by Year\"],[14],[0,\"\\n  \"],[1,[33,[\"line-chart\"],null,[[\"chartId\",\"data\",\"rollup\"],[\"combined-mpg\",[28,[\"data\"]],\"comb08\"]]],false],[0,\"\\n\"],[14],[0,\"\\n\\n\"],[11,\"section\",[]],[15,\"id\",\"second\"],[15,\"data-magellan-target\",\"second\"],[13],[0,\"\\n  \"],[11,\"h4\",[]],[13],[0,\"Toyota's Average Combined MPG by Year\"],[14],[0,\"\\n  \"],[1,[33,[\"line-chart\"],null,[[\"chartId\",\"data\",\"rollup\",\"groupBy\",\"filter\"],[\"combined-Toyota\",[28,[\"data\"]],\"comb08\",\"model\",\"Civic\"]]],false],[0,\"\\n\"],[14],[0,\"\\n\\n\"],[11,\"section\",[]],[15,\"id\",\"first\"],[15,\"data-magellan-target\",\"first\"],[13],[0,\"\\n  \"],[11,\"h4\",[]],[13],[0,\"Top Auto Maker's Average Engine Displacement by Year\"],[14],[0,\"\\n  \"],[1,[33,[\"line-chart\"],null,[[\"chartId\",\"data\",\"rollup\"],[\"displacement\",[28,[\"data\"]],\"displ\"]]],false],[0,\"\\n\"],[14],[0,\"\\n\\n\"],[1,[26,[\"outlet\"]],false],[0,\"\\n\"]],\"locals\":[],\"named\":[],\"yields\":[],\"hasPartials\":false}", "meta": { "moduleName": "final-project/templates/application.hbs" } });
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
  require("final-project/app")["default"].create({"name":"final-project","version":"0.0.0+ed4ce034"});
}
//# sourceMappingURL=final-project.map
