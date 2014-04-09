#Tiny Rx
Tiny-rx is a small toolset that borrows concepts from [functional reactive programming](http://en.wikipedia.org/wiki/Functional_reactive_programming) to __help you avoid callback hell__. Here's @cmeiklejohn's [articulate presentation](https://www.youtube.com/watch?v=ZOCCzDNsAtI) on frp. Trx is mainly inspired by the excellent [baconjs](https://github.com/baconjs/bacon.js/tree/master).

##Getting Started
Since I haven't published tiny-rx on npm yet (it's still very early), just use the link to my repository
```bash
npm install juliankrispel/tiny-rx
```

Include tinyrx in your html file
```html
<script src="node_modules/tiny-rx/dist/trx.js"></script>
```

or require it as a node module
```javascript
var trx = require('tiny-rx');
```

#API Documentation
There are basically two classes that trx provides, EventStream and Property. They both inherit the same interface, with the main difference that Property holds a state.


### `trx.createStream(eventCallback)`
Library method for creating streams. (Internally this executes `new EventStream(eventCallback)`)

| Argument | Type | Details |
| ---- | ---- | --- |
| `notifier` | `[function]` | A function that notifies the EventStream |

#### Example
Note that to successfully notify a stream, you need to call the callback function that is passed to the notifier as the only argument.

```javascript
var clickStream = trx.createStream(
    function(notifyStream){
        document.addEventListener('click', function(e){
            notifyStream(e);
        });
    }
);
```

### `trx.fromDomEvent(eventName, selectors)`
Convenience method for creating an EventStream from dom events.

| Argument | Type | Details |
| ---- | ---- | --- |
| `eventName` | `String` | the name of the event you want to listen to. |
| `selectors` | `String``[Strings]``Node``[NodeList]` | The dom selectors used for listening to the events. Can be either a string, an array of strings an actual dom node or a nodelist |

__`Returns instance of `EventStream`__

#### Example

```javascript
// Create stream from click events on every button element
var buttonClickEvents = trx.fromDomEvent('click', 'button');

// Create stream from click events on a list of header elements 
var headerClickEvents = trx.fromDomEvent('click', ['h1', 'h2', 'h3', 'h4', 'h5']);

// Create stream from click events on every link
var linkClickEvents = trx.fromDomEvent('click', 'a[href]');
```

## EventStream
An EventStream is an object that can both subscribe to and publish events (or arbitrary values).

### `EventStream.subscribe( callback )`

| Argument | Type | Details |
| ---- | ---- | --- |
| `callback` | `function` | A callback function that executes when the stream fires an event |
  
__Returns `EventStream` that we subscribed to__

#### Example:
```javascript
// First create a stream
var clicks = trx.fromDomEvent('click', document);

// Subscribe a callback to click stream
clicks.subscribe(function(e){
    alert(e.target.nodeName + ' has been clicked');
});
```

### `EventStream.map( mapping )`

| Argument | Type | Details |
| ---- | ---- | --- |
| `mapping` | `string`,`number` | When passed a string or a number, EventStream.map will return a stream that publishes the argument everytime itself gets notified|
| `mapping` | `function` | When passed a function, EventStream.map will map its notifications to what the function returns. The event or stream value will be passed to the mapping function |

__Returns instance of `EventStream`__

#### Example:
```javascript
var number = 0;

// Create two streams
var plusButton = trx.fromDomEvent('click', 'button.plus');
var minusButton = trx.fromDomEvent('click', 'button.minus');

// Then map the streams
var pluses = plusButton.map(1);
var minuses = minusButton.map(-1);

pluses.subscribe(function(value){
    number + value;
});

minuses.subscribe(function(value){
    number + value;
});

// Now everytime a plusButton or minusButton gets clicked, number changes;
```

### `EventStream.extract( extractor )`

| Argument | Type | Details |
| ---- | ---- | --- |
| `extractor` | `string` | When passed a string, EventStream.extract will extract an event property of such name |
| `extractor` | `function` | When passed a function, EventStream.extract will create a stream from the return value. The event will be passed as an argument | 

__Returns instance of `EventStream`__

```javascript
// Create an EventStream
var plusButton = trx.fromDomEvent('click', document);

// Extract property from event object 
var classes = plusButton.extract('x');

classes.subscribe(function(xValue){
    alert('You clicked on a thing ' + xValue + ' pixels away from the left side of your screen');
});
```

### `EventStream.filter( condition, [value] )`

| Argument | Type | Details |
| ---- | ---- | --- |
| `condition` | `string` | When a string is passed, EventStream.filter will filter events which have a property of such name. If value is being passed as well, the content of the event property needs to be equal to value |
| `condition` | `function` | When a function is passed, the stream gets filtered by evaluating the functions return value. The event object gets passed into this function |
| `condition` | `object` | When an object is passed, EventStream.filter will check if object is identical or contained within the event object |
| `value` (optional) | `any` | When passed a `value` EventStream.filter will use it to compare it to `e[condition]`. It filters where `e[condition] == value` returns true | 

__Returns instance of `EventStream`__

```javascript
// TODO: Write Example
```

### `EventStream.truethy()`
Returns an EventStream that only contains truethy values. Does not take any arguments.

__Returns instance of `EventStream`__

```javascript
// TODO: Write Example
```

### `EventStream.createHistory( [steps] )`
Creates a `Property` that contains an array of event objects in the order they were fired.

| Argument | Type | Details |
| ---- | ---- | --- |
| `steps` (optional) | `number` | The number of events objects that are recorded |

__Returns instance of `Property`__

```javascript
// TODO: Write Example
```

## Property
A Property is an object that can both subscribe to and publish events (or arbitrary values).
