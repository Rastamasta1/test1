// src/components/CryptoAssetCard.js
import React from 'react';

const CryptoAssetCard = ({ asset }) => {
  return (
    <div className="crypto-asset-card">
      <h3>{asset.name}</h3>
      <p>Price: {asset.price}</p>
      <p>Market Cap: {asset.marketCap}</p>
    </div>
  );
};

export default CryptoAssetCard;