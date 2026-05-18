export const FormatCurrency = (value, currency = 'USD') => {
  if (value === null || value === undefined || value === '') return '-';
  if (typeof value !== 'number') {
    value = parseFloat(value);
    if (isNaN(value)) return '-';
  }
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(value);
};