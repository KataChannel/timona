#!/usr/bin/env bun
/**
 * ============================================================================
 * DEBUG: Decode JWT Token từ localStorage
 * ============================================================================
 * 
 * Tool này giúp debug xem JWT token có đúng không
 * 
 * Cách dùng:
 * 1. Mở browser console
 * 2. Copy token: localStorage.getItem('accessToken')
 * 3. Paste vào đây
 * 
 * bun scripts/debug-jwt-token.ts <token>
 */

function decodeJWT(token: string) {
  try {
    // Remove "Bearer " if present
    const cleanToken = token.replace('Bearer ', '').trim();
    
    // Split token
    const parts = cleanToken.split('.');
    if (parts.length !== 3) {
      console.error('❌ Invalid JWT format (expected 3 parts)');
      return;
    }

    // Decode header
    const header = JSON.parse(
      Buffer.from(parts[0], 'base64').toString('utf-8')
    );
    
    // Decode payload
    const payload = JSON.parse(
      Buffer.from(parts[1], 'base64').toString('utf-8')
    );

    console.log('\n🔍 JWT TOKEN DEBUG\n');
    console.log('='.repeat(60) + '\n');
    
    console.log('📋 HEADER:');
    console.log(JSON.stringify(header, null, 2));
    console.log('');
    
    console.log('📦 PAYLOAD:');
    console.log(JSON.stringify(payload, null, 2));
    console.log('');
    
    // Check expiration
    if (payload.exp) {
      const expDate = new Date(payload.exp * 1000);
      const now = new Date();
      const isExpired = expDate < now;
      
      console.log('⏰ EXPIRATION:');
      console.log(`   Expires at: ${expDate.toLocaleString('vi-VN')}`);
      console.log(`   Now: ${now.toLocaleString('vi-VN')}`);
      console.log(`   Status: ${isExpired ? '❌ EXPIRED' : '✅ Valid'}`);
      
      if (!isExpired) {
        const timeLeft = expDate.getTime() - now.getTime();
        const hours = Math.floor(timeLeft / (1000 * 60 * 60));
        const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
        console.log(`   Time left: ${hours}h ${minutes}m`);
      }
      console.log('');
    }
    
    // Extract user info
    console.log('👤 USER INFO:');
    console.log(`   User ID (sub): ${payload.sub || payload.id || 'N/A'}`);
    console.log(`   Email: ${payload.email || 'N/A'}`);
    console.log(`   Username: ${payload.username || 'N/A'}`);
    console.log('');
    
    // Check for chat usage
    console.log('💬 CHAT COMPATIBILITY:');
    const userId = payload.sub || payload.id;
    if (userId) {
      console.log(`   ✅ userId available: ${userId}`);
      console.log(`   → Socket.IO auth sẽ thành công`);
    } else {
      console.log(`   ❌ userId MISSING!`);
      console.log(`   → Socket.IO auth sẽ thất bại`);
    }
    console.log('');
    
    console.log('='.repeat(60));
    
  } catch (error: any) {
    console.error('💥 Error decoding token:', error.message);
    console.log('\n💡 Gợi ý:');
    console.log('   1. Token có đúng format không?');
    console.log('   2. Token có bị truncate không?');
    console.log('   3. Thử copy lại từ browser console');
  }
}

// Get token from command line
const token = process.argv[2];

if (!token) {
  console.log('📖 HƯỚNG DẪN:\n');
  console.log('1. Mở browser console (F12)');
  console.log('2. Chạy: localStorage.getItem("accessToken")');
  console.log('3. Copy token');
  console.log('4. Chạy: bun scripts/debug-jwt-token.ts "<token>"\n');
  console.log('Ví dụ:');
  console.log('   bun scripts/debug-jwt-token.ts eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...\n');
  process.exit(1);
}

decodeJWT(token);
