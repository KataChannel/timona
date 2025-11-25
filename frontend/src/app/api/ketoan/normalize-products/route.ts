import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { dryRun = false, limit = 10 } = await req.json();

    // Call backend API to run normalization
    let graphqlEndpoint = process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT || 'http://localhost:14000/graphql';
    const backendUrl = graphqlEndpoint.replace('/graphql', '') || 'http://localhost:4000';
    
    const response = await fetch(`${backendUrl}/api/ketoan/normalize-products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ dryRun, limit }),
    });

    const result = await response.json();

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in normalize API:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Lỗi khi thực hiện chuẩn hóa',
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
