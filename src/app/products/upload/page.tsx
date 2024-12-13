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
    const [price, setPrice] = useState('');
    const [product_line, setProduct_line] = useState('');
    const [features, setFeatures] = useState('');
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [file, setFile] = useState<File | null>(null); // 업로드할 파일 저장
    const [loading, setLoading] = useState(false)

    const handleFeatureButtonClick = async (
        e: React.MouseEvent<HTMLButtonElement>
    ) => {
        e.preventDefault(); // 기본 submit 동작 방지

        const data = {
            desc: description,
        };

        try {
            setLoading(true)
            const response = await axios.post('/api/openai/features', data);
            setLoading(false)

            console.log(response)

            setProduct_line(response.data.category)
            setFeatures(response.data.features.join(', '))
        } catch (error) {
            console.error('요청 중 오류 발생:', error);

            // 필요 시 사용자에게 알림 표시
            alert('요청에 실패했습니다. 나중에 다시 시도해주세요.');
        }
    };

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
            price: Number(price),
            features,
            category : product_line
        };

        console.log(productData);

        try {
            await axios.post('/api/products', productData);
            alert('Product uploaded successfully!');
        } catch (error) {
            console.error('Error uploading product:', error);
            alert('Failed to upload product.');
        } finally {
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
        setPrice(e.target.value);
    };

    const handleProductLineChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setProduct_line(e.target.value);
    };

    const handleFeaturesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setFeatures(e.target.value);
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
                <div className='flex flex-col gap-3 mb-4'>
                    <label htmlFor="product_title" className='text-xl'>상품 이름</label>
                    <input
                        type="text"
                        id="product_title"
                        placeholder="상품이름을 적어주세요."
                        value={name}
                        onChange={handleTitleChange}
                        required
                        className="border-2 border-blue-100 p-2 rounded-md focus:outline-none focus:border-blue-300"
                    />
                </div>

                <div className='flex flex-col gap-3 mb-4'>
                    <label htmlFor="product_description" className='text-xl'>상품 설명</label>
                    <textarea
                        id="product_description"
                        placeholder="상품 설명을 적어주세요."
                        value={description}
                        onChange={handleDescriptionChange}
                        rows={10}
                        required
                        className="border-2 border-blue-100 p-2 rounded-md focus:outline-none focus:border-blue-300"
                    />
                    <button className="ml-auto bg-blue-400 rounded-lg p-2 text-white hover:bg-blue-500" onClick={handleFeatureButtonClick}>특징 뽑아내기</button>
                </div>
                <div className='flex flex-col gap-3 mb-4'>
                    <label htmlFor="product_line" className='text-xl'>상품 유형</label>
                    <input
                        type="text"
                        id="product_line"
                        placeholder="상품 유형을 입력하세요."
                        value={product_line}
                        onChange={handleProductLineChange}
                        required
                        className="border-2 border-blue-100 p-2 rounded-md focus:outline-none focus:border-blue-300"
                    />
                </div>
                <div className='flex flex-col gap-3 mb-4'>
                    <label htmlFor="product_features" className='text-xl'>특징</label>
                    <textarea
                        id="product_features"
                        placeholder="특징을 입력하세요.(ex. 세련된 디자인, 배터리 효율)"
                        value={features}
                        onChange={handleFeaturesChange}
                        rows={5}
                        required
                        className="border-2 border-blue-100 p-2 rounded-md focus:outline-none focus:border-blue-300"
                    />
                </div>

                <div className='flex flex-col gap-3 mb-4'>
                    <label htmlFor="product_price" className='text-xl'>가격</label>
                    <input
                        type="number"
                        id="product_price"
                        placeholder="가격을 입력하세요."
                        value={price}
                        onChange={handlePriceChange}
                        required
                        className="border-2 border-blue-100 p-2 rounded-md focus:outline-none focus:border-blue-300"
                    />
                </div>

                <div className='flex flex-col gap-3 mb-4'>
                    <label htmlFor="product_image" className='text-xl'>이미지 업로드</label>
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

                <div className='flex flex-col gap-3 mb-4'>
                    <button className="m-auto bg-blue-400 rounded-lg p-2 text-white hover:bg-blue-500">물품 등록하기</button>
                </div>

            </form>
        </div>
    );
}
