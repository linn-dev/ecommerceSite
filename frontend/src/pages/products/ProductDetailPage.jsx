import { useParams } from 'react-router-dom';

export default function ProductDetailPage() {
    const { slug } = useParams();

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold">Product Detail: {slug}</h1>
            <p>Product details will go here</p>
        </div>
    );
}