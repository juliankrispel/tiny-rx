t = require('tap').test
trx = require('../dist/trx.js')

t('Create EventStream', (t)->
    stream = trx.createStream()
    t.ok typeof stream == 'object', 'EventStream has initialised'
    t.end()
)

t('Subscribe and publish with EventStream', (t)->
    s = trx.createStream()
    s.subscribe (value)->
        t.ok value == 'ello', 'Subscriber has been notified'
        t.end()

    s.publish 'value'
)
