export const distribuirClasses = (n) => {
  let numMrWhite = 0;
  let numUndercover = 0;
  let numCivis = 0;

   if(n == 3 || n == 4){
    numUndercover = 1;
    numMrWhite = 0;
    numCivis = n - numUndercover - numMrWhite;
  }

  else if (n > 4 && n <= 100){
    numCivis = n % 2 === 0 ? n / 2 + 1 : (n + 1) / 2;
    numMrWhite = n < 5 ? 0 : Math.floor((n - 5) / 6) + 1;
    numUndercover = n - numCivis - numMrWhite;
  }

  // else if(n == 5 || n == 6){
  //   numUndercover = 1;
  //   numMrWhite = 1;
  //   numCivis = n - numUndercover - numMrWhite;
  // }

  // else if(n == 7 || n == 8){
  //   numUndercover = 2;
  //   numMrWhite = 1;
  //   numCivis = n - numUndercover - numMrWhite;
  // }

  // else if (n == 9 || n == 10) {
  //   numUndercover = 3;
  //   numMrWhite = 1;
  //   numCivis = n - numUndercover - numMrWhite;
  // }

  // else if (n > 10) {
  //   numCivis = n % 2 === 0 ? n / 2 + 1 : (n + 1) / 2;
  //   numMrWhite = n < 5 ? 0 : Math.floor((n - 5) / 6) + 1;
  //   numUndercover = n - numCivis - numMrWhite;

  //   // numMrWhite = 2;
  //   // numUndercover = Math.floor(n / 4);
  // }

  // const numCivis = n - numMrWhite - numUndercover;
  return {
    distribuicao: [
      ...Array(numUndercover).fill("Undercover"),
      ...Array(numMrWhite).fill("Mr. White"),
      ...Array(numCivis).fill("Civil"),
    ].sort(() => 0.5 - Math.random()),
    numCivis,
    numUndercover,
    numMrWhite
  };
};