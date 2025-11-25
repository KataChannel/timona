#!/bin/bash

# Test GraphQL query to fetch page with blocks

GRAPHQL_ENDPOINT="${GRAPHQL_ENDPOINT:-http://localhost:12001/graphql}"
PAGE_ID="d3796ed7-9237-4120-b299-51503db04fa6"

echo "🔍 Testing GraphQL query: getPageById"
echo "Endpoint: $GRAPHQL_ENDPOINT"
echo "Page ID: $PAGE_ID"
echo ""

echo "=== Full Response ==="
curl -s -X POST "$GRAPHQL_ENDPOINT" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "query GetPageById($id: ID!) { getPageById(id: $id) { id title slug blocks { id type order content isVisible parentId depth } } }",
    "variables": {
      "id": "'"$PAGE_ID"'"
    }
  }' | jq '.'

echo ""
echo "=== BLOG_CAROUSEL blocks only ==="
curl -s -X POST "$GRAPHQL_ENDPOINT" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "query GetPageById($id: ID!) { getPageById(id: $id) { id title slug blocks { id type order content isVisible parentId depth } } }",
    "variables": {
      "id": "'"$PAGE_ID"'"
    }
  }' | jq '.data.getPageById.blocks[] | select(.type == "BLOG_CAROUSEL")'

echo ""
echo "✅ Done"
