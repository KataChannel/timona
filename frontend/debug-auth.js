// Debug script to test authentication flow
// Paste this into browser console when experiencing token removal issues

console.log('=== AUTH DEBUG SCRIPT ===');

// Check current token
const token = localStorage.getItem('accessToken');
console.log('Current token:', token ? `${token.substring(0, 20)}...` : 'No token');

// Test getMe query directly
if (token) {
  console.log('Testing getMe query...');
  
  fetch('http://localhost:14000/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      query: `
        query GetCurrentUser {
          getMe {
            id
            email
            username
            roleType
          }
        }
      `
    })
  })
  .then(response => {
    console.log('Response status:', response.status);
    return response.json();
  })
  .then(data => {
    console.log('getMe response:', data);
    if (data.errors) {
      console.error('GraphQL errors:', data.errors);
      data.errors.forEach(error => {
        console.log('Error details:', {
          message: error.message,
          extensions: error.extensions,
          path: error.path
        });
      });
    } else {
      console.log('✅ getMe successful:', data.data.getMe);
    }
  })
  .catch(error => {
    console.error('❌ Network error:', error);
  });

  // Test user search query
  console.log('Testing searchUsers query...');
  
  fetch('http://localhost:14000/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      query: `
        query SearchUsers($input: UserSearchInput!) {
          searchUsers(input: $input) {
            users {
              id
              email
              username
            }
            total
          }
        }
      `,
      variables: {
        input: {
          page: 0,
          size: 10
        }
      }
    })
  })
  .then(response => {
    console.log('SearchUsers response status:', response.status);
    return response.json();
  })
  .then(data => {
    console.log('searchUsers response:', data);
    if (data.errors) {
      console.error('SearchUsers GraphQL errors:', data.errors);
    } else {
      console.log('✅ searchUsers successful, found users:', data.data.searchUsers.total);
    }
  })
  .catch(error => {
    console.error('❌ SearchUsers network error:', error);
  });
} else {
  console.log('❌ No token found - user needs to login');
}

// Monitor localStorage changes
const originalSetItem = localStorage.setItem;
localStorage.setItem = function(key, value) {
  if (key === 'token') {
    console.log('🔐 Token being set:', value ? `${value.substring(0, 20)}...` : 'null');
  }
  originalSetItem.apply(this, arguments);
};

const originalRemoveItem = localStorage.removeItem;
localStorage.removeItem = function(key) {
  if (key === 'token') {
    console.warn('⚠️ Token being removed!');
    console.trace('Token removal stack trace:');
  }
  originalRemoveItem.apply(this, arguments);
};

console.log('✅ Auth debugging enabled. Token changes will be logged.');