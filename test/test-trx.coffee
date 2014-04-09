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

t('Create an EventStream with a subscriptionCallback')
