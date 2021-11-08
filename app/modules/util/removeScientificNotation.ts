import BigNumber from 'bignumber.js'

export const removeScientificNotation = (number: any) => {
  const notationExists = number.toString().indexOf('-')
  if(notationExists !== -1 ) {
    return new BigNumber(number).toFormat()
  } else
  return +number
} 
