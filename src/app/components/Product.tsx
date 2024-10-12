import React from 'react'
import { useRouter } from 'next/navigation';
import Image from 'next/image';

type ProductProps = {
    product: {
        id: number,
        created_at: string,
        description: string,
        name: string,
        price: number,
        image_url?: string | null;
        features?: string[] | null;
    };
};

export default function Product({ product }: ProductProps) {
    const router = useRouter();

    const handleClick = () => {
        router.push(`/products/${product.id}`);
    }

    return (
        <div className="p-4 bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300 cursor-pointer" onClick={handleClick}>
            <Image
                        src={
                            product.image_url ||
                            'https://img.freepik.com/premium-vector/default-image-icon-vector-missing-picture-page-for-website-design-or-mobile-app-no-photo-available_87543-11093.jpg?size=626&ext=jpg'
                        }
                        alt="상품 이미지"
                        width={300}
                        height={300}
                        className="w-full h-48 object-cover"
                    />
            <h2 className='text-2xl'>{product.name}</h2>
            <p>{product.price}원</p>
        </div>
    );
}