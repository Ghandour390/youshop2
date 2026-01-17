import Link from 'next/link';
import { notFound } from 'next/navigation';
import { productsApi } from '@/lib/api/products';
import { categories as categoriesApi } from '@/lib/api/categories';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category: { id: number; name: string };
  images: { url: string }[];
  availableQuantity: number;
}

export default async function CategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  let products: Product[] = [];
  let categoryName = '';
  
  try {
    const [productsResponse, categoriesResponse] = await Promise.all([
      productsApi.getAllProducts(),
      categoriesApi.getAll()
    ]);
    
    const allProducts = productsResponse.data || [];
    products = allProducts.filter((p: Product) => p.category.id === parseInt(id));
    
    const category = categoriesResponse.data?.find((c: any) => c.id === parseInt(id));
    categoryName = category?.name || 'Catégorie';
  } catch (error) {
    console.error('Error:', error);
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50 mt-15">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Link href="/" className="mb-6 text-blue-600 hover:text-blue-800 flex items-center gap-2 w-fit">
          ← Retour
        </Link>

        <h1 className="text-3xl font-bold text-gray-900 mb-8">{categoryName}</h1>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <div key={product.id} className="bg-white rounded-lg shadow hover:shadow-lg transition">
              <div className="relative h-64 w-full overflow-hidden rounded-t-lg bg-gray-200">
                {product.images?.[0]?.url ? (
                  <img
                    src={product.images[0].url}
                    alt={product.name}
                    loading="lazy"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    No Image
                  </div>
                )}
              </div>
              
              <div className="p-4">
                <h2 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                  {product.name}
                </h2>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {product.description}
                </p>
                
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xl font-bold text-gray-900">
                    {(product.price / 100).toFixed(2)} MAD
                  </span>
                  <span className="text-xs text-gray-500">
                    Stock: {product.availableQuantity}
                  </span>
                </div>

                <Link href={`/products/${product.id}`} className="block w-full bg-blue-600 text-white text-center py-2 rounded-lg font-medium hover:bg-blue-700 transition">
                  Voir détails
                </Link>
              </div>
            </div>
          ))}
        </div>

        {products.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Aucun produit dans cette catégorie</p>
          </div>
        )}
      </div>
    </div>
  );
}
