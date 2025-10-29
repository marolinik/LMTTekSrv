import { GoogleGenAI, Chat, GenerateContentResponse, Type, Modality } from '@google/genai';
import { ServerSpec, Source, ChatMessage } from '@/types/ai.types';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!API_KEY || API_KEY === 'YOUR_GEMINI_API_KEY_HERE') {
  console.warn('Gemini API key not configured. AI features will not work.');
}

const ai = API_KEY && API_KEY !== 'YOUR_GEMINI_API_KEY_HERE' ? new GoogleGenAI({ apiKey: API_KEY }) : null;

export const generateTechnicalDescription = async (
  specs: ServerSpec[],
  onChunk: (textChunk: string) => void
): Promise<void> => {
  if (!ai) throw new Error('Gemini API key not configured');

  const prompt = `
You are a technical writer specializing in high-performance computing and AI infrastructure.
Your task is to write a comprehensive, well-formatted technical description of the LM TEK RM-4U8G server configuration based on the specifications provided.

**Configuration Details:**
${specs.map((cat) => `\n## ${cat.category}\n${cat.items.map((item) => `- ${item.feature}: ${Array.isArray(item.value) ? item.value.join(', ') : item.value}`).join('\n')}`).join('')}

**Instructions:**
1. Write a detailed, flowing narrative that explains the technical capabilities of this server configuration
2. Cover all major components: GPUs, CPU, RAM, Storage, Cooling, Power, Network, and Motherboard
3. Explain not just WHAT the components are, but WHY they matter and what use cases they enable
4. Discuss the overall capabilities and potential applications for this configuration (AI training, machine learning, rendering, scientific computing, etc.)
5. Use proper technical terminology but keep it accessible
6. Format the output in well-structured Markdown with appropriate headings and paragraphs
7. Make it engaging and informative - this should help a technical decision-maker understand the full potential of this configuration
8. Include sections like "Processing Power", "Memory Architecture", "Storage Infrastructure", "Cooling & Reliability", "Use Cases", etc.

The output should be professionally formatted and approximately 500-800 words.
  `;

  try {
    const responseStream = await ai.models.generateContentStream({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    for await (const chunk of responseStream) {
      const chunkText = chunk.text;
      if (chunkText) {
        onChunk(chunkText);
      }
    }
  } catch (error) {
    console.error('Error generating technical description:', error);
    throw new Error('Failed to generate technical description. Please check the console for details.');
  }
};

export const generatePitch = async (
  specs: ServerSpec[],
  onChunk: (textChunk: string) => void
): Promise<void> => {
  if (!ai) throw new Error('Gemini API key not configured');

  const prompt = `
You are a world-class enterprise sales executive specializing in high-performance computing and AI infrastructure.
Your task is to generate a compelling, concise, and persuasive sales pitch for the LM TEK RM-4U8G server based on the following technical specifications.

**Target Audience:** CTOs, AI/ML engineering leads, and IT decision-makers at mid-to-large enterprises.
**Key Selling Points to Emphasize:**
- **Unmatched Performance:** Highlight the GPU capacity and support for the latest NVIDIA Blackwell and RTX series.
- **Scalability & Future-Proofing:** Mention the support for AMD EPYC 9004/9005 series CPUs and up to 2TB of DDR5 RAM.
- **In-House AI Powerhouse:** Frame it as the perfect solution for companies wanting to bring AI development, training, and fine-tuning in-house, reducing reliance on expensive cloud services.
- **Reliability & Cooling:** Touch upon the robust EK liquid cooling system and redundant power supply, ensuring maximum uptime for mission-critical AI workloads.

**Server Specifications:**
${specs.map((cat) => `\n## ${cat.category}\n${cat.items.map((item) => `- ${item.feature}: ${Array.isArray(item.value) ? item.value.join(', ') : item.value}`).join('\n')}`).join('')}

**Instructions:**
1. Start with a powerful opening that grabs the attention of a technical leader.
2. Structure the pitch into clear sections (e.g., Performance, Scalability, ROI).
3. Use strong, benefit-oriented language. Instead of just listing specs, explain what they enable (e.g., "process massive datasets in minutes, not hours").
4. End with a clear call to action.
5. The output should be in Markdown format.
  `;

  try {
    const responseStream = await ai.models.generateContentStream({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    for await (const chunk of responseStream) {
      const chunkText = chunk.text;
      if (chunkText) {
        onChunk(chunkText);
      }
    }
  } catch (error) {
    console.error('Error generating pitch:', error);
    throw new Error('Failed to generate sales pitch. Please check the console for details.');
  }
};

export const discoverCompetitors = async (): Promise<string[]> => {
  if (!ai) throw new Error('Gemini API key not configured');

  const prompt = `
You are a market research analyst specializing in high-performance computing and AI server hardware.
Your task is to identify the top 5-7 direct competitors for the "LM TEK RM-4U8G", which is a 4U 8-GPU rackmount server designed for AI training and inference.

Focus on servers with similar capabilities:
- High GPU density (supports 8x double-width GPUs)
- 4U or similar rackmount form factor
- Support for modern high-TDP CPUs (like AMD EPYC or Intel Xeon Scalable)
- Support for high amounts of RAM (1TB or more).

List each competitor's full product name on a new line. Do not add any other text, numbers, or bullet points.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const textResponse = response.text;
    const competitors = textResponse
      .split('\n')
      .map((c) => c.trim())
      .filter((c) => c.length > 0);
    return competitors;
  } catch (error) {
    console.error('Error discovering competitors:', error);
    throw new Error('Failed to discover competitors.');
  }
};

export const analyzeCompetition = async (
  competitors: string[],
  onChunk: (textChunk: string) => void
): Promise<{ sources: Source[] }> => {
  if (!ai) throw new Error('Gemini API key not configured');

  const prompt = `
You are a market analyst specializing in server hardware. Create a detailed comparison table in Markdown format.
The table should compare our server, the 'LM TEK RM-4U8G', against the following competitor models: ${competitors.join(', ')}.

**Instructions:**
1. The first column of the table should be the 'Feature'.
2. The second column should be for our 'LM TEK RM-4U8G'.
3. Subsequent columns should be for each competitor.
4. Key features to compare MUST include: GPU Capacity, Supported GPU Models, CPU Support, Max RAM, Cooling System, Power Supply, Form Factor, and Estimated Price Range.
5. Use Google Search to find the most up-to-date information for the competitor models. If a direct competitor model isn't obvious, choose their most comparable high-density GPU server.
6. After the table, write a brief "Summary & Key Advantages" section in markdown, highlighting why the LM TEK server is a superior choice based on the data in the table.
7. Ensure the entire output is valid Markdown.
  `;

  try {
    const responseStream = await ai.models.generateContentStream({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    let lastChunk: GenerateContentResponse | null = null;
    for await (const chunk of responseStream) {
      const chunkText = chunk.text;
      if (chunkText) {
        onChunk(chunkText);
      }
      lastChunk = chunk;
    }

    const groundingChunks = lastChunk?.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources = groundingChunks
      .map((chunk: any) => (chunk.web ? { title: chunk.web.title, uri: chunk.web.uri } : null))
      .filter((source: any) => source !== null) as Source[];

    return { sources };
  } catch (error) {
    console.error('Error analyzing competition:', error);
    throw new Error('Failed to analyze competition. Please check the console for details.');
  }
};

export const getSalesAdvice = async (question: string): Promise<string> => {
  if (!ai) throw new Error('Gemini API key not configured');

  const prompt = `
As a sales coach, provide guidance on the following question related to selling high-performance AI servers like the LM TEK RM-4U8G: "${question}".
Provide actionable advice, potential scripts, and strategies.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-flash-lite-latest',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error('Error getting sales advice:', error);
    return 'Failed to get sales advice. Please check the console for details.';
  }
};

export const findLeads = async (profile: string): Promise<{ text: string; sources: Source[] }> => {
  if (!ai) throw new Error('Gemini API key not configured');

  const prompt = `
You are a lead generation specialist for a high-performance server company selling the 'LM TEK RM-4U8G'.
Based on the ideal customer profile: "${profile}", generate a list of 5 to 7 potential companies that would be excellent leads.
Use Google Search to find up-to-date and accurate information.

For each company, provide the following information in a structured Markdown format:

### [Company Name]
- **Reason for Fit:** A brief, compelling reason why they are a good fit for our server.
- **Website:** The company's official website URL as a clickable markdown link.
- **Key Contacts:** A list of 1-2 relevant contacts (e.g., CTO, Head of AI, VP of Engineering). For each contact, provide:
    - **[Name], [Title]:** [LinkedIn Profile URL as a clickable markdown link]

Focus on companies in sectors like AI research, biotech, financial modeling, and autonomous driving.
Ensure all links are valid and direct.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources = groundingChunks
      .map((chunk: any) => (chunk.web ? { title: chunk.web.title, uri: chunk.web.uri } : null))
      .filter((source: any) => source !== null) as Source[];

    return { text: response.text, sources };
  } catch (error) {
    console.error('Error finding leads:', error);
    return { text: 'Failed to find leads. Please check the console for details.', sources: [] };
  }
};

export const generateSocialText = async (
  subject: string
): Promise<{ posts: Record<string, string> }> => {
  if (!ai) throw new Error('Gemini API key not configured');

  const textPrompt = `
You are an expert social media content creator for LM TEK, creating posts about: "${subject}"

CRITICAL: Return ONLY valid JSON. NO explanations. NO character counts. NO meta-commentary.

CREATE ENGAGING, SUBSTANTIAL POSTS:

linkedin: (400-500 characters)
Create a professional post with:
- Opening hook (bold statement, question, or "Here's what nobody tells you...")
- 2-3 sentences explaining the insight/benefit
- One concrete example or use case
- Clear call-to-action
- 3-4 relevant hashtags (#AI #MachineLearning #Enterprise #Tech)
Example tone: "Most companies waste $X on cloud AI. Here's why smart CTOs are switching to in-house infrastructure: [explain 2-3 key benefits]. The ROI speaks for itself. Ready to future-proof your AI stack? #AI #Enterprise"

x: (250-270 characters including hashtags)
Create an engaging tweet with:
- Strong opening hook or hot take
- One surprising fact or insight
- Make people want to engage
- 2-3 hashtags
Example: "Hot take: Renting cloud GPUs is the new 'leasing office space.' The math only works until you scale. Smart companies are building owned AI infrastructure. The breakeven point? Sooner than you think. #AI #Tech #Innovation"

instagram: (350-450 characters)
Create a visual-focused caption with:
- Attention-grabbing first line
- Story or emotional connection (2-3 sentences)
- Value proposition
- Engagement question or "Tag someone..."
- 5-7 trending hashtags
Example: "POV: You just realized your AI budget could buy you a supercomputer instead of monthly cloud bills. 💡 Building in-house AI infrastructure isn't just for tech giants anymore. [benefit]. Who else is ready to own their AI future? Tag your tech lead! #AI #MachineLearning #TechInnovation #AIInfrastructure #FutureOfWork"

facebook: (500-600 characters)
Create a conversational post with:
- Relatable opening (3-4 sentences)
- Personal angle or story
- Specific benefits/insights
- Question to spark discussion
- Conversational, friendly tone
Example: "Can we talk about the elephant in the room? Everyone's racing to build AI products, but most are burning cash on cloud compute like there's no tomorrow. Here's what changed my mind about in-house infrastructure: [explain benefits with specifics]. The game-changer? Full control and predictable costs. Who else is thinking about bringing AI in-house? What's holding you back?"

tiktok: (200-300 characters as video script)
Create a punchy script with:
- Attention hook (first 3 words must grab)
- One mind-blowing fact or demo description
- Visual suggestion
- Strong ending hook
Example: "This is INSANE. 🤯 [Show server close-up] This one 4U server replaces $50K/month in cloud costs. Eight GPUs. Liquid cooled. Ready for your biggest AI models. [Pan to full rack] This is how smart companies are building AI in 2025. Follow for more AI infrastructure secrets. #AI #Tech #Innovation"

Return ONLY the JSON object with these 5 complete posts. Make them ENGAGING and SUBSTANTIAL.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: textPrompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            linkedin: {
              type: Type.STRING,
              description: 'Professional LinkedIn post with hashtags'
            },
            x: {
              type: Type.STRING,
              description: 'X/Twitter post under 280 characters with hashtags'
            },
            instagram: {
              type: Type.STRING,
              description: 'Instagram caption with hook, benefit, CTA and hashtags'
            },
            facebook: {
              type: Type.STRING,
              description: 'Conversational Facebook post encouraging discussion'
            },
            tiktok: {
              type: Type.STRING,
              description: 'TikTok video script focusing on one feature'
            },
          },
          required: ['linkedin', 'x', 'instagram', 'facebook', 'tiktok'],
        },
      },
    });

    let jsonString = response.text.trim();

    // Remove markdown code fences if present
    if (jsonString.startsWith('```json')) {
      jsonString = jsonString.substring(7, jsonString.length - 3).trim();
    } else if (jsonString.startsWith('```')) {
      jsonString = jsonString.substring(3, jsonString.length - 3).trim();
    }

    // Try to extract JSON if there's extra text
    const jsonMatch = jsonString.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      jsonString = jsonMatch[0];
    }

    console.log('Raw response:', response.text);
    console.log('Parsed JSON string:', jsonString);

    const posts = JSON.parse(jsonString);

    // Validate all required fields are present
    if (!posts.linkedin || !posts.x || !posts.instagram || !posts.facebook || !posts.tiktok) {
      throw new Error('Missing required social media post fields');
    }

    return { posts };
  } catch (error) {
    console.error('Error generating social posts:', error);
    throw new Error('Failed to generate social media content. Please check the console.');
  }
};

export const generateSocialTextAndImage = async (
  subject: string,
  imageBase64: string,
  imageMimeType: string
): Promise<{ posts: Record<string, string>; imageUrl: string }> => {
  if (!ai) throw new Error('Gemini API key not configured');

  const textPrompt = `
You are an expert social media content creator for LM TEK, creating posts about: "${subject}"

CRITICAL: Return ONLY valid JSON. NO explanations. NO character counts. NO meta-commentary.

CREATE ENGAGING, SUBSTANTIAL POSTS:

linkedin: (400-500 characters)
Create a professional post with:
- Opening hook (bold statement, question, or "Here's what nobody tells you...")
- 2-3 sentences explaining the insight/benefit
- One concrete example or use case
- Clear call-to-action
- 3-4 relevant hashtags (#AI #MachineLearning #Enterprise #Tech)
Example tone: "Most companies waste $X on cloud AI. Here's why smart CTOs are switching to in-house infrastructure: [explain 2-3 key benefits]. The ROI speaks for itself. Ready to future-proof your AI stack? #AI #Enterprise"

x: (250-270 characters including hashtags)
Create an engaging tweet with:
- Strong opening hook or hot take
- One surprising fact or insight
- Make people want to engage
- 2-3 hashtags
Example: "Hot take: Renting cloud GPUs is the new 'leasing office space.' The math only works until you scale. Smart companies are building owned AI infrastructure. The breakeven point? Sooner than you think. #AI #Tech #Innovation"

instagram: (350-450 characters)
Create a visual-focused caption with:
- Attention-grabbing first line
- Story or emotional connection (2-3 sentences)
- Value proposition
- Engagement question or "Tag someone..."
- 5-7 trending hashtags
Example: "POV: You just realized your AI budget could buy you a supercomputer instead of monthly cloud bills. 💡 Building in-house AI infrastructure isn't just for tech giants anymore. [benefit]. Who else is ready to own their AI future? Tag your tech lead! #AI #MachineLearning #TechInnovation #AIInfrastructure #FutureOfWork"

facebook: (500-600 characters)
Create a conversational post with:
- Relatable opening (3-4 sentences)
- Personal angle or story
- Specific benefits/insights
- Question to spark discussion
- Conversational, friendly tone
Example: "Can we talk about the elephant in the room? Everyone's racing to build AI products, but most are burning cash on cloud compute like there's no tomorrow. Here's what changed my mind about in-house infrastructure: [explain benefits with specifics]. The game-changer? Full control and predictable costs. Who else is thinking about bringing AI in-house? What's holding you back?"

tiktok: (200-300 characters as video script)
Create a punchy script with:
- Attention hook (first 3 words must grab)
- One mind-blowing fact or demo description
- Visual suggestion
- Strong ending hook
Example: "This is INSANE. 🤯 [Show server close-up] This one 4U server replaces $50K/month in cloud costs. Eight GPUs. Liquid cooled. Ready for your biggest AI models. [Pan to full rack] This is how smart companies are building AI in 2025. Follow for more AI infrastructure secrets. #AI #Tech #Innovation"

Return ONLY the JSON object with these 5 complete posts. Make them ENGAGING and SUBSTANTIAL.
  `;

  const textPromise = ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: textPrompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          linkedin: {
            type: Type.STRING,
            description: 'Professional LinkedIn post with hashtags'
          },
          x: {
            type: Type.STRING,
            description: 'X/Twitter post under 280 characters with hashtags'
          },
          instagram: {
            type: Type.STRING,
            description: 'Instagram caption with hook, benefit, CTA and hashtags'
          },
          facebook: {
            type: Type.STRING,
            description: 'Conversational Facebook post encouraging discussion'
          },
          tiktok: {
            type: Type.STRING,
            description: 'TikTok video script focusing on one feature'
          },
        },
        required: ['linkedin', 'x', 'instagram', 'facebook', 'tiktok'],
      },
    },
  });

  const imagePromise = ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        { inlineData: { data: imageBase64, mimeType: imageMimeType } },
        {
          text: `Slightly enhance this image to make it look more professional and visually appealing for a social media post about "${subject}". Maintain the original subject matter.`,
        },
      ],
    },
    config: {
      responseModalities: [Modality.IMAGE],
    },
  });

  try {
    const [textResponse, imageResponse] = await Promise.all([textPromise, imagePromise]);

    let jsonString = textResponse.text.trim();

    // Remove markdown code fences if present
    if (jsonString.startsWith('```json')) {
      jsonString = jsonString.substring(7, jsonString.length - 3).trim();
    } else if (jsonString.startsWith('```')) {
      jsonString = jsonString.substring(3, jsonString.length - 3).trim();
    }

    // Try to extract JSON if there's extra text
    const jsonMatch = jsonString.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      jsonString = jsonMatch[0];
    }

    console.log('Raw response:', textResponse.text);
    console.log('Parsed JSON string:', jsonString);

    const posts = JSON.parse(jsonString);

    // Validate all required fields are present
    if (!posts.linkedin || !posts.x || !posts.instagram || !posts.facebook || !posts.tiktok) {
      throw new Error('Missing required social media post fields');
    }

    const imagePart = imageResponse.candidates?.[0]?.content?.parts?.[0];
    let imageUrl = '';
    if (imagePart && imagePart.inlineData) {
      const base64ImageBytes = imagePart.inlineData.data;
      const mimeType = imagePart.inlineData.mimeType;
      imageUrl = `data:${mimeType};base64,${base64ImageBytes}`;
    } else {
      throw new Error('AI did not return an image.');
    }

    return { posts, imageUrl };
  } catch (error) {
    console.error('Error generating social posts:', error);
    throw new Error('Failed to generate social media content. Please check the console.');
  }
};

export const generateEnhancedImage = async (
  subject: string,
  imageBase64: string,
  imageMimeType: string
): Promise<string> => {
  if (!ai) throw new Error('Gemini API key not configured');

  try {
    const imageResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { inlineData: { data: imageBase64, mimeType: imageMimeType } },
          {
            text: `Slightly enhance this image to make it look more professional and visually appealing for a social media post about "${subject}". Maintain the original subject matter.`,
          },
        ],
      },
      config: {
        responseModalities: [Modality.IMAGE],
      },
    });

    const imagePart = imageResponse.candidates?.[0]?.content?.parts?.[0];
    if (imagePart && imagePart.inlineData) {
      const base64ImageBytes = imagePart.inlineData.data;
      const mimeType = imagePart.inlineData.mimeType;
      return `data:${mimeType};base64,${base64ImageBytes}`;
    } else {
      throw new Error('AI did not return an image.');
    }
  } catch (error) {
    console.error('Error enhancing image:', error);
    throw new Error('Failed to enhance image. Please check the console.');
  }
};

export const generateSocialVideo = async (
  subject: string,
  imageBase64: string,
  imageMimeType: string,
  onStatusUpdate: (status: string) => void
): Promise<string> => {
  if (!API_KEY || API_KEY === 'YOUR_GEMINI_API_KEY_HERE') {
    throw new Error('Gemini API key not configured');
  }

  // Per guidelines, create a new instance right before the call
  const videoAI = new GoogleGenAI({ apiKey: API_KEY });

  try {
    // 1. Generate a creative prompt for Veo
    onStatusUpdate('Generating cinematic prompt...');
    const promptGenResponse = await videoAI.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Based on the subject "${subject}", write a short, dynamic, and visually exciting prompt for a video generation AI like Veo. Focus on action, cinematic shots, and a professional tone suitable for a tech product.`,
    });
    const videoPrompt = promptGenResponse.text;
    onStatusUpdate(`Prompt created: "${videoPrompt}"`);

    // 2. Generate the video
    onStatusUpdate('Initializing video generation...');
    let operation = await videoAI.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt: videoPrompt,
      image: {
        imageBytes: imageBase64,
        mimeType: imageMimeType,
      },
      config: {
        numberOfVideos: 1,
        resolution: '720p',
        aspectRatio: '16:9',
      },
    });

    // 3. Poll for completion
    onStatusUpdate('Creating video... This can take several minutes.');
    while (!operation.done) {
      await new Promise((resolve) => setTimeout(resolve, 10000));
      onStatusUpdate('Polling for video status...');
      operation = await videoAI.operations.getVideosOperation({ operation: operation });
    }

    onStatusUpdate('Video generation complete!');
    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!downloadLink) {
      throw new Error('Video generation succeeded, but no download link was provided.');
    }

    const response = await fetch(`${downloadLink}&key=${API_KEY}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch video. Status: ${response.status}`);
    }
    const videoBlob = await response.blob();
    return URL.createObjectURL(videoBlob);
  } catch (error: any) {
    console.error('Error generating social video:', error);
    if (error.message.includes('Requested entity was not found.')) {
      throw new Error(
        'Video generation failed: Invalid API Key. Please re-select your key and ensure it has billing enabled.'
      );
    }
    throw new Error('Failed to generate social media video.');
  }
};

export const createChat = (systemInstruction?: string): Chat | null => {
  if (!ai) return null;

  return ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction:
        systemInstruction ||
        `You are a helpful AI assistant for a salesperson selling the LM TEK RM-4U8G server.
You have deep knowledge of its specs and the AI hardware market. Answer questions concisely.`,
    },
  });
};

export const chatWithAI = async (
  history: ChatMessage[],
  newMessage: string,
  specs: ServerSpec[]
): Promise<string> => {
  if (!ai) throw new Error('Gemini API key not configured');

  const specsText = specs.length > 0
    ? `\n\nCurrent Server Configuration:\n${specs.map((cat) => `\n## ${cat.category}\n${cat.items.map((item) => `- ${item.feature}: ${Array.isArray(item.value) ? item.value.join(', ') : item.value}`).join('\n')}`).join('')}`
    : '';

  const systemInstruction = `You are a helpful AI sales assistant for the LM TEK RM-4U8G server.
You have deep knowledge of its specs, the AI hardware market, and sales strategies.
Answer questions concisely and professionally.${specsText}`;

  try {
    // Build the conversation history with system instruction
    const contents = [
      { role: 'user', parts: [{ text: systemInstruction }] },
      { role: 'model', parts: [{ text: 'I understand. I\'m ready to assist you with LM TEK server questions.' }] },
      ...history.map((msg) => ({
        role: msg.role,
        parts: [{ text: msg.content }],
      })),
      { role: 'user', parts: [{ text: newMessage }] },
    ];

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents,
    });

    return response.text;
  } catch (error) {
    console.error('Error in chat:', error);
    throw new Error('Failed to get response from AI assistant.');
  }
};
