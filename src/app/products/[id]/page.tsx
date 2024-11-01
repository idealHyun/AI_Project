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
  features: string;
  category: string
};

export default function ProductPage() {
  const router = useRouter();
  const path = usePathname();
  const [product, setProduct] = useState<Product>();
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<string[]>([])
  const [isModal, setIsModal] = useState(false)
  const [answers, setAnswers] = useState<Record<number, string>>({});

  const handleInputChange = (index : number, value :string) => {
    setAnswers((prev) => ({
      ...prev,
      [index]: value, // 인덱스를 키로 사용하여 값을 업데이트
    }));
  };

  // 리뷰 작성 버튼 클릭
  const handleReivwButtonClick = async () => {
    const response = await axios.post('/api/openai/questions', {
      category: product?.category,
      features: product?.features
    });
    setQuestions(response.data.questions)
    console.log(response.data.questions)
  }

  // 제출 버튼 클릭
  const handleSubmitClick = async () => {

  }

  // questions 가 업데이트 된 후에 실행
  useEffect(() => {
    if (questions.length > 0) {
      questions.forEach((question) => console.log(question));
      setIsModal(true) // 모달창 띄우기
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
        className="w-1/2 h-1/2 object-cover rounded-lg m-auto"
      />
      <h1 className="text-3xl font-bold my-4">{product.name}</h1>
      <p className="text-lg text-gray-700">{product.description}</p>
      <p className="text-2xl mt-4">{product.price}원</p>
      <button className=" bg-blue-400 rounded-lg p-2 text-white hover:bg-blue-500" onClick={handleReivwButtonClick}>리뷰 작성</button>

      {isModal && questions.length > 0 && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-lg w-full">
        <h2 className="text-2xl font-semibold mb-4">리뷰 작성</h2>
        <div className="flex flex-col gap-4">
          {questions.map((question, index) => (
            <div key={index} className="flex flex-col gap-2">
              <span className="font-medium">{question}</span>
              <input
                type="text"
                placeholder="답변을 적어주세요."
                value={answers[index] || ''} // 값이 없으면 빈 문자열
                onChange={(e) => handleInputChange(index, e.target.value)}
                className="border-2 border-blue-100 p-2 rounded-md focus:outline-none focus:border-blue-300"
              />
            </div>
          ))}
        </div>
        <div className="mt-6 flex justify-end gap-4">
          <button
            className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400"
            onClick={() => setIsModal(false)}
          >
            닫기
          </button>
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            onClick={handleSubmitClick}
          >
            제출
          </button>
        </div>
      </div>
    </div>)}
    </div>
  );
}
