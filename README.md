# Salla-Klaviyo Integration Scalability Test Suite

A comprehensive load testing tool for validating the Salla-Klaviyo integration's ability to handle concurrent webhook events from multiple merchant accounts.

## 🎯 Purpose

This tool simulates real Salla webhook events and sends them to your Server-side Tag Manager endpoint to test:
- **Scalability**: Can the system handle multiple concurrent merchants?
- **Reliability**: Does the Firestore lookup work correctly under load?
- **Performance**: What are the response times at different loads?
- **Data Routing**: Are events correctly routed to different Klaviyo accounts?

## 🏗️ Architecture Overview

```
┌─────────────────┐
│  Testing Tool   │
│  (This Suite)   │
└────────┬────────┘
         │ Sends fake Salla webhooks
         │ with different merchant IDs
         ▼
┌─────────────────────────────┐
│  Your Backend Endpoint      │
│  track.hydralyte-sa.com     │
└────────┬────────────────────┘
         │ Looks up merchant ID
         ▼
┌─────────────────┐
│    Firestore    │ ◄── Stores private keys
└─────────────────┘     per merchant
         │
         ▼
┌─────────────────────────────┐
│  Server-side Tag Manager    │
└────────┬────────────────────┘
         │ Routes to correct account
         ▼
┌─────────────────┐
│     Klaviyo     │ ◄── Different accounts
└─────────────────┘     per merchant
```

## 📋 Prerequisites

- **Node.js** v14 or higher
- **npm** or **yarn**
- Your backend must be running and accessible at `https://track.hydralyte-sa.com/data`
- Firestore must be seeded with test merchant data (see below)

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd /Users/abdulellah/.gemini/antigravity/scratch/salla-klaviyo-test
npm install
```

### 2. Set Up Firestore Test Data

**IMPORTANT**: Before running tests, you need to seed Firestore with test merchant accounts.

In your Firestore database, create a collection (e.g., `merchants` or `salla_merchants`) with documents for each test merchant:

```javascript
// Example Firestore structure
merchants/
  merchant_0001/
    privateKey: "pk_test_abc123..."  // Klaviyo private key
    merchantName: "Test Merchant 1"
    status: "active"
    createdAt: timestamp
  
  merchant_0002/
    privateKey: "pk_test_def456..."
    merchantName: "Test Merchant 2"
    status: "active"
    createdAt: timestamp
  
  // ... up to merchant_0050 for stress testing
```

The tool will generate webhooks with merchant IDs: `merchant_0001` through `merchant_0050` (depending on scenario).

### 3. Run a Test

```bash
# Light load test (5 merchants, 10 req/s, 30s)
npm run test:light

# Medium load test (10 merchants, 50 req/s, 60s)
npm run test:medium

# Heavy load test (20 merchants, 100 req/s, 60s)
npm run test:heavy

# Stress test (50 merchants, 200 req/s, 120s)
npm run test:stress
```

### 4. Review Results

Test reports are automatically saved in the `reports/` directory:
- **JSON format**: `reports/[scenario]_[timestamp].json`
- **Markdown format**: `reports/[scenario]_[timestamp].md`

## 📊 Test Scenarios

| Scenario | Merchants | Requests/sec | Duration | Total Requests | Use Case |
|----------|-----------|--------------|----------|----------------|----------|
| Light    | 5         | 10           | 30s      | ~300           | Basic validation |
| Medium   | 10        | 50           | 60s      | ~3,000         | Normal traffic |
| Heavy    | 20        | 100          | 60s      | ~6,000         | Peak hours |
| Stress   | 50        | 200          | 120s     | ~24,000        | Maximum capacity |

## 🎨 Custom Test Configuration

Create a custom test by setting environment variables:

```bash
MERCHANT_COUNT=15 REQUESTS_PER_SECOND=75 DURATION_SECONDS=90 npm run test:custom
```

Or edit the `.env` file:

```env
WEBHOOK_ENDPOINT=https://track.hydralyte-sa.com/data
MERCHANT_COUNT=15
REQUESTS_PER_SECOND=75
DURATION_SECONDS=90
```

## 📝 Understanding Test Output

### Real-time Console Output

```
ℹ 10.0s | Requests: 500 | Success: 498 | Failed: 2 | Rate: 50.0 req/s
```

- **Requests**: Total sent so far
- **Success**: Successfully received 2xx responses
- **Failed**: Errors or timeouts
- **Rate**: Actual requests per second

### Final Report

```
═══════════════════════════════════════════════════════════════════
  TEST SUMMARY
═══════════════════════════════════════════════════════════════════

Scenario: Medium Load
Merchants: 10 | RPS: 50 | Duration: 60s

Results:
  Total Requests:  3000
  Successful:      2985 (99.50%)
  Failed:          15
  Avg Response:    125.45ms
  Min Response:    45.20ms
  Max Response:    850.30ms
  Duration:        60.12s
```

## 🔍 What Gets Tested

### Generated Webhook Events

The tool generates realistic Salla webhook payloads:

1. **Order Created Events** (`order.created`)
   - Arabic customer names and addresses
   - SAR currency
   - Saudi phone numbers (+966)
   - Multiple products with realistic pricing
   - Tax (15% VAT) and shipping costs

2. **Customer Created Events** (`customer.created`)
   - Saudi cities (Riyadh, Jeddah, etc.)
   - Realistic contact information

3. **Product Created Events** (`product.created`)
   - Arabic product names
   - SKU codes
   - Inventory data

### Example Webhook Payload

```json
{
  "event": "order.created",
  "merchant": "merchant_0005",
  "created_at": "2026-01-29T14:10:44.123Z",
  "data": {
    "id": 123456,
    "reference_id": "ORD-1738163444123-789",
    "customer": {
      "name": "محمد العتيبي",
      "email": "محمدالعتيبي789@example.com",
      "mobile": "+966501234567"
    },
    "amounts": {
      "subtotal": 499.99,
      "shipping_cost": 25.00,
      "tax": 75.00,
      "total": 599.99,
      "currency": "SAR"
    },
    // ... more fields
  }
}
```

## 🛠️ Troubleshooting

### High Failure Rate

**Symptoms**: Failed requests > 5%

**Possible Causes**:
- Backend endpoint is down or slow
- Firestore lookups are timing out
- Missing merchant IDs in Firestore
- Network issues

**Solutions**:
1. Check backend logs for errors
2. Verify Firestore has all merchant IDs seeded
3. Reduce load (try `test:light` first)
4. Check Server-side Tag Manager debug console

### Merchant Lookup Failures

**Symptoms**: All requests fail with same error

**Possible Causes**:
- Merchant IDs in Firestore don't match test IDs
- Incorrect Firestore collection name
- Firestore permissions issues

**Solutions**:
1. Verify Firestore collection structure matches expected format
2. Check that merchant IDs are `merchant_0001`, `merchant_0002`, etc.
3. Review backend code for correct Firestore query

### Slow Response Times

**Symptoms**: Avg response time > 1000ms

**Possible Causes**:
- Server-side Tag Manager processing is slow
- Firestore reads are not optimized
- Klaviyo API is rate limiting

**Solutions**:
1. Optimize Firestore queries (add indexes)
2. Implement caching for merchant private keys
3. Review STM tag configuration
4. Check Klaviyo API rate limits

## 📂 Project Structure

```
salla-klaviyo-test/
├── src/
│   ├── generators/
│   │   └── salla-webhook-generator.js    # Fake webhook data
│   ├── load-test/
│   │   ├── scalability-tester.js         # Main test runner
│   │   └── test-scenarios.js             # Test configurations
│   └── utils/
│       ├── logger.js                      # Colored console output
│       └── reporter.js                    # Report generation
├── reports/                               # Generated test reports
├── .env                                   # Configuration
├── package.json
└── README.md
```

## 🎯 Best Practices

1. **Start Small**: Always run `test:light` first to validate setup
2. **Gradual Scaling**: Progress through scenarios (light → medium → heavy → stress)
3. **Monitor Backend**: Watch server logs and Firestore metrics during tests
4. **Clean Data**: Clear test data from Klaviyo after testing
5. **Review Reports**: Check per-merchant breakdown for uneven distribution

## 🔐 Security Notes

- This tool uses **fake merchant IDs** for testing
- No real Salla API keys are required
- Backend should validate webhook signatures in production
- Test Klaviyo keys should be separate from production

## 📞 Support for Salla Team

When sharing this with the Salla team, ensure they:

1. ✅ Have Node.js installed
2. ✅ Understand they need to seed Firestore first
3. ✅ Know the merchant ID format (`merchant_0001`, etc.)
4. ✅ Can access backend logs for troubleshooting
5. ✅ Review generated reports in `reports/` folder

## 🚦 Expected Results

For a healthy integration:

| Metric | Expected | Action if Not Met |
|--------|----------|-------------------|
| Success Rate | > 99% | Investigate backend logs |
| Avg Response Time | < 500ms | Optimize Firestore/STM |
| Failed Requests | < 1% | Check merchant data seeding |
| Max Response Time | < 2000ms | Review bottlenecks |

---

**Ready to test?** Run `npm run test:light` to get started! 🚀
