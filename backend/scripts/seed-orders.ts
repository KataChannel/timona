/**
 * Seed Script - Tạo sample orders cho testing
 * Run: npx ts-node backend/scripts/seed-orders.ts
 */

import { PrismaClient, OrderStatus, PaymentMethod, PaymentStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function seedOrders() {
  try {
    console.log('🌱 Starting order seeding...');

    // Kiểm tra xem có user nào không
    const users = await prisma.user.findMany({ take: 1 });
    
    if (users.length === 0) {
      console.log('❌ No users found! Please create a user first.');
      console.log('Run: npx ts-node backend/scripts/seed-users.ts');
      return;
    }

    const userId = users[0].id;
    const userEmail = users[0].email || 'test@example.com';
    const userFullName = `${users[0].firstName || ''} ${users[0].lastName || ''}`.trim() || 'Test User';
    console.log(`✅ Found user: ${userEmail} (${userId})`);

    // Get available products with correct status enum
    const products = await prisma.product.findMany({
      where: {
        status: 'ACTIVE' // Use ACTIVE instead of PUBLISHED
      },
      take: 10,
    });

    if (products.length === 0) {
      console.error('❌ No products found. Please create some products first.');
      process.exit(1);
    }

    console.log(`✅ Found ${products.length} products`);

    // Delete existing test orders for this user
    const existingOrders = await prisma.order.findMany({
      where: { userId }
    });

    if (existingOrders.length > 0) {
      console.log(`🗑️  Deleting ${existingOrders.length} existing orders...`);
      
      // Delete order items first (cascade should handle this, but being explicit)
      await prisma.orderItem.deleteMany({
        where: {
          orderId: {
            in: existingOrders.map(o => o.id)
          }
        }
      });

      // Delete orders
      await prisma.order.deleteMany({
        where: { userId }
      });
    }

    // Create 5 sample orders with correct enum values
    const orderStatuses: OrderStatus[] = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPING', 'DELIVERED'];
    const paymentMethods: PaymentMethod[] = ['CASH_ON_DELIVERY', 'BANK_TRANSFER', 'VNPAY', 'MOMO', 'ZALOPAY'];
    const shippingAddresses = [
      {
        name: 'Nguyễn Văn A',
        phone: '0901234567',
        address: '123 Lê Lợi',
        city: 'Hồ Chí Minh',
        district: 'Quận 1',
        ward: 'Phường Bến Nghé',
        zipCode: '700000',
      },
      {
        name: 'Trần Thị B',
        phone: '0912345678',
        address: '456 Nguyễn Huệ',
        city: 'Hà Nội',
        district: 'Quận Hoàn Kiếm',
        ward: 'Phường Tràng Tiền',
        zipCode: '100000',
      },
      {
        name: 'Lê Văn C',
        phone: '0923456789',
        address: '789 Trần Hưng Đạo',
        city: 'Đà Nẵng',
        district: 'Quận Hải Châu',
        ward: 'Phường Thuận Phước',
        zipCode: '550000',
      },
    ];

    for (let i = 0; i < 5; i++) {
      const orderNumber = `ORD-${Date.now()}-${i + 1}`;
      const status: OrderStatus = orderStatuses[i];
      const paymentMethod: PaymentMethod = paymentMethods[i];
      const shippingAddress = shippingAddresses[i % shippingAddresses.length];
      
      // Select random products
      const numItems = Math.floor(Math.random() * 3) + 1; // 1-3 items
      const selectedProducts = products
        .sort(() => 0.5 - Math.random())
        .slice(0, numItems);

      // Calculate totals
      let subtotal = 0;
      const orderItems = selectedProducts.map((product) => {
        const quantity = Math.floor(Math.random() * 3) + 1; // 1-3 quantity
        const price = product.price || 100000;
        const itemSubtotal = price * quantity;
        subtotal += itemSubtotal;

        return {
          productId: product.id,
          productName: product.name,
          thumbnail: product.thumbnail || 'https://via.placeholder.com/400',
          quantity,
          quantityOrdered: quantity, // Required field
          quantityDelivered: status === 'DELIVERED' ? quantity : 0,
          quantityReceived: status === 'DELIVERED' ? quantity : 0,
          quantityCancelled: 0,
          price,
          subtotal: itemSubtotal,
          totalDelivered: status === 'DELIVERED' ? itemSubtotal : 0,
        };
      });

      const shippingFee = 30000;
      const tax = subtotal * 0.1; // 10% VAT
      const total = subtotal + shippingFee + tax;
      
      const paymentStatus: PaymentStatus = status === 'DELIVERED' ? 'PAID' : 'PENDING';

      const order = await prisma.order.create({
        data: {
          orderNumber,
          userId,
          status,
          total,
          subtotal,
          shippingFee,
          tax,
          vat: 10, // VAT percentage
          discount: 0,
          paymentMethod,
          paymentStatus,
          shippingMethod: 'STANDARD',
          shippingAddress: {
            fullName: shippingAddress.name,
            phone: shippingAddress.phone,
            email: userEmail,
            address: shippingAddress.address,
            ward: shippingAddress.ward,
            district: shippingAddress.district,
            city: shippingAddress.city,
            zipCode: shippingAddress.zipCode,
          },
          items: {
            create: orderItems,
          },
          createdAt: new Date(Date.now() - (5 - i) * 24 * 60 * 60 * 1000), // Stagger dates: newest first
        },
        include: {
          items: true,
        }
      });

      console.log(`✅ Created order ${i + 1}/5: ${orderNumber} (${status})`);
    }

    console.log('\n🎉 Order seeding completed successfully!');
    console.log(`Created 5 sample orders for user: ${userEmail}`);
    
  } catch (error) {
    console.error('❌ Error seeding orders:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run seed
seedOrders()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
