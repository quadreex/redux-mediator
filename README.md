# redux-mediator

[![NPM version](https://img.shields.io/npm/v/redux-mediator.svg)](https://www.npmjs.com/package/redux-mediator)
[![Build Status](https://travis-ci.org/quadreex/redux-mediator.svg?branch=master)](https://travis-ci.org/quadreex/redux-mediator)
[![Coverage Status](https://coveralls.io/repos/github/quadreex/redux-mediator/badge.svg?branch=master)](https://coveralls.io/github/quadreex/redux-mediator?branch=master)

Redux middleware to support mediator pattern. Helps you to reduce complexity of large redux applications by separating your codebase into independent modules which know nothing about each other. Communication between modules is encapsulated within a mediator middleware. Modules no longer use actions of each other directly, but instead communicate through the mediator. Mediator maps output actions of one module to input actions of another. This reduces the dependencies between communicating objects, thereby reducing coupling.

## Install

```
npm install redux-mediator --save
```

## Usage

The default export is a function - creator of middleware. It accepts one Object parameter - action mapper. Keys of this object is action types, values - descriptors of action transformation. 

Transformation descriptor fields:
- `type` - type of mapped action (required*);
- `create` - function to create new action based on old one (required*);
- `args` - additional arguments for transformation function (optional);
- `suppress` - boolean flag, which indicates if initial action should be suppressed (optional).

\* user have to specify one of `type` or `create`. If `create` is specified, then `type` will be ignored.

Action creator:
```javascript
create(action, ...args, state)
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
      /*
        create new action with type 'action1.out'
        with payload 'a', 'b', and 'c' from params and 
        'dst' from initial action field 'src'
      */
      create: (action, a, b, c, state) => ({
        type: 'action1.out',
        a, b, c, dst: action.src
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
