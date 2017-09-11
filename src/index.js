/**
 * createMediator
 *
 * @param map {Object} - dictionary, used to map initial actions to new ones
 */
export default (map = {}) => store => next => action => {
  const descriptor = map[action.type];
  const noType = !descriptor.type;
  const noCreator = typeof descriptor.create !== 'function';

  if (!descriptor || (noType && noCreator)) {
    return next(action);
  }

  if (noCreator) {
    store.dispatch({ ...action, type: descriptor.type });
  } else {
    const additionalArgs = descriptor.args || [];
    const needStore = descriptor.create.length > additionalArgs.length + 1;
    const params = needStore
      ? [action, ...additionalArgs, store.getState()]
      : [action, ...additionalArgs];

    store.dispatch(descriptor.create(...params));
  }

  if (!descriptor.suppress) {
    return next(action);
  }
};
