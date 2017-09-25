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
- `type` [any] - type of mapped action (required*);
- `create` [function] - action creator (required*);
- `predicate` [function] - predicate to check if action should be mapped (optional).
- `suppress` [boolean] - flag, which indicates if initial action should be suppressed (optional).

\* user have to specify one of `type` or `create`. If `create` is specified, then `type` will be ignored.

Action creator:
```javascript
create(action, state)
```
- action - initial action;
- state - current redux state (result of `store.getState()` call).

Predicate:
```javascript
predicate(action, state)
```
- action - initial action;
- state - current redux state (result of `store.getState()` call).

Example:
```javascript
import createMediator from 'redux-mediator';

const mediator = createMediator({
    /* For each action with type 'action1.in' */
    'action1.in': {
        /*
          create new action with type 'action1.out'
          with payload 'dst' populated from initial action field 'src'
        */
        create: (action, state) => ({
            type: 'action1.out',
            dst: action.src
        }),
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
    },
    
    /* For each action with type 'cond.in' which satisfies predicate */
    'cond.in': {
        /*
          create new action with type 'cond.out'
          with payload 'dst' populated from initial action field 'src'
        */
        create: (action, state) => ({
            type: 'cond.out',
            dst: action.src
        }),
        predicate: (action, state) => action.value > 0,
        suppress: true // suppress initial action
        /*
          If predicate returns true for initial action it will be suppressed
          and new action with type 'cond.out' will be dispatched.
          If predicate returns false for initial action it will be dispatched.
        */
    },
    
    /*
      Also you can map action to an array of descriptors.
    */
    'multi.in' : [
        { type: 'multi.out.1', suppress: true },
        { create: (action, state) => ({
          type: 'multi.out.2',
          dst: action.src + 'bar'
        }) },
        { create: (action, state) => ({
          type: 'multi.out.3',
          dst: action.src
        }) }
    ]
});
```

## Changelog

version 1.1.0:
- added support for multi descriptors

version 1.0.1:
- first stable version

## License

MIT
