'use client';

import { useEffect, useState } from 'react';
import { BarcodeScanner } from '@/components/BarcodeScanner';
import { ProductCard } from '@/components/ProductCard';

export default function BarcodePage() {
    const [code, setCode] = useState<string | null>(null);
    const [products, setProducts] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [manualInput, setManualInput] = useState('');

    useEffect(() => { console.log(products) }, [products])

    const fetchProduct = async (upc: string) => {
        if (!/^[0-9]{12}$/.test(upc)) {
            alert('Invalid UPC-A format. Must be exactly 12 digits.');
            return;
        }
        setCode(upc);
        setLoading(true);
        const res = await fetch(`/api/lookup?upc=${upc}`);
        const data = await res.json();
        setProducts(data);
        setLoading(false);
    };

    const handleScan = (scannedCode: string) => {
        console.log('Scanned code:', scannedCode);
        fetchProduct(scannedCode);
    };

    const handleManualSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        fetchProduct(manualInput);
    };

    return (
        <main className="p-4 space-y-4 text-center">
            <h1 className="text-2xl font-bold">eBay Barcode Lookup</h1>
            {!code && (
                <div className='flex flex-col items-center'>
                    <div className="max-w-[512px] max-h-[512px] p-0 m-0">
                        <BarcodeScanner onScan={handleScan} />
                    </div>
                    <form onSubmit={handleManualSubmit} className="mt-4 space-y-2">
                        <label htmlFor="manualUPC" className="block font-semibold">Or enter UPC manually:</label>
                        <input
                            id="manualUPC"
                            type="text"
                            inputMode="numeric"
                            pattern="\d{12}"
                            maxLength={12}
                            className="border p-2 rounded w-full"
                            value={manualInput}
                            onChange={(e) => setManualInput(e.target.value)}
                        />
                        <button type="submit" className="bg-gray-900 text-white px-4 py-2 border rounded">
                            Search
                        </button>
                    </form>
                </div>
            )}
            {loading && <p>Loading...</p>}
            {/* {products && products.map((product: any, productIndex: number) => (<ProductCard key={`ebay-product-${productIndex}`} product={product} />))} */}
            {/* {products && products.map((product: any) => (<div>{product.title}</div>))} */}
            {products && (
                <div className="text-center text-gray-700 space-y-1">
                    <p className="text-sm font-medium">
                        Suggested Range: ${products.minPrice.toFixed(2)} – ${products.maxPrice.toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-500">
                        Average Price: ${products.averagePrice.toFixed(2)}
                    </p>
                </div>
            )}
        </main>
    );
}
