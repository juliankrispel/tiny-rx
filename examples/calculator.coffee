keyup = trx.fromDomEvent('keyup', document.body)
button = document.querySelectorAll('button')
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


buttonClick = trx.fromDomEvent('click', 'button').map(
    (e)-> e.target.textContent
)

$display = document.querySelector('.display')

buttonHistory = buttonClick.createHistory()

expression = buttonClick.createProperty((memo, e)->
    if(e == '=')
        memo
    else
        memo + '' + e
, '')

buttonClick.subscribe((e)->
    if e == '='
        result = parseExpression(expression.value())
        expression.value(result)
        $display.textContent = result
    else 
        $display.textContent = expression.value()
)

parseExpression = (expression) ->
    splitExpression = expression.match(/(?:[0-9]+)|[\+\-\*\/]/gi);
    console.log splitExpression
    processExpression(splitExpression)

processExpression = (tokens) ->
    result = ''
    switch tokens[1]
        when '-' then result = +tokens[0] - +tokens[2]
        when '+' then result = +tokens[0] + +tokens[2]
        when '/' then result = +tokens[0] / +tokens[2]
        when '*' then result = +tokens[0] * +tokens[2]

    if(tokens.length > 3)
        tokens.splice(0, 3)
        tokens.unshift(result)
        processExpression(tokens)
    else
        result
