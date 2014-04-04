class EventStream
    constructor: (eventCallback) ->
        @_subscribers = [] 
        eventCallback(@_publish)

    subscribe: (subscriber)->
        @_subscribers.push(subscriber)
        @

    addEvent: (eventCallback) =>
        eventCallback(@_publish)

    filter: (condition) =>
        self = @
        new EventStream((cb)->
            self.subscribe((e)->
                cb(e) if(condition(e))
            )
        )

    _publish: (e) =>
        s(e) for s in @_subscribers


assertNotNull = (args) ->
    for a in args
        throw new Error 'variable can not be null' unless a

assertDomNode = (domNode) ->
    unless domNode.hasOwnProperty('nodeType')
        throw new Error 'variable does not contain html element'

fromDomEvent = (eventName, domNode)->
    assertNotNull(arguments)
    assertDomNode(domNode)
    new EventStream((cb)->
        domNode.addEventListener(eventName, (e)->
            cb(e)
        )
    )

window.trx = {
    createStream: (eventCallback) ->
        new EventStream(eventCallback)
    fromDomEvent: fromDomEvent
}

