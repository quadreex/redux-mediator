import test from 'tape';
import sinon from 'sinon';
import createMediator from '../src/index';

const setupSpies = () => {
  const store = {
    dispatch: sinon.spy(),
    getState: sinon.spy()
  };
  const next = sinon.spy();

  return { store, next };
};

const mediator = createMediator({
  'action1.in': {
    create: (action, state) => ({
      type: 'action1.out',
      dst: action.src
    }),
    suppress: true
  },
  'optimize.in': {
    create: action => ({
      type: 'optimize.out',
      dst: action.src
    }),
    suppress: false
  },
  'action2.in': {
    type: 'action2.out'
  },
  'conditional': {
    type: 'conditional.out',
    predicate: (action, state) => action.payload === 'pass'
  },
  'conditional.opt': {
    type: 'conditional.out',
    predicate: action => action.payload === 'pass',
    suppress: true
  },
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
  ],
  'multi.in2' : [
    { type: 'multi.out.1' },
    { type: 'multi.out.2' },
    { type: 'multi.out.3' },
  ],
  'multi.in.pred' : [
    { type: 'multi.out' },
    { type: 'multi.out.pass', predicate: action => action.payload === 'pass' },
    { type: 'multi.out.go', predicate: action => action.payload === 'go' },
  ]
});

test('Use action creator, suppress initial action', t => {
  const { store, next } = setupSpies();
  const dispatch = mediator(store)(next);

  dispatch({
    type: 'action1.in',
    src: 'foo',
    dst: 'bar'
  });
  const EXPECTED_ACTION = {
    type: 'action1.out',
    dst: 'foo'
  };

  t.ok(store.getState.calledOnce, 'store.getState should be called once');
  t.ok(store.dispatch.calledOnce, 'store.dispatch should be called once');
  t.deepEqual(
    store.dispatch.getCall(0).args[0],
    EXPECTED_ACTION,
    'store dispatch should be called with mapped action'
  );
  t.notOk(next.called, 'next should not be called for suppressed actions');

  t.end();
});

test('Use action creator, pass initial action, optimize getState() call', t => {
  const { store, next } = setupSpies();
  const dispatch = mediator(store)(next);
  const INITIAL_ACTION = {
    type: 'optimize.in',
    src: 'dst',
    foo: 'bar'
  };
  const EXPECTED_ACTION = {
    type: 'optimize.out',
    dst: 'dst'
  };

  dispatch(INITIAL_ACTION);

  t.notOk(store.getState.called, 'store.getState should not be called');
  t.ok(store.dispatch.calledOnce, 'store.dispatch should be called once');
  t.deepEqual(
    store.dispatch.getCall(0).args[0],
    EXPECTED_ACTION,
    'store dispatch should be called with mapped action'
  );
  t.ok(next.calledOnce, 'next should be called once');
  t.deepEqual(
    next.getCall(0).args[0],
    INITIAL_ACTION,
    'next should be called with initial action'
  );

  t.end();
});

test('Copy payload, pass initial action', t => {
  const { store, next } = setupSpies();
  const dispatch = mediator(store)(next);

  const INITIAL_ACTION = {
    type: 'action2.in',
    src: 'foo',
    dst: 'bar'
  };
  const EXPECTED_ACTION = {
    type: 'action2.out',
    src: 'foo',
    dst: 'bar'
  };

  dispatch(INITIAL_ACTION);

  t.notOk(store.getState.called, 'store.getState should not be called');
  t.ok(store.dispatch.calledOnce, 'store.dispatch should be called once');
  t.deepEqual(
    store.dispatch.getCall(0).args[0],
    EXPECTED_ACTION,
    'store dispatch should be called with mapped action'
  );
  t.ok(next.calledOnce, 'next should be called once');
  t.deepEqual(
    next.getCall(0).args[0],
    INITIAL_ACTION,
    'next should be called with initial action'
  );

  t.end();
});

test('Ignore other actions', t => {
  const { store, next } = setupSpies();
  const dispatch = mediator(store)(next);

  const OTHER_ACTION = {
    type: 'other.action',
    src: 'foo',
    dst: 'bar'
  };

  dispatch(OTHER_ACTION);

  t.notOk(store.getState.called, 'store.getState should not be called');
  t.notOk(store.dispatch.called, 'store.dispatch should not be called');
  t.ok(next.calledOnce, 'next should be called once');
  t.deepEqual(
    next.getCall(0).args[0],
    OTHER_ACTION,
    'next should be called with action'
  );

  t.end();
});

test('Actions with predicate (drop)', t => {
  const { store, next } = setupSpies();
  const dispatch = mediator(store)(next);

  const PREDICATE_ACTION = {
    type: 'conditional',
    payload: 'drop'
  };

  dispatch(PREDICATE_ACTION);

  t.ok(store.getState.called, 'store.getState should be called');
  t.notOk(store.dispatch.called, 'store.dispatch should not be called');
  t.ok(next.calledOnce, 'next should be called once');
  t.deepEqual(
    next.getCall(0).args[0],
    PREDICATE_ACTION,
    'next should be called with action'
  );

  t.end();
});

test('Actions with predicate (pass)', t => {
  const { store, next } = setupSpies();
  const dispatch = mediator(store)(next);

  const PREDICATE_ACTION = {
    type: 'conditional.opt',
    payload: 'pass'
  };
  const EXPECTED_ACTION = {
    type: 'conditional.out',
    payload: 'pass'
  };

  dispatch(PREDICATE_ACTION);

  t.notOk(store.getState.called, 'store.getState should not be called');
  t.ok(store.dispatch.calledOnce, 'store.dispatch should be called');
  t.deepEqual(
    store.dispatch.getCall(0).args[0],
    EXPECTED_ACTION,
    'next should be called with proper action'
  );
  t.notOk(next.called, 'next should not be called');

  t.end();
});

test('Multi descriptor', t => {
  const { store, next } = setupSpies();
  const dispatch = mediator(store)(next);
  const ACTION = {
    type: 'multi.in2',
    src: 'foo'
  };
  const EXPECTED_ACTIONS = [
    {
      type: 'multi.out.1',
      src: 'foo'
    },
    {
      type: 'multi.out.2',
      src: 'foo'
    },
    {
      type: 'multi.out.3',
      src: 'foo'
    },
  ];

  dispatch(ACTION);

  t.notOk(store.getState.called, 'store.getState should not be called');

  const calls = store.dispatch.getCalls();

  t.equal(calls.length, EXPECTED_ACTIONS.length, 'store.dispatch should be called for every action');

  calls.forEach((call, i) => {
    t.deepEqual(
      call.args[0],
      EXPECTED_ACTIONS[i],
      `store dispatch should be called with mapped action (${EXPECTED_ACTIONS[i].type})`
    );
  });

  t.ok(next.calledOnce, 'next should be called once');
  t.deepEqual(
    next.getCall(0).args[0],
    ACTION,
    'next should be called with input action'
  );

  t.end();
});

test('Multi descriptor (suppress)', t => {
  const { store, next } = setupSpies();
  const dispatch = mediator(store)(next);

  dispatch({
    type: 'multi.in',
    src: 'foo'
  });
  const EXPECTED_ACTIONS = [
    {
      type: 'multi.out.1',
      src: 'foo'
    },
    {
      type: 'multi.out.2',
      dst: 'foobar'
    },
    {
      type: 'multi.out.3',
      dst: 'foo'
    }
  ];

  t.ok(store.getState.calledOnce, 'store.getState should be called once');

  const calls = store.dispatch.getCalls();

  t.equal(calls.length, EXPECTED_ACTIONS.length, 'store.dispatch should be called for every action');

  calls.forEach((call, i) => {
    t.deepEqual(
      call.args[0],
      EXPECTED_ACTIONS[i],
      `store dispatch should be called with mapped action (${EXPECTED_ACTIONS[i].type})`
    );
  });

  t.notOk(next.called, 'next should not be called for suppressed actions');

  t.end();
});

test('Multi descriptor (with predicate)', t => {
  const ACTION_NONE = {
    type: 'multi.in.pred',
    payload: 'none'
  };
  const EXPECTED_ACTIONS_NONE = [
    {
      type: 'multi.out',
      payload: 'none'
    }
  ];
  const ACTION_PASS = {
    type: 'multi.in.pred',
    payload: 'pass'
  };
  const EXPECTED_ACTIONS_PASS = [
    {
      type: 'multi.out',
      payload: 'pass'
    },
    {
      type: 'multi.out.pass',
      payload: 'pass'
    }
  ];
  const ACTION_GO = {
    type: 'multi.in.pred',
    payload: 'go'
  };
  const EXPECTED_ACTIONS_GO = [
    {
      type: 'multi.out',
      payload: 'go'
    },
    {
      type: 'multi.out.go',
      payload: 'go'
    }
  ];
  const tests = [
    { input: ACTION_NONE, output: EXPECTED_ACTIONS_NONE },
    { input: ACTION_PASS, output: EXPECTED_ACTIONS_PASS },
    { input: ACTION_GO, output: EXPECTED_ACTIONS_GO },
  ];

  tests.forEach(({ input, output }) => {
    const { store, next } = setupSpies();
    const dispatch = mediator(store)(next);

    dispatch(input);

    t.notOk(store.getState.called, `store.getState should not be called for (${JSON.stringify(input)})`);

    const calls = store.dispatch.getCalls();

    t.equal(calls.length, output.length, 'store.dispatch should be called for passed actions');

    calls.forEach((call, i) => {
      t.deepEqual(
        call.args[0],
        output[i],
        `store dispatch should be called with mapped action (${output[i].type})`
      );
    });

    t.ok(next.calledOnce, 'next should be called once');
    t.deepEqual(
      next.getCall(0).args[0],
      input,
      'next should be called with input action'
    );
  });

  t.end();
});
