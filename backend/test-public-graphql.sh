#!/bin/bash

# Test public GraphQL query

GRAPHQL_ENDPOINT="${GRAPHQL_ENDPOINT:-http://localhost:12001/graphql}"
SLUG="trang-chu"

echo "🔍 Testing getPageBySlug (public query)"
echo "Endpoint: $GRAPHQL_ENDPOINT"
echo "Slug: $SLUG"
echo ""

echo "=== Block types and order ==="
curl -s -X POST "$GRAPHQL_ENDPOINT" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "query GetPageBySlug($slug: String!) { getPageBySlug(slug: $slug) { id title slug blocks { id type order isVisible parentId } } }",
    "variables": {
      "slug": "'"$SLUG"'"
    }
  }' | jq '.data.getPageBySlug.blocks | sort_by(.order) | .[] | "\(.order): \(.type) (id: \(.id[:8])..., visible: \(.isVisible))"'

echo ""
echo "=== BLOG_CAROUSEL blocks ==="
curl -s -X POST "$GRAPHQL_ENDPOINT" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "query GetPageBySlug($slug: String!) { getPageBySlug(slug: $slug) { blocks { id type order } } }",
    "variables": {
      "slug": "'"$SLUG"'"
    }
  }' | jq '.data.getPageBySlug.blocks[] | select(.type == "BLOG_CAROUSEL")'

echo ""
echo "✅ Done"
