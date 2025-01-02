'use client'

import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from 'next/navigation';

type Product = {
  id: number,
  created_at: string,
  description: string,
  name: string,
  price: number,
  image_url?: string | null;
  features?: string[] | null;
}

export default function Home() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true); // fetch 시작 시 로딩 활성화
      try {
        const response = await fetch('/api/products');
        const data: Product[] = await response.json();
        setProducts(data);
      } catch (error) {
        console.error('Failed to fetch products:', error);
      } finally {
        setLoading(false); // fetch 완료 시 로딩 비활성화
      }
    };

    fetchProducts()
  }, [])

  return (
    <div className="max-w-7xl mx-auto p-6">
      <header className="flex justify-between items-center mb-8 border-b-2 border-gray-300 pb-4">
        <h1 className="text-3xl font-bold text-gray-800">실감인공지능 프로젝트</h1>
        <button
          className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600"
          onClick={() => router.push("/products/upload")}
        >
          물품 등록
        </button>
      </header>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-solid"></div>
          <p className="ml-4 text-gray-500">Loading...</p>
        </div>
      ) : (
        <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-white shadow-md rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
            >
              <Image
                src={product.image_url || "/placeholder-image.jpg"}
                alt={product.name}
                width={400}
                height={400}
                className="w-full h-48 object-contain"
              />
              <div className="p-4">
                <h2 className="text-lg font-semibold text-gray-800 truncate">{product.name}</h2>
                <p className="text-blue-600 font-bold mt-4">{product.price.toLocaleString()}원</p>
                <button
                  className="mt-4 w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600"
                  onClick={() => router.push(`/products/${product.id}`)}
                >
                  자세히 보기
                </button>
              </div>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}
