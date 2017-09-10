# redux-mediator

Redux middleware to support mediator pattern. Helps you to reduce complexity of large redux applications by separating your codebase into independent modules which know nothing about each other. Communication between modules is encapsulated within a mediator middleware. Modules no longer use actions of each other directly, but instead communicate through the mediator. Mediator maps output actions of one module to input actions of another. This reduces the dependencies between communicating objects, thereby reducing coupling.

## Install

```
npm install redux-mediator --save
```

## Usage

The default export is a function - creator of middleware. It accepts one Object parameter - action mapper. Keys of this object is action types, values - descriptors of action transformation. 

Transformation descriptor fields:
- `type` - type of mapped action (required);
- `mapPayload` - function to transform payload (optional);
- `args` - additional arguments for transformation function (optional);
- `suppress` - boolean flag, which indicates if initial action should be suppressed (optional).

Transformation function:
```javascript
mapPayload(action, ...args, state)
```
- action - initial action;
- args - additional arguments (if defined in descriptor);
- state - current redux state (result of `store.getState()` call).

Example:
```javascript
import createMediator from 'redux-mediator';

const mediator = createMediator({

  /* For each action with type 'action1.in' */
  'action1.in': {
      /* create new action with type 'action1.out' */
      type: 'action1.out',
      /*
        with payload 'a', 'b', and 'c' from params and 
        'src' from initial action
      */
      mapPayload: (action, a, b, c) => ({
        a, b, c, src: action.src
      }),
      args: [1, 2, 3], // values to be passed as params to 'mapPayload function'
      suppress: true // suppress initial action
      /*
        Initial action will be suppressed. Dispatching of action
        'action1.in' will actually dispatch action 'action1.out'
      */
  },
  
  /* For each action with type 'action2.in' */
  'action2.in': {
    /*
      create new action with type 'action2.out' and the same
      payload as in initial action
    */
    type: 'action2.out'
    /*
      Initial action won't be suppressed. Dispatching of action
      'action2.in' will actually dispatch two actions:
      'action2.in' and 'action2.out'
    */
  }
});
```

## License

MIT
