var EventStream, assertDomNode, assertNotNull, fromDomEvent, isArray,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

EventStream = (function() {
  function EventStream(eventCallback) {
    this._publish = __bind(this._publish, this);
    this.filter = __bind(this.filter, this);
    this.addEvent = __bind(this.addEvent, this);
    this._subscribers = [];
    eventCallback(this._publish);
  }

  EventStream.prototype.subscribe = function(subscriber) {
    this._subscribers.push(subscriber);
    return this;
  };

  EventStream.prototype.addEvent = function(eventCallback) {
    return eventCallback(this._publish);
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

  EventStream.prototype._publish = function(e) {
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

isArray = function(obj) {
  return Object.prototype.toString.call(obj) === '[object Array]';
};

fromDomEvent = function(eventNames, domNode) {
  assertNotNull(arguments);
  assertDomNode(domNode);
  if (!isArray(eventNames)) {
    eventNames = [eventNames];
  }
  return new EventStream(function(cb) {
    var eventName, _i, _len, _results;
    _results = [];
    for (_i = 0, _len = eventNames.length; _i < _len; _i++) {
      eventName = eventNames[_i];
      _results.push(domNode.addEventListener(eventName, function(e) {
        return cb(e);
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
