import { 
    convertCurrency, 
    getExchangeRates, 
    getConversionRate 
} from '@/services/CurrencyService';

export async function GET(request) {
    try {
        const url = new URL(request.url);
        const baseCurrency = url.searchParams.get('base') || 'USD';
        const targetCurrency = url.searchParams.get('target');
        const amount = parseFloat(url.searchParams.get('amount'));

        if (targetCurrency && amount) {
            // Convert specific amount
            const conversion = await convertCurrency(amount, baseCurrency, targetCurrency);
            return Response.json({
                success: true,
                message: 'Currency conversion completed',
                data: { conversion }
            });
        } else if (targetCurrency) {
            // Get conversion rate only
            const rate = await getConversionRate(baseCurrency, targetCurrency);
            return Response.json({
                success: true,
                message: 'Exchange rate retrieved',
                data: { 
                    rate,
                    from: baseCurrency,
                    to: targetCurrency,
                    timestamp: new Date().toISOString()
                }
            });
        } else {
            // Get all rates for base currency
            const rates = await getExchangeRates(baseCurrency);
            return Response.json({
                success: true,
                message: 'Exchange rates retrieved',
                data: { rates }
            });
        }

    } catch (error) {
        console.error('Currency conversion API error:', error);
        return Response.json({
            success: false,
            error: 'Failed to process currency conversion request'
        }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const body = await request.json();
        const { amount, fromCurrency, toCurrency } = body;

        // Validate input
        if (!amount || !fromCurrency || !toCurrency) {
            return Response.json({
                success: false,
                error: 'Missing required fields: amount, fromCurrency, toCurrency'
            }, { status: 400 });
        }

        if (isNaN(amount) || amount <= 0) {
            return Response.json({
                success: false,
                error: 'Amount must be a positive number'
            }, { status: 400 });
        }

        const conversion = await convertCurrency(amount, fromCurrency, toCurrency);
        
        return Response.json({
            success: true,
            message: 'Currency conversion completed',
            data: { conversion }
        });

    } catch (error) {
        console.error('Currency conversion POST error:', error);
        return Response.json({
            success: false,
            error: 'Failed to convert currency'
        }, { status: 500 });
    }
}