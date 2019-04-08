// Based on MobX and the talk by Max Gallo
// https://www.youtube.com/watch?v=9TBCmCN82w0
// https://github.com/maxgallo/talk-rxjs-mobx

const accessedObservables = [];
const derivationGraph     = {};

export const observable = (targetObject) => {
  const observableObject = {};

  const unique = Math.random();

  function getObservableId(key) {
    return unique + key;
  }


  Object.keys(targetObject).forEach(objectKey => {
    Object.defineProperty(
      observableObject,
      objectKey,
      {
        get() {
          accessedObservables.push(getObservableId(objectKey));
          return targetObject[objectKey];
        },
        set(value) {
          targetObject[objectKey] = value;
          derivationGraph[getObservableId(objectKey)].forEach(runner => {
            runner()
          })
        }
      }
    )
  })


  return observableObject;
};

export const autorun = (runner) => {
  accessedObservables.length = 0;
  runner();
  // console.log(accessedObservables);
  accessedObservables.forEach(objectId => {
    derivationGraph[objectId] = derivationGraph[objectId] || [];
    derivationGraph[objectId].push(runner)
  });
};