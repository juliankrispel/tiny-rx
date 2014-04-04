keyup = trx.fromDomEvent('keyup', document.body)
button = document.querySelector('button')
mousedown = trx.fromDomEvent('mousedown', button)
mouseup = trx.fromDomEvent(['mouseleave', 'mouseup'], button)
longPress = trx.createStream()

#`mousedown.subscribe((e)->
#`    console.log('mousedown')
#`    longPress.later(1000, true, mouseup.subscribe)
#`)
#`
#`mouseup.subscribe((e)->
#`    console.log('mouseup or mouseleave')
#`)

buttonKeyup = keyup.filter((e)->
    e.target.nodeName == 'BUTTON'
)

next = buttonKeyup.filter((e)-> e.keyCode == 40 || e.keyCode == 13 )

prev = buttonKeyup.filter({keyCode: 13, target: {nodeName: 'BUTTON'}})

#next.subscribe((e)->
#    console.log('next')
#)
#
#prev.subscribe (e)->
#    console.log('prev')
#
#longPress.subscribe((e)->
#    console.log e
#)

plusButton = document.getElementById('plus')
minusButton = document.getElementById('minus')

plusminus = trx.fromDomEvent('click', minusButton).map(-1).merge(
    trx.fromDomEvent('click', plusButton).map(1)
)

prop = trx.createProperty(plusminus.subscribe, (history, e)->
    history.pop() if(history.length > 4)
    history.push e
    history
, [])

prop.subscribe((prop)->
    console.log(prop)
)
