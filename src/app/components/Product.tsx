import React from 'react'
import { useRouter } from 'next/navigation';

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
        <div className='p-4 ' onClick={handleClick}>
            <h2>{product.name}</h2>
            <p>가격: {product.price}원</p>
        </div>
    );
}