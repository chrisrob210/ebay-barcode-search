'use client';

import { useState } from 'react';
import { BarcodeScanner } from './BarcodeScanner';
import { ProductCard } from './ProductCard';

export default function BarcodePage() {
    const [code, setCode] = useState<string | null>(null);
    const [product, setProduct] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [manualInput, setManualInput] = useState('');

    const fetchProduct = async (upc: string) => {
        if (!/^[0-9]{12}$/.test(upc)) {
            alert('Invalid UPC-A format. Must be exactly 12 digits.');
            return;
        }
        setCode(upc);
        setLoading(true);
        const res = await fetch(`/api/lookup?upc=${upc}`);
        const data = await res.json();
        setProduct(data);
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
        <main className="p-4 space-y-4">
            <h1 className="text-2xl font-bold">eBay Barcode Lookup</h1>
            {!code && (
                <>
                    <BarcodeScanner onScan={handleScan} />
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
                        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
                            Search
                        </button>
                    </form>
                </>
            )}
            {loading && <p>Loading...</p>}
            {product && <ProductCard product={product} />}
        </main>
    );
}
