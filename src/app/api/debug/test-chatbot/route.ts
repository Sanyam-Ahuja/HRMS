import { NextRequest, NextResponse } from 'next/server';
import { chatbotSchema } from '@/lib/validations';

export async function POST(request: NextRequest) {
  try {
    console.log('=== Testing Chatbot API ===');
    
    const body = await request.json();
    console.log('Request body received:', body);
    
    // Test different message structures
    const testCases = [
      { message: 'Hello' },
      { message: 'Hello', context: {} },
      { message: 'Hello', context: { role: 'admin' } },
      { message: 'Hello', context: { userId: '123', role: 'employee' } },
      body, // The actual request
    ];

    const results = [];

    for (let i = 0; i < testCases.length; i++) {
      const testCase = testCases[i];
      console.log(`\nTesting case ${i + 1}:`, testCase);
      
      try {
        const validatedData = chatbotSchema.parse(testCase);
        console.log(`Case ${i + 1} PASSED:`, validatedData);
        results.push({
          case: i + 1,
          data: testCase,
          status: 'PASSED',
          result: validatedData,
        });
      } catch (error: any) {
        console.log(`Case ${i + 1} FAILED:`, error.errors || error.message);
        results.push({
          case: i + 1,
          data: testCase,
          status: 'FAILED',
          error: error.errors || error.message,
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Chatbot validation test completed',
      results: results,
      schema: {
        message: 'string (required)',
        context: {
          userId: 'string (optional)',
          role: 'admin | employee (optional)',
        },
      },
    });

  } catch (error: any) {
    console.error('Test chatbot error:', error);
    
    return NextResponse.json(
      { 
        error: 'Test failed', 
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
