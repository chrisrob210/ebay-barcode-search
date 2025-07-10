import { NextRequest, NextResponse } from 'next/server';
import { getEbayAccessToken } from '@/lib/ebay';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const upc = searchParams.get('upc');

    if (!upc) return NextResponse.json({ error: 'Missing UPC' }, { status: 400 });

    try {
        const token = await getEbayAccessToken();

        const ebayRes = await fetch(
            `https://api.ebay.com/buy/browse/v1/item_summary/search?gtin=${encodeURIComponent(upc)}&filter=buyingOptions:{FIXED_PRICE,AUCTION}&limit=50`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        const ebayData = await ebayRes.json();
        // const item = ebayData.itemSummaries?.[0];
        const items = ebayData.itemSummaries;

        // return NextResponse.json({
        //     title: item?.title || 'Not found',
        //     price: item?.price?.value || 'N/A',
        //     image: item?.image?.imageUrl || '',
        //     url: item?.itemWebUrl || '#',
        // });
        // return NextResponse.json(items);

        const simplified = items
            .filter((item: any) => item.price?.value)
            .map((item: any) => ({
                title: item.title,
                price: {
                    value: parseFloat(item.price.value),
                    currency: item.price.currency,
                },
                itemWebUrl: item.itemWebUrl,
                image: item.image?.imageUrl ? { imageUrl: item.image.imageUrl } : null,
            }));

        // Extract prices
        const prices = simplified.map((p: any) => p.price.value);
        if (prices.length === 0) {
            return Response.json({
                minPrice: null,
                maxPrice: null,
                averagePrice: null,
                items: simplified,
            });
        }

        // Sort and find quartiles
        const sorted = prices.slice().sort((a: number, b: number) => a - b);
        const q1 = sorted[Math.floor(sorted.length * 0.25)];
        const q3 = sorted[Math.floor(sorted.length * 0.75)];

        // Keep only prices within Q1 and Q3
        const filtered = simplified.filter((p: any) =>
            p.price.value >= q1 && p.price.value <= q3
        );

        const filteredPrices = filtered.map((p: any) => p.price.value);
        const averagePrice = filteredPrices.reduce((a: number, b: number) => a + b, 0) / filteredPrices.length;
        const minPrice = Math.min(...filteredPrices);
        const maxPrice = Math.max(...filteredPrices);

        return Response.json({
            minPrice,
            maxPrice,
            averagePrice,
            items: filtered,
        });
    } catch (err) {
        console.error('eBay Lookup Error:', err);
        return NextResponse.json({ error: 'Failed to fetch eBay data' }, { status: 500 });
    }
}