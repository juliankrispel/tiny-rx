keyup = trx.fromDomEvent('keyup', document.body);
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
