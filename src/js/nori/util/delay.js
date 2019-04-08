/*
Handy function picked up from this blog post
https://medium.freecodecamp.org/hooked-on-hooks-how-to-use-reacts-usereducer-2fe8f486b963

Usage
const doSomething = async () => {
   //foo
   await delay(500);
   // bar
};
 */


export const delay = (time = 1000) => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(true);
    }, time);
  });
};