import React from "react";

// Props 타입 정의
interface ReviewItemProps {
  review: {
    id: number;
    comment: string;
    created_at: string;
  };
  index: number;
}

const Review: React.FC<ReviewItemProps> = ({ review, index }) => {
  return (
    <li className="p-4 border rounded-md shadow-md bg-white flex flex-col">
      {/* 유저 정보 */}
      <div className="flex items-center mb-2">
        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-semibold">
          {/* 이니셜 U */}
          U
        </div>
        <p className="ml-2 font-semibold text-gray-800">User{index + 1}</p>
      </div>

      {/* 리뷰 코멘트 */}
      <p className="text-gray-800">{review.comment}</p>

      {/* 작성일 */}
      <p className="text-sm text-gray-500 mt-2">
        작성일: {new Date(review.created_at).toLocaleDateString()}
      </p>
    </li>
  );
};

export default Review;
