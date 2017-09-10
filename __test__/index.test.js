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
    type: 'action1.out',
    mapPayload: (action, a, b, c) => ({
      a, b, c, src: action.src
    }),
    args: [1, 2, 3],
    suppress: true
  },
  'action2.in': {
    type: 'action2.out'
  }
});

test('Map payload, suppress initial action', t => {
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
    src: 'foo'
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