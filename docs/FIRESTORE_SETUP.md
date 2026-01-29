# Firestore Test Data Setup

## Overview

Before running the scalability tests, you need to seed Firestore with test merchant accounts. Each merchant document must contain a `privateKey` field that stores the Klaviyo API key for that merchant.

## Required Firestore Structure

The backend app needs to query Firestore using the merchant ID from the webhook payload. Make sure your Firestore structure matches what your backend expects.

### Recommended Structure

```
Collection: merchants (or salla_merchants, or whatever your backend uses)
├── Document: merchant_0001
│   ├── privateKey: "pk_test_abc123xyz..."
│   ├── merchantName: "Test Merchant 1"
│   ├── status: "active"
│   └── createdAt: Timestamp
├── Document: merchant_0002
│   ├── privateKey: "pk_test_def456uvw..."
│   ├── merchantName: "Test Merchant 2"
│   ├── status: "active"
│   └── createdAt: Timestamp
...
└── Document: merchant_0050
    ├── privateKey: "pk_test_mno789rst..."
    ├── merchantName: "Test Merchant 50"
    ├── status: "active"
    └── createdAt: Timestamp
```

## How to Seed Firestore

### Option 1: Firebase Console (Manual)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to **Firestore Database**
4. Create or navigate to your merchants collection
5. Add documents with IDs: `merchant_0001`, `merchant_0002`, etc.
6. For each document, add:
   - `privateKey` (string): TEST Klaviyo private key (e.g., `pk_test_xxxxxx`)
   - `merchantName` (string): Any name for identification
   - `status` (string): `"active"`
   - `createdAt` (timestamp): Current timestamp

### Option 2: Firebase Admin SDK Script

Create a simple Node.js script to seed data:

```javascript
const admin = require('firebase-admin');
const serviceAccount = require('./path/to/serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function seedMerchants(count = 50) {
  const batch = db.batch();
  
  for (let i = 1; i <= count; i++) {
    const merchantId = `merchant_${i.toString().padStart(4, '0')}`;
    const docRef = db.collection('merchants').doc(merchantId);
    
    batch.set(docRef, {
      privateKey: `pk_test_merchant_${merchantId}_key_${Math.random().toString(36).substr(2, 9)}`,
      merchantName: `Test Merchant ${i}`,
      status: 'active',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
  }
  
  await batch.commit();
  console.log(`✓ Seeded ${count} test merchants`);
}

seedMerchants(50);
```

### Option 3: Firestore REST API

Use curl or Postman to create documents via REST API.

## Backend Configuration Checklist

Ensure your backend:

1. ✅ Reads the `merchant` field from webhook payload
2. ✅ Queries Firestore using that merchant ID
3. ✅ Retrieves the `privateKey` field from the document
4. ✅ Passes the private key to Server-side Tag Manager as a variable
5. ✅ STM uses that variable in the Klaviyo tag configuration

## Testing the Setup

After seeding, verify the data:

```javascript
// Quick verification script
const admin = require('firebase-admin');
admin.initializeApp();

async function verifyMerchant(merchantId) {
  const doc = await admin.firestore()
    .collection('merchants')
    .doc(merchantId)
    .get();
  
  if (doc.exists) {
    console.log(`✓ ${merchantId}:`, doc.data());
  } else {
    console.log(`✗ ${merchantId}: NOT FOUND`);
  }
}

verifyMerchant('merchant_0001');
```

## Important Notes

- **Use TEST Klaviyo keys**: Never use production Klaviyo API keys for testing
- **Merchant ID format**: Must match exactly: `merchant_0001`, `merchant_0002`, etc. (4 digits with leading zeros)
- **Collection name**: Make sure it matches what your backend queries
- **Field names**: Ensure `privateKey` field name matches your backend code

## Troubleshooting

### "Merchant not found" errors

- Check Firestore collection name matches backend code
- Verify merchant IDs use correct format with 4 digits
- Confirm documents exist in Firestore console

### "Invalid private key" errors

- Ensure privateKey field exists in documents
- Check that keys have correct Klaviyo format (`pk_test_...`)
- Verify Server-side Tag Manager can read the variable

### Permission errors

- Check Firestore security rules
- Ensure service account has read permissions
- Verify Firebase Admin SDK is properly initialized

---

Once Firestore is seeded, you're ready to run the tests! 🚀
