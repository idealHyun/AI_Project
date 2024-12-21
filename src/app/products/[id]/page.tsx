'use client'

import React, { useEffect, useState } from 'react';
import { usePathname } from "next/navigation"
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Review from '@/app/components/Review';
import LoadingModal from '@/app/components/LoadingModal';

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
  const [isLoading, setIsLoading] = useState(false); // 로딩 상태 추가

  const handleInputChange = (index: number, value: string) => {
    setAnswers((prev) => ({
      ...prev,
      [index]: value, // 인덱스를 키로 사용하여 값을 업데이트
    }));
  };

  // 리뷰 작성 버튼 클릭
  const handleReviewButtonClick = async () => {
    setIsLoading(true);
    try {
      const response = await axios.post(
        '/api/openai/questions',
        {
          category: product?.category,
          features: product?.features,
        },
        {
          headers: {
            'api_key': process.env.NEXT_PUBLIC_API_KEY,
          },
        }
      );
      setQuestions(response.data.questions);
    } catch (error) {
      console.error('Error fetching questions:', error);
      alert('리뷰 작성 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 제출 버튼 클릭
  const handleSubmitClick = async () => {
    // 모든 질문에 대한 답변이 1자 이상인지 확인
    const isAllAnswered = questions.every((_, index) => {
      const answer = answers[index];
      return answer && answer.trim().length > 0; // 값이 비어있거나 공백만 있는 경우 false
    });

    if (!isAllAnswered) {
      alert("모든 질문에 답변을 작성해 주세요.");
      return; // 조건을 만족하지 않으면 실행 중단
    }

    try {
      const payload = questions.map((question, index) => ({
        question,
        answer: answers[index] || '',
      }));

      setIsModal(false);
      setIsLoading(true);

      const response = await axios.post('/api/openai/answer', { answers: payload }, {
        headers: {
          'api_key': process.env.NEXT_PUBLIC_API_KEY,
        },
      });
      setIsLoading(false);

      if (response.status === 200) {
        setReviewResult(response.data.answer);

        setIsReviewModal(true);
        setAnswers({});
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
        fetchReviews();
      } else {
        alert("리뷰 등록에 실패했습니다.");
      }
    } catch (error) {
      console.error("Error registering review:", error);
      alert("리뷰 등록 중 오류가 발생했습니다.");
    }
  };

  // 특정 물품의 리뷰 가져오기
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
      setIsModal(true);
    }
  }, [questions]);

  // 특정 물품 조회하기
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
    return <div className="flex justify-center items-center h-screen">
      <p className="text-gray-500 text-lg">Loading...</p>
    </div>;
  }

  if (!product) {
    return <div className="flex justify-center items-center h-screen">
      <p className="text-gray-500 text-lg">Product not found.</p>
    </div>;
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">

      {isLoading && <LoadingModal />}
      <div className="flex items-center justify-between mb-8">
        <button className="text-xl text-blue-600 hover:text-blue-800" onClick={() => router.back()}>← Back</button>
        <h1 className="text-3xl font-bold text-center flex-grow">제품 상세 페이지</h1>
      </div>

      <div className="shadow-lg p-6 bg-white rounded-lg">
        <img
          src={
            product.image_url ||
            'https://img.freepik.com/premium-vector/default-image-icon-vector-missing-picture-page-for-website-design-or-mobile-app-no-photo-available_87543-11093.jpg?size=626&ext=jpg'
          }
          alt="상품 이미지"
          className="w-full h-80 object-contain rounded-md mb-6"
        />
        <h2 className="text-2xl font-bold mb-4">{product.name}</h2>
        <p className="text-gray-600 mb-4">{product.description}</p>
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">특징 요약</h3>
          {product.features.split(',').map((feature, index) => (
            <p key={index} className="text-gray-600">- {feature.trim()}</p>
          ))}
        </div>
        <p className="text-xl font-semibold text-blue-700">{product.price.toLocaleString()}원</p>

      </div>

      {isModal && questions.length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full">
            <h2 className="text-2xl font-semibold mb-4">리뷰 작성</h2>
            <div className="flex flex-col gap-4">
              {questions.map((question, index) => (
                <div key={index} className="flex flex-col gap-2">
                  <span className="font-medium text-gray-800">{question}</span>
                  <input
                    type="text"
                    placeholder="답변을 적어주세요."
                    value={answers[index] || ''}
                    onChange={(e) => handleInputChange(index, e.target.value)}
                    className="border border-gray-300 p-2 rounded-md focus:outline-none focus:border-blue-500"
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
                리뷰 생성
              </button>
            </div>
          </div>
        </div>)}

      {isReviewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-2xl w-full">
            <h2 className="text-2xl font-semibold mb-4">리뷰 결과</h2>
            <textarea
              rows={10}
              className="w-full border border-gray-300 p-3 rounded-md focus:outline-none focus:border-blue-500"
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
                리뷰 등록
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 리뷰 목록 표시 */}
      <div className="mt-10">
        <div className='flex justify-between items-center p-4'>
          <h2 className="text-2xl font-semibold mb-4">리뷰 목록</h2>
          <button className="mt-4 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600" onClick={handleReviewButtonClick}>리뷰 작성</button>
        </div>
        {reviews.length > 0 ? (
          <ul className="space-y-4">
            {reviews.map((review, index) => (
              <Review key={review.id} review={review} index={index} />
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">리뷰가 없습니다.</p>
        )}

      </div>
    </div>
  );
}
