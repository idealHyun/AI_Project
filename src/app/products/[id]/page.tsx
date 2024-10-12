'use client'

import React, { useEffect, useState } from 'react';
import { usePathname } from "next/navigation"
import { useRouter } from 'next/navigation';
import axios from 'axios';

type Product = {
  id: number;
  created_at: string;
  description: string;
  name: string;
  price: number;
  image_url?: string | null;
  features?: string[] | null;
};

export default function ProductPage() {
  const router = useRouter();
  const path = usePathname();
  const [product, setProduct] = useState<Product>();
  const [loading, setLoading] = useState(true); // 로딩 상태 추가
  const [questions,setQuestions] = useState<string[]>([])

  const handleReivwButtonClick = async () => {
    const response = await axios.post('/api/openai/review', {
      desc: product?.description
    });
    setQuestions(response.data.questions)
    console.log(response.data.questions)
    questions.forEach((question)=>console.log(question))
  }

  // questions 가 업데이트 된 후에 실행
  useEffect(() => {
    if (questions.length > 0) {
      questions.forEach((question) => console.log(question));
    }
  }, [questions]);

  useEffect(() => {
    const fetchProduct = async () => {
      const id = path.split('/').pop();

      try {
        const response = await fetch(`/api/products/${id}`);
        const data: [Product[]] = await response.json();

        // 이중 배열에서 첫 번째 객체만 추출
        const productData = data[0][0];
        setProduct(productData);
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false); // 로딩 완료 시 false로 설정
      }
    };

    fetchProduct();
  }, []);

  // 로딩 중일 때 표시할 컴포넌트
  if (loading) {
    return <p>Loading...</p>;
  }

  // product가 없을 경우 에러 메시지 표시
  if (!product) {
    return <p>Product not found.</p>;
  }

  // product가 있을 때 렌더링
  return (
    <div className="p-6">
      <div className='flex justify-center mb-8'>
        <button className='text-2xl mr-auto' onClick={() => router.back()}>{"<"}</button>
        <span className='flex justify-center mr-auto text-2xl'>제품 상세 페이지</span>
      </div>

      <img
        src={
          product.image_url ||
          'https://img.freepik.com/premium-vector/default-image-icon-vector-missing-picture-page-for-website-design-or-mobile-app-no-photo-available_87543-11093.jpg?size=626&ext=jpg'
        }
        alt="상품 이미지"
        className="w-full h-full object-cover rounded-lg"
      />
      <h1 className="text-3xl font-bold my-4">{product.name}</h1>
      <p className="text-lg text-gray-700">{product.description}</p>
      <p className="text-2xl mt-4">{product.price}원</p>
      <button className=" bg-blue-400 rounded-lg p-2 text-white hover:bg-blue-500" onClick={handleReivwButtonClick}>리뷰 작성</button>


    </div>
  );
}
