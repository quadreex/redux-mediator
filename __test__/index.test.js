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
    create: (action, a, b, c, state) => ({
      type: 'action1.out',
      a, b, c, dst: action.src
    }),
    args: [1, 2, 3],
    suppress: true
  },
  'optimize.in': {
    create: (action, a, b, c) => ({
      type: 'optimize.out',
      a, b, c, dst: action.src
    }),
    args: [1, 2, 3],
    suppress: false
  },
  'action2.in': {
    type: 'action2.out'
  }
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
    a: 1,
    b: 2,
    c: 3,
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
    src: 'foo',
    dst: 'bar'
  };
  const EXPECTED_ACTION = {
    type: 'optimize.out',
    a: 1,
    b: 2,
    c: 3,
    dst: 'foo'
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
