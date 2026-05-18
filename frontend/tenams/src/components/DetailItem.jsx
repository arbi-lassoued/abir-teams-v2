 import { FormatCurrency } from './FormatCurrency';

const DetailItemC = ({ label, value, currency = false, currencyType = 'USD' }) => {
  const displayValue = currency ? FormatCurrency(value, currencyType) : value;
  
  return (
    <div className="detail-item">
      <div className="font-semibold text-gray-700">{label}:</div>
      <div className="text-gray-900">{displayValue}</div>
    </div>
  );
};

export default DetailItemC;