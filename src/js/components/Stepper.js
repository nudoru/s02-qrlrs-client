/* @jsx h */

/**
 * From here https://medium.freecodecamp.org/hooked-on-hooks-how-to-use-reacts-usereducer-2fe8f486b963
 */

import {h} from "../nori/Nori";
import {useReducer} from "../nori/Hooks";
import {css} from 'emotion';
import {delay} from '../nori/util/delay';

const blue = css`
  padding-left: 1rem;
  color: blue;
`;

const initialState = {
  loading: false,
  count: 0,
};

const reducer = (state, action) => {
  switch (action.type) {
    case 'increment': {
      return { ...state, count: state.count + 1, loading: false };
    }
    case 'decrement': {
      return { ...state, count: state.count - 1, loading: false };
    }
    case 'loading': {
      return { ...state, loading: true };
    }
    default: {
      return state;
    }
  }
};

export const Stepper = props => {
  const [{ count, loading }, dispatch] = useReducer(reducer, initialState);

  const onHandleIncrement = async () => {
    dispatch({ type: 'loading' });
    await delay(500);
    dispatch({ type: 'increment' });
  };

  const onHandleDecrement = async () => {
    dispatch({ type: 'loading' });
    await delay(500);
    dispatch({ type: 'decrement' });
  };

  return (
    <div>
      <p>Count {loading ? 'loading..' : count}
      <button type="button" onClick={onHandleIncrement}>+</button>
      <button type="button" onClick={onHandleDecrement}>-</button>
      </p>
    </div>
  );
};