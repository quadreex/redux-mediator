import test from 'tape';
import sinon from 'sinon';
import createMapper from '../src/index';

const resetSpies = (store, next) => {
  store.dispatch.reset();
  store.getState.reset();
  next.reset();
};

test('Map actions', t => {
  t.plan(9);

  const store = {
    dispatch: sinon.spy(),
    getState: sinon.spy()
  };
  const next = sinon.spy();

  const mapper = createMapper({
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
  const dispatch = mapper(store)(next);

  dispatch({
    type: 'action1.in',
    src: 'foo',
    dst: 'bar'
  });
  const EXPECTED_ACTION1 = {
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
    EXPECTED_ACTION1,
    'store dispatch should be called with mapped action'
  );
  t.notOk(next.called, 'next should not be called for suppressed actions');

  resetSpies(store, next);

  dispatch({
    type: 'action2.in',
    src: 'foo',
    dst: 'bar'
  });
  const EXPECTED_ACTION2 = {
    type: 'action2.out',
    src: 'foo',
    dst: 'bar'
  };

  t.notOk(store.getState.called, 'store.getState should not be called');
  t.ok(store.dispatch.calledOnce, 'store.dispatch should be called once');
  t.deepEqual(
    store.dispatch.getCall(0).args[0],
    EXPECTED_ACTION2,
    'store dispatch should be called with mapped action'
  );
  t.ok(next.calledOnce, 'next should be called once');
  t.deepEqual(
    next.getCall(0).args[0],
    {
      type: 'action2.in',
      src: 'foo',
      dst: 'bar'
    },
    'next should be called with original action'
  );
});