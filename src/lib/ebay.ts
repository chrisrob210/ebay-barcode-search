let cachedToken: { value: string; expiresAt: number } | null = null;

export async function getEbayAccessToken(): Promise<string> {
    const now = Date.now();

    if (cachedToken && cachedToken.expiresAt > now) {
        return cachedToken.value;
    }

    const credentials = `${process.env.EBAY_CLIENT_ID}:${process.env.EBAY_CLIENT_SECRET}`;
    const encoded = Buffer.from(credentials).toString('base64');

    const res = await fetch('https://api.ebay.com/identity/v1/oauth2/token', {
        method: 'POST',
        headers: {
            'Authorization': `Basic ${encoded}`,
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'grant_type=client_credentials&scope=https://api.ebay.com/oauth/api_scope',
    });

    const json = await res.json();

    if (!res.ok) {
        console.error("Failed to fetch eBay token:", json);
        throw new Error("eBay OAuth failed");
    }

    const { access_token, expires_in } = json;

    cachedToken = {
        value: access_token,
        expiresAt: now + expires_in * 1000 - 60_000, // refresh 1 min early
    };

    return access_token;
}