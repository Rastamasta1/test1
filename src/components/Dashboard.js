// src/components/Dashboard.js
import React from 'react';
import DashboardHeader from './DashboardHeader';
import DashboardSidebar from './DashboardSidebar';
import PortfolioItemCard from './PortfolioItemCard';
import CryptoAssetCard from './CryptoAssetCard'; // New import for crypto assets

const Dashboard = () => {
  const portfolioItems = [
    { itemId: 1, title: 'Project X', details: 'Details about Project X' },
    { itemId: 2, title: 'Project Y', details: 'Details about Project Y' }
  ];

  const cryptoAssets = [
    { name: 'Bitcoin', price: '$50,000', marketCap: '$1 trillion' },
    { name: 'Ethereum', price: '$3,000', marketCap: '$400 billion' }
  ]; // Sample data for crypto assets

  return (
    <div className="dashboard">
      <DashboardHeader />
      <DashboardSidebar />
      <main>
        <h2>Portfolio Items</h2>
        {portfolioItems.map(item => (
          <PortfolioItemCard key={item.itemId} item={item} />
        ))}

        <h2>Crypto Assets</h2>
        {cryptoAssets.map(asset => (
          <CryptoAssetCard key={asset.name} asset={asset} />
        ))}
      </main>
    </div>
  );
};

export default Dashboard;