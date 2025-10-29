
import { GoogleGenAI, Chat, GenerateContentResponse, Type, Modality } from "@google/genai";
import { ServerSpec } from "../types";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

export const generatePitch = async (specs: ServerSpec[], onChunk: (textChunk: string) => void): Promise<void> => {
    const prompt = `
        You are a world-class enterprise sales executive specializing in high-performance computing and AI infrastructure.
        Your task is to generate a compelling, concise, and persuasive sales pitch for the LM TEK RM-4U8G server based on the following technical specifications.

        **Target Audience:** CTOs, AI/ML engineering leads, and IT decision-makers at mid-to-large enterprises.
        **Key Selling Points to Emphasize:**
        - **Unmatched Performance:** Highlight the 8x GPU capacity and support for the latest NVIDIA Blackwell and RTX series.
        - **Scalability & Future-Proofing:** Mention the support for AMD EPYC 9004/9005 series CPUs and up to 2TB of DDR5 RAM.
        - **In-House AI Powerhouse:** Frame it as the perfect solution for companies wanting to bring AI development, training, and fine-tuning in-house, reducing reliance on expensive cloud services.
        - **Reliability & Cooling:** Touch upon the robust EK liquid cooling system and redundant power supply, ensuring maximum uptime for mission-critical AI workloads.

        **Server Specifications:**
        ${specs.map(cat => `\n## ${cat.category}\n${cat.items.map(item => `- ${item.feature}: ${Array.isArray(item.value) ? item.value.join(', ') : item.value}`).join('\n')}`).join('')}

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
        console.error("Error generating pitch:", error);
        throw new Error("Failed to generate sales pitch. Please check the console for details.");
    }
};

export const discoverCompetitors = async (): Promise<string[]> => {
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
                tools: [{googleSearch: {}}],
            },
        });

        const textResponse = response.text;
        const competitors = textResponse.split('\n').map(c => c.trim()).filter(c => c.length > 0);
        return competitors;

    } catch (error) {
        console.error("Error discovering competitors:", error);
        throw new Error("Failed to discover competitors.");
    }
};


export const analyzeCompetition = async (
    competitors: string[],
    onChunk: (textChunk: string) => void
): Promise<{ sources: any[] }> => {
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
                tools: [{googleSearch: {}}],
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
            .map((chunk: any) => chunk.web ? { title: chunk.web.title, uri: chunk.web.uri } : null)
            .filter((source: any) => source !== null);

        return { sources };
    } catch (error) {
        console.error("Error analyzing competition:", error);
        throw new Error("Failed to analyze competition. Please check the console for details.");
    }
};

export const getSalesAdvice = async (question: string): Promise<string> => {
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
        console.error("Error getting sales advice:", error);
        return "Failed to get sales advice. Please check the console for details.";
    }
};

export const findLeads = async (profile: string): Promise<{ text: string, sources: any[] }> => {
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
                tools: [{googleSearch: {}}],
            },
        });

        const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
        const sources = groundingChunks
            .map((chunk: any) => chunk.web ? { title: chunk.web.title, uri: chunk.web.uri } : null)
            .filter((source: any) => source !== null);
        
        return { text: response.text, sources };
    } catch (error) {
        console.error("Error finding leads:", error);
        return { text: "Failed to find leads. Please check the console for details.", sources: [] };
    }
};

export const generateSocialTextAndImage = async (subject: string, imageBase64: string, imageMimeType: string): Promise<{ posts: Record<string, string>, imageUrl: string }> => {
    const textPrompt = `
        You are a social media marketing expert. Your client is selling the LM TEK RM-4U8G, a high-performance AI server.
        Based on the following subject, create engaging posts tailored for each social media platform listed in the schema.

        Subject: "${subject}"

        Guidelines:
        - LinkedIn: Professional, benefit-oriented, targeting CTOs and AI professionals. Include relevant hashtags.
        - X: Concise, impactful, using strong keywords and hashtags. Keep it under 280 characters.
        - Instagram: Visually driven caption. Start with a hook, explain the benefit, and end with a call-to-action or question. Use popular tech/AI hashtags.
        - Facebook: More conversational and informative. Can be slightly longer. Encourage discussion.
        - TikTok: Write a script for a short, snappy video. Focus on one "wow" feature or benefit. Suggest visuals.
    `;
    
    const textPromise = ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: textPrompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    linkedin: { type: Type.STRING },
                    x: { type: Type.STRING },
                    instagram: { type: Type.STRING },
                    facebook: { type: Type.STRING },
                    tiktok: { type: Type.STRING },
                },
            },
        },
    });

    const imagePromise = ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
            parts: [
                { inlineData: { data: imageBase64, mimeType: imageMimeType } },
                { text: `Slightly enhance this image to make it look more professional and visually appealing for a social media post about "${subject}". Maintain the original subject matter.` },
            ],
        },
        config: {
            responseModalities: [Modality.IMAGE],
        },
    });

    try {
        const [textResponse, imageResponse] = await Promise.all([textPromise, imagePromise]);
        
        let jsonString = textResponse.text.trim();
        if (jsonString.startsWith("```json")) {
          jsonString = jsonString.substring(7, jsonString.length - 3).trim();
        } else if (jsonString.startsWith("```")) {
           jsonString = jsonString.substring(3, jsonString.length - 3).trim();
        }
        const posts = JSON.parse(jsonString);

        const imagePart = imageResponse.candidates?.[0]?.content?.parts?.[0];
        let imageUrl = '';
        if (imagePart && imagePart.inlineData) {
            const base64ImageBytes = imagePart.inlineData.data;
            const mimeType = imagePart.inlineData.mimeType;
            imageUrl = `data:${mimeType};base64,${base64ImageBytes}`;
        } else {
             throw new Error("AI did not return an image.");
        }
        
        return { posts, imageUrl };

    } catch (error) {
        console.error("Error generating social posts:", error);
        throw new Error("Failed to generate social media content. Please check the console.");
    }
};

export const generateSocialVideo = async (
    subject: string, 
    imageBase64: string, 
    imageMimeType: string, 
    onStatusUpdate: (status: string) => void
): Promise<string> => {
    // Per guidelines, create a new instance right before the call
    const videoAI = new GoogleGenAI({ apiKey: API_KEY });

    try {
        // 1. Generate a creative prompt for Veo
        onStatusUpdate("Generating cinematic prompt...");
        const promptGenResponse = await videoAI.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Based on the subject "${subject}", write a short, dynamic, and visually exciting prompt for a video generation AI like Veo. Focus on action, cinematic shots, and a professional tone suitable for a tech product.`,
        });
        const videoPrompt = promptGenResponse.text;
        onStatusUpdate(`Prompt created: "${videoPrompt}"`);

        // 2. Generate the video
        onStatusUpdate("Initializing video generation...");
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
                aspectRatio: '16:9'
            }
        });

        // 3. Poll for completion
        onStatusUpdate("Creating video... This can take several minutes.");
        while (!operation.done) {
            await new Promise(resolve => setTimeout(resolve, 10000));
            onStatusUpdate("Polling for video status...");
            operation = await videoAI.operations.getVideosOperation({ operation: operation });
        }
        
        onStatusUpdate("Video generation complete!");
        const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
        if (!downloadLink) {
            throw new Error("Video generation succeeded, but no download link was provided.");
        }
        
        const response = await fetch(`${downloadLink}&key=${API_KEY}`);
        if (!response.ok) {
            throw new Error(`Failed to fetch video. Status: ${response.status}`);
        }
        const videoBlob = await response.blob();
        return URL.createObjectURL(videoBlob);

    } catch (error: any) {
        console.error("Error generating social video:", error);
        if (error.message.includes("Requested entity was not found.")) {
             throw new Error("Video generation failed: Invalid API Key. Please re-select your key and ensure it has billing enabled.");
        }
        throw new Error("Failed to generate social media video.");
    }
};


export const createChat = (): Chat => {
    return ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: `You are a helpful AI assistant for a salesperson selling the LM TEK RM-4U8G server. 
        You have deep knowledge of its specs and the AI hardware market. Answer questions concisely.`,
      },
    });
};
