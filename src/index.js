/**
 * createMediator
 *
 * @param map {Object} - dictionary, used to map initial actions to new ones
 */
export default (map = {}) => store => next => action => {
  const descriptor = map[action.type];
  const hasDescriptor = typeof descriptor === 'object';
  const { type, create, predicate, suppress } = descriptor || {};
  const hasType = typeof type !== 'undefined';
  const hasCreator = typeof create === 'function';
  const hasPredicate = typeof predicate === 'function';
  const needState = (hasCreator && create.length > 1)
    || (hasPredicate && predicate.length > 1);
  const state = needState ? store.getState() : void 0;

  if (!hasDescriptor || !(hasType || hasCreator)) {
    return next(action);
  }

  if (hasPredicate && !predicate(action, state)) {
    return next(action);
  }

  const newAction = hasCreator
    ? create(action, state)
    : { ...action, type };

  store.dispatch(newAction);

  if (!suppress) {
    return next(action);
  }
};
