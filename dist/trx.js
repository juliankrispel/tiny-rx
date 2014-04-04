var EventStream, applyMapping, assertDomNode, assertNotNull, fromDomEvent, isArray, isFunction, isObject, isString,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

EventStream = (function() {
  function EventStream(eventCallback) {
    this.publish = __bind(this.publish, this);
    this.filter = __bind(this.filter, this);
    this.later = __bind(this.later, this);
    this.map = __bind(this.map, this);
    this.merge = __bind(this.merge, this);
    this.addEvent = __bind(this.addEvent, this);
    this.subscribe = __bind(this.subscribe, this);
    this._subscribers = [];
    if (isFunction(eventCallback)) {
      eventCallback(this.publish);
    }
  }

  EventStream.prototype.subscribe = function(subscriber) {
    this._subscribers.push(subscriber);
    return this;
  };

  EventStream.prototype.addEvent = function(eventCallback) {
    return eventCallback(this.pconjs, ublish);
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

  EventStream.prototype.map = function(mapping) {
    var self;
    self = this;
    return new EventStream(function(cb) {
      return applyMapping(self.subscriber, cb, mapping);
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

  EventStream.prototype.filter = function(condition) {
    var self;
    self = this;
    return new EventStream(function(cb) {
      return self.subscribe(function(e) {
        if (condition(e)) {
          return cb(e);
        }
      });
    });
  };

  EventStream.prototype.publish = function(e) {
    var s, _i, _len, _ref, _results;
    _ref = this._subscribers;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      s = _ref[_i];
      _results.push(s(e));
    }
    return _results;
  };

  return EventStream;

})();

applyMapping = function(subscriber, cb, mapping) {
  if (isFunction(mapping)) {
    return subscriber(function(e) {
      return cb(mapping(e));
    });
  } else if (isString(mapping)) {
    return subscriber(function(e) {
      if (e.hasOwnProperty(mapping)) {
        return cb(e[mapping]);
      }
    });
  }
};

assertNotNull = function(args) {
  var a, _i, _len, _results;
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

assertDomNode = function(domNode) {
  if (!domNode.hasOwnProperty('nodeType')) {
    throw new Error('variable does not contain html element');
  }
};

isObject = function(obj) {
  return !!a && (a.constructor === Object);
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

fromDomEvent = function(eventNames, domNode) {
  assertNotNull(arguments);
  assertDomNode(domNode);
  if (!isArray(eventNames)) {
    eventNames = [eventNames];
  }
  return new EventStream(function(signal) {
    var eventName, _i, _len, _results;
    _results = [];
    for (_i = 0, _len = eventNames.length; _i < _len; _i++) {
      eventName = eventNames[_i];
      _results.push(domNode.addEventListener(eventName, function(e) {
        return signal(e);
      }));
    }
    return _results;
  });
};

window.trx = {
  createStream: function(eventCallback) {
    return new EventStream(eventCallback);
  },
  fromDomEvent: fromDomEvent
};
