// Simple implementation of React's useState hook, similar API totes different impl
// https://reactjs.org/docs/hooks-state.html

/*
Merge fn for updater
prevState => ({...prevState, ...updatedValues});
}

//for(let i=0; i<5; i++) {
  //   let [foo, setFoo] = useState('foo');
  //   console.log('foo is',foo);
  //   foo = setFoo(ps => ps + 'BAZ!');
  //   console.log('foo is',foo);
  //   foo = setFoo(ps => ps + 'BAZ!');
  //   console.log('foo is',foo);
  //   foo = setFoo(ps => ps + 'BAZ!');
  //   console.log('foo is',foo);
  //}

 */

let __stateValueMap = [];

export function useState(initial) {

  let stateIdx = __stateValueMap.length;

  if (!__stateValueMap[stateIdx]) {
    __stateValueMap[stateIdx] = initial;
  } else {
  }

  // console.log('useState', __stateValueMap);

  let setState = (newState) => {
    let currentValue = __stateValueMap[stateIdx];
    if (typeof newState === "function") {
      currentValue = newState(currentValue);
    } else {
      currentValue = newState;
    }
    __stateValueMap[stateIdx] = currentValue;
    return currentValue;
  };

  return [initial, setState];
}