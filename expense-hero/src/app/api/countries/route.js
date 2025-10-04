import { 
    getCountriesWithCurrencies, 
    getCurrencyCodes, 
    getCurrencyDetails,
    getMajorCurrencies 
} from '@/services/CurrencyService';

export async function GET(request) {
    try {
        const url = new URL(request.url);
        const type = url.searchParams.get('type') || 'countries';

        switch (type) {
            case 'countries':
                const countries = await getCountriesWithCurrencies();
                return Response.json({
                    success: true,
                    message: 'Countries with currencies retrieved successfully',
                    data: { countries }
                });

            case 'currencies':
                const currencies = await getCurrencyDetails();
                return Response.json({
                    success: true,
                    message: 'Currency details retrieved successfully',
                    data: { currencies }
                });

            case 'codes':
                const codes = await getCurrencyCodes();
                return Response.json({
                    success: true,
                    message: 'Currency codes retrieved successfully',
                    data: { codes }
                });

            case 'major':
                const majorCurrencies = await getMajorCurrencies();
                return Response.json({
                    success: true,
                    message: 'Major currencies retrieved successfully',
                    data: { currencies: majorCurrencies }
                });

            default:
                return Response.json({
                    success: false,
                    error: 'Invalid type parameter. Use: countries, currencies, codes, or major'
                }, { status: 400 });
        }

    } catch (error) {
        console.error('Countries/Currencies API error:', error);
        return Response.json({
            success: false,
            error: 'Failed to fetch countries and currencies data'
        }, { status: 500 });
    }
}