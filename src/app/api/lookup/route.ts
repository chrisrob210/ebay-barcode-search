import { NextRequest, NextResponse } from 'next/server';
import { getEbayAccessToken } from '@/lib/ebay';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const upc = searchParams.get('upc');

    if (!upc) return NextResponse.json({ error: 'Missing UPC' }, { status: 400 });

    try {
        const token = await getEbayAccessToken();

        const ebayRes = await fetch(
            `https://api.ebay.com/buy/browse/v1/item_summary/search?gtin=${encodeURIComponent(upc)}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        const ebayData = await ebayRes.json();
        const item = ebayData.itemSummaries?.[0];

        return NextResponse.json({
            title: item?.title || 'Not found',
            price: item?.price?.value || 'N/A',
            image: item?.image?.imageUrl || '',
            url: item?.itemWebUrl || '#',
        });
    } catch (err) {
        console.error('eBay Lookup Error:', err);
        return NextResponse.json({ error: 'Failed to fetch eBay data' }, { status: 500 });
    }
}