t = require('tap').test
trx = require('../dist/trx.js')

t('Create an EventStream, subscribe to and publish with it', (t)->
    s = trx.createStream()
    t.ok trx._EventStream.prototype.isPrototypeOf(s), 'EventStream has initialised'
    s.subscribe (value)->
        t.ok value == 'hello', 'EventStream has been notified by EventStream'
        t.end()

    s.publish('hello')

)

t('Create property from EventStream', (t)->
    p = trx.createStream().createProperty((propertyValue, newValue)->
        propertyValue + newValue
    , 0)
    t.ok trx._Property.prototype.isPrototypeOf(p), 'Prototype has initialised'
    p.subscribe (value)->
        t.ok value == 1, 'EventStream has been notified by Property'
        t.end()

    p.publish(1)
)

t('Create a history from an EventStream', (t)->
    stream = trx.createStream()

    history = stream.createHistory(10)

    stream.publish(i) for i in [0..9]

    history.filter((e)-> e.length > 9 && e[9] == 11).subscribe((e)->
        t.ok e.length == 10, 'history holds right amount of items'
        t.end()
    )

    # Publishing this last number should still cause the history only to hold 10 items
    stream.publish(10) 
    stream.publish(11) 
)

t('once only fires callback once', (t)->
    stream = trx.createStream()
    value = 0

    stream.once((e)->
        value++
    )

    stream.once((e)->
        value++
    )

    stream.publish(1) for i in [0..5]

    setTimeout((e)->
        t.ok value == 2, 'once() only fired one callback'
        t.end()
    , 10)
)
