/**
 * Salla Webhook Generator (Browser Version)
 */
export class SallaWebhookGenerator {
    constructor() {
        this.saudiFirstNames = ['محمد', 'أحمد', 'فاطمة', 'عائشة', 'خالد', 'عبدالله', 'سارة', 'نورة'];
        this.saudiLastNames = ['العتيبي', 'الغامدي', 'القحطاني', 'الدوسري', 'الشمري', 'الزهراني'];
        this.englishFirstNames = ['James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer'];
        this.englishLastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia'];
    }

    generateMerchantId() {
        return 'mer_' + Math.random().toString(36).substring(2, 10);
    }

    generateEmail() {
        const fn = this.englishFirstNames[Math.floor(Math.random() * this.englishFirstNames.length)].toLowerCase();
        const ln = this.englishLastNames[Math.floor(Math.random() * this.englishLastNames.length)].toLowerCase();
        const rand = Math.random().toString(36).substring(2, 6);
        return `${fn}.${ln}.${rand}@test.com`;
    }

    generateAppStoreAuthorize(merchantId) {
        return {
            event: 'app.store.authorize',
            merchant: merchantId,
            created_at: new Date().toISOString(),
            data: {
                id: 1376022133,
                app_name: "Test Klaviyo",
                access_token: "ory_at_" + Math.random().toString(36).substring(2),
                expires: 1770908740,
                refresh_token: "ory_rt_" + Math.random().toString(36).substring(2),
                scope: "settings.read products.read webhooks.read_write store-settings.read_write offline_access",
                token_type: "bearer"
            },
            customDataList: [
                { name: "salla_access_token", value: "ory_at_..." },
                { name: "salla_refresh_token", value: "ory_rt_..." },
                { name: "salla_expires_at", value: 1770908740 },
                { name: "salla_scope", value: "settings.read products.read webhooks.read_write store-settings.read_write offline_access" }
            ]
        };
    }

    generateAppSettingsUpdated(merchantId, privateKey) {
        return {
            event: 'app.settings.updated',
            merchant: merchantId,
            created_at: new Date().toISOString(),
            data: {
                settings: {
                    klaviyo_private_key: privateKey,
                    klaviyo_public_key: "WhhV4y"
                }
            },
            customDataList: [
                { name: "klaviyo_private_key", value: privateKey },
                { name: "klaviyo_public_key", value: "WhhV4y" },
                { name: "klaviyo_Public_Key", value: "WhhV4y" },
                { name: "feed_url", value: `https://me-central2-klaviyu-e80a2.cloudfunctions.net/klaviyoFeed?merchant_id=${merchantId}` },
                { name: "installed_at", value: Date.now() },
                { name: "last_authorize_at", value: Date.now() },
                { name: "last_settings_updated_at", value: Date.now() },
                { name: "timestamp", value: Date.now() }
            ]
        };
    }

    generateCustomerCreated(merchantId) {
        const firstName = this.englishFirstNames[Math.floor(Math.random() * this.englishFirstNames.length)];
        const lastName = this.englishLastNames[Math.floor(Math.random() * this.englishLastNames.length)];
        const fullName = `${firstName} ${lastName}`;

        return {
            event: 'customer.created',
            merchant: merchantId,
            created_at: new Date().toISOString(),
            data: {
                id: Math.floor(Math.random() * 1000000),
                full_name: fullName,
                first_name: firstName,
                last_name: lastName,
                email: this.generateEmail(),
                mobile: 550000000,
                mobile_code: "+966"
            }
        };
    }

    generateOrderCreated(merchantId) {
        const customer = this.generateCustomerCreated(merchantId).data;
        const orderId = 1336859240;
        const referenceId = 232751309;

        return {
            event: 'order.created',
            merchant: merchantId,
            created_at: new Date().toISOString(),
            data: {
                id: orderId,
                external_order_id: null,
                checkout_id: null,
                reference_id: referenceId,
                urls: {
                    customer: "https://demostore.salla.sa/dev-oedrju5bfxmfqkq3/order/OwlwNjp",
                    admin: "https://s.salla.sa/orders/order/D82JZ3kzpyYBWQZqj94GM6Q0rVARwxqP",
                    rating: null,
                    digital_content: null
                },
                date: {
                    date: "2026-01-29 17:47:03.000000",
                    timezone_type: 3,
                    timezone: "Asia/Riyadh"
                },
                updated_at: {
                    date: "2026-01-29 17:47:03.000000",
                    timezone_type: 3,
                    timezone: "Asia/Riyadh"
                },
                source: "dashboard",
                draft: false,
                read: true,
                source_details: {
                    type: "dashboard",
                    value: null,
                    device: "desktop",
                    "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36",
                    utm_source: "",
                    utm_campaign: "",
                    utm_medium: "",
                    utm_term: "",
                    utm_content: "",
                    ip: null
                },
                status: {
                    id: 566146469,
                    name: "بإنتظار المراجعة",
                    slug: "under_review",
                    customized: { id: 1692755273, name: "بإنتظار المراجعة" }
                },
                is_price_quote: false,
                payment_method: "cod",
                receipt_image: null,
                currency: "SAR",
                amounts: {
                    sub_total: { amount: 299, currency: "SAR" },
                    shipping_cost: { amount: 0, currency: "SAR" },
                    cash_on_delivery: { amount: 43, currency: "SAR" },
                    tax: { percent: "0.00", amount: { amount: 0, currency: "SAR" } },
                    discounts: [
                        {
                            title: "كوبون خصم 7day",
                            type: "normal",
                            code: "7day",
                            discount: "101.66",
                            currency: "SAR",
                            discounted_shipping: "0.00",
                            hasMarketing: false
                        }
                    ],
                    total: { amount: 240.34, currency: "SAR" }
                },
                customer: customer,
                items: [
                    {
                        id: 1167628430,
                        name: "فستان",
                        sku: "15504448-30000024230-",
                        product_sku_id: 1188306250,
                        quantity: 1,
                        free_quantity: null,
                        currency: "SAR",
                        weight: 0.25,
                        amounts: {
                            original_price: { amount: 299, currency: "SAR" },
                            total: { amount: 197.34, currency: "SAR" }
                        },
                        product: {
                            id: 846903625,
                            name: "فستان",
                            thumbnail: "https://salla-dev.s3.eu-central-1.amazonaws.com/nWzD/ACknxzEIkcTdaFr1DETbQlXo5UwupBedJ9ZGyR8v.jpg",
                            url: "https://demostore.salla.sa/dev-oedrju5bfxmfqkq3/فستان/p846903625"
                        }
                    }
                ],
                store: {
                    id: 558749540,
                    name: { ar: "متجر تجريبي", en: "Demo Store" }
                }
            }
        };
    }
}
