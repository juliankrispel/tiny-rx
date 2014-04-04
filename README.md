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

##Using trx
At the moment you can create a eventstreams and filter them, Filtering an eventstream returns a new eventstream that subscribes to the filtered one, that's pretty much it. But just with that alone a lot can be achieved:

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
```

###Credit where credit is due
Trx Inspired by [bacon.js](https://github.com/baconjs/bacon.js/tree/master) and [RxJS](https://github.com/Reactive-Extensions/RxJS) and the amazing useful concepts these libraries make use of.
