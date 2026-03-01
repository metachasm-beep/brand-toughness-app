import axios from 'axios';
import crypto from 'crypto';

const MERCHANT_ID = process.env.PHONEPE_MERCHANT_ID || 'MERCHANTUAT';
const SALT_KEY = process.env.PHONEPE_SALT_KEY || '099eb0cd-02cf-4e2a-8aca-3e6c6aff0399';
const SALT_INDEX = process.env.PHONEPE_SALT_INDEX || '1';
const PHONEPE_ENV = process.env.PHONEPE_ENV || 'UAT'; // UAT or PROD

const BASE_URL = PHONEPE_ENV === 'PROD'
    ? 'https://api.phonepe.com/apis/hermes'
    : 'https://api-preprod.phonepe.com/apis/pg-sandbox';

export async function initiatePhonePePayment(amount: number, transactionId: string, userId: string, redirectUrl: string) {
    const payload = {
        merchantId: MERCHANT_ID,
        merchantTransactionId: transactionId,
        merchantUserId: userId,
        amount: amount * 100, // Amount in paise
        redirectUrl: redirectUrl,
        redirectMode: 'POST',
        callbackUrl: `${process.env.NEXTAUTH_URL}/api/phonepe/callback`,
        mobileNumber: '9999999999',
        paymentInstrument: {
            type: 'PAY_PAGE',
        },
    };

    const base64Payload = Buffer.from(JSON.stringify(payload)).toString('base64');
    const fullURL = base64Payload + '/pg/v1/pay' + SALT_KEY;
    const checksum = crypto.createHash('sha256').update(fullURL).digest('hex') + '###' + SALT_INDEX;

    try {
        const response = await axios.post(
            `${BASE_URL}/pg/v1/pay`,
            { request: base64Payload },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'X-VERIFY': checksum,
                    'accept': 'application/json',
                },
            }
        );

        return response.data;
    } catch (error: any) {
        console.error('PhonePe Initiation Error:', error.response?.data || error.message);
        throw error;
    }
}

export function verifyPhonePeCallback(base64Response: string, receivedChecksum: string) {
    const fullURL = base64Response + SALT_KEY;
    const expectedChecksum = crypto.createHash('sha256').update(fullURL).digest('hex') + '###' + SALT_INDEX;
    return expectedChecksum === receivedChecksum;
}
