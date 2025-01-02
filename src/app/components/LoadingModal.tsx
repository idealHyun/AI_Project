import React from 'react'

export default function LoadingModal() {
  return (
    <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg flex items-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
        <p className="text-lg text-gray-800">로딩 중입니다...</p>
      </div>
    </div>
  )
}