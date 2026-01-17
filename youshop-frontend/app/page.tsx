import Link from 'next/link';
import SearchBar from '@/components/SearchBar';
import ProductGrid from '@/components/ProductGrid';

export const metadata = {
  title: "Home - youShop",
  description: "Welcome to youShop, your go-to e-commerce platform",
};

export default async function Home({ searchParams }: { searchParams?: Promise<{ q?: string }> }) {
  const params = await searchParams;
  const query = params?.q || '';

  return (
    <div className="min-h-screen bg-gray-50 mt-15">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <SearchBar defaultValue={query} />
        </div>
        
        <ProductGrid searchQuery={query} />
      </div>
    </div>
  );
}
