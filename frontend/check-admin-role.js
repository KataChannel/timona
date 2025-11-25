// Script to check current user role and update if needed
// Paste this into browser console after logging in

console.log('🔍 Checking current user role...');

// Get current user info
const token = localStorage.getItem('token');
if (!token) {
  console.error('❌ No token found - please login first');
} else {
  console.log('✅ Token found, checking user info...');
  
  // Test getMe query with roleType field
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
            createdAt
          }
        }
      `
    })
  })
  .then(response => response.json())
  .then(data => {
    if (data.errors) {
      console.error('❌ GraphQL errors:', data.errors);
    } else {
      const user = data.data.getMe;
      console.log('👤 Current user info:', user);
      console.log(`📋 Role: ${user.roleType}`);
      
      if (user.roleType !== 'ADMIN') {
        console.warn(`⚠️ User role is "${user.roleType}", not "ADMIN"`);
        console.log('💡 To fix this, run the backend script: npx ts-node check-user-role.ts');
        console.log('💡 Or ask an admin to update your role');
      } else {
        console.log('✅ User has ADMIN role - should be able to access admin features');
        
        // Test admin queries
        console.log('🧪 Testing admin queries...');
        
        // Test searchUsers
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
                    roleType
                  }
                  total
                }
              }
            `,
            variables: {
              input: {
                page: 0,
                size: 5
              }
            }
          })
        })
        .then(response => response.json())
        .then(searchData => {
          if (searchData.errors) {
            console.error('❌ SearchUsers failed:', searchData.errors);
          } else {
            console.log('✅ SearchUsers successful:', searchData.data.searchUsers);
          }
        });

        // Test getUserStats
        fetch('http://localhost:14000/graphql', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            query: `
              query GetUserStats {
                getUserStats {
                  totalUsers
                  activeUsers
                  adminUsers
                  regularUsers
                }
              }
            `
          })
        })
        .then(response => response.json())
        .then(statsData => {
          if (statsData.errors) {
            console.error('❌ GetUserStats failed:', statsData.errors);
          } else {
            console.log('✅ GetUserStats successful:', statsData.data.getUserStats);
          }
        });
      }
    }
  })
  .catch(error => {
    console.error('❌ Network error:', error);
  });
}