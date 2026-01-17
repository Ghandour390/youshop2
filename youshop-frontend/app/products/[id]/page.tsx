import { notFound } from 'next/navigation';
import Link from 'next/link';
import { productsApi } from '@/lib/api/products';
import ImageGallery from '@/components/ImageGallery';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category: { name: string };
  images: { url: string }[];
  availableQuantity: number;
}

export default async function ProductDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  let product: Product | null = null;
  try {
    const response = await productsApi.getProductById(id);
    product = response.data;
  } catch (error) {
    console.error('Error:', error);
    notFound();
  }

  if (!product) notFound();

  return (
    <div className="min-h-screen bg-gray-50 ">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Link href="/" className="mb-6 text-blue-600 hover:text-blue-800 flex items-center gap-2 w-fit">
          ← Retour
        </Link>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="grid md:grid-cols-2 gap-8 p-8">
            <ImageGallery images={product.images} productName={product.name} />

            <div>
              <span className="text-sm text-blue-600 font-medium">{product.category.name}</span>
              <h1 className="text-3xl font-bold text-gray-900 mt-2 mb-4">{product.name}</h1>
              <p className="text-4xl font-bold text-gray-900 mb-6">{(product.price / 100).toFixed(2)} MAD</p>
              
              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-2">Description</h2>
                <p className="text-gray-700 leading-relaxed">{product.description}</p>
              </div>

              <div className="mb-6">
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${product.availableQuantity > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {product.availableQuantity > 0 ? `En stock (${product.availableQuantity})` : 'Rupture de stock'}
                </span>
              </div>

              <button disabled={product.availableQuantity === 0} className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition">
                Ajouter au panier
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
