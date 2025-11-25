/**
 * AFFILIATE SYSTEM - COMPREHENSIVE SEED DATA
 * 
 * This script creates realistic sample data for the entire affiliate system:
 * - Users (Affiliates & Merchants)
 * - Campaigns (various statuses and commission types)
 * - Links (with tracking codes)
 * - Clicks (with analytics data)
 * - Conversions (various stages)
 * - Payment Requests
 * - Campaign Applications
 * 
 * Run: cd backend && bun scripts/seed-affiliate-data.ts
 */

import { PrismaClient, AffUserRole, AffCampaignStatus, AffConversionStatus, AffPaymentStatus, AffPaymentMethod } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

// Helper function to generate random date within range
function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

// Helper to generate tracking code
function generateTrackingCode(prefix: string = 'TRK'): string {
  return `${prefix}-${faker.string.alphanumeric(8).toUpperCase()}`;
}

// Helper to calculate commission
function calculateCommission(saleAmount: number, commissionRate: number, commissionType: string, fixedAmount?: number): number {
  if (commissionType === 'fixed' && fixedAmount) {
    return fixedAmount;
  }
  return (saleAmount * commissionRate) / 100;
}

async function main() {
  console.log('🚀 Starting Affiliate System Data Seeding...\n');

  // ============================================
  // 1. CREATE SAMPLE USERS (if they don't exist)
  // ============================================
  console.log('👤 Step 1: Creating sample users...');
  
  const sampleUsers = [];
  for (let i = 0; i < 10; i++) {
    const user = await prisma.user.upsert({
      where: { email: `affiliate${i + 1}@example.com` },
      update: {},
      create: {
        username: `affiliate_user_${i + 1}`,
        email: `affiliate${i + 1}@example.com`,
        password: '$2b$10$YourHashedPasswordHere', // In production, hash properly
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        roleType: 'USER',
        isActive: true,
        isVerified: true,
      },
    });
    sampleUsers.push(user);
  }
  console.log(`✅ Created/Updated ${sampleUsers.length} users\n`);

  // ============================================
  // 2. CREATE AFFILIATE USERS
  // ============================================
  console.log('🎯 Step 2: Creating Affiliate Users...');
  
  const affiliateUsers = [];
  const merchantUsers = [];

  // Create 6 Affiliate users
  for (let i = 0; i < 6; i++) {
    const affUser = await prisma.affUser.create({
      data: {
        userId: sampleUsers[i].id,
        role: AffUserRole.AFFILIATE,
        isActive: i < 4, // First 4 are active
        companyName: faker.company.name(),
        website: faker.internet.url(),
        paymentMethod: faker.helpers.arrayElement([AffPaymentMethod.PAYPAL, AffPaymentMethod.BANK_TRANSFER, AffPaymentMethod.MOMO]),
        paypalEmail: faker.internet.email(),
        bankAccount: faker.finance.accountNumber(),
        taxId: faker.string.alphanumeric(10),
        description: faker.company.catchPhrase(),
        businessType: faker.helpers.arrayElement(['Blog', 'YouTube Channel', 'Social Media', 'Website', 'Email Marketing']),
      },
    });
    affiliateUsers.push(affUser);
  }

  // Create 4 Merchant users
  for (let i = 6; i < 10; i++) {
    const merchantUser = await prisma.affUser.create({
      data: {
        userId: sampleUsers[i].id,
        role: AffUserRole.MERCHANT,
        isActive: true,
        companyName: faker.company.name(),
        website: faker.internet.url(),
        paymentMethod: AffPaymentMethod.BANK_TRANSFER,
        bankAccount: faker.finance.accountNumber(),
        taxId: faker.string.alphanumeric(10),
        description: faker.company.catchPhrase(),
        businessType: 'E-commerce',
      },
    });
    merchantUsers.push(merchantUser);
  }

  console.log(`✅ Created ${affiliateUsers.length} Affiliate users`);
  console.log(`✅ Created ${merchantUsers.length} Merchant users\n`);

  // ============================================
  // 3. CREATE CAMPAIGNS
  // ============================================
  console.log('📋 Step 3: Creating Campaigns...');

  const campaigns = [];
  const campaignTypes = ['percentage', 'fixed', 'percentage'];
  const campaignStatuses = [
    AffCampaignStatus.ACTIVE,
    AffCampaignStatus.ACTIVE,
    AffCampaignStatus.ACTIVE,
    AffCampaignStatus.PAUSED,
    AffCampaignStatus.DRAFT,
  ];

  for (let i = 0; i < 8; i++) {
    const commissionType = campaignTypes[i % campaignTypes.length];
    const commissionRate = commissionType === 'percentage' ? faker.number.float({ min: 5, max: 30, fractionDigits: 2 }) : 0;
    const fixedAmount = commissionType === 'fixed' ? faker.number.float({ min: 10, max: 100, fractionDigits: 2 }) : null;

    const campaign = await prisma.affCampaign.create({
      data: {
        creatorId: merchantUsers[i % merchantUsers.length].id,
        name: `${faker.commerce.productAdjective()} ${faker.commerce.product()} Campaign`,
        productName: faker.commerce.productName(),
        productUrl: faker.internet.url(),
        productImage: faker.image.url(),
        description: faker.commerce.productDescription(),
        commissionType,
        commissionRate,
        fixedAmount,
        status: campaignStatuses[i % campaignStatuses.length],
        requireApproval: faker.datatype.boolean(),
        startDate: randomDate(new Date('2025-09-01'), new Date('2025-10-01')),
        endDate: randomDate(new Date('2025-11-01'), new Date('2025-12-31')),
        maxAffiliates: faker.number.int({ min: 50, max: 500 }),
      },
    });
    campaigns.push(campaign);
  }

  console.log(`✅ Created ${campaigns.length} campaigns\n`);

  // ============================================
  // 4. CREATE CAMPAIGN APPLICATIONS
  // ============================================
  console.log('📝 Step 4: Creating Campaign Applications...');

  const applications = [];
  const activeCampaigns = campaigns.filter(c => c.status === AffCampaignStatus.ACTIVE);

  for (const campaign of activeCampaigns) {
    // Each active campaign gets 2-4 applications
    const numApplications = faker.number.int({ min: 2, max: 4 });
    
    for (let i = 0; i < numApplications && i < affiliateUsers.length; i++) {
      const status = faker.helpers.arrayElement(['approved', 'approved', 'pending', 'rejected']);
      const appliedAt = randomDate(new Date(campaign.startDate!), new Date());
      
      const application = await prisma.affCampaignAffiliate.create({
        data: {
          campaignId: campaign.id,
          affiliateId: affiliateUsers[i].id,
          status,
          appliedAt,
          approvedAt: status === 'approved' ? randomDate(appliedAt, new Date()) : null,
          rejectedAt: status === 'rejected' ? randomDate(appliedAt, new Date()) : null,
          reason: status === 'rejected' ? faker.lorem.sentence() : null,
          totalClicks: status === 'approved' ? faker.number.int({ min: 0, max: 500 }) : 0,
          totalConversions: status === 'approved' ? faker.number.int({ min: 0, max: 50 }) : 0,
          totalEarnings: status === 'approved' ? faker.number.float({ min: 0, max: 1000, fractionDigits: 2 }) : 0,
        },
      });
      applications.push(application);
    }
  }

  console.log(`✅ Created ${applications.length} campaign applications\n`);

  // ============================================
  // 5. CREATE AFFILIATE LINKS
  // ============================================
  console.log('🔗 Step 5: Creating Affiliate Links...');

  const links: any[] = [];
  const approvedApplications = applications.filter(app => app.status === 'approved');

  for (const app of approvedApplications) {
    // Each approved application gets 1-3 links
    const numLinks = faker.number.int({ min: 1, max: 3 });
    
    for (let i = 0; i < numLinks; i++) {
      const trackingCode = generateTrackingCode('AFF');
      const campaign = campaigns.find(c => c.id === app.campaignId)!;
      
      const link = await prisma.affLink.create({
        data: {
          affiliateId: app.affiliateId,
          campaignId: app.campaignId,
          trackingCode,
          originalUrl: campaign.productUrl,
          shortUrl: `https://aff.link/${trackingCode}`,
          utmSource: faker.helpers.arrayElement(['facebook', 'twitter', 'instagram', 'email']),
          utmMedium: faker.helpers.arrayElement(['social', 'email', 'banner', 'text']),
          utmCampaign: campaign.name.toLowerCase().replace(/\s/g, '-'),
          isActive: faker.datatype.boolean(0.9), // 90% active
          expiresAt: randomDate(new Date(), new Date('2026-01-01')),
          totalClicks: 0,
          totalConversions: 0,
          totalEarnings: 0,
        },
      });
      links.push(link);
    }
  }

  console.log(`✅ Created ${links.length} affiliate links\n`);

  // ============================================
  // 6. CREATE CLICKS
  // ============================================
  console.log('📊 Step 6: Creating Click Data...');

  const clicks = [];
  const devices = ['desktop', 'mobile', 'tablet'];
  const browsers = ['Chrome', 'Firefox', 'Safari', 'Edge'];
  const countries = ['US', 'UK', 'CA', 'AU', 'VN', 'DE', 'FR', 'JP'];
  const cities = ['New York', 'London', 'Toronto', 'Sydney', 'Hanoi', 'Berlin', 'Paris', 'Tokyo'];

  for (const link of links) {
    const numClicks = faker.number.int({ min: 10, max: 200 });
    
    for (let i = 0; i < numClicks; i++) {
      const clickedAt = randomDate(new Date('2025-10-01'), new Date());
      
      const click = await prisma.affClick.create({
        data: {
          linkId: link.id,
          clickedAt,
          ipAddress: faker.internet.ipv4(),
          userAgent: faker.internet.userAgent(),
          referer: faker.internet.url(),
          country: faker.helpers.arrayElement(countries),
          city: faker.helpers.arrayElement(cities),
          device: faker.helpers.arrayElement(devices),
          browser: faker.helpers.arrayElement(browsers),
          sessionId: faker.string.uuid(),
          visitorId: faker.string.uuid(),
        },
      });
      clicks.push(click);
    }

    // Update link click count
    await prisma.affLink.update({
      where: { id: link.id },
      data: { totalClicks: numClicks },
    });
  }

  console.log(`✅ Created ${clicks.length} clicks\n`);

  // ============================================
  // 7. CREATE CONVERSIONS
  // ============================================
  console.log('💰 Step 7: Creating Conversions...');

  const conversions = [];
  const conversionStatuses = [
    AffConversionStatus.APPROVED,
    AffConversionStatus.APPROVED,
    AffConversionStatus.PENDING,
    AffConversionStatus.PAID,
  ];

  for (const link of links) {
    const campaign = campaigns.find(c => c.id === link.campaignId)!;
    const linkClicks = clicks.filter(c => c.linkId === link.id);
    const numConversions = faker.number.int({ min: 0, max: Math.floor(linkClicks.length * 0.15) }); // 5-15% conversion rate
    
    for (let i = 0; i < numConversions; i++) {
      const saleAmount = faker.number.float({ min: 20, max: 500, fractionDigits: 2 });
      const commissionRateNum = Number(campaign.commissionRate);
      const fixedAmountNum = campaign.fixedAmount ? Number(campaign.fixedAmount) : undefined;
      const commission = calculateCommission(saleAmount, commissionRateNum, campaign.commissionType, fixedAmountNum);
      const status = faker.helpers.arrayElement(conversionStatuses);
      const convertedAt = randomDate(new Date('2025-10-05'), new Date());
      
      const conversion = await prisma.affConversion.create({
        data: {
          affiliateId: link.affiliateId,
          campaignId: link.campaignId,
          linkId: link.id,
          clickId: linkClicks[i % linkClicks.length]?.id,
          orderId: `ORD-${faker.string.alphanumeric(10).toUpperCase()}`,
          saleAmount,
          commission,
          currency: 'VND',
          conversionType: 'sale',
          status,
          convertedAt,
          approvedAt: status === AffConversionStatus.APPROVED || status === AffConversionStatus.PAID ? randomDate(convertedAt, new Date()) : null,
          paidAt: status === AffConversionStatus.PAID ? randomDate(convertedAt, new Date()) : null,
          customerEmail: faker.internet.email(),
          notes: faker.lorem.sentence(),
        },
      });
      conversions.push(conversion);
    }

    // Update link totals
    const linkConversions = conversions.filter(c => c.linkId === link.id);
    const totalEarnings = linkConversions.reduce((sum, c) => sum + Number(c.commission), 0);
    
    await prisma.affLink.update({
      where: { id: link.id },
      data: {
        totalConversions: linkConversions.length,
        totalEarnings,
      },
    });
  }

  console.log(`✅ Created ${conversions.length} conversions\n`);

  // ============================================
  // 8. CREATE PAYMENT REQUESTS
  // ============================================
  console.log('💳 Step 8: Creating Payment Requests...');

  const paymentRequests = [];

  for (const affUser of affiliateUsers.filter(u => u.isActive)) {
    // Get approved conversions for this affiliate
    const affConversions = conversions.filter(
      c => c.affiliateId === affUser.id && c.status === AffConversionStatus.APPROVED
    );

    if (affConversions.length > 0) {
      const totalAvailable = affConversions.reduce((sum, c) => sum + Number(c.commission), 0);
      
      if (totalAvailable > 50) {
        const numRequests = faker.number.int({ min: 1, max: 3 });
        
        for (let i = 0; i < numRequests; i++) {
          const amount = faker.number.float({ min: 50, max: Math.min(totalAvailable / 2, 500), fractionDigits: 2 });
          const status = faker.helpers.arrayElement([
            AffPaymentStatus.COMPLETED,
            AffPaymentStatus.COMPLETED,
            AffPaymentStatus.PENDING,
            AffPaymentStatus.PROCESSING,
          ]);
          const requestedAt = randomDate(new Date('2025-10-10'), new Date());
          
          const periodStart = randomDate(new Date('2025-09-01'), requestedAt);
          const periodEnd = randomDate(periodStart, requestedAt);
          
          const paymentRequest = await prisma.affPaymentRequest.create({
            data: {
              affiliateId: affUser.id,
              amount,
              currency: 'VND',
              paymentMethod: affUser.paymentMethod || AffPaymentMethod.BANK_TRANSFER,
              status,
              requestedAt,
              processedAt: status === AffPaymentStatus.COMPLETED || status === AffPaymentStatus.PROCESSING ? randomDate(requestedAt, new Date()) : null,
              completedAt: status === AffPaymentStatus.COMPLETED ? randomDate(requestedAt, new Date()) : null,
              periodStart,
              periodEnd,
              accountDetails: JSON.stringify({
                account: faker.finance.accountNumber(),
                note: faker.lorem.sentence(),
              }),
              transactionId: status === AffPaymentStatus.COMPLETED ? `TXN-${faker.string.alphanumeric(12).toUpperCase()}` : null,
              notes: status === AffPaymentStatus.COMPLETED ? 'Payment completed successfully' : null,
            },
          });
          paymentRequests.push(paymentRequest);
        }
      }
    }
  }

  console.log(`✅ Created ${paymentRequests.length} payment requests\n`);

  // ============================================
  // 9. UPDATE CAMPAIGN STATISTICS
  // ============================================
  console.log('📈 Step 9: Updating Campaign Statistics...');

  for (const campaign of campaigns) {
    const campaignConversions = conversions.filter(c => c.campaignId === campaign.id);
    const campaignClicks = clicks.filter(click => {
      const link = links.find(l => l.id === click.linkId);
      return link?.campaignId === campaign.id;
    });

    const totalRevenue = campaignConversions.reduce((sum, c) => sum + Number(c.saleAmount), 0);
    const totalCommission = campaignConversions.reduce((sum, c) => sum + Number(c.commission), 0);

    await prisma.affCampaign.update({
      where: { id: campaign.id },
      data: {
        totalClicks: campaignClicks.length,
        totalConversions: campaignConversions.length,
        totalRevenue,
        totalCommission,
      },
    });
  }

  console.log('✅ Updated campaign statistics\n');

  // ============================================
  // 10. UPDATE APPLICATION STATISTICS
  // ============================================
  console.log('📊 Step 10: Updating Application Statistics...');

  for (const app of applications) {
    const appLinks = links.filter(l => l.campaignId === app.campaignId && l.affiliateId === app.affiliateId);
    const totalClicks = appLinks.reduce((sum, l) => sum + l.totalClicks, 0);
    const totalConversions = appLinks.reduce((sum, l) => sum + l.totalConversions, 0);
    const totalEarnings = appLinks.reduce((sum, l) => sum + Number(l.totalEarnings), 0);

    await prisma.affCampaignAffiliate.update({
      where: { id: app.id },
      data: {
        totalClicks,
        totalConversions,
        totalEarnings,
      },
    });
  }

  console.log('✅ Updated application statistics\n');

  // ============================================
  // SUMMARY
  // ============================================
  console.log('═══════════════════════════════════════════');
  console.log('✨ AFFILIATE SYSTEM DATA SEEDING COMPLETED!');
  console.log('═══════════════════════════════════════════\n');

  console.log('📊 SUMMARY OF CREATED DATA:\n');
  console.log(`👤 Users:                    ${sampleUsers.length}`);
  console.log(`🎯 Affiliate Users:          ${affiliateUsers.length}`);
  console.log(`🏢 Merchant Users:           ${merchantUsers.length}`);
  console.log(`📋 Campaigns:                ${campaigns.length}`);
  console.log(`   ├─ Active:                ${campaigns.filter(c => c.status === AffCampaignStatus.ACTIVE).length}`);
  console.log(`   ├─ Paused:                ${campaigns.filter(c => c.status === AffCampaignStatus.PAUSED).length}`);
  console.log(`   └─ Draft:                 ${campaigns.filter(c => c.status === AffCampaignStatus.DRAFT).length}`);
  console.log(`📝 Applications:             ${applications.length}`);
  console.log(`   ├─ Approved:              ${applications.filter(a => a.status === 'approved').length}`);
  console.log(`   ├─ Pending:               ${applications.filter(a => a.status === 'pending').length}`);
  console.log(`   └─ Rejected:              ${applications.filter(a => a.status === 'rejected').length}`);
  console.log(`🔗 Affiliate Links:          ${links.length}`);
  console.log(`📊 Clicks:                   ${clicks.length}`);
  console.log(`💰 Conversions:              ${conversions.length}`);
  console.log(`   ├─ Pending:               ${conversions.filter(c => c.status === AffConversionStatus.PENDING).length}`);
  console.log(`   ├─ Approved:              ${conversions.filter(c => c.status === AffConversionStatus.APPROVED).length}`);
  console.log(`   └─ Paid:                  ${conversions.filter(c => c.status === AffConversionStatus.PAID).length}`);
  console.log(`💳 Payment Requests:         ${paymentRequests.length}`);
  console.log(`   ├─ Pending:               ${paymentRequests.filter(p => p.status === AffPaymentStatus.PENDING).length}`);
  console.log(`   ├─ Processing:            ${paymentRequests.filter(p => p.status === AffPaymentStatus.PROCESSING).length}`);
  console.log(`   └─ Completed:             ${paymentRequests.filter(p => p.status === AffPaymentStatus.COMPLETED).length}`);

  const totalRevenue = conversions.reduce((sum, c) => sum + Number(c.saleAmount), 0);
  const totalCommission = conversions.reduce((sum, c) => sum + Number(c.commission), 0);
  const totalPaid = paymentRequests
    .filter(p => p.status === AffPaymentStatus.COMPLETED)
    .reduce((sum, p) => sum + Number(p.amount), 0);

  console.log(`\n💵 FINANCIAL SUMMARY:`);
  console.log(`   Total Revenue:            ${totalRevenue.toLocaleString('vi-VN')} VND`);
  console.log(`   Total Commission:         ${totalCommission.toLocaleString('vi-VN')} VND`);
  console.log(`   Total Paid Out:           ${totalPaid.toLocaleString('vi-VN')} VND`);
  console.log(`   Pending Payout:           ${(totalCommission - totalPaid).toLocaleString('vi-VN')} VND`);

  console.log('\n═══════════════════════════════════════════');
  console.log('🎉 All data created successfully!');
  console.log('═══════════════════════════════════════════\n');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
