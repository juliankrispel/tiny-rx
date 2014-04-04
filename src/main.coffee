class EventStream
    constructor: (eventCallback) ->
        @_subscribers = [] 
        self = @
        eventCallback(@publish)

    subscribe: (subscriber)->
        @_subscribers.push(subscriber)
        @

    filter: (condition) =>
        self = @
        new EventStream((cb)->
            self.subscribe((e)->
                cb(e) if(condition(e))
            )
        )

    publish: (e) =>
        s(e) for s in @_subscribers

#filter: (condition)
        



#
#    filter: (fn) ->
#        new EventStream(()->
#            fn(e) === true
#        )

fromDomEvent = (eventName, domNode)->
    new EventStream((cb)->
        domNode.addEventListener(eventName, (e)->
            cb(e)
        )
    )




# Test
click = fromDomEvent('click', document)

button = click.filter((e)->
    e.target.nodeName == 'BUTTON'
)

click.subscribe(()->
    console.log('whatever')
)

button.subscribe(()->
    console.log('button clicked')
)


console.log 


