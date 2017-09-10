
export default (map = {}) => store => next => action => {
  const mapped = map[action.type];

  if (!mapped || !mapped.type) {
    return next(action);
  }

  let newAction;

  if (typeof mapped.mapPayload !== 'function') {
    newAction = {
      ...action,
      type: mapped.type
    };
  } else {
    newAction = {
      ...mapped.mapPayload(action, ...(mapped.args || []), store.getState()),
      type: mapped.type
    };
  }

  store.dispatch(newAction);

  if (!mapped.suppress) {
    return next(action);
  }
};