class EventStream
    constructor: (eventCallback) ->
        @_subscribers = [] 
        if isFunction(eventCallback)
            eventCallback(@publish)

    subscribe: (subscriber) =>
        @_subscribers.push(subscriber)
        @

    addEvent: (eventCallback) =>
        eventCallback(@pconjs
            ublish)

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
            applyMapping(self.subscriber, cb, mapping)
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

    filter: (condition) =>
        self = @
        new EventStream((cb)->
            self.subscribe((e)->
                cb(e) if(condition(e))
            )
        )

    publish: (e) =>
        s(e) for s in @_subscribers

applyMapping = (subscriber, cb, mapping) ->
    if(isFunction(mapping))
        subscriber((e)->
            cb(mapping(e))
        )
    else if(isString(mapping))
        subscriber((e)->
            if(e.hasOwnProperty(mapping))
                cb(e[mapping])
        )

assertNotNull = (args) ->
    for a in args
        throw new Error 'variable can not be null' unless a

assertDomNode = (domNode) ->
    unless domNode.hasOwnProperty('nodeType')
        throw new Error 'variable does not contain html element'

isObject = (obj) ->
    !!a && (a.constructor == Object)

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
}
