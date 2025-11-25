#!/bin/bash

# Quick Test Script for MinIO Domain Migration
# Tests if storage.rausachtrangia.com is working correctly

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "=================================================="
echo "  MinIO Domain - Quick Test"
echo "=================================================="
echo ""

PASS=0
FAIL=0

# Test 1: DNS Resolution
echo -e "${BLUE}[Test 1] DNS Resolution${NC}"
if command -v dig &> /dev/null; then
  IP=$(dig +short storage.rausachtrangia.com | tail -n1)
  if [ "$IP" = "116.118.49.243" ]; then
    echo -e "${GREEN}✓ PASS${NC} - DNS resolves to 116.118.49.243"
    ((PASS++))
  else
    echo -e "${RED}✗ FAIL${NC} - DNS resolves to $IP (expected: 116.118.49.243)"
    ((FAIL++))
  fi
else
  echo -e "${YELLOW}⚠ SKIP${NC} - dig not installed"
fi
echo ""

# Test 2: HTTP → HTTPS Redirect
echo -e "${BLUE}[Test 2] HTTP → HTTPS Redirect${NC}"
HTTP_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://storage.rausachtrangia.com 2>&1 || echo "000")
if [ "$HTTP_RESPONSE" = "301" ] || [ "$HTTP_RESPONSE" = "302" ]; then
  echo -e "${GREEN}✓ PASS${NC} - HTTP redirects (Status: $HTTP_RESPONSE)"
  ((PASS++))
else
  echo -e "${RED}✗ FAIL${NC} - HTTP status: $HTTP_RESPONSE (expected: 301 or 302)"
  ((FAIL++))
fi
echo ""

# Test 3: HTTPS Access
echo -e "${BLUE}[Test 3] HTTPS Access${NC}"
HTTPS_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" https://storage.rausachtrangia.com 2>&1 || echo "000")
if [ "$HTTPS_RESPONSE" = "200" ] || [ "$HTTPS_RESPONSE" = "403" ]; then
  echo -e "${GREEN}✓ PASS${NC} - HTTPS accessible (Status: $HTTPS_RESPONSE)"
  ((PASS++))
else
  echo -e "${RED}✗ FAIL${NC} - HTTPS status: $HTTPS_RESPONSE (expected: 200 or 403)"
  ((FAIL++))
fi
echo ""

# Test 4: SSL Certificate
echo -e "${BLUE}[Test 4] SSL Certificate${NC}"
if command -v openssl &> /dev/null; then
  SSL_INFO=$(echo | openssl s_client -connect storage.rausachtrangia.com:443 -servername storage.rausachtrangia.com 2>&1)
  if echo "$SSL_INFO" | grep -q "Verify return code: 0"; then
    echo -e "${GREEN}✓ PASS${NC} - SSL certificate valid"
    ((PASS++))
  else
    ERROR=$(echo "$SSL_INFO" | grep "Verify return code:" || echo "Unknown error")
    echo -e "${RED}✗ FAIL${NC} - SSL error: $ERROR"
    ((FAIL++))
  fi
else
  echo -e "${YELLOW}⚠ SKIP${NC} - openssl not installed"
fi
echo ""

# Test 5: CORS Headers
echo -e "${BLUE}[Test 5] CORS Headers${NC}"
CORS_HEADER=$(curl -s -I -H "Origin: https://shop.rausachtrangia.com" https://storage.rausachtrangia.com 2>&1 | grep -i "access-control-allow-origin" || echo "")
if [ -n "$CORS_HEADER" ]; then
  echo -e "${GREEN}✓ PASS${NC} - CORS headers present"
  echo "  $CORS_HEADER"
  ((PASS++))
else
  echo -e "${RED}✗ FAIL${NC} - CORS headers missing"
  ((FAIL++))
fi
echo ""

# Test 6: Bucket Access (if exists)
echo -e "${BLUE}[Test 6] Bucket Access${NC}"
BUCKET_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" https://storage.rausachtrangia.com/rausach-uploads/ 2>&1 || echo "000")
if [ "$BUCKET_RESPONSE" = "200" ] || [ "$BUCKET_RESPONSE" = "403" ]; then
  echo -e "${GREEN}✓ PASS${NC} - Bucket endpoint accessible (Status: $BUCKET_RESPONSE)"
  ((PASS++))
else
  echo -e "${YELLOW}⚠ WARN${NC} - Bucket status: $BUCKET_RESPONSE (may not be configured yet)"
fi
echo ""

# Test 7: Application Configuration
echo -e "${BLUE}[Test 7] Application Configuration${NC}"
if [ -f "/mnt/chikiet/kataoffical/shoprausach/.env" ]; then
  if grep -q "MINIO_ENDPOINT=storage.rausachtrangia.com" /mnt/chikiet/kataoffical/shoprausach/.env; then
    echo -e "${GREEN}✓ PASS${NC} - .env configured with domain"
    ((PASS++))
  else
    echo -e "${RED}✗ FAIL${NC} - .env still using old IP"
    ((FAIL++))
  fi
else
  echo -e "${YELLOW}⚠ SKIP${NC} - .env file not found"
fi
echo ""

# Summary
echo "=================================================="
echo "  Test Summary"
echo "=================================================="
echo -e "${GREEN}Passed: $PASS${NC}"
echo -e "${RED}Failed: $FAIL${NC}"
echo ""

if [ $FAIL -eq 0 ]; then
  echo -e "${GREEN}✨ All tests passed! Domain migration successful!${NC}"
  echo ""
  echo "Next steps:"
  echo "1. Restart services: pm2 restart all"
  echo "2. Run migration: bun run scripts/migrate-storage-domain.ts"
  echo "3. Test upload via admin panel"
  exit 0
else
  echo -e "${RED}⚠️  Some tests failed. Check configuration.${NC}"
  echo ""
  echo "Troubleshooting:"
  echo "1. Check DNS: nslookup storage.rausachtrangia.com"
  echo "2. Check web server: sudo systemctl status nginx / caddy"
  echo "3. Check logs: sudo tail -f /var/log/nginx/*.log"
  echo "4. Check MinIO: curl http://116.118.49.243:12007/minio/health/live"
  echo ""
  echo "See MINIO_DOMAIN_MIGRATION_COMPLETE.md for detailed troubleshooting."
  exit 1
fi
