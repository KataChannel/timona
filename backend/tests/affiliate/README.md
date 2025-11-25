# Affiliate System End-to-End Testing

This directory contains comprehensive end-to-end tests for the affiliate marketing system. The tests validate the complete workflow from affiliate user registration to payment processing.

## Test Coverage

### 🧪 Test Scenarios

1. **Setup & Authentication**
   - User registration (Merchant & Affiliate)
   - JWT token authentication
   - GraphQL client initialization

2. **Affiliate User Management**
   - Affiliate profile creation
   - Business information setup
   - Payment method configuration

3. **Campaign Management**
   - Campaign creation by merchants
   - Campaign discovery by affiliates
   - Campaign status management

4. **Link Management**
   - Affiliate link generation
   - Custom alias assignment
   - Link metadata configuration

5. **Tracking System**
   - Click tracking validation
   - Pixel tracking verification
   - Device fingerprinting
   - Referrer tracking

6. **Analytics & Reporting**
   - Link performance metrics
   - Conversion tracking
   - Revenue calculation
   - Commission computation

7. **Payment Processing**
   - Payment request creation
   - Amount validation
   - Payment method verification
   - Status tracking

## 🚀 Running Tests

### Prerequisites

Ensure the backend server is running:

```bash
# From the backend directory
cd /chikiet/kataoffical/fullstack/rausachcore/backend
bun run dev
```

### Install Test Dependencies

```bash
cd /chikiet/kataoffical/fullstack/rausachcore/backend/tests/affiliate
bun install
```

### Execute Tests

```bash
# Run all tests
bun run test

# Run with file watching (for development)
bun run test:watch

# Run with verbose debugging
bun run test:verbose
```

### Manual Test Execution

```bash
# Direct execution
node e2e-test.js
```

## 📊 Test Configuration

### Environment Settings

The tests are configured to run against:
- **GraphQL Endpoint**: `http://localhost:3001/graphql`
- **API Base URL**: `http://localhost:3001`

### Test Data

Default test users are created automatically:

```javascript
// Merchant User
{
  email: 'merchant@test.com',
  password: 'testpass123',
  firstName: 'John',
  lastName: 'Merchant',
  username: 'merchant_user'
}

// Affiliate User  
{
  email: 'affiliate@test.com',
  password: 'testpass123', 
  firstName: 'Jane',
  lastName: 'Affiliate',
  username: 'affiliate_user'
}
```

## 🔍 Test Details

### GraphQL Operations Tested

#### Mutations
- `register` - User registration
- `login` - User authentication
- `createAffiliateUser` - Affiliate profile creation
- `createAffiliateCampaign` - Campaign creation
- `createAffiliateLink` - Link generation
- `createPaymentRequest` - Payment request submission

#### Queries
- `affiliateCampaigns` - Campaign discovery and search
- `affiliateLinks` - Link analytics and performance metrics

### HTTP Endpoints Tested

- `GET /aff/{trackingCode}` - Click tracking with redirect
- `GET /aff/pixel/{trackingCode}` - Pixel tracking for conversions

## 📈 Expected Results

### Success Criteria

A successful test run should show:

```
🧪 Test Results Summary:
================================================

✅ PASS setup
✅ PASS userRegistration  
✅ PASS campaignCreation
✅ PASS campaignDiscovery
✅ PASS linkCreation
✅ PASS linkTracking
✅ PASS linkAnalytics
✅ PASS paymentRequest

📊 Overall Result: 8/8 tests passed (100%)
🎉 All tests passed! Affiliate system is fully functional.
```

### Performance Expectations

- GraphQL operations should complete within 2-5 seconds
- Click tracking redirects should be under 500ms
- Pixel tracking should respond instantly
- Database operations should be optimized with proper indexing

## 🛠️ Troubleshooting

### Common Issues

1. **Connection Refused**
   ```
   Error: connect ECONNREFUSED 127.0.0.1:3001
   ```
   **Solution**: Ensure backend server is running on port 3001

2. **Authentication Errors**
   ```
   Error: Unauthorized
   ```
   **Solution**: Check JWT token generation and GraphQL authentication guards

3. **Database Errors**
   ```
   Error: relation "AffUser" does not exist
   ```
   **Solution**: Run Prisma migrations to create affiliate tables

4. **GraphQL Schema Errors**
   ```
   Error: Cannot query field on type
   ```
   **Solution**: Verify GraphQL resolvers are properly registered

### Debug Mode

Enable detailed logging:

```bash
DEBUG=* bun run test
```

This will show:
- HTTP request/response details
- GraphQL query execution
- Database interaction logs
- Authentication token flows

## 📝 Test Maintenance

### Adding New Tests

1. Create new test functions following the naming pattern:
   ```javascript
   async function testNewFeature() {
     console.log('🔍 Testing new feature...');
     // Test implementation
   }
   ```

2. Add to the main test execution flow:
   ```javascript
   results.newFeature = await testNewFeature();
   ```

3. Update the results summary section

### Updating Test Data

Modify the `testUsers` object or create new test datasets as needed:

```javascript
const testUsers = {
  // Add new user types
  admin: {
    email: 'admin@test.com',
    // ... other properties
  }
};
```

## 🔒 Security Considerations

- Test users use non-production credentials
- All test data is clearly marked as test data
- Tests clean up after execution
- No sensitive information is logged

## 📋 Test Report Example

```
🧪 Starting Affiliate System End-to-End Test

================================================

🔧 Setting up GraphQL clients...
📝 Registering merchant user...
✅ Merchant registered: merchant@test.com
📝 Registering affiliate user...  
✅ Affiliate registered: affiliate@test.com
✅ GraphQL clients setup complete

👤 Testing affiliate user registration...
✅ Affiliate user created: {
  id: 'aff_usr_123',
  role: 'AFFILIATE', 
  status: 'PENDING',
  businessName: 'Jane's Marketing Agency'
}

🚀 Testing campaign creation...
✅ Campaign created: {
  id: 'aff_camp_456',
  name: 'Premium Product Launch 2025',
  commissionRate: 15,
  status: 'ACTIVE'
}

... (additional test output)

================================================
🧪 Test Results Summary:
================================================

✅ PASS setup
✅ PASS userRegistration
✅ PASS campaignCreation  
✅ PASS campaignDiscovery
✅ PASS linkCreation
✅ PASS linkTracking
✅ PASS linkAnalytics
✅ PASS paymentRequest

📊 Overall Result: 8/8 tests passed (100%)
🎉 All tests passed! Affiliate system is fully functional.

================================================
```

This comprehensive test suite ensures the affiliate system is production-ready and all critical workflows function correctly.