class EventStream
    constructor: (eventCallback) ->
        @_subscribers = [] 
        if isFunction(eventCallback)
            eventCallback(@publish)

    subscribe: (subscriber) =>
        @_subscribers.push(subscriber)
        @

    addEvent: (eventCallback) =>
        eventCallback(@publish)

    later: (delay, value, cancelEvent) =>
        self = @
        callback = ->
            self.publish(value)

        timeoutId = setTimeout(callback, delay)
        if(isFunction(cancelEvent))
            cancelEvent(()->
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

assertNotNull = (args) ->
    for a in args
        throw new Error 'variable can not be null' unless a

assertDomNode = (domNode) ->
    unless domNode.hasOwnProperty('nodeType')
        throw new Error 'variable does not contain html element'

isArray = (obj) ->
    Object.prototype.toString.call( obj ) == '[object Array]'

isFunction = (obj) ->
    obj instanceof Function

fromDomEvent = (eventNames, domNode)->
    assertNotNull(arguments)
    assertDomNode(domNode)
    unless isArray(eventNames)
        eventNames = [eventNames]
    new EventStream((cb)->
        for eventName in eventNames
            domNode.addEventListener(eventName, (e)->
                cb(e)
            )
    )

window.trx = {
    createStream: (eventCallback) ->
        new EventStream(eventCallback)
    fromDomEvent: fromDomEvent
}
