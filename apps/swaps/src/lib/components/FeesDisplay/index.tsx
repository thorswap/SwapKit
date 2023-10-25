import React from 'react';



const FeesComponent: React.FC<any> = ({ route }) => {
  let grandTotalFee = 0;
  let grandTotalFeeUsd = 0;

  Object.keys(route.fees).forEach((key) => {
    route.fees[key].forEach((fee) => {
      grandTotalFee += fee.totalFee;
      grandTotalFeeUsd += fee.totalFeeUSD;
    });
  });

  return (
    <div>
      <div>
        <strong>Grand Total Fee:</strong> {grandTotalFee.toFixed(8)}
      </div>
      <div>
        <strong>Grand Total Fee USD:</strong> {grandTotalFeeUsd.toFixed(8)}
      </div>
      <div>
        <small>
          fees:{" "}
          {Object.keys(route.fees).map((key) => (
            <div key={key}>
              {key}:{" "}
              {route.fees[key].map((fee, index) => (
                <div key={index}>
                  - {fee.type}: {fee.totalFee} ({fee.totalFeeUSD} USD)
                </div>
              ))}
            </div>
          ))}
        </small>
      </div>
    </div>
  );
};

export default FeesComponent;
