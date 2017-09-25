/**
 * createMediator
 *
 * @param map {Object} - dictionary, used to map initial actions to new ones
 */
export default (map = {}) => store => next => action => {
  const descriptor = map[action.type];

  if (typeof descriptor !== 'object') return next(action);

  const multi = Array.isArray(descriptor);
  const descriptors = multi ? descriptor : [descriptor];

  const steps = descriptors
    .map(parser)
    .filter(step => step !== null);

  if (!steps.length) return next(action);

  const flags = any({
    needState: ({ needState }) => needState,
    suppress: ({ suppress }) => suppress
  })(steps);
  const state = flags.needState ? store.getState() : void 0;

  steps.forEach(step => {
    if (step.predicate(action, state)) {
      store.dispatch(step.create(action, state));
    }
  });

  if (!flags.suppress) {
    return next(action);
  }
};

const parser = (descriptor = {}) => {
  const { type, create, predicate, suppress } = descriptor;
  const hasType = typeof type !== 'undefined';
  const hasCreator = typeof create === 'function';
  const hasPredicate = typeof predicate === 'function';
  const needState = (hasCreator && create.length > 1)
    || (hasPredicate && predicate.length > 1);

  if (!hasType && !hasCreator) {
    return null;
  }

  return {
    create: hasCreator ? create : action => ({ ...action, type }),
    predicate: hasPredicate ? predicate : trueFn,
    needState,
    suppress
  }
};

const trueFn = () => true;

const any = predicates => {
  const keys = Object.keys(predicates);

  return arr => arr.reduce((acc, el) => keys.reduce((acc, key) => {
    acc[key] = acc[key] || predicates[key](el);

    return acc;
  }, acc), {});
};
