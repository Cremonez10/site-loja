import AgeGate from '../components/age/AgeGate';
import CatalogClient from '../components/catalog/CatalogClient';

export default function HomePage() {
  return (
    <AgeGate>
      <CatalogClient />
    </AgeGate>
  );
}
