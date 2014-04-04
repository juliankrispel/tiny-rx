keyup = trx.fromDomEvent('keyup', document.body)
button = document.querySelectorAll('button')
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


number = trx.fromDomEvent('click', '.number').map(
    (e)->
        parseInt(e.target.textContent)
)
displayNumber = number.toProperty((memo, e)->
    memo + e
)

display = document.querySelector('.counter')
helement = document.querySelector('.history')
combination = document.querySelector('.combination')

history = trx.createProperty(number.subscribe, (history, e)->
    history.shift() if(history.length > 4)
    history.push e
    history
, [])

displayNumber.subscribe((number)->
    display.textContent = number
)

history.subscribe((h)->
    helement.textContent = h.join(', ')
    if(h.join('') == '12345')
        combination.textContent = 'Combination Unlocked mate'
)
