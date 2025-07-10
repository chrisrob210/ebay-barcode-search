export function ProductCard({ product }: { product: any }) {
    return (
        <div className="border rounded-lg p-4 shadow">
            <h2 className="font-semibold text-lg">{product.title}</h2>
            {product.image ? (
                <img src={product.image.imageUrl} alt={product.title} className="w-full max-w-xs" />
            ) : (
                <div className="w-full max-w-xs h-40 bg-gray-200 flex items-center justify-center text-gray-500">
                    No Image
                </div>
            )}
            <p className="text-sm text-gray-600">Price: {product.price.value} {product.price.currency} </p>
            <a href={product.itemWebUrl} target="_blank" rel="noopener" className="text-blue-600 underline">
                View on eBay
            </a>
        </div>
    );
}
