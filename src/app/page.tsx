'use client'

import Image from "next/image";
import { useEffect, useState } from "react";
import Product from "./components/Product";
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

  useEffect(() => {
    const fetchProducts = async () => {
      const response = await fetch('/api/products');
      const data: Product[] = await response.json();
      setProducts(data);
      console.log(data)
    };

    fetchProducts()
  }, [])

  return (
    <div className="">
      <div className="flex justify-between mb-4 border-b-2 border-b-gray-400 py-2">
        <span className=" text-3xl font-bold">실감인공지능 프로젝트</span>
        <button className=" bg-blue-400 rounded-lg p-2 text-white hover:bg-blue-500" onClick={() => router.push("/products/upload")}>물품 등록</button>
      </div >
      <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-6">
        {products.map((product) =>
          <Product key={product.id} product={product} />)}
      </section>

    </div>
  );
}
