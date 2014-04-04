class Observable
    constructor: () ->
        @_subscribers = []
        @_init.apply(@, arguments)

    subscribe: (subscriber) =>
        @_subscribers.push(subscriber)
        @

    publish: (e) =>
        s(e) for s in @_subscribers
        @

class Property extends Observable
    _init: (subscribe, aggregator, initialValue = 0)->
        assertFunction(subscribe)
        assertFunction(aggregator)
        @_value = initialValue
        self = @
        subscribe((e)->
            self._value = aggregator(self._value, e)
            self.publish(self._value)
        )

class EventStream extends Observable
    _init: (eventCallback) ->
        if isFunction(eventCallback)
            eventCallback(@publish)

    addEvent: (eventCallback) =>
        eventCallback(@publish)

    merge: (stream) =>
        self = @
        new EventStream((cb)->
            self.subscribe((e)->
                cb(e)
            )
            stream.subscribe((e)->
                cb(e)
            )
        )

    map: (mapping) =>
        self = @
        new EventStream((cb)->
            applyMapping(self.subscribe, cb, mapping)
        )

    extract: (extraction) =>
        self = @
        new EventStream((cb)->
            applyExtraction(self.subscriber, cb, extraction)
        )

    later: (delay, value, cancelingEvent) =>
        self = @
        callback = ->
            self.publish(value)

        timeoutId = setTimeout(callback, delay)
        if(isFunction(cancelingEvent))
            cancelingEvent(()->
                clearTimeout(timeoutId)
            )

    filter: (condition, value) =>
        self = @
        new EventStream((cb)->
            applyFilter(self.subscribe, cb, condition, value)
        )

applyMapping = (subscriber, cb, mapping) ->
    assertNotNull(subscriber, cb, mapping)
    if(isFunction(mapping))
        subscriber((e)->
            cb(mapping(e))
        )
    else if(isString(mapping) or isNumber(mapping))
        subscriber((e)->
            cb(mapping)
        )

applyFilter = (subscriber, cb, condition, value) ->
    assertNotNull(subscriber, cb, condition)
    if(isFunction(condition))
        subscriber((e)->
            cb(e) if condition(e)
        )
    else if(isObject(condition))
        subscriber((e)->
            cb(e) if needlesInHaystack(condition, e)
        )

applyExtraction = (subscriber, cb, extraction) ->
    if(isFunction(extraction))
        subscriber((e)->
            cb(extraction(e))
        )

    else if(isString(extraction))
        subscriber((e)->
            cb(e[extraction])
        )

needlesInHaystack = (obj, haystack) ->
    isEqual = true
    for k, v of obj
        if(isObject(v))
            subHaystack = obj[k]
            for sk, sv of v
                unless sv == haystack[k][sk]
                    isEqual = false
                    break
        else
            unless v == haystack[k]
                isEqual = false
                break
    isEqual

assertFunction = (func) ->
    throw new Error 'variable must be function -> ' + func unless isFunction(func)

assertString = (obj) ->
    throw new Error 'variable must be String -> ' + obj unless isString(obj)

assertDomNode = (domNode) ->
    throw new Error 'variable must be html element ->' + domNode unless isDomNode(domNode)

assertNotNull = (args) ->
    unless isArray(args)
        args = [args]
    for a in args
        throw new Error 'variable can not be null' unless a

isObject = (obj) ->
    !!obj && (obj.constructor == Object)

isNumber = (obj) ->
    typeof obj == 'number' || obj instanceof Number

isDomNode = (domNode) ->
    domNode.hasOwnProperty('nodeType')

isString = (obj) ->
    typeof obj == 'string' || obj instanceof String

isArray = (obj) ->
    Object.prototype.toString.call( obj ) == '[object Array]'

isFunction = (obj) ->
    obj instanceof Function

fromDomEvent = (eventNames, domNode)->
    assertNotNull(arguments)
    assertDomNode(domNode)
    unless isArray(eventNames)
        eventNames = [eventNames]
    new EventStream((signal)->
        for eventName in eventNames
            domNode.addEventListener(eventName, (e)->
                signal(e)
            )
    )

window.trx = {
    createStream: (eventCallback) ->
        new EventStream(eventCallback)

    fromDomEvent: fromDomEvent

    createProperty: ( subscribe, aggregator, initialValue ) ->
        new Property( subscribe, aggregator, initialValue )
}
