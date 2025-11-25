import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { GoogleGenerativeAI } from '@google/generative-ai';

interface GenerateCourseFromPromptInput {
  prompt: string;
  categoryId?: string;
  instructorId: string;
}

interface GenerateCourseFromDocumentsInput {
  documentIds: string[];
  categoryId?: string;
  additionalPrompt?: string;
  instructorId: string;
  // User-edited fields from analysis step
  title?: string;
  description?: string;
  level?: string;
  learningObjectives?: string[];
  whatYouWillLearn?: string[];
  requirements?: string[];
  targetAudience?: string[];
  additionalContext?: string;
}

@Injectable()
export class AICourseGeneratorService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor(private prisma: PrismaService) {
    const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('⚠️  GOOGLE_GEMINI_API_KEY not set. AI course generation will not work.');
    } else {
      this.genAI = new GoogleGenerativeAI(apiKey);
      // Sử dụng model ổn định - gemini-pro cho v1beta API
      this.model = this.genAI.getGenerativeModel({ 
        model: 'gemini-flash-latest',
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 16384, // Increased from 8192 to handle larger responses
        },
      });
      console.log('✅ AI Course Generator initialized with Gemini Pro');
      console.log(`🔑 API Key: ${apiKey.substring(0, 10)}...${apiKey.substring(apiKey.length - 4)}`);
    }
  }

  /**
   * Generate course from AI prompt
   */
  async generateCourseFromPrompt(input: GenerateCourseFromPromptInput) {
    if (!this.model) {
      throw new BadRequestException('AI service is not configured. Please set GOOGLE_GEMINI_API_KEY');
    }

    const { prompt, categoryId, instructorId } = input;

    console.log('🤖 [AI Course Generator] Starting...');
    console.log(`📝 Prompt: ${prompt.substring(0, 100)}...`);
    console.log(`👤 Instructor ID: ${instructorId}`);
    console.log(`📁 Category ID: ${categoryId || 'None'}`);

    // Step 1: Generate course structure using Gemini AI
    console.log('\n⏳ Step 1/3: Calling Google Gemini AI...');
    const startAI = Date.now();
    const courseStructure = await this.generateCourseStructure(prompt);
    const aiDuration = ((Date.now() - startAI) / 1000).toFixed(2);
    console.log(`✅ AI Response received in ${aiDuration}s`);
    console.log(`📚 Generated: ${courseStructure.modules?.length || 0} modules`);

    // Step 2: Create course with modules, lessons, and quizzes
    console.log('\n⏳ Step 2/3: Creating course in database...');
    const startDB = Date.now();
    const course = await this.createCourseFromStructure(
      courseStructure,
      instructorId,
      categoryId
    );
    const dbDuration = ((Date.now() - startDB) / 1000).toFixed(2);
    console.log(`✅ Course created in ${dbDuration}s`);
    console.log(`📖 Course ID: ${course.id}`);
    console.log(`📖 Course Title: ${course.title}`);

    // Step 3: Summary
    const totalDuration = ((Date.now() - startAI) / 1000).toFixed(2);
    console.log('\n🎉 Course generation completed!');
    console.log(`⏱️  Total time: ${totalDuration}s`);
    console.log(`📊 Stats:`);
    console.log(`   - Modules: ${course.modules?.length || 0}`);
    console.log(`   - Lessons: ${course.modules?.reduce((sum, m) => sum + (m.lessons?.length || 0), 0) || 0}`);
    console.log(`   - Quizzes: ${course.modules?.reduce((sum, m) => sum + (m.lessons?.reduce((s, l) => s + (l.quizzes?.length || 0), 0) || 0), 0) || 0}`);
    console.log(`✨ Ready for editing at: /lms/admin/courses/${course.id}/edit\n`);

    return course;
  }

  /**
   * Generate course from source documents using AI analysis
   */
  async generateCourseFromDocuments(input: GenerateCourseFromDocumentsInput) {
    if (!this.model) {
      throw new BadRequestException('AI service is not configured. Please set GOOGLE_GEMINI_API_KEY');
    }

    const { 
      documentIds, 
      categoryId, 
      additionalPrompt, 
      instructorId,
      // User-edited fields from analysis step
      title,
      description,
      level,
      learningObjectives,
      whatYouWillLearn,
      requirements,
      targetAudience,
      additionalContext,
    } = input;

    // Validate input
    if (!documentIds || !Array.isArray(documentIds) || documentIds.length === 0) {
      throw new BadRequestException('documentIds is required and must be a non-empty array');
    }

    if (!instructorId) {
      throw new BadRequestException('instructorId is required');
    }

    console.log('🤖 [AI Course Generator from Documents] Starting...');
    console.log(`📚 Documents: ${documentIds.length} items`);
    console.log(`👤 Instructor ID: ${instructorId}`);
    console.log(`📁 Category ID: ${categoryId || 'None'}`);
    console.log(`✏️  User-edited fields: ${title ? 'Yes' : 'No'}`);

    // Step 1: Fetch source documents with AI data
    console.log('\n⏳ Step 1/4: Fetching source documents...');
    const documents = await this.prisma.sourceDocument.findMany({
      where: {
        id: { in: documentIds },
        status: 'PUBLISHED',
      },
      include: {
        category: true,
      },
    });

    if (documents.length === 0) {
      throw new BadRequestException('No valid documents found');
    }

    console.log(`✅ Found ${documents.length} documents`);

    // Step 2: Aggregate AI analysis from all documents
    console.log('\n⏳ Step 2/4: Aggregating AI analysis...');
    const aggregatedData = this.aggregateDocumentAnalysis(documents);
    console.log(`✅ Aggregated data from ${documents.length} documents`);
    console.log(`   - Keywords: ${aggregatedData.keywords.length}`);
    console.log(`   - Topics: ${aggregatedData.topics.length}`);

    // Step 3: Build prompt (with user edits if provided)
    const promptContext = additionalPrompt || additionalContext || '';
    const generatedPrompt = this.buildPromptFromDocuments(
      aggregatedData,
      documents,
      promptContext,
      // Include user-edited fields in prompt
      {
        title,
        description,
        level,
        learningObjectives,
        whatYouWillLearn,
        requirements,
        targetAudience,
      }
    );
    console.log(`✅ Generated prompt (${generatedPrompt.length} chars)`);

    // Step 4: Generate course using standard flow
    console.log('\n⏳ Step 3/4: Calling Gemini AI...');
    const startAI = Date.now();
    const courseStructure = await this.generateCourseStructure(generatedPrompt);
    const aiDuration = ((Date.now() - startAI) / 1000).toFixed(2);
    console.log(`✅ AI Response received in ${aiDuration}s`);

    // Step 5: Create course in database
    console.log('\n⏳ Step 4/4: Creating course in database...');
    const startDB = Date.now();
    const course = await this.createCourseFromStructure(
      courseStructure,
      instructorId,
      categoryId
    );
    const dbDuration = ((Date.now() - startDB) / 1000).toFixed(2);
    console.log(`✅ Course created in ${dbDuration}s`);

    // Step 6: Link source documents to course
    await this.prisma.courseSourceDocument.createMany({
      data: documentIds.map((docId, index) => ({
        courseId: course.id,
        documentId: docId,
        order: index,
        isRequired: false,
      })),
    });
    console.log(`✅ Linked ${documentIds.length} source documents to course`);

    const totalDuration = ((Date.now() - startAI) / 1000).toFixed(2);
    console.log('\n🎉 Course from documents completed!');
    console.log(`⏱️  Total time: ${totalDuration}s`);
    console.log(`📖 Course ID: ${course.id}`);
    console.log(`📖 Course Title: ${course.title}\n`);

    return course;
  }

  /**
   * Aggregate AI analysis data from multiple source documents
   */
  private aggregateDocumentAnalysis(documents: any[]) {
    const allKeywords: string[] = [];
    const allTopics: string[] = [];
    const summaries: string[] = [];
    const difficulties: string[] = [];

    documents.forEach((doc) => {
      if (doc.aiKeywords) {
        allKeywords.push(...doc.aiKeywords);
      }
      if (doc.aiTopics) {
        allTopics.push(...doc.aiTopics);
      }
      if (doc.aiSummary) {
        summaries.push(`${doc.title}: ${doc.aiSummary}`);
      }
      if (doc.aiDifficulty) {
        difficulties.push(doc.aiDifficulty);
      }
    });

    // Deduplicate and sort by frequency
    const keywordFreq = this.getFrequency(allKeywords);
    const topicFreq = this.getFrequency(allTopics);
    const difficultyFreq = this.getFrequency(difficulties);

    return {
      keywords: Object.keys(keywordFreq).sort((a, b) => keywordFreq[b] - keywordFreq[a]),
      topics: Object.keys(topicFreq).sort((a, b) => topicFreq[b] - topicFreq[a]),
      summaries,
      mostCommonDifficulty: Object.keys(difficultyFreq)[0] || 'BEGINNER',
    };
  }

  /**
   * Count frequency of items
   */
  private getFrequency(items: string[]): Record<string, number> {
    return items.reduce((acc, item) => {
      acc[item] = (acc[item] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }

  /**
   * Build AI prompt from aggregated document data
   */
  private buildPromptFromDocuments(
    aggregatedData: any,
    documents: any[],
    additionalPrompt?: string,
    userEdits?: {
      title?: string;
      description?: string;
      level?: string;
      learningObjectives?: string[];
      whatYouWillLearn?: string[];
      requirements?: string[];
      targetAudience?: string[];
    }
  ): string {
    const documentTitles = documents.map((d) => d.title).join(', ');
    const topKeywords = aggregatedData.keywords.slice(0, 10).join(', ');
    const topTopics = aggregatedData.topics.slice(0, 5).join(', ');

    let prompt = `Tạo khóa học dựa trên ${documents.length} tài liệu nguồn sau:\n\n`;
    prompt += `📚 Tài liệu: ${documentTitles}\n\n`;
    prompt += `🔑 Từ khóa chính: ${topKeywords}\n\n`;
    prompt += `📖 Chủ đề: ${topTopics}\n\n`;
    prompt += `📊 Độ khó đề xuất: ${aggregatedData.mostCommonDifficulty}\n\n`;

    // Add summaries
    if (aggregatedData.summaries.length > 0) {
      prompt += `📝 Tóm tắt nội dung:\n`;
      aggregatedData.summaries.forEach((summary, idx) => {
        prompt += `${idx + 1}. ${summary}\n`;
      });
      prompt += '\n';
    }

    // Add user-edited fields if provided
    if (userEdits) {
      prompt += '\n📝 THÔNG TIN ĐÃ XÁC NHẬN (sử dụng chính xác):\n';
      
      if (userEdits.title) {
        prompt += `Tiêu đề: ${userEdits.title}\n`;
      }
      if (userEdits.description) {
        prompt += `Mô tả: ${userEdits.description}\n`;
      }
      if (userEdits.level) {
        prompt += `Cấp độ: ${userEdits.level}\n`;
      }
      if (userEdits.learningObjectives && userEdits.learningObjectives.length > 0) {
        prompt += `Mục tiêu học tập:\n`;
        userEdits.learningObjectives.forEach((obj, idx) => {
          prompt += `${idx + 1}. ${obj}\n`;
        });
      }
      if (userEdits.whatYouWillLearn && userEdits.whatYouWillLearn.length > 0) {
        prompt += `Bạn sẽ học được:\n`;
        userEdits.whatYouWillLearn.forEach((item, idx) => {
          prompt += `${idx + 1}. ${item}\n`;
        });
      }
      if (userEdits.requirements && userEdits.requirements.length > 0) {
        prompt += `Yêu cầu:\n`;
        userEdits.requirements.forEach((req, idx) => {
          prompt += `${idx + 1}. ${req}\n`;
        });
      }
      if (userEdits.targetAudience && userEdits.targetAudience.length > 0) {
        prompt += `Đối tượng học viên:\n`;
        userEdits.targetAudience.forEach((aud, idx) => {
          prompt += `${idx + 1}. ${aud}\n`;
        });
      }
      prompt += '\n';
    }

    // Add additional instructions
    if (additionalPrompt) {
      prompt += `\n💡 Yêu cầu bổ sung: ${additionalPrompt}\n`;
    }

    prompt += `\nDựa trên các tài liệu nguồn${userEdits ? ' và thông tin đã xác nhận' : ''} trên, hãy tạo một khóa học toàn diện, có cấu trúc rõ ràng với modules, lessons và quizzes phù hợp.`;

    return prompt;
  }

  /**
   * Analyze documents and generate course suggestions (WITHOUT creating course)
   * Step 1 of 2-step process
   */
  async analyzeDocumentsForCourse(input: { documentIds: string[]; additionalContext?: string }) {
    if (!this.model) {
      throw new BadRequestException('AI service is not configured. Please set GOOGLE_GEMINI_API_KEY');
    }

    const { documentIds, additionalContext } = input;

    // Validate input
    if (!documentIds || !Array.isArray(documentIds) || documentIds.length === 0) {
      throw new BadRequestException('documentIds is required and must be a non-empty array');
    }

    console.log('🔍 [AI Course Analysis] Starting...');
    console.log(`📚 Documents: ${documentIds.length} items`);

    // Fetch source documents
    const documents = await this.prisma.sourceDocument.findMany({
      where: {
        id: { in: documentIds },
        status: 'PUBLISHED',
      },
      include: {
        category: true,
      },
    });

    if (documents.length === 0) {
      throw new BadRequestException('No valid published documents found');
    }

    console.log(`✅ Found ${documents.length} documents`);

    // Aggregate AI analysis
    const aggregatedData = this.aggregateDocumentAnalysis(documents);

    // Build analysis prompt for AI
    const analysisPrompt = this.buildAnalysisPrompt(aggregatedData, documents, additionalContext);

    console.log('🤖 Calling Gemini AI for analysis...');
    const startAI = Date.now();

    try {
      const result = await this.model.generateContent(analysisPrompt);
      const response = await result.response;
      let text = response.text();

      // Clean response
      text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      
      const jsonStart = text.indexOf('{');
      const jsonEnd = text.lastIndexOf('}');
      if (jsonStart !== -1 && jsonEnd !== -1) {
        text = text.substring(jsonStart, jsonEnd + 1);
      }

      const analysisResult = JSON.parse(text);
      const aiDuration = ((Date.now() - startAI) / 1000).toFixed(2);
      
      console.log(`✅ AI Analysis completed in ${aiDuration}s`);

      // Return structured analysis result
      return {
        suggestedTitle: analysisResult.suggestedTitle || '',
        suggestedDescription: analysisResult.suggestedDescription || '',
        recommendedLevel: analysisResult.recommendedLevel || 'BEGINNER',
        aggregatedKeywords: aggregatedData.keywords.slice(0, 20),
        mainTopics: aggregatedData.topics.slice(0, 10),
        learningObjectives: analysisResult.learningObjectives || [],
        whatYouWillLearn: analysisResult.whatYouWillLearn || [],
        requirements: analysisResult.requirements || [],
        targetAudience: analysisResult.targetAudience || [],
        suggestedStructure: analysisResult.suggestedStructure || {},
        estimatedDuration: analysisResult.estimatedDuration || 120,
        sourceDocumentIds: documentIds,
        analysisSummary: analysisResult.analysisSummary || '',
      };
    } catch (error) {
      console.error('❌ AI Analysis error:', error);
      throw new BadRequestException('Failed to analyze documents with AI: ' + error.message);
    }
  }

  /**
   * Build analysis prompt (lighter than full course generation)
   */
  private buildAnalysisPrompt(
    aggregatedData: any,
    documents: any[],
    additionalContext?: string
  ): string {
    const documentTitles = documents.map((d) => d.title).join(', ');
    const topKeywords = aggregatedData.keywords.slice(0, 15).join(', ');
    const topTopics = aggregatedData.topics.slice(0, 8).join(', ');

    let prompt = `Bạn là chuyên gia phân tích giáo dục. Phân tích ${documents.length} tài liệu nguồn sau và đề xuất khóa học.

📚 THÔNG TIN TÀI LIỆU:
- Tài liệu: ${documentTitles}
- Từ khóa: ${topKeywords}
- Chủ đề: ${topTopics}

`;

    // Add summaries
    if (aggregatedData.summaries.length > 0) {
      prompt += `📝 TÓM TẮT NỘI DUNG:\n`;
      aggregatedData.summaries.slice(0, 5).forEach((summary: string, idx: number) => {
        prompt += `${idx + 1}. ${summary}\n`;
      });
      prompt += '\n';
    }

    if (additionalContext) {
      prompt += `💡 YÊU CẦU BỔ SUNG: ${additionalContext}\n\n`;
    }

    prompt += `YÊU CẦU PHÂN TÍCH (trả về JSON):
{
  "suggestedTitle": "Tên khóa học gợi ý (60-100 ký tự)",
  "suggestedDescription": "Mô tả khóa học (200-300 ký tự)",
  "recommendedLevel": "BEGINNER|INTERMEDIATE|ADVANCED",
  "learningObjectives": ["Mục tiêu 1", "Mục tiêu 2", "Mục tiêu 3"],
  "whatYouWillLearn": ["Kỹ năng 1", "Kỹ năng 2", "Kỹ năng 3", "Kỹ năng 4"],
  "requirements": ["Yêu cầu 1", "Yêu cầu 2"],
  "targetAudience": ["Đối tượng 1", "Đối tượng 2"],
  "suggestedStructure": {
    "moduleCount": 3-5,
    "modules": [
      {
        "title": "Tên module",
        "description": "Mô tả ngắn",
        "topics": ["Topic 1", "Topic 2"]
      }
    ]
  },
  "estimatedDuration": 120-240,
  "analysisSummary": "Tóm tắt phân tích (100-200 ký tự)"
}

CHỈ TRẢ VỀ JSON, KHÔNG GIẢI THÍCH THÊM.`;

    return prompt;
  }


  /**
   * Attempt to repair incomplete JSON from AI response
   */
  private repairIncompleteJSON(text: string): string {
    console.log('   🔧 Attempting to repair incomplete JSON...');
    
    // Count opening and closing brackets
    const openBraces = (text.match(/{/g) || []).length;
    const closeBraces = (text.match(/}/g) || []).length;
    const openBrackets = (text.match(/\[/g) || []).length;
    const closeBrackets = (text.match(/\]/g) || []).length;
    
    console.log(`   📊 Brackets: { ${openBraces} vs } ${closeBraces}, [ ${openBrackets} vs ] ${closeBrackets}`);
    
    // If incomplete, try to complete it
    let repaired = text;
    
    // Close incomplete arrays
    const missingCloseBrackets = openBrackets - closeBrackets;
    if (missingCloseBrackets > 0) {
      console.log(`   ✂️  Adding ${missingCloseBrackets} missing ]`);
      repaired += ']'.repeat(missingCloseBrackets);
    }
    
    // Close incomplete objects
    const missingCloseBraces = openBraces - closeBraces;
    if (missingCloseBraces > 0) {
      console.log(`   ✂️  Adding ${missingCloseBraces} missing }`);
      repaired += '}'.repeat(missingCloseBraces);
    }
    
    // Remove trailing commas before closing brackets/braces
    repaired = repaired.replace(/,(\s*[}\]])/g, '$1');
    
    return repaired;
  }

  /**
   * Generate course structure using Gemini AI - OPTIMIZED
   */
  private async generateCourseStructure(prompt: string): Promise<any> {
    // SIMPLIFIED PROMPT - Ngắn gọn hơn để AI response nhanh hơn
    const systemPrompt = `Bạn là chuyên gia thiết kế khóa học. Tạo cấu trúc khóa học NGẮN GỌN bằng tiếng Việt.

YÊU CẦU QUAN TRỌNG:
- CHÍNH XÁC 3 modules (không được nhiều hơn)
- Mỗi module: CHÍNH XÁC 3 lessons (không được nhiều hơn)
- Mỗi module: 1 quiz với CHÍNH XÁC 4 câu (không được nhiều hơn)
- Nội dung lesson: 200-400 ký tự (NGẮN GỌN)
- 4 đáp án/câu hỏi
- Mô tả course: tối đa 300 ký tự

JSON format:
{
  "title": "Tên khóa học",
  "description": "Mô tả (300-500 ký tự)",
  "level": "BEGINNER",
  "duration": 120,
  "price": 0,
  "whatYouWillLearn": ["Kỹ năng 1", "Kỹ năng 2"],
  "requirements": ["Yêu cầu 1"],
  "targetAudience": ["Đối tượng 1"],
  "tags": ["tag1", "tag2"],
  "metaTitle": "SEO (max 60)",
  "metaDescription": "SEO (max 160)",
  "modules": [
    {
      "title": "Module 1",
      "description": "Mô tả ngắn",
      "order": 0,
      "lessons": [
        {
          "title": "Bài 1",
          "description": "Mô tả",
          "type": "TEXT",
          "content": "# Tiêu đề\n\nNội dung ngắn gọn 300-500 ký tự...",
          "duration": 15,
          "order": 0,
          "isPreview": false,
          "isFree": false
        }
      ],
      "quiz": {
        "title": "Quiz module 1",
        "description": "Kiểm tra",
        "passingScore": 70,
        "timeLimit": 10,
        "maxAttempts": 3,
        "isRequired": true,
        "questions": [
          {
            "type": "MULTIPLE_CHOICE",
            "question": "Câu hỏi ngắn?",
            "points": 20,
            "order": 0,
            "explanation": "Giải thích ngắn",
            "answers": [
              {"text": "A", "isCorrect": false, "order": 0},
              {"text": "B", "isCorrect": true, "order": 1},
              {"text": "C", "isCorrect": false, "order": 2},
              {"text": "D", "isCorrect": false, "order": 3}
            ]
          }
        ]
      }
    }
  ]
}

LƯU Ý QUAN TRỌNG: 
- NGẮN GỌN để tránh response bị cắt
- Quiz: 4 câu x 25 điểm = 100 điểm
- Chỉ trả JSON, KHÔNG giải thích thêm
- QUAN TRỌNG: Nội dung trong "content" và "description" phải NGẮN (200-400 ký tự)
- Nội dung KHÔNG được chứa xuống dòng thật (newline), chỉ dùng \\n
- Tất cả dấu ngoặc kép trong string phải escape thành \\"
- PHẢI TRẢ VỀ JSON HOÀN CHỈNH với đầy đủ dấu đóng ]} ở cuối`;

    const fullPrompt = `${systemPrompt}\n\nMÔ TẢ KHÓA HỌC:\n${prompt}\n\nTrả về COMPLETE VALID JSON (3 modules, 3 lessons each, 4 questions each):`;

    try {
      console.log('   🔄 Sending request to Gemini API...');
      console.log(`   📊 Prompt length: ${fullPrompt.length} characters`);
      
      // Thêm timeout protection (90 seconds)
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('AI request timeout after 90 seconds')), 90000);
      });

      const generatePromise = this.model.generateContent(fullPrompt);

      const result = await Promise.race([generatePromise, timeoutPromise]) as any;
      
      console.log('   📥 Received response from Gemini');
      const response = await result.response;
      let text = response.text();

      console.log(`   📏 Response length: ${text.length} characters`);

      // Clean response - remove markdown code blocks if present
      text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

      // Robust JSON cleaning for AI responses with Vietnamese content
      // Handle common AI response issues:
      // 1. Remove any leading/trailing whitespace
      text = text.trim();
      
      // 2. Find actual JSON start/end (in case AI adds text before/after)
      const jsonStart = text.indexOf('{');
      const jsonEnd = text.lastIndexOf('}');
      if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
        text = text.substring(jsonStart, jsonEnd + 1);
      }

      console.log('   🔍 Parsing JSON response...');
      console.log(`   📏 Cleaned JSON length: ${text.length} characters`);
      
      let courseData;
      try {
        courseData = JSON.parse(text);
      } catch (parseError) {
        console.error('   ❌ Initial JSON parse failed, attempting advanced cleaning...');
        
        // Advanced cleaning for malformed JSON
        // 1. Remove control characters except newlines in string values
        let cleaned = text.replace(/[\x00-\x09\x0B-\x1F\x7F]/g, '');
        
        // 2. Replace problematic unicode characters
        cleaned = cleaned.replace(/[\u2018\u2019]/g, "'").replace(/[\u201C\u201D]/g, '"');
        
        try {
          courseData = JSON.parse(cleaned);
          console.log('   ✅ JSON parsed successfully after advanced cleaning');
        } catch (secondError) {
          console.error('   ❌ Advanced cleaning also failed, attempting JSON repair...');
          
          // Last resort: Repair incomplete JSON (missing closing brackets/braces)
          try {
            let repaired = this.repairIncompleteJSON(cleaned);
            courseData = JSON.parse(repaired);
            console.log('   ✅ JSON parsed successfully after repair');
          } catch (thirdError) {
            console.error('   ❌ JSON repair also failed');
            console.error('   📄 First 500 chars of problematic JSON:', text.substring(0, 500));
            console.error('   📄 Last 500 chars:', text.substring(Math.max(0, text.length - 500)));
            console.error('   ⚠️ Parse error position:', parseError.message);
            
            throw new Error(`Failed to parse AI response as JSON: ${parseError.message}. Response length: ${text.length} chars. This may be due to incomplete AI response or special characters. Please try a simpler prompt.`);
          }
        }
      }
      
      console.log('   ✅ JSON parsed successfully');
      console.log(`   📚 Title: ${courseData.title}`);
      console.log(`   📦 Modules: ${courseData.modules?.length || 0}`);
      
      return courseData;
    } catch (error) {
      console.error('❌ AI Generation Error:', error.message);
      console.error('   Error name:', error.name);
      console.error('   Error stack:', error.stack?.substring(0, 200));
      
      // Specific error messages
      if (error.message?.includes('timeout')) {
        throw new BadRequestException('AI request timeout. Prompt có thể quá dài hoặc phức tạp. Hãy thử prompt ngắn gọn hơn.');
      }
      if (error.message?.includes('API key')) {
        throw new BadRequestException('Invalid API key. Vui lòng kiểm tra GOOGLE_GEMINI_API_KEY.');
      }
      if (error.message?.includes('quota')) {
        throw new BadRequestException('API quota exceeded. Vui lòng đợi hoặc upgrade plan.');
      }
      
      throw new BadRequestException('Failed to generate course: ' + error.message);
    }
  }

  /**
   * Create course in database from AI-generated structure
   */
  private async createCourseFromStructure(
    structure: any,
    instructorId: string,
    categoryId?: string
  ) {
    const {
      title,
      description,
      level,
      duration,
      price,
      whatYouWillLearn,
      requirements,
      targetAudience,
      tags,
      metaTitle,
      metaDescription,
      modules,
    } = structure;

    console.log('   🔄 Generating unique slug...');
    // Generate slug
    const baseSlug = this.generateSlug(title);
    let slug = baseSlug;
    let counter = 1;

    while (await this.prisma.course.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }
    console.log(`   ✅ Slug: ${slug}`);

    console.log('   🔄 Creating course with modules and lessons...');
    // Create course with modules, lessons, and quizzes
    const course = await this.prisma.course.create({
      data: {
        title,
        slug,
        description,
        level: level || 'BEGINNER',
        duration: duration || 0,
        price: price || 0,
        status: 'DRAFT',
        whatYouWillLearn: whatYouWillLearn || [],
        requirements: requirements || [],
        targetAudience: targetAudience || [],
        tags: tags || [],
        metaTitle: metaTitle || title,
        metaDescription: metaDescription || description?.substring(0, 160),
        instructorId,
        categoryId: categoryId || null,
        modules: {
          create: modules.map((module: any) => ({
            title: module.title,
            description: module.description,
            order: module.order,
            isPublished: true,
            lessons: {
              create: module.lessons.map((lesson: any) => ({
                title: lesson.title,
                description: lesson.description,
                type: lesson.type || 'TEXT',
                content: lesson.content,
                duration: lesson.duration || 15,
                order: lesson.order,
                isPreview: lesson.isPreview || false,
                isFree: lesson.isFree || false,
              })),
            },
          })),
        },
      },
      include: {
        instructor: true,
        category: true,
        modules: {
          include: {
            lessons: true,
          },
        },
      },
    });
    console.log(`   ✅ Course created with ${course.modules.length} modules`);

    // Create quizzes for each module
    console.log('   🔄 Creating quizzes for modules...');
    let quizCount = 0;
    let skippedModules = [];
    
    for (let i = 0; i < modules.length; i++) {
      const moduleData = modules[i];
      const createdModule = course.modules[i];

      // Validate quiz data
      if (!moduleData.quiz) {
        console.warn(`   ⚠️  Module ${i + 1} "${moduleData.title}" has no quiz data`);
        skippedModules.push(`${moduleData.title} (no quiz data)`);
        continue;
      }

      if (createdModule.lessons.length === 0) {
        console.warn(`   ⚠️  Module ${i + 1} "${moduleData.title}" has no lessons, skipping quiz`);
        skippedModules.push(`${moduleData.title} (no lessons)`);
        continue;
      }

      if (!moduleData.quiz.questions || moduleData.quiz.questions.length === 0) {
        console.warn(`   ⚠️  Module ${i + 1} "${moduleData.title}" has no questions in quiz`);
        skippedModules.push(`${moduleData.title} (no questions)`);
        continue;
      }

      // Validate each question has answers
      const validQuestions = moduleData.quiz.questions.filter((q: any) => 
        q.answers && q.answers.length >= 2
      );

      if (validQuestions.length === 0) {
        console.warn(`   ⚠️  Module ${i + 1} "${moduleData.title}" has no valid questions (need at least 2 answers each)`);
        skippedModules.push(`${moduleData.title} (invalid questions)`);
        continue;
      }

      try {
        // Get last lesson of module to attach quiz
        const lastLesson = createdModule.lessons[createdModule.lessons.length - 1];

        const createdQuiz = await this.prisma.quiz.create({
          data: {
            title: moduleData.quiz.title || `Quiz: ${moduleData.title}`,
            description: moduleData.quiz.description || 'Kiểm tra kiến thức',
            lessonId: lastLesson.id,
            passingScore: moduleData.quiz.passingScore || 70,
            timeLimit: moduleData.quiz.timeLimit || 20,
            maxAttempts: moduleData.quiz.maxAttempts || 3,
            isRequired: moduleData.quiz.isRequired !== false,
            questions: {
              create: validQuestions.map((question: any, qIdx: number) => ({
                type: question.type || 'MULTIPLE_CHOICE',
                question: question.question,
                points: question.points || 25,
                order: question.order !== undefined ? question.order : qIdx,
                explanation: question.explanation,
                answers: {
                  create: question.answers.map((answer: any, aIdx: number) => ({
                    text: answer.text,
                    isCorrect: answer.isCorrect || false,
                    order: answer.order !== undefined ? answer.order : aIdx,
                  })),
                },
              })),
            },
          },
          include: {
            questions: {
              include: { answers: true }
            }
          }
        });
        
        quizCount++;
        const questionCount = createdQuiz.questions.length;
        const totalAnswers = createdQuiz.questions.reduce((sum, q) => sum + q.answers.length, 0);
        console.log(`   ✓ Quiz ${quizCount}/${modules.length} created for module: ${moduleData.title}`);
        console.log(`      📝 ${questionCount} questions, ${totalAnswers} answers total`);
      } catch (error) {
        console.error(`   ❌ Failed to create quiz for module ${i + 1} "${moduleData.title}":`, error.message);
        skippedModules.push(`${moduleData.title} (creation error)`);
      }
    }
    
    console.log(`   ✅ Created ${quizCount}/${modules.length} quizzes`);
    if (skippedModules.length > 0) {
      console.warn(`   ⚠️  Skipped ${skippedModules.length} modules: ${skippedModules.join(', ')}`);
    }

    console.log('   🔄 Fetching complete course data...');
    // Fetch complete course with quizzes
    return this.prisma.course.findUnique({
      where: { id: course.id },
      include: {
        instructor: true,
        category: true,
        modules: {
          orderBy: { order: 'asc' },
          include: {
            lessons: {
              orderBy: { order: 'asc' },
              include: {
                quizzes: {
                  include: {
                    questions: {
                      include: {
                        answers: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });
  }

  /**
   * Get sample prompts for soft skills courses
   */
  getSamplePrompts(): string[] {
    return [
      'Tạo khóa học "Kỹ năng giao tiếp hiệu quả" cho người mới bắt đầu, bao gồm giao tiếp cá nhân, giao tiếp nhóm, thuyết trình, và xử lý xung đột.',
      'Khóa học "Quản lý thời gian và năng suất" dành cho dân văn phòng, bao gồm lập kế hoạch, ưu tiên công việc, time blocking, và loại bỏ phân tâm.',
      'Tạo khóa học "Tư duy phản biện và giải quyết vấn đề" cho học sinh - sinh viên, bao gồm phân tích logic, ra quyết định, sáng tạo giải pháp.',
      'Khóa học "Lãnh đạo và làm việc nhóm" cho quản lý, bao gồm leadership, động viên đội nhóm, quản lý xung đột, và coaching.',
    ];
  }

  /**
   * Get detailed prompt templates for soft skills
   */
  getPromptTemplates() {
    return [
      {
        title: 'Kỹ năng giao tiếp hiệu quả',
        category: 'Kỹ năng mềm',
        prompt: `Tạo khóa học "Kỹ năng giao tiếp hiệu quả" cho người mới bắt đầu.

Nội dung chính:
- Module 1: Cơ bản về giao tiếp (ngôn ngữ cơ thể, giọng nói, lắng nghe)
- Module 2: Giao tiếp 1-1 (trò chuyện, đàm phán, phản hồi)
- Module 3: Giao tiếp nhóm (họp nhóm, thảo luận, brainstorming)
- Module 4: Thuyết trình (chuẩn bị, slides, speaking, Q&A)
- Module 5: Giao tiếp qua email và chat (writing, tone, etiquette)
- Module 6: Xử lý xung đột và phản đối

Mỗi module có bài tập thực hành và quiz đánh giá.`,
        tags: ['giao tiếp', 'soft skills', 'presentation', 'kỹ năng mềm'],
      },
      {
        title: 'Quản lý thời gian và năng suất',
        category: 'Kỹ năng mềm',
        prompt: `Tạo khóa học "Quản lý thời gian và năng suất" dành cho dân văn phòng.

Nội dung chính:
- Module 1: Nhận thức về thời gian (audit thời gian, time wasters)
- Module 2: Lập kế hoạch hiệu quả (weekly planning, daily planning, review)
- Module 3: Ưu tiên công việc (Eisenhower Matrix, ABC method, MIT)
- Module 4: Time blocking và Deep Work
- Module 5: Loại bỏ phân tâm và procrastination
- Module 6: Công cụ và hệ thống năng suất (GTD, Pomodoro, tools)

Bao gồm templates, checklists, và exercises thực hành.`,
        tags: ['time management', 'productivity', 'planning', 'năng suất'],
      },
      {
        title: 'Tư duy phản biện và giải quyết vấn đề',
        category: 'Kỹ năng mềm',
        prompt: `Tạo khóa học "Tư duy phản biện và giải quyết vấn đề" cho học sinh - sinh viên.

Nội dung chính:
- Module 1: Tư duy logic (reasoning, fallacies, assumptions)
- Module 2: Phân tích vấn đề (root cause, 5 whys, fishbone)
- Module 3: Sáng tạo giải pháp (brainstorming, SCAMPER, lateral thinking)
- Module 4: Ra quyết định (pros-cons, decision matrix, risk assessment)
- Module 5: Tư duy phản biện (evaluate arguments, bias detection)
- Module 6: Áp dụng thực tế (case studies, projects)

Mỗi module có case studies và quiz tình huống.`,
        tags: ['critical thinking', 'problem solving', 'logic', 'tư duy'],
      },
      {
        title: 'Lãnh đạo và làm việc nhóm',
        category: 'Kỹ năng mềm',
        prompt: `Tạo khóa học "Lãnh đạo và làm việc nhóm" cho quản lý và team leader.

Nội dung chính:
- Module 1: Cơ bản về leadership (styles, traits, vs management)
- Module 2: Xây dựng đội nhóm (team building, trust, culture)
- Module 3: Giao việc và ủy quyền (delegation, empowerment)
- Module 4: Động viên và phát triển nhân viên (motivation, feedback, coaching)
- Module 5: Quản lý xung đột trong nhóm (conflict resolution, mediation)
- Module 6: Dẫn dắt thay đổi (change management, resilience)

Bao gồm role-play scenarios, self-assessment, và action plans.`,
        tags: ['leadership', 'teamwork', 'management', 'lãnh đạo'],
      },
    ];
  }

  /**
   * Generate slug from title
   */
  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'd')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
}
