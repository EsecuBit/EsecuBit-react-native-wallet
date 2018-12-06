import Router from '../router/Router'
const initialState = Router.router.getStateForAction(
  Router.router.getActionForPathAndParams('Handler')
)
const navigationReducer = (state = initialState, action) => {
  const newState = Router.router.getStateForAction(action, state);
  return newState || state;
};

export default navigationReducer;