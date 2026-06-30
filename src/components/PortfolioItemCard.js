export default function PortfolioItemCard({ title, details }) {
  return (
    <div className="portfolio-item-card">
      <h3>{title}</h3>
      <p>{details}</p>
    </div>
  );
}