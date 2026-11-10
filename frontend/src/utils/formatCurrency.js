export const formatCurrency = (amount, currency = 'USD') => {
  const numeric = Number(amount) || 0;
  
  const currencySymbols = {
    USD: '$',
    INR: '₹',
    EUR: '€',
    GBP: '£',
    CAD: 'CA$',
    AUD: 'A$',
  };

  const symbol = currencySymbols[currency] || '$';

  return `${symbol}${numeric.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

export const getCurrencySymbol = (currency = 'USD') => {
  const currencySymbols = {
    USD: '$',
    INR: '₹',
    EUR: '€',
    GBP: '£',
    CAD: 'CA$',
    AUD: 'A$',
  };
  return currencySymbols[currency] || '$';
};

