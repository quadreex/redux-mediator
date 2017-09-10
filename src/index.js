/**
 * createMediator
 *
 * @param map {Object} - dictionary, used to map initial actions to new ones
 */
export default (map = {}) => store => next => action => {
  const descriptor = map[action.type];

  if (!descriptor || !descriptor.type) {
    return next(action);
  }

  const payload = typeof descriptor.mapPayload === 'function'
    ? descriptor.mapPayload(action, ...(descriptor.args || []), store.getState())
    : action;

  const newAction = {
    ...payload,
    type: descriptor.type
  };

  store.dispatch(newAction);

  if (!descriptor.suppress) {
    return next(action);
  }
};
