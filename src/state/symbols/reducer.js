import authTypes from 'state/auth/constants'

import types from './constants'

const initialState = {
  coins: [],
  pairs: [],
}

export function symbolsReducer(state = initialState, action) {
  switch (action.type) {
    case types.UPDATE_SYMBOLS: {
      const { coins, pairs } = action.payload
      return {
        ...state,
        coins: coins.sort().map(sym => sym.toUpperCase()),
        pairs: pairs.sort(),
      }
    }
    case authTypes.LOGOUT:
      return initialState
    default: {
      return state
    }
  }
}

export default symbolsReducer