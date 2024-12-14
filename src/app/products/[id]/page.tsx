// 리뷰 등록 API 요청 처리 추가
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

type Review = {
  id: number;
  product_id: number;
  comment: string;
  created_at: string;
};

export default function ProductPage() {
  const router = useRouter();
  const path = usePathname();
  const [product, setProduct] = useState<Product>();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<string[]>([]);
  const [isModal, setIsModal] = useState(false);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [reviewResult, setReviewResult] = useState(""); // 받은 데이터를 저장
  const [isReviewModal, setIsReviewModal] = useState(false); // 새로운 모달 상태

  const handleInputChange = (index: number, value: string) => {
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
    setQuestions(response.data.questions);
    console.log(response.data.questions);
  };

  // 제출 버튼 클릭
  const handleSubmitClick = async () => {
    try {
      const payload = questions.map((question, index) => ({
        question,
        answer: answers[index] || '',
      }));

      const response = await axios.post('/api/openai/answer', { answers: payload });

      if (response.status === 200) {
        setReviewResult(response.data.answer); // 리뷰 결과 저장
        setIsModal(false); // 기존 모달 닫기
        setIsReviewModal(true); // 새로운 모달 열기
        setAnswers({}); // 입력 초기화
      } else {
        alert("리뷰 제출에 실패했습니다.");
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      alert("리뷰 제출 중 오류가 발생했습니다.");
    }
  };

  // 리뷰 등록 버튼 클릭
  const handleRegisterReview = async () => {
    try {
      const response = await axios.post(`/api/reviews/${product?.id}`, {
        productId: product?.id,
        comment: reviewResult,
      });

      if (response.status === 201) {
        alert("리뷰가 성공적으로 등록되었습니다.");
        setIsReviewModal(false);
        fetchReviews(); // 리뷰 목록 갱신
      } else {
        alert("리뷰 등록에 실패했습니다.");
      }
    } catch (error) {
      console.error("Error registering review:", error);
      alert("리뷰 등록 중 오류가 발생했습니다.");
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await axios.get(`/api/reviews/${product?.id}`);
      setReviews(response.data); // 리뷰 데이터 저장
    } catch (error) {
      console.error("Error fetching reviews:", error);
    }
  };

  useEffect(() => {
    if (questions.length > 0) {
      questions.forEach((question) => console.log(question));
      setIsModal(true);
    }
  }, [questions]);

  useEffect(() => {
    const fetchProduct = async () => {
      const id = path.split('/').pop();

      try {
        const response = await fetch(`/api/products/${id}`);
        const data: [Product[]] = await response.json();

        const productData = data[0][0];
        setProduct(productData);
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, []);

  useEffect(() => {
    if (product) {
      fetchReviews();
    }
  }, [product]);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!product) {
    return <p>Product not found.</p>;
  }

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
                    value={answers[index] || ''}
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

      {isReviewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-lg max-w-2xl w-full">
            <h2 className="text-2xl font-semibold mb-4">리뷰 결과</h2>
            <textarea
              rows={10}
              cols={80}
              className="w-full h-48 border-2 border-blue-100 p-2 rounded-md focus:outline-none focus:border-blue-300"
              value={reviewResult}
              onChange={(e) => setReviewResult(e.target.value)}
            />
            <div className="mt-6 flex justify-end gap-4">
              <button
                className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400"
                onClick={() => setIsReviewModal(false)}
              >
                닫기
              </button>
              <button
                className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
                onClick={handleRegisterReview}
              >
                등록
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 리뷰 목록 표시 */}
      <div className="mt-8">
        <h2 className="text-2xl font-semibold mb-4">리뷰 목록</h2>
        {reviews.length > 0 ? (
          <ul className="space-y-4">
            {reviews.map((review) => (
              <li key={review.id} className="p-4 border rounded-md shadow-md">
                <p className="text-gray-700">{review.comment}</p>
                <p className="text-sm text-gray-500">작성일: {new Date(review.created_at).toLocaleDateString()}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">리뷰가 없습니다.</p>
        )}
      </div>
    </div>
  );
}
