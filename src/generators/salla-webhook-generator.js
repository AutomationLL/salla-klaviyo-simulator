const crypto = require('crypto');

/**
 * Generates realistic Salla webhook payloads for testing
 */
class SallaWebhookGenerator {
  constructor() {
    this.saudiFirstNames = [
      'محمد', 'أحمد', 'فاطمة', 'عائشة', 'خالد', 'عبدالله', 'سارة', 'نورة',
      'سلطان', 'فهد', 'مريم', 'هند', 'عبدالعزيز', 'منصور', 'لطيفة', 'جواهر'
    ];

    this.saudiLastNames = [
      'العتيبي', 'الغامدي', 'القحطاني', 'الدوسري', 'الشمري', 'الزهراني',
      'العنزي', 'الحربي', 'المطيري', 'السهلي', 'العمري', 'الشهري'
    ];

    this.englishFirstNames = [
      'James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda',
      'William', 'Elizabeth', 'David', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica'
    ];

    this.englishLastNames = [
      'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis'
    ];

    this.saudiCities = [
      { name: 'الرياض', name_en: 'Riyadh' },
      { name: 'جدة', name_en: 'Jeddah' },
      { name: 'الدمام', name_en: 'Dammam' },
      { name: 'مكة المكرمة', name_en: 'Makkah' },
      { name: 'المدينة المنورة', name_en: 'Madinah' },
      { name: 'الخبر', name_en: 'Khobar' }
    ];

    this.productNames = [
      { ar: 'عطر فاخر', en: 'Luxury Perfume' },
      { ar: 'ساعة ذكية', en: 'Smart Watch' },
      { ar: 'حقيبة جلدية', en: 'Leather Bag' },
      { ar: 'قميص رجالي', en: 'Men\'s Shirt' },
      { ar: 'فستان نسائي', en: 'Women\'s Dress' },
      { ar: 'حذاء رياضي', en: 'Sports Shoes' },
      { ar: 'هاتف ذكي', en: 'Smartphone' },
      { ar: 'سماعات لاسلكية', en: 'Wireless Headphones' }
    ];
  }

  /**
   * Generate random Saudi phone number
   */
  generatePhoneNumber() {
    const prefixes = ['50', '53', '54', '55', '56', '58', '59'];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const number = Math.floor(Math.random() * 10000000).toString().padStart(7, '0');
    return `+966${prefix}${number}`;
  }

  /**
   * Generate random English name
   */
  generateEnglishName() {
    const firstName = this.englishFirstNames[Math.floor(Math.random() * this.englishFirstNames.length)];
    const lastName = this.englishLastNames[Math.floor(Math.random() * this.englishLastNames.length)];
    return { firstName, lastName, fullName: `${firstName} ${lastName}` };
  }

  /**
   * Generate random Saudi name
   */
  generateName() {
    const firstName = this.saudiFirstNames[Math.floor(Math.random() * this.saudiFirstNames.length)];
    const lastName = this.saudiLastNames[Math.floor(Math.random() * this.saudiLastNames.length)];
    return `${firstName} ${lastName}`;
  }

  /**
   * Generate random email (English alphanumeric)
   */
  generateEmail() {
    const firstName = this.englishFirstNames[Math.floor(Math.random() * this.englishFirstNames.length)].toLowerCase();
    const lastName = this.englishLastNames[Math.floor(Math.random() * this.englishLastNames.length)].toLowerCase();
    const random = crypto.randomBytes(4).toString('hex');
    return `${firstName}.${lastName}.${random}@test.com`;
  }

  /**
   * Generate random city
   */
  generateCity() {
    return this.saudiCities[Math.floor(Math.random() * this.saudiCities.length)];
  }

  /**
   * Generate random product
   */
  generateProduct() {
    const product = this.productNames[Math.floor(Math.random() * this.productNames.length)];
    const price = (Math.random() * 1000 + 50).toFixed(2);
    const quantity = Math.floor(Math.random() * 5) + 1;

    return {
      id: Math.floor(Math.random() * 1000000),
      name: product.ar,
      name_en: product.en,
      price: parseFloat(price),
      quantity: quantity,
      currency: 'SAR'
    };
  }

  /**
   * Generate app.store.authorize webhook payload
   */
  generateAppStoreAuthorize(merchantId) {
    return {
      event: 'app.store.authorize',
      merchant: merchantId,
      created_at: new Date().toISOString(),
      data: {
        id: 1376022133,
        app_name: "Klaviyo v1",
        app_description: "Klaviyo integration that connects your store to Klaviyo for automated marketing.",
        app_type: "app",
        access_token: "ory_at_uBi3WzgQRlehnBscS8u4-c4gSuuMfqsBPSAIe_doyVY.gwh21Hhdqoit9JbJIw0a3j_Q3zyYoItv-qPAQTE0FRQ",
        expires: 1770908740,
        refresh_token: "ory_rt_R5lyBoZjdetgMXb1q95d-LGUoEEZWhIoFWzuFf3KEpA.k13eDFCDgpYqysVIw9wmvJl3sPGw2m-OPHCUZPswL4w",
        scope: "settings.read products.read webhooks.read_write store-settings.read_write offline_access",
        token_type: "bearer"
      },
      customDataList: [
        {
          name: "salla_access_token",
          value: "ory_at_uBi3WzgQRlehnBscS8u4-c4gSuuMfqsBPSAIe_doyVY.gwh21Hhdqoit9JbJIw0a3j_Q3zyYoItv-qPAQTE0FRQ"
        },
        {
          name: "salla_refresh_token",
          value: "ory_rt_R5lyBoZjdetgMXb1q95d-LGUoEEZWhIoFWzuFf3KEpA.k13eDFCDgpYqysVIw9wmvJl3sPGw2m-OPHCUZPswL4w"
        },
        { name: "salla_expires_at", value: 1770908740 },
        { name: "salla_scope", value: "settings.read products.read webhooks.read_write store-settings.read_write offline_access" }
      ]
    };
  }

  /**
   * Generate app.settings.updated webhook payload (CRITICAL FOR DB SYNC)
   */
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

  /**
   * Generate customer.created webhook payload (AUTHENTIC)
   */
  generateCustomerCreated(merchantId) {
    const { firstName, lastName, fullName } = this.generateEnglishName();
    const mobile = this.generatePhoneNumber().replace('+966', '');
    const email = this.generateEmail();

    return {
      event: 'customer.created',
      merchant: merchantId,
      created_at: new Date().toISOString(),
      data: {
        id: Math.floor(Math.random() * 2000000000),
        full_name: fullName,
        first_name: firstName,
        last_name: lastName,
        mobile: parseInt(mobile),
        mobile_code: "+966",
        email: email,
        urls: {
          customer: `https://demostore.salla.sa/${merchantId}/profile`,
          admin: `https://s.salla.sa/customers/${crypto.randomBytes(16).toString('hex')}`
        },
        avatar: "https://cdn.assets.salla.network/prod/admin/cp/assets/images/avatar_male.png",
        gender: "",
        birthday: null,
        city: "",
        country: "السعودية",
        country_code: "SA",
        currency: "SAR",
        location: "",
        lang: "ar",
        created_at: {
          date: new Date().toISOString().replace('T', ' ').replace('Z', ''),
          timezone_type: 3,
          timezone: "Asia/Riyadh"
        },
        updated_at: {
          date: new Date().toISOString().replace('T', ' ').replace('Z', ''),
          timezone_type: 3,
          timezone: "Asia/Riyadh"
        },
        type: "user",
        groups: [],
        source: {
          device: "desktop",
          "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          ip: "2a02:cb80:4098:ad4b:a450:d199:4d62:6947"
        },
        is_notifications_enabled: true
      }
    };
  }

  /**
   * Generate order.created webhook payload (MATCH USER SAMPLE)
   */
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

  /**
   * Generate order.status.updated webhook payload
   */
  generateOrderStatusUpdated(merchantId, orderId) {
    return {
      event: 'order.status.updated',
      merchant: merchantId,
      created_at: new Date().toISOString(),
      data: {
        id: Math.floor(Math.random() * 1000000000),
        status: "قيد الإسترجاع",
        order: {
          id: orderId || 1336859240,
          status: {
            name: "قيد الإسترجاع",
            slug: "restoring"
          }
        }
      }
    };
  }

  /**
   * Generate customer.updated webhook payload
   */
  generateCustomerUpdated(merchantId, customerId) {
    const payload = this.generateCustomerCreated(merchantId);
    payload.event = 'customer.updated';
    if (customerId) payload.data.id = customerId;
    return payload;
  }

  /**
   * Generate random webhook event
   */
  generateRandomEvent(merchantId) {
    const eventTypes = ['order.created', 'customer.created', 'customer.updated'];
    const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];

    switch (eventType) {
      case 'order.created':
        return this.generateOrderCreated(merchantId);
      case 'customer.created':
        return this.generateCustomerCreated(merchantId);
      case 'customer.updated':
        return this.generateCustomerUpdated(merchantId);
      default:
        return this.generateOrderCreated(merchantId);
    }
  }
}

module.exports = SallaWebhookGenerator;
