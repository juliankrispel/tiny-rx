var EventStream, Observable, Property, addEventListener, applyExtraction, applyFilter, applyMapping, assertDomNode, assertFunction, assertNotNull, assertString, fromDomEvent, inArray, isArray, isDomNode, isFunction, isNumber, isObject, isString, needlesInHaystack,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Observable = (function() {
  function Observable() {
    this.publish = __bind(this.publish, this);
    this.subscribe = __bind(this.subscribe, this);
    this._subscribers = [];
    this._init.apply(this, arguments);
  }

  Observable.prototype.subscribe = function(subscriber) {
    this._subscribers.push(subscriber);
    return this;
  };

  Observable.prototype.publish = function(e) {
    var s, _i, _len, _ref;
    _ref = this._subscribers;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      s = _ref[_i];
      s(e);
    }
    return this;
  };

  return Observable;

})();

Property = (function(_super) {
  __extends(Property, _super);

  function Property() {
    return Property.__super__.constructor.apply(this, arguments);
  }

  Property.prototype._init = function(subscribe, aggregator, initialValue) {
    var self;
    if (initialValue == null) {
      initialValue = 0;
    }
    assertFunction(subscribe);
    assertFunction(aggregator);
    this._value = initialValue;
    self = this;
    return subscribe(function(e) {
      self._value = aggregator(self._value, e);
      return self.publish(self._value);
    });
  };

  return Property;

})(Observable);

EventStream = (function(_super) {
  __extends(EventStream, _super);

  function EventStream() {
    this.filter = __bind(this.filter, this);
    this.later = __bind(this.later, this);
    this.extract = __bind(this.extract, this);
    this.map = __bind(this.map, this);
    this.merge = __bind(this.merge, this);
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

  EventStream.prototype.toProperty = function(aggregator, initialValue) {
    return new Property(this.subscribe, aggregator, initialValue);
  };

  EventStream.prototype.map = function(mapping) {
    var self;
    self = this;
    return new EventStream(function(cb) {
      return applyMapping(self.subscribe, cb, mapping);
    });
  };

  EventStream.prototype.extract = function(extraction) {
    var self;
    self = this;
    return new EventStream(function(cb) {
      return applyExtraction(self.subscriber, cb, extraction);
    });
  };

  EventStream.prototype.later = function(delay, value, cancelingEvent) {
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

  EventStream.prototype.filter = function(condition, value) {
    var self;
    self = this;
    return new EventStream(function(cb) {
      return applyFilter(self.subscribe, cb, condition, value);
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

applyFilter = function(subscriber, cb, condition, value) {
  assertNotNull(subscriber, cb, condition);
  if (isString(condition)) {
    assertNotNull(value);
    if (isString(value)) {
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
  console.log(needle);
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
    if (!a) {
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

window.trx = {
  createStream: function(eventCallback) {
    return new EventStream(eventCallback);
  },
  fromDomEvent: fromDomEvent,
  createProperty: function(subscribe, aggregator, initialValue) {
    return new Property(subscribe, aggregator, initialValue);
  }
};
