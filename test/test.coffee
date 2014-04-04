keyup = trx.fromDomEvent('keyup', document.body)
button = document.querySelector('button')
mousedown = trx.fromDomEvent('mousedown', button)
mouseup = trx.fromDomEvent(['mouseleave', 'mouseup'], button)
longPress = trx.createStream()

mousedown.subscribe((e)->
    console.log('mousedown')
    longPress.later(1000, true, mouseup.subscribe)
)

mouseup.subscribe((e)->
    console.log('mouseup or mouseleave')
)

buttonKeyup = keyup.filter((e)->
    e.target.nodeName == 'BUTTON'
)

next = buttonKeyup.filter((e)-> e.keyCode == 40 || e.keyCode == 13 )
prev = buttonKeyup.filter((e)-> e.keyCode == 38 )

next.subscribe((e)->
    console.log('next')
)

prev.subscribe (e)->
    console.log('prev')

longPress.subscribe((e)->
    console.log e
)
