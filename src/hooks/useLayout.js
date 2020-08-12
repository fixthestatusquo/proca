import {
  atom,
  useSetRecoilState,
  useRecoilValue
} from 'recoil';


let state = null;

export const init = (data) => {
  if (state) return false;
  const d ={
    variant:"filled", // options filled, outlined, standard
    margin:"dense",
    primaryColor: '#1976d2',
    secondaryColor: '#dc004e',
    paletteType:'light',
    backgroundColor:'tranparent',
    ...data
  } // default value (aka initial value)

  state = atom({
  key:"layout",
  default: d});
  return true;
}

init();

const useLayout = () =>  useRecoilValue (state);

const useSetLayout = () => {

  const _set = useSetRecoilState(state);

  //const set = useCallback((key, value) => {
  const set = (key, value) => {

    if (typeof key === 'object') {
      _set(current => {
        return {...current, ...key}
      });
      return;
    }
     _set(current =>{
       let d = {...current};
       d[key]=value;
       return d;
     });
  }//,[_set]);

  return set;
}


export {useSetLayout, useLayout};
export default useLayout;
