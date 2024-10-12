'use client';

import React, { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

type ProductFormProps = {};

export default function ProductForm({ }: ProductFormProps) {
    const router = useRouter();
    // 입력 값을 관리하는 상태
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState(0);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [file, setFile] = useState<File | null>(null); // 업로드할 파일 저장

    // 폼 제출 처리 함수
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
    
        // 이미지가 업로드된 후에만 계속 진행
        const imageUrl = await uploadImageToS3(); 
        if (!imageUrl) return alert('Image upload failed.');
    
        const productData = {
            name,
            description,
            image_url: imageUrl, // 업로드된 이미지 URL
            price,
        };
    
        console.log(productData);
    
        try {
            await axios.post('/api/products', productData);
            alert('Product uploaded successfully!');
        } catch (error) {
            console.error('Error uploading product:', error);
            alert('Failed to upload product.');
        } finally{
            router.push('/');
        }
    };

    // 입력 필드 변경 함수들
    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setName(e.target.value);
    };

    const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setDescription(e.target.value);
    };

    const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPrice(Number(e.target.value));
    };

    // S3에 이미지 업로드
    const uploadImageToS3 = async (): Promise<string | null> => {
        if (!file) return null;
    
        const formData = new FormData();
        formData.append('file', file);
    
        try {
            const response = await axios.post('/api/upload-to-s3', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
    
            console.log('Uploaded image URL:', response.data.url);
            setImagePreview(response.data.url); // 상태 업데이트
            return response.data.url; // 업로드된 URL 반환
        } catch (error) {
            console.error('Error uploading image:', error);
            alert('Failed to upload image.');
            return null;
        }
    };

    // 로컬에서 이미지 올리거나 변경되었을 때
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0]; // 사용자가 업로드한 첫 번째 파일
    
        if (selectedFile) {
            setFile(selectedFile); // 선택한 파일 상태에 저장
    
            // 로컬 미리보기 제공
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string); // 로컬 미리보기 URL 설정
            };
            reader.readAsDataURL(selectedFile);
        } else {
            // 파일이 선택되지 않은 경우 미리보기 이미지 제거
            setFile(null);
            setImagePreview(null);
        }
    };

    return (
        <div>
            <div className="flex justify-between mb-4 border-b-2 border-b-gray-400 py-2">
                <span className=" text-3xl font-bold">물품 등록 페이지</span>
            </div>
            <form onSubmit={handleSubmit} className='my-4'>
                <div className='flex flex-col gap-3'>
                    <label htmlFor="product_title" className='text-xl'>상품 이름</label>
                    <input
                        type="text"
                        id="product_title"
                        placeholder="상품이름을 적어주세요."
                        value={name}
                        onChange={handleTitleChange}
                        required
                    />
                </div>

                <div className='flex flex-col'>
                    <label htmlFor="product_description">상품 설명</label>
                    <textarea
                        id="product_description"
                        placeholder="상품 설명을 적어주세요."
                        value={description}
                        onChange={handleDescriptionChange}
                        required
                    />
                </div>

                <div className='flex flex-col'>
                    <label htmlFor="product_price">가격</label>
                    <input
                        type="number"
                        id="product_price"
                        placeholder="가격을 입력하세요."
                        value={price}
                        onChange={handlePriceChange}
                        required
                    />
                </div>

                <div>
                    <label htmlFor="product_image">이미지 업로드</label>
                    {/* 이미지 미리보기 */}
                    {imagePreview && (
                        <div>
                            <Image
                                src={imagePreview}
                                alt="Product Preview"
                                width={300}
                                height={300}
                                unoptimized
                            />
                        </div>
                    )}
                    <input
                        type="file"
                        id="product_image"
                        accept="image/*"
                        onChange={handleImageChange}
                    />
                </div>



                {/* 폼 제출 버튼 */}
                <button className=" bg-blue-400 rounded-lg p-2 text-white hover:bg-blue-500">물품 등록하기</button>
            </form>
        </div>
    );
}
