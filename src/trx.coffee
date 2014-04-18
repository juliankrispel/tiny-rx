###
# Tiny Rx Documentation
# 
###

class Observable
    ###
    # Observable is the base primitive that all others inherit from
    ###

    ###
    # The Observables constructor simply does some initalisation
    # and forwards the arguments to the init method of extended classes
    ###
    constructor: () ->
        @_subscribers = []
        @_oneOffSubscribers = []
        @_init.apply(@, arguments)

    ###
    # Subscribe 
    # @param {function} subscriber - The callback that gets executed
    # whenever an event occurs
    ###
    subscribe: (subscriber) =>
        @_subscribers.push(subscriber)
        @

    once: (subscriber) =>
        @_oneOffSubscribers.push(subscriber)
        @

    publish: (e) =>
        s(e) for s in @_subscribers
        for so,index in @_oneOffSubscribers
            so(e) if so
            @_oneOffSubscribers.splice(index,1)
        @

    map: (mapping) =>
        self = @
        new EventStream((cb)->
            applyMapping(self.subscribe, cb, mapping)
        )

    extract: (extraction) =>
        self = @
        new EventStream((cb)->
            applyExtraction(self.subscribe, cb, extraction)
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

    truethy: () =>
        self = @
        new EventStream((cb)->
            self.subscribe((e)->
                cb(e) if e
            )
        )

    createHistory: (steps = 100) =>
        @createProperty((historyAsArray, e) ->
            historyAsArray.shift() if(historyAsArray.length >= steps)
            historyAsArray.push e
            historyAsArray
        , [])

    createProperty: (aggregator, initialValue) =>
        new Property( @subscribe, aggregator, initialValue )



class Property extends Observable
    _init: (subscribe, aggregator, initialValue = 0)->
        self = @
        @_initialValue = initialValue
        @_value = clone(initialValue)

        if(isFunction(subscribe) && isFunction(aggregator))
            subscribe((e)->
                self._value = aggregator(self._value, e)
                self.publish(self._value)
            )

    reset: () =>  @_value = clone(@_initialValue)
    value: (set) =>
        if(set != undefined)
            @_value = set
            @publish(@_value)
        @_value

class EventStream extends Observable
    _init: (eventCallback) ->
        if isFunction(eventCallback)
            eventCallback(@publish)

    addEvent: (eventCallback) =>
        eventCallback(@publish)

    addDomEvent: (eventNames, domNodes) =>
        assertNotNull(arguments)
        domNodes = [domNodes] unless isArray(domNodes)
        eventNames = [eventNames] unless isArray(eventNames)
        self = @

        for domNode in domNodes
            if(isString(domNode))
                selected = document.querySelectorAll(domNode) 
            else
                selected = [domNode]
            for sNode in selected
                for eventName in eventNames
                    addEventListener(sNode, eventName, (e)->
                        self.publish(e)
                    )


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

clone = (obj) ->
    JSON.parse(JSON.stringify(obj))

applyFilter = (subscriber, cb, condition, value) ->
    assertNotNull(subscriber, cb, condition)
    if(isString(condition))
        if(!value)
            subscribe((e)->
                cb(e) if e.hasOwnProperty(condition)
            )
        else if(value != undefined && value != null)
            subscriber((e)->
                cb(e) if e[condition] == value
            )
        else if(isArray(value))
            subscriber((e)->
                cb(e) if inArray(e[condition], value)
            )


    else if(isFunction(condition))
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

inArray = (needle, haystack) ->
    assertNotNull(needle)
    assertArray(haystack)
    inHaystack = false
    for i in haystack
        if(i == needle)
            inHaystack = true
            break
    inHaystack

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
    args = [args] unless isArray(args)
    for a in args
        throw new Error 'variable can not be null' if a == null

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

addEventListener = (obj, evt, fnc) ->
    # W3C model
    if (obj.addEventListener) 
        obj.addEventListener(evt, fnc, false)
        true
    # Microsoft model
    else if (obj.attachEvent) 
        obj.attachEvent('on' + evt, fnc)

    # Browser don't support W3C or MSFT model, go on with traditional
    else 
        evt = 'on'+evt
        if(typeof obj[evt] == 'function')
            ## Object already has a function on traditional
            ## Let's wrap it with our own function inside another function
            fnc = ((f1,f2)->
                 ()->
                    f1.apply(@arguments)
                    f2.apply(@arguments)
            )(obj[evt], fnc)
        obj[evt] = fnc
        true
    false

fromDomEvent = (eventNames, domNodes)->
    assertNotNull(arguments)
    domNodes = [domNodes] unless isArray(domNodes)
    eventNames = [eventNames] unless isArray(eventNames)
        
    new EventStream((signal)->
        for domNode in domNodes
            if(isString(domNode))
                selected = document.querySelectorAll(domNode) 
            else
                selected = [domNode]
            for sNode in selected
                for eventName in eventNames
                    addEventListener(sNode, eventName, (e)->
                        signal(e)
                    )
    )

trx = {
    # Attach Classes for test assertions and after all, 
    # why the fuck not
    _EventStream: EventStream
    _Property: Property

    # Create a stream with or without a callback
    createStream: (eventCallback) ->
        new EventStream(eventCallback)

    # Create a stream from a dom event
    fromDomEvent: fromDomEvent

    # Create an empty property or one that subscribes to an 
    # Observable or an EventStream
    createProperty: ( subscribe, aggregator, initialValue ) ->
        new Property( subscribe, aggregator, initialValue )
}

if module?
    module.exports = trx
else
    window.trx = trx
