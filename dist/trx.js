
/*
 * Tiny Rx Documentation
 *
 */
var EventStream, Observable, Property, addEventListener, applyExtraction, applyFilter, applyMapping, assertDomNode, assertFunction, assertNotNull, assertString, clone, fromDomEvent, inArray, isArray, isDomNode, isFunction, isNumber, isObject, isString, needlesInHaystack, trx,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Observable = (function() {

  /*
   * Observable is the base primitive that all others inherit from
   */

  /*
   * The Observables constructor simply does some initalisation
   * and forwards the arguments to the init method of extended classes
   */
  function Observable() {
    this.createProperty = __bind(this.createProperty, this);
    this.createHistory = __bind(this.createHistory, this);
    this.truethy = __bind(this.truethy, this);
    this.filter = __bind(this.filter, this);
    this.later = __bind(this.later, this);
    this.extract = __bind(this.extract, this);
    this.map = __bind(this.map, this);
    this.publish = __bind(this.publish, this);
    this.once = __bind(this.once, this);
    this.subscribe = __bind(this.subscribe, this);
    this._subscribers = [];
    this._oneOffSubscribers = [];
    this._init.apply(this, arguments);
  }


  /*
   * Subscribe 
   * @param {function} subscriber - The callback that gets executed
   * whenever an event occurs
   */

  Observable.prototype.subscribe = function(subscriber) {
    this._subscribers.push(subscriber);
    return this;
  };

  Observable.prototype.once = function(subscriber) {
    this._oneOffSubscribers.push(subscriber);
    return this;
  };

  Observable.prototype.publish = function(e) {
    var index, s, so, _i, _j, _len, _len1, _ref, _ref1;
    _ref = this._subscribers;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      s = _ref[_i];
      s(e);
    }
    _ref1 = this._oneOffSubscribers;
    for (index = _j = 0, _len1 = _ref1.length; _j < _len1; index = ++_j) {
      so = _ref1[index];
      if (so) {
        so(e);
      }
      this._oneOffSubscribers.splice(index, 1);
    }
    return this;
  };

  Observable.prototype.map = function(mapping) {
    var self;
    self = this;
    return new EventStream(function(cb) {
      return applyMapping(self.subscribe, cb, mapping);
    });
  };

  Observable.prototype.extract = function(extraction) {
    var self;
    self = this;
    return new EventStream(function(cb) {
      return applyExtraction(self.subscribe, cb, extraction);
    });
  };

  Observable.prototype.later = function(delay, value, cancelingEvent) {
    var callback, self, timeoutId;
    self = this;
    callback = function() {
      return self.publish(value);
    };
    timeoutId = setTimeout(callback, delay);
    if (isFunction(cancelingEvent)) {
      return cancelingEvent(function() {
        return clearTimeout(timeoutId);
      });
    }
  };

  Observable.prototype.filter = function(condition, value) {
    var self;
    self = this;
    return new EventStream(function(cb) {
      return applyFilter(self.subscribe, cb, condition, value);
    });
  };

  Observable.prototype.truethy = function() {
    var self;
    self = this;
    return new EventStream(function(cb) {
      return self.subscribe(function(e) {
        if (e) {
          return cb(e);
        }
      });
    });
  };

  Observable.prototype.createHistory = function(steps) {
    if (steps == null) {
      steps = 100;
    }
    return this.createProperty(function(historyAsArray, e) {
      if (historyAsArray.length >= steps) {
        historyAsArray.shift();
      }
      historyAsArray.push(e);
      return historyAsArray;
    }, []);
  };

  Observable.prototype.createProperty = function(aggregator, initialValue) {
    return new Property(this.subscribe, aggregator, initialValue);
  };

  return Observable;

})();

Property = (function(_super) {
  __extends(Property, _super);

  function Property() {
    this.value = __bind(this.value, this);
    this.reset = __bind(this.reset, this);
    return Property.__super__.constructor.apply(this, arguments);
  }

  Property.prototype._init = function(subscribe, aggregator, initialValue) {
    var self;
    if (initialValue == null) {
      initialValue = 0;
    }
    self = this;
    this._initialValue = initialValue;
    this._value = clone(initialValue);
    if (isFunction(subscribe) && isFunction(aggregator)) {
      return subscribe(function(e) {
        self._value = aggregator(self._value, e);
        return self.publish(self._value);
      });
    }
  };

  Property.prototype.reset = function() {
    return this._value = clone(this._initialValue);
  };

  Property.prototype.value = function(set) {
    if (set !== void 0) {
      this._value = set;
      this.publish(this._value);
    }
    return this._value;
  };

  return Property;

})(Observable);

EventStream = (function(_super) {
  __extends(EventStream, _super);

  function EventStream() {
    this.merge = __bind(this.merge, this);
    this.addDomEvent = __bind(this.addDomEvent, this);
    this.addEvent = __bind(this.addEvent, this);
    return EventStream.__super__.constructor.apply(this, arguments);
  }

  EventStream.prototype._init = function(eventCallback) {
    if (isFunction(eventCallback)) {
      return eventCallback(this.publish);
    }
  };

  EventStream.prototype.addEvent = function(eventCallback) {
    return eventCallback(this.publish);
  };

  EventStream.prototype.addDomEvent = function(eventNames, domNodes) {
    var domNode, eventName, sNode, selected, self, _i, _len, _results;
    assertNotNull(arguments);
    if (!isArray(domNodes)) {
      domNodes = [domNodes];
    }
    if (!isArray(eventNames)) {
      eventNames = [eventNames];
    }
    self = this;
    _results = [];
    for (_i = 0, _len = domNodes.length; _i < _len; _i++) {
      domNode = domNodes[_i];
      if (isString(domNode)) {
        selected = document.querySelectorAll(domNode);
      } else {
        selected = [domNode];
      }
      _results.push((function() {
        var _j, _len1, _results1;
        _results1 = [];
        for (_j = 0, _len1 = selected.length; _j < _len1; _j++) {
          sNode = selected[_j];
          _results1.push((function() {
            var _k, _len2, _results2;
            _results2 = [];
            for (_k = 0, _len2 = eventNames.length; _k < _len2; _k++) {
              eventName = eventNames[_k];
              _results2.push(addEventListener(sNode, eventName, function(e) {
                return self.publish(e);
              }));
            }
            return _results2;
          })());
        }
        return _results1;
      })());
    }
    return _results;
  };

  EventStream.prototype.merge = function(stream) {
    var self;
    self = this;
    return new EventStream(function(cb) {
      self.subscribe(function(e) {
        return cb(e);
      });
      return stream.subscribe(function(e) {
        return cb(e);
      });
    });
  };

  return EventStream;

})(Observable);

applyMapping = function(subscriber, cb, mapping) {
  assertNotNull(subscriber, cb, mapping);
  if (isFunction(mapping)) {
    return subscriber(function(e) {
      return cb(mapping(e));
    });
  } else if (isString(mapping) || isNumber(mapping)) {
    return subscriber(function(e) {
      return cb(mapping);
    });
  }
};

clone = function(obj) {
  return JSON.parse(JSON.stringify(obj));
};

applyFilter = function(subscriber, cb, condition, value) {
  assertNotNull(subscriber, cb, condition);
  if (isString(condition)) {
    if (!value) {
      return subscribe(function(e) {
        if (e.hasOwnProperty(condition)) {
          return cb(e);
        }
      });
    } else if (value !== void 0 && value !== null) {
      return subscriber(function(e) {
        if (e[condition] === value) {
          return cb(e);
        }
      });
    } else if (isArray(value)) {
      return subscriber(function(e) {
        if (inArray(e[condition], value)) {
          return cb(e);
        }
      });
    }
  } else if (isFunction(condition)) {
    return subscriber(function(e) {
      if (condition(e)) {
        return cb(e);
      }
    });
  } else if (isObject(condition)) {
    return subscriber(function(e) {
      if (needlesInHaystack(condition, e)) {
        return cb(e);
      }
    });
  }
};

applyExtraction = function(subscriber, cb, extraction) {
  if (isFunction(extraction)) {
    return subscriber(function(e) {
      return cb(extraction(e));
    });
  } else if (isString(extraction)) {
    return subscriber(function(e) {
      return cb(e[extraction]);
    });
  }
};

inArray = function(needle, haystack) {
  var i, inHaystack, _i, _len;
  assertNotNull(needle);
  assertArray(haystack);
  inHaystack = false;
  for (_i = 0, _len = haystack.length; _i < _len; _i++) {
    i = haystack[_i];
    if (i === needle) {
      inHaystack = true;
      break;
    }
  }
  return inHaystack;
};

needlesInHaystack = function(obj, haystack) {
  var isEqual, k, sk, subHaystack, sv, v;
  isEqual = true;
  for (k in obj) {
    v = obj[k];
    if (isObject(v)) {
      subHaystack = obj[k];
      for (sk in v) {
        sv = v[sk];
        if (sv !== haystack[k][sk]) {
          isEqual = false;
          break;
        }
      }
    } else {
      if (v !== haystack[k]) {
        isEqual = false;
        break;
      }
    }
  }
  return isEqual;
};

assertFunction = function(func) {
  if (!isFunction(func)) {
    throw new Error('variable must be function -> ' + func);
  }
};

assertString = function(obj) {
  if (!isString(obj)) {
    throw new Error('variable must be String -> ' + obj);
  }
};

assertDomNode = function(domNode) {
  if (!isDomNode(domNode)) {
    throw new Error('variable must be html element ->' + domNode);
  }
};

assertNotNull = function(args) {
  var a, _i, _len, _results;
  if (!isArray(args)) {
    args = [args];
  }
  _results = [];
  for (_i = 0, _len = args.length; _i < _len; _i++) {
    a = args[_i];
    if (a === null) {
      throw new Error('variable can not be null');
    } else {
      _results.push(void 0);
    }
  }
  return _results;
};

isObject = function(obj) {
  return !!obj && (obj.constructor === Object);
};

isNumber = function(obj) {
  return typeof obj === 'number' || obj instanceof Number;
};

isDomNode = function(domNode) {
  return domNode.hasOwnProperty('nodeType');
};

isString = function(obj) {
  return typeof obj === 'string' || obj instanceof String;
};

isArray = function(obj) {
  return Object.prototype.toString.call(obj) === '[object Array]';
};

isFunction = function(obj) {
  return obj instanceof Function;
};

addEventListener = function(obj, evt, fnc) {
  if (obj.addEventListener) {
    obj.addEventListener(evt, fnc, false);
    true;
  } else if (obj.attachEvent) {
    obj.attachEvent('on' + evt, fnc);
  } else {
    evt = 'on' + evt;
    if (typeof obj[evt] === 'function') {
      fnc = (function(f1, f2) {
        return function() {
          f1.apply(this["arguments"]);
          return f2.apply(this["arguments"]);
        };
      })(obj[evt], fnc);
    }
    obj[evt] = fnc;
    true;
  }
  return false;
};

fromDomEvent = function(eventNames, domNodes) {
  assertNotNull(arguments);
  if (!isArray(domNodes)) {
    domNodes = [domNodes];
  }
  if (!isArray(eventNames)) {
    eventNames = [eventNames];
  }
  return new EventStream(function(signal) {
    var domNode, eventName, sNode, selected, _i, _len, _results;
    _results = [];
    for (_i = 0, _len = domNodes.length; _i < _len; _i++) {
      domNode = domNodes[_i];
      if (isString(domNode)) {
        selected = document.querySelectorAll(domNode);
      } else {
        selected = [domNode];
      }
      _results.push((function() {
        var _j, _len1, _results1;
        _results1 = [];
        for (_j = 0, _len1 = selected.length; _j < _len1; _j++) {
          sNode = selected[_j];
          _results1.push((function() {
            var _k, _len2, _results2;
            _results2 = [];
            for (_k = 0, _len2 = eventNames.length; _k < _len2; _k++) {
              eventName = eventNames[_k];
              _results2.push(addEventListener(sNode, eventName, function(e) {
                return signal(e);
              }));
            }
            return _results2;
          })());
        }
        return _results1;
      })());
    }
    return _results;
  });
};

trx = {
  _EventStream: EventStream,
  _Property: Property,
  createStream: function(eventCallback) {
    return new EventStream(eventCallback);
  },
  fromDomEvent: fromDomEvent,
  createProperty: function(subscribe, aggregator, initialValue) {
    return new Property(subscribe, aggregator, initialValue);
  }
};

if (typeof module !== "undefined" && module !== null) {
  module.exports = trx;
} else {
  window.trx = trx;
}
