import { ApolloClient, InMemoryCache, gql, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

// Test file để debug GraphQL queries

const httpLink = createHttpLink({
  uri: 'http://localhost:14000/graphql',
});

const authLink = setContext((_, { headers }) => {
  // Get the authentication token from local storage if it exists
  const token = localStorage.getItem('accessToken');
  // Return the headers to the context so httpLink can read them
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    }
  }
});

const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache()
});

// Test Register/Login
const REGISTER_MUTATION = gql`
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
      access_token
      refresh_token
      user {
        id
        username
        email
      }
    }
  }
`;

const LOGIN_MUTATION = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      access_token
      refresh_token
      user {
        id
        username
        email
      }
    }
  }
`;

// Test Task Query
const GET_TASKS_QUERY = gql`
  query GetTasks($filters: TaskFilterInput) {
    getTasks(filters: $filters) {
      id
      title
      description
      category
      priority
      status
      dueDate
      createdAt
      updatedAt
      userId
      author {
        id
        username
        firstName
        lastName
        avatar
      }
    }
  }
`;

// Test functions
async function testRegister() {
  try {
    const result = await client.mutate({
      mutation: REGISTER_MUTATION,
      variables: {
        input: {
          username: 'testuser' + Date.now(),
          email: 'test' + Date.now() + '@example.com',
          password: 'password123',
          firstName: 'Test',
          lastName: 'User'
        }
      }
    });
    
    console.log('Register success:', result.data);
    localStorage.setItem('accessToken', result.data.register.access_token);
    return result.data;
  } catch (error) {
    console.error('Register error:', error);
    throw error;
  }
}

async function testLogin() {
  try {
    const result = await client.mutate({
      mutation: LOGIN_MUTATION,
      variables: {
        input: {
          username: 'admin',
          password: 'admin123'
        }
      }
    });
    
    console.log('Login success:', result.data);
    localStorage.setItem('accessToken', result.data.login.access_token);
    return result.data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
}

async function testGetTasks() {
  try {
    const result = await client.query({
      query: GET_TASKS_QUERY,
      fetchPolicy: 'network-only'
    });
    
    console.log('Get tasks success:', result.data);
    return result.data;
  } catch (error) {
    console.error('Get tasks error:', error);
    throw error;
  }
}

// Run tests
async function runTests() {
  console.log('Starting GraphQL API tests...');
  
  try {
    // Test login first
    console.log('\n1. Testing login...');
    await testLogin();
    
    // Test get tasks
    console.log('\n2. Testing get tasks...');
    await testGetTasks();
    
    console.log('\n✅ All tests passed!');
  } catch (error: any) {
    console.error('\n❌ Test failed:', error);
    
    // If login failed, try register
    if (error.message && error.message.includes('Invalid credentials')) {
      try {
        console.log('\n3. Login failed, trying register...');
        await testRegister();
        await testGetTasks();
        console.log('\n✅ Tests passed after register!');
      } catch (regError) {
        console.error('\n❌ Register also failed:', regError);
      }
    }
  }
}

// Export for browser console
(window as any).runTests = runTests;
(window as any).testGetTasks = testGetTasks;
(window as any).testLogin = testLogin;
(window as any).testRegister = testRegister;

console.log('GraphQL test functions loaded. Call runTests() to start testing.');
