'use client'

import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  return (
    <div className="w-screen h-screen flex items-center justify-center">
      <div className="space-x-4">
        <button
          onClick={() => router.push('/api-key')}
          className="px-6 py-3 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          api key 발급하러가기
        </button>
        <button
          onClick={() => router.push('/products')}
          className="px-6 py-3 bg-gray-500 text-white font-semibold rounded-lg shadow-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400"
        >
          해당 서비스 사용 예시 보기
        </button>
      </div>
    </div>
  );
}
