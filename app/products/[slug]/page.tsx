import AgeGate from '../../../components/age/AgeGate';
import ProductDetailClient from '../../../components/catalog/ProductDetailClient';

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;

  return (
    <AgeGate>
      <ProductDetailClient slug={slug} />
    </AgeGate>
  );
}
