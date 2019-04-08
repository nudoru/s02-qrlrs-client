/* @jsx h */

/**
 * Example component that uses hooks
 */

import {h} from "../nori/Nori";
import {useState, useEffect, useMemo, useRef, useContext} from "../nori/Hooks";
import {css} from 'emotion';
import {createContext} from "../nori/Context";

const blue = css`
  padding-left: 1rem;
  color: blue;
`;


const useTitle = title => {
  useEffect(() => {
    document.title = title;
  });
};

let ContextComp = createContext();

const useGetInputDisplay = value => {
  return useMemo(() => {
    return <span className={blue}><span>{value}</span></span>;
  }, [value]);
};

// const Label = _ => {
//   const cntx = useContext(ContextComp);
//   return <span>{cntx.label}</span>
// };

export const InputControls = props => {
  let [inputValue, setInputValue] = useState('');
  let Output = useGetInputDisplay(inputValue);
  useTitle(inputValue);
  const inputRef = useRef(null);

  const _onInputChange = e => {
    setInputValue(e.target.value);
  };

  const _onInputFocus = e => console.log('focus',e);
  const _onInputBlur = e => console.log('blur',e);


  return (
    <div>
      <ContextComp.Provider value={{label: 'Magic: '}}>
        <ContextComp.Consumer>
          {value => <span>{value.label}</span>}
        </ContextComp.Consumer>
      </ContextComp.Provider>
      <input
      ref={inputRef}
      type='text'
      placeholder='Type here'
      onInput={_onInputChange}
      onFocus={_onInputFocus}
      onBlur={_onInputBlur}
    /><Output/></div>
  )
};