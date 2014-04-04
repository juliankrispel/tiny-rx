#Tiny Rx
Tiny Rx is/will be a very small library (no dependencies) for creating and making use of event streams in javascript. I'm making this little library because I wanted to 1. understand what's involved in a basic implementation of an eventstream and 2. have a very tiny solution instead of using something bigger.

##Getting Started
Since I haven't published tiny-rx on npm yet (it's still very early), just use the link to my repository
```bash
npm install juliankrispel/tiny-rx
```

Include in your html file
```html
<script src="node_modules/tiny-rx/dist/trx.js"></script>
```

##Getting Started
Tiny-rx is a minimal set of tools to help you avoiding callback hell. With `EventStream`'s you can make sense of event flow and get rid of state.

1. Create an EventStream
You can create a stream pretty much from anything, but the easiest way is to use a shorthand method like fromDomEvent
```javascript
var clickEvents = trx.fromDomEvent('click', document.body);
```

2. Subscribing to an EventStream
To react to your events, just use the subscribe method
```javascript
clickEvents.subscribe(function(e){
    alert('Hey, you clicked on my body');
})
```
Pretty standard ey, now let's see what tiny-rx can really do

3. Organising EventStreams
With tiny-rx you have tools to help you to map and filter your events, extract properties etc. 

TODO: Write a good readme


```javascript
var clickEvents = trx.fromDomEvent('click', document.body);

var buttonPressed = clickEvents.filter(function(e){
    return e.target.nodeName === 'BUTTON';
});

var helloButtonPressed = buttonPressed.filter(function(e){
    return e.target.textContent === 'Hello';
});

var numberButtonPressed = buttonPressed.filter(function(e){
    return typeof parseInt(e.target.textContent) == 'number';
});

numberButtonPressed.subscribe(function(e){
    alert('Pressed button with number ' + e.target.textContent);
});
```

###Credit where credit is due
Trx is inspired by [bacon.js](https://github.com/baconjs/bacon.js/tree/master) and [RxJS](https://github.com/Reactive-Extensions/RxJS) and the beautifully simple concepts of [frp](http://en.wikipedia.org/wiki/Functional_reactive_programming).
