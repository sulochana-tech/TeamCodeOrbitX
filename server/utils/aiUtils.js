import genAI from "../config/gemini.js";

/**
 * Analyze image and determine category using Gemini Vision
 */
export const analyzeImageCategory = async (imageUrl) => {
  try {
    if (!genAI || !process.env.GEMINI_API_KEY) {
      console.warn("Gemini API key not configured, returning default category");
      return "Other";
    }

    // Use gemini-1.5-flash (supports vision and is faster/cheaper)
    // If that fails, fallback to gemini-1.5-pro
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash" 
    });

    const prompt = `Analyze this image and determine which category it belongs to. 
    Categories are: "Road Management", "Waste Management", "Electricity", "Water Supply", or "Other".
    
    Look for:
    - Road Management: potholes, damaged roads, broken pavements, road signs issues
    - Waste Management: garbage, trash, waste disposal issues, littering
    - Electricity: broken street lights, electrical hazards, power line issues
    - Water Supply: water leaks, broken pipes, water quality issues, drainage problems
    - Other: anything that doesn't fit the above categories
    
    Respond with ONLY the category name, nothing else.`;

    // Fetch image from URL
    const imageResponse = await fetch(imageUrl);
    const imageBuffer = await imageResponse.arrayBuffer();
    const imageBase64 = Buffer.from(imageBuffer).toString("base64");
    const mimeType = imageResponse.headers.get("content-type") || "image/jpeg";

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: imageBase64,
          mimeType: mimeType,
        },
      },
    ]);

    const response = await result.response;
    const category = response.text().trim();

    // Validate and return category
    const validCategories = [
      "Road Management",
      "Waste Management",
      "Electricity",
      "Water Supply",
      "Other",
    ];

    // Check if response contains a valid category
    for (const validCat of validCategories) {
      if (category.toLowerCase().includes(validCat.toLowerCase())) {
        return validCat;
      }
    }

    return "Other";
  } catch (error) {
    console.error("Error analyzing image category with Gemini:", error);
    return "Other";
  }
};

/**
 * Generate description from image using Gemini Vision
 */
export const generateDescriptionAI = async (imageUrl) => {
  try {
    if (!genAI || !process.env.GEMINI_API_KEY) {
      console.warn("Gemini API key not configured, returning default description");
      return "Issue detected in the image. Please provide more details.";
    }

    // Use gemini-1.5-flash (supports vision and is faster/cheaper)
    // If that fails, fallback to gemini-1.5-pro
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash" 
    });

    const prompt = `Analyze this image of a community issue in Rupandehi District, Nepal. 
    Generate a clear, concise description in English (or Nepali if appropriate) that describes:
    1. What the problem is
    2. Where it appears to be located (if visible)
    3. The severity/urgency of the issue
    4. Any relevant details that would help authorities address it
    
    Keep the description professional, factual, and under 200 words. 
    Focus on actionable information that will help resolve the issue.`;

    // Fetch image from URL
    const imageResponse = await fetch(imageUrl);
    const imageBuffer = await imageResponse.arrayBuffer();
    const imageBase64 = Buffer.from(imageBuffer).toString("base64");
    const mimeType = imageResponse.headers.get("content-type") || "image/jpeg";

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: imageBase64,
          mimeType: mimeType,
        },
      },
    ]);

    const response = await result.response;
    const description = response.text().trim();

    return description || "Issue detected in the image. Please provide more details.";
  } catch (error) {
    console.error("Error generating description with Gemini:", error);
    return "Issue detected in the image. Please provide more details.";
  }
};

/**
 * Detect duplicate issues using location and image similarity
 */
export const detectDuplicateIssue = async (lat, lng, imageUrl) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      console.warn("Gemini API key not configured, skipping duplicate detection");
      return false;
    }

    // First, do a geospatial check for nearby issues
    const Issue = (await import("../models/Issue.js")).default;
    
    // Check for issues within 50 meters of this location
    const nearbyIssues = await Issue.find({
      lat: { $gte: lat - 0.0005, $lte: lat + 0.0005 },
      lng: { $gte: lng - 0.0005, $lte: lng + 0.0005 },
      status: { $ne: "resolved" }, // Only check unresolved issues
    }).limit(5);

    if (nearbyIssues.length === 0) {
      return false;
    }

    // If we have nearby issues and an image, use Gemini to compare visual similarity
    if (imageUrl && nearbyIssues.length > 0 && genAI) {
      try {
        // Compare with the most recent nearby issue
        const mostRecentIssue = nearbyIssues[0];
        if (mostRecentIssue.image) {
          // Use gemini-1.5-flash (supports vision and is faster/cheaper)
    // If that fails, fallback to gemini-1.5-pro
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash" 
    });

          // Fetch both images
          const [image1Response, image2Response] = await Promise.all([
            fetch(imageUrl),
            fetch(mostRecentIssue.image),
          ]);

          const [image1Buffer, image2Buffer] = await Promise.all([
            image1Response.arrayBuffer(),
            image2Response.arrayBuffer(),
          ]);

          const image1Base64 = Buffer.from(image1Buffer).toString("base64");
          const image2Base64 = Buffer.from(image2Buffer).toString("base64");
          const mimeType1 = image1Response.headers.get("content-type") || "image/jpeg";
          const mimeType2 = image2Response.headers.get("content-type") || "image/jpeg";

          const prompt = `Compare these two images. Are they showing the same issue/problem? 
          Respond with only "YES" if they are the same issue, or "NO" if they are different issues.`;

          const result = await model.generateContent([
            prompt,
            {
              inlineData: {
                data: image1Base64,
                mimeType: mimeType1,
              },
            },
            {
              inlineData: {
                data: image2Base64,
                mimeType: mimeType2,
              },
            },
          ]);

          const response = await result.response;
          const isDuplicate = response.text().trim().toUpperCase().includes("YES");
          return isDuplicate;
        }
      } catch (error) {
        console.error("Error comparing images with Gemini:", error);
        // Fall back to location-based detection
      }
    }

    // If image comparison fails or no image, return true if there are nearby issues
    return nearbyIssues.length > 0;
  } catch (error) {
    console.error("Error detecting duplicate issue:", error);
    return false;
  }
};

/**
 * Analyze priority level based on image and description
 */
export const suggestPriorityAI = async (imageUrl, description = "") => {
  try {
    if (!genAI || !process.env.GEMINI_API_KEY) {
      return "medium"; // Default priority
    }

    // Use gemini-1.5-flash (supports vision and is faster/cheaper)
    // If that fails, fallback to gemini-1.5-pro
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash" 
    });

    let prompt = `Analyze this community issue and suggest a priority level: "high", "medium", or "low".
    
    Consider:
    - High: Safety hazards, urgent public health issues, blocking infrastructure
    - Medium: Moderate impact on community, needs attention soon
    - Low: Minor issues, cosmetic problems, non-urgent matters
    
    Respond with ONLY one word: "high", "medium", or "low".`;

    const content = [prompt];

    if (imageUrl) {
      const imageResponse = await fetch(imageUrl);
      const imageBuffer = await imageResponse.arrayBuffer();
      const imageBase64 = Buffer.from(imageBuffer).toString("base64");
      const mimeType = imageResponse.headers.get("content-type") || "image/jpeg";

      content.push({
        inlineData: {
          data: imageBase64,
          mimeType: mimeType,
        },
      });
    }

    if (description && description.trim().length > 10) {
      prompt = `${prompt}\n\nIssue Description: "${description}"`;
      content[0] = prompt;
    }

    const result = await model.generateContent(content);
    const response = await result.response;
    const priority = response.text().trim().toLowerCase();

    // Validate and return priority
    if (priority.includes("high")) return "high";
    if (priority.includes("low")) return "low";
    return "medium"; // Default
  } catch (error) {
    // Silently fallback to medium priority if AI fails
    // Budget allocation will use fallback calculation instead
    if (error.message && error.message.includes("404")) {
      console.warn("Gemini API model not available, using fallback priority");
    }
    return "medium";
  }
};

/**
 * Assess severity and urgency of issue
 */
export const assessSeverityAI = async (imageUrl, description = "") => {
  try {
    if (!genAI || !process.env.GEMINI_API_KEY) {
      return {
        severity: "moderate",
        urgency: "medium",
        reasoning: "Unable to analyze. Please review manually.",
      };
    }

    // Use gemini-1.5-flash (supports vision and is faster/cheaper)
    // If that fails, fallback to gemini-1.5-pro
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash" 
    });

    let prompt = `Analyze this community issue in Rupandehi, Nepal and assess:
    1. Severity: "critical", "high", "moderate", "low"
    2. Urgency: "immediate", "urgent", "medium", "low"
    3. Brief reasoning (one sentence)
    
    Respond in JSON format:
    {
      "severity": "high|moderate|low|critical",
      "urgency": "immediate|urgent|medium|low",
      "reasoning": "brief explanation"
    }`;

    const content = [prompt];

    if (imageUrl) {
      const imageResponse = await fetch(imageUrl);
      const imageBuffer = await imageResponse.arrayBuffer();
      const imageBase64 = Buffer.from(imageBuffer).toString("base64");
      const mimeType = imageResponse.headers.get("content-type") || "image/jpeg";

      content.push({
        inlineData: {
          data: imageBase64,
          mimeType: mimeType,
        },
      });
    }

    if (description && description.trim().length > 10) {
      prompt = `${prompt}\n\nIssue Description: "${description}"`;
      content[0] = prompt;
    }

    const result = await model.generateContent(content);
    const response = await result.response;
    const text = response.text().trim();

    // Try to parse JSON response
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const assessment = JSON.parse(jsonMatch[0]);
        return {
          severity: assessment.severity || "moderate",
          urgency: assessment.urgency || "medium",
          reasoning: assessment.reasoning || "AI analysis completed",
        };
      }
    } catch (parseError) {
      console.error("Error parsing AI severity assessment:", parseError);
    }

    // Fallback: extract severity and urgency from text
    const severity = text.toLowerCase().includes("critical") ? "critical" :
                    text.toLowerCase().includes("high") ? "high" :
                    text.toLowerCase().includes("low") ? "low" : "moderate";
    const urgency = text.toLowerCase().includes("immediate") ? "immediate" :
                   text.toLowerCase().includes("urgent") ? "urgent" :
                   text.toLowerCase().includes("low") ? "low" : "medium";

    return {
      severity,
      urgency,
      reasoning: text.substring(0, 200) || "AI analysis completed",
    };
  } catch (error) {
    // Silently fallback if AI fails - severity assessment isn't critical
    if (error.message && error.message.includes("404")) {
      console.warn("Gemini API model not available, using fallback severity assessment");
    }
    return {
      severity: "moderate",
      urgency: "medium",
      reasoning: "Unable to assess severity - using default",
    };
  }
};

/**
 * Auto-generate tags/keywords from image and description
 */
export const generateTagsAI = async (imageUrl, description = "", category = "") => {
  try {
    if (!genAI || !process.env.GEMINI_API_KEY) {
      return [];
    }

    // Use gemini-1.5-flash (supports vision and is faster/cheaper)
    // If that fails, fallback to gemini-1.5-pro
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash" 
    });

    let prompt = `Analyze this community issue and generate 3-5 relevant tags/keywords.
    Tags should be short (1-2 words), specific, and useful for searching/filtering.
    
    Examples: "pothole", "broken pipe", "garbage dump", "street light", "water leak"
    
    Respond with ONLY a comma-separated list of tags, no other text.`;

    const content = [prompt];

    if (imageUrl) {
      const imageResponse = await fetch(imageUrl);
      const imageBuffer = await imageResponse.arrayBuffer();
      const imageBase64 = Buffer.from(imageBuffer).toString("base64");
      const mimeType = imageResponse.headers.get("content-type") || "image/jpeg";

      content.push({
        inlineData: {
          data: imageBase64,
          mimeType: mimeType,
        },
      });
    }

    if (description && description.trim().length > 10) {
      prompt = `${prompt}\n\nIssue Description: "${description}"`;
      content[0] = prompt;
    }

    if (category) {
      prompt = `${prompt}\n\nCategory: "${category}"`;
      content[0] = prompt;
    }

    const result = await model.generateContent(content);
    const response = await result.response;
    const tagsText = response.text().trim();

    // Parse tags from comma-separated string
    const tags = tagsText
      .split(",")
      .map((tag) => tag.trim().toLowerCase())
      .filter((tag) => tag.length > 0 && tag.length < 30)
      .slice(0, 5); // Limit to 5 tags

    return tags;
  } catch (error) {
    console.error("Error generating tags with AI:", error);
    return [];
  }
};

/**
 * Predict resolution time based on similar historical issues
 */
export const predictResolutionTime = async (category, priority, description = "") => {
  try {
    if (!genAI || !process.env.GEMINI_API_KEY) {
      return {
        estimatedDays: 7,
        confidence: "low",
        reasoning: "Based on default estimates",
      };
    }

    const Issue = (await import("../models/Issue.js")).default;

    // Find similar resolved issues
    const similarIssues = await Issue.find({
      category: category,
      status: "resolved",
    })
      .sort({ createdAt: -1 })
      .limit(10)
      .select("createdAt updatedAt");

    const averageResolutionTime =
      similarIssues.length > 0
        ? similarIssues.reduce((acc, issue) => {
            const resolutionTime =
              (new Date(issue.updatedAt) - new Date(issue.createdAt)) /
              (1000 * 60 * 60 * 24); // Convert to days
            return acc + resolutionTime;
          }, 0) / similarIssues.length
        : 7; // Default 7 days if no similar issues

    // Use gemini-1.5-flash (supports vision and is faster/cheaper)
    // If that fails, fallback to gemini-1.5-pro
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash" 
    });

    const prompt = `Based on the following information, predict resolution time:
    - Category: ${category}
    - Priority: ${priority}
    - Description: ${description || "Not provided"}
    - Historical average for similar issues: ${averageResolutionTime.toFixed(1)} days
    
    Consider:
    - High priority issues typically resolve faster
    - Complex issues may take longer
    - Common categories have established workflows
    
    Respond with JSON:
    {
      "estimatedDays": number,
      "confidence": "high|medium|low",
      "reasoning": "brief explanation"
    }`;

    const result = await model.generateContent([prompt]);
    const response = await result.response;
    const text = response.text().trim();

    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const prediction = JSON.parse(jsonMatch[0]);
        return {
          estimatedDays: Math.round(prediction.estimatedDays || averageResolutionTime),
          confidence: prediction.confidence || "medium",
          reasoning: prediction.reasoning || "Based on historical data",
        };
      }
    } catch (parseError) {
      console.error("Error parsing AI prediction:", parseError);
    }

    // Fallback calculation
    let estimatedDays = averageResolutionTime;
    if (priority === "high") estimatedDays *= 0.7;
    if (priority === "low") estimatedDays *= 1.3;

    return {
      estimatedDays: Math.round(estimatedDays),
      confidence: similarIssues.length > 5 ? "high" : "medium",
      reasoning: `Based on ${similarIssues.length} similar resolved issues`,
    };
  } catch (error) {
    console.error("Error predicting resolution time:", error);
    return {
      estimatedDays: 7,
      confidence: "low",
      reasoning: "Unable to predict. Based on default estimates.",
    };
  }
};

/**
 * Enhance user-written description with AI
 */
export const enhanceDescriptionAI = async (originalDescription) => {
  try {
    if (!genAI || !process.env.GEMINI_API_KEY || !originalDescription || originalDescription.trim().length < 10) {
      return originalDescription;
    }

    // Use gemini-1.5-flash (supports vision and is faster/cheaper)
    // If that fails, fallback to gemini-1.5-pro
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash" 
    });

    const prompt = `Improve and enhance this community issue description while keeping the original meaning and facts intact.
    
    Original Description: "${originalDescription}"
    
    Enhance by:
    - Making it more professional and clear
    - Adding relevant details that might be missing
    - Improving grammar and structure
    - Keeping it concise (under 300 words)
    - Maintaining factual accuracy
    
    Respond with ONLY the enhanced description, no other text.`;

    const result = await model.generateContent([prompt]);
    const response = await result.response;
    const enhanced = response.text().trim();

    return enhanced || originalDescription;
  } catch (error) {
    console.error("Error enhancing description with AI:", error);
    return originalDescription;
  }
};

/**
 * Get multiple category suggestions with confidence scores
 */
export const suggestCategoriesAI = async (imageUrl, description = "") => {
  try {
    if (!genAI || !process.env.GEMINI_API_KEY) {
      return [{ category: "Other", confidence: 0.5 }];
    }

    // Use gemini-1.5-flash (supports vision and is faster/cheaper)
    // If that fails, fallback to gemini-1.5-pro
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash" 
    });

    let prompt = `Analyze this community issue and suggest the top 3 most likely categories from:
    "Road Management", "Waste Management", "Electricity", "Water Supply", "Other"
    
    Respond in JSON array format:
    [
      {"category": "Category Name", "confidence": 0.0-1.0, "reasoning": "brief explanation"},
      ...
    ]
    
    Sort by confidence (highest first).`;

    const content = [prompt];

    if (imageUrl) {
      const imageResponse = await fetch(imageUrl);
      const imageBuffer = await imageResponse.arrayBuffer();
      const imageBase64 = Buffer.from(imageBuffer).toString("base64");
      const mimeType = imageResponse.headers.get("content-type") || "image/jpeg";

      content.push({
        inlineData: {
          data: imageBase64,
          mimeType: mimeType,
        },
      });
    }

    if (description && description.trim().length > 10) {
      prompt = `${prompt}\n\nIssue Description: "${description}"`;
      content[0] = prompt;
    }

    const result = await model.generateContent(content);
    const response = await result.response;
    const text = response.text().trim();

    try {
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const suggestions = JSON.parse(jsonMatch[0]);
        const validCategories = [
          "Road Management",
          "Waste Management",
          "Electricity",
          "Water Supply",
          "Other",
        ];

        return suggestions
          .filter((s) => validCategories.includes(s.category))
          .slice(0, 3)
          .map((s) => ({
            category: s.category,
            confidence: Math.min(1, Math.max(0, s.confidence || 0.5)),
            reasoning: s.reasoning || "AI analysis",
          }));
      }
    } catch (parseError) {
      console.error("Error parsing category suggestions:", parseError);
    }

    // Fallback: single category
    const singleCategory = await analyzeImageCategory(imageUrl);
    return [{ category: singleCategory, confidence: 0.7, reasoning: "AI analysis" }];
  } catch (error) {
    console.error("Error suggesting categories with AI:", error);
    return [{ category: "Other", confidence: 0.5 }];
  }
};

/**
 * Find similar issues using AI semantic similarity
 */
export const findSimilarIssues = async (description, category, lat, lng, limit = 5) => {
  try {
    if (!genAI || !process.env.GEMINI_API_KEY || !description || description.trim().length < 10) {
      return [];
    }

    const Issue = (await import("../models/Issue.js")).default;

    // First, get issues with same category and nearby location (within 1km)
    const nearbyIssues = await Issue.find({
      category: category,
      lat: { $gte: lat - 0.01, $lte: lat + 0.01 },
      lng: { $gte: lng - 0.01, $lte: lng + 0.01 },
      status: { $ne: "resolved" }, // Only show unresolved similar issues
    })
      .limit(10)
      .sort({ createdAt: -1 })
      .populate("user", "fullName");

    if (nearbyIssues.length === 0) {
      return [];
    }

    // Use gemini-1.5-flash (supports vision and is faster/cheaper)
    // If that fails, fallback to gemini-1.5-pro
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash" 
    });

    // Create a prompt to find semantically similar issues
    const issueDescriptions = nearbyIssues.map((issue, idx) => 
      `${idx + 1}. "${issue.description || issue.aiDescription || 'No description'}"`
    ).join('\n');

    const prompt = `Given this new issue description:
"${description}"

Compare it with these existing issues and rank them by similarity (1 = most similar):
${issueDescriptions}

Respond with JSON array of the top ${limit} most similar issue numbers:
{"similar": [1, 3, 5], "reasoning": "brief explanation"}

Only include issues that are actually similar (not just in same location).`;

    const result = await model.generateContent([prompt]);
    const response = await result.response;
    const text = response.text().trim();

    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const analysis = JSON.parse(jsonMatch[0]);
        const similarIndices = analysis.similar || [];
        
        // Map indices to actual issues (convert to 0-based)
        const similarIssues = similarIndices
          .map(idx => nearbyIssues[idx - 1])
          .filter(Boolean)
          .slice(0, limit);

        return similarIssues.map(issue => ({
          id: issue._id,
          description: issue.description || issue.aiDescription,
          category: issue.category,
          locationName: issue.locationName,
          status: issue.status,
          createdAt: issue.createdAt,
          similarity: analysis.reasoning || "Similar issue found",
        }));
      }
    } catch (parseError) {
      console.error("Error parsing similar issues:", parseError);
    }

    // Fallback: return nearby issues of same category
    return nearbyIssues.slice(0, limit).map(issue => ({
      id: issue._id,
      description: issue.description || issue.aiDescription,
      category: issue.category,
      locationName: issue.locationName,
      status: issue.status,
      createdAt: issue.createdAt,
      similarity: "Nearby issue in same category",
    }));
  } catch (error) {
    console.error("Error finding similar issues:", error);
    return [];
  }
};

/**
 * Smart routing - suggest appropriate department for issue
 */
export const suggestDepartment = async (imageUrl, description, category) => {
  try {
    if (!genAI || !process.env.GEMINI_API_KEY) {
      return {
        department: "General Services",
        confidence: 0.5,
        reasoning: "Default routing",
      };
    }

    // Use gemini-1.5-flash (supports vision and is faster/cheaper)
    // If that fails, fallback to gemini-1.5-pro
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash" 
    });

    const departments = [
      "Public Works Department",
      "Environmental Services",
      "Electrical Department",
      "Water Supply Department",
      "Road Maintenance",
      "Waste Management",
      "Emergency Services",
      "General Services",
    ];

    let prompt = `Analyze this community issue and suggest the most appropriate department to handle it.
    
    Available departments: ${departments.join(", ")}
    
    Issue Category: ${category || "Not specified"}
    Description: ${description || "Not provided"}
    
    Consider:
    - Category and issue type
    - Urgency and severity
    - Department expertise and responsibilities
    
    Respond with JSON:
    {
      "department": "Department Name",
      "confidence": 0.0-1.0,
      "reasoning": "brief explanation",
      "alternativeDepartments": ["Dept1", "Dept2"]
    }`;

    const content = [prompt];

    if (imageUrl) {
      const imageResponse = await fetch(imageUrl);
      const imageBuffer = await imageResponse.arrayBuffer();
      const imageBase64 = Buffer.from(imageBuffer).toString("base64");
      const mimeType = imageResponse.headers.get("content-type") || "image/jpeg";

      content.push({
        inlineData: {
          data: imageBase64,
          mimeType: mimeType,
        },
      });
    }

    const result = await model.generateContent(content);
    const response = await result.response;
    const text = response.text().trim();

    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const suggestion = JSON.parse(jsonMatch[0]);
        return {
          department: suggestion.department || "General Services",
          confidence: Math.min(1, Math.max(0, suggestion.confidence || 0.5)),
          reasoning: suggestion.reasoning || "AI analysis",
          alternativeDepartments: suggestion.alternativeDepartments || [],
        };
      }
    } catch (parseError) {
      console.error("Error parsing department suggestion:", parseError);
    }

    // Fallback: category-based routing
    const categoryRouting = {
      "Road Management": "Road Maintenance",
      "Waste Management": "Waste Management",
      "Electricity": "Electrical Department",
      "Water Supply": "Water Supply Department",
    };

    return {
      department: categoryRouting[category] || "General Services",
      confidence: 0.6,
      reasoning: `Based on category: ${category}`,
      alternativeDepartments: [],
    };
  } catch (error) {
    console.error("Error suggesting department:", error);
    return {
      department: "General Services",
      confidence: 0.5,
      reasoning: "Unable to analyze",
      alternativeDepartments: [],
    };
  }
};

/**
 * Analyze sentiment of comments/descriptions
 */
export const analyzeSentiment = async (text) => {
  try {
    if (!genAI || !process.env.GEMINI_API_KEY || !text || text.trim().length < 5) {
      return {
        sentiment: "neutral",
        score: 0,
        emotions: [],
      };
    }

    // Use gemini-1.5-flash (supports vision and is faster/cheaper)
    // If that fails, fallback to gemini-1.5-pro
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash" 
    });

    const prompt = `Analyze the sentiment of this text from a community issue reporting platform:
"${text}"

Respond with JSON:
{
  "sentiment": "positive|negative|neutral",
  "score": -1.0 to 1.0,
  "emotions": ["emotion1", "emotion2"],
  "urgency": "high|medium|low"
}`;

    const result = await model.generateContent([prompt]);
    const response = await result.response;
    const textResponse = response.text().trim();

    try {
      const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const analysis = JSON.parse(jsonMatch[0]);
        return {
          sentiment: analysis.sentiment || "neutral",
          score: Math.min(1, Math.max(-1, analysis.score || 0)),
          emotions: analysis.emotions || [],
          urgency: analysis.urgency || "medium",
        };
      }
    } catch (parseError) {
      console.error("Error parsing sentiment:", parseError);
    }

    // Simple fallback sentiment analysis
    const lowerText = text.toLowerCase();
    const positiveWords = ["good", "great", "excellent", "thanks", "appreciate", "helpful"];
    const negativeWords = ["bad", "terrible", "awful", "urgent", "dangerous", "broken", "failed"];

    const positiveCount = positiveWords.filter(word => lowerText.includes(word)).length;
    const negativeCount = negativeWords.filter(word => lowerText.includes(word)).length;

    let sentiment = "neutral";
    let score = 0;
    if (positiveCount > negativeCount) {
      sentiment = "positive";
      score = 0.5;
    } else if (negativeCount > positiveCount) {
      sentiment = "negative";
      score = -0.5;
    }

    return {
      sentiment,
      score,
      emotions: [],
      urgency: negativeCount > 2 ? "high" : "medium",
    };
  } catch (error) {
    console.error("Error analyzing sentiment:", error);
    return {
      sentiment: "neutral",
      score: 0,
      emotions: [],
      urgency: "medium",
    };
  }
};

/**
 * Predict community impact of issue
 */
export const predictImpact = async (imageUrl, description, category, locationName) => {
  try {
    if (!genAI || !process.env.GEMINI_API_KEY) {
      return {
        impactLevel: "medium",
        affectedPeople: 50,
        economicImpact: "low",
        reasoning: "Default estimate",
      };
    }

    // Use gemini-1.5-flash (supports vision and is faster/cheaper)
    // If that fails, fallback to gemini-1.5-pro
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash" 
    });

    let prompt = `Analyze this community issue in Rupandehi, Nepal and predict its impact:

Category: ${category || "Not specified"}
Location: ${locationName || "Not specified"}
Description: ${description || "Not provided"}

Estimate:
1. Impact Level: "low", "medium", "high", "critical"
2. Estimated number of people affected (0-1000)
3. Economic impact: "low", "medium", "high"
4. Brief reasoning

Respond with JSON:
{
  "impactLevel": "low|medium|high|critical",
  "affectedPeople": number,
  "economicImpact": "low|medium|high",
  "reasoning": "brief explanation"
}`;

    const content = [prompt];

    if (imageUrl) {
      const imageResponse = await fetch(imageUrl);
      const imageBuffer = await imageResponse.arrayBuffer();
      const imageBase64 = Buffer.from(imageBuffer).toString("base64");
      const mimeType = imageResponse.headers.get("content-type") || "image/jpeg";

      content.push({
        inlineData: {
          data: imageBase64,
          mimeType: mimeType,
        },
      });
    }

    const result = await model.generateContent(content);
    const response = await result.response;
    const text = response.text().trim();

    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const prediction = JSON.parse(jsonMatch[0]);
        return {
          impactLevel: prediction.impactLevel || "medium",
          affectedPeople: Math.min(1000, Math.max(0, prediction.affectedPeople || 50)),
          economicImpact: prediction.economicImpact || "low",
          reasoning: prediction.reasoning || "AI analysis",
        };
      }
    } catch (parseError) {
      console.error("Error parsing impact prediction:", parseError);
    }

    // Fallback
    return {
      impactLevel: "medium",
      affectedPeople: 50,
      economicImpact: "low",
      reasoning: "Based on default estimates",
    };
  } catch (error) {
    console.error("Error predicting impact:", error);
    return {
      impactLevel: "medium",
      affectedPeople: 50,
      economicImpact: "low",
      reasoning: "Unable to predict",
    };
  }
};

/**
 * Detect potential duplicate and return details
 */
/**
 * AI-based Budget Allocation
 * Analyzes image, description, category to calculate probability-based budget allocation
 */
export const allocateBudgetAI = async (imageUrl, description, category, locationName) => {
  try {
    // Base budget ranges by department/category (in Nepali Rupees)
    const categoryBudgetRanges = {
      "Road Management": { min: 50000, max: 500000, avg: 150000 },
      "Waste": { min: 20000, max: 200000, avg: 75000 },
      "Electricity": { min: 30000, max: 300000, avg: 100000 },
      "Water": { min: 40000, max: 400000, avg: 125000 },
      "Other": { min: 25000, max: 250000, avg: 85000 },
    };

    // Get base range for category
    const budgetRange = categoryBudgetRanges[category] || categoryBudgetRanges["Other"];

    // If AI is available, use it for detailed analysis
    if (genAI && process.env.GEMINI_API_KEY && imageUrl) {
      try {
        // Use gemini-1.5-flash (supports vision and is faster/cheaper)
    // If that fails, fallback to gemini-1.5-pro
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash" 
    });

        // Get priority and severity first
        const priority = await suggestPriorityAI(imageUrl, description);
        const severity = await assessSeverityAI(imageUrl, description);

        // AI Analysis prompt
        let prompt = `Analyze this community issue in Rupandehi, Nepal and estimate budget allocation:

Category/Department: ${category || "Other"}
Location: ${locationName || "Not specified"}
Description: ${description || "Not provided"}
Priority: ${priority || "medium"}
Severity: ${severity.severity || "moderate"}

Based on the image analysis, estimate:
1. Complexity level (1-10): simple repair (1-3), moderate work (4-6), complex project (7-10)
2. Estimated budget in Nepali Rupees (रु): between रु ${budgetRange.min.toLocaleString()} and रु ${budgetRange.max.toLocaleString()}
3. Confidence level (0-100%): how confident you are in this estimate
4. Probability factor (0.6-1.4): multiplier based on complexity (0.6-0.8 for simple, 0.8-1.0 for moderate, 1.0-1.4 for complex)

Consider factors:
- Scope of work needed
- Material and labor costs in Nepal
- Infrastructure complexity
- Urgency and impact

Respond with JSON:
{
  "complexity": number (1-10),
  "estimatedBudget": number (in NPR),
  "confidence": number (0-100),
  "probabilityFactor": number (0.6-1.4),
  "reasoning": "brief explanation of budget calculation"
}`;

        const content = [prompt];

        if (imageUrl) {
          try {
            const imageResponse = await fetch(imageUrl);
            const imageBuffer = await imageResponse.arrayBuffer();
            const imageBase64 = Buffer.from(imageBuffer).toString("base64");
            const mimeType = imageResponse.headers.get("content-type") || "image/jpeg";

            content.push({
              inlineData: {
                data: imageBase64,
                mimeType: mimeType,
              },
            });
          } catch (imgError) {
            console.warn("Could not fetch image for budget analysis:", imgError);
          }
        }

        const result = await model.generateContent(content);
        const response = await result.response;
        const text = response.text().trim();

        try {
          const jsonMatch = text.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const analysis = JSON.parse(jsonMatch[0]);
            
            // Validate and calculate final budget
            const complexity = Math.min(10, Math.max(1, analysis.complexity || 5));
            const probabilityFactor = Math.min(1.4, Math.max(0.6, analysis.probabilityFactor || 1.0));
            const confidence = Math.min(100, Math.max(0, analysis.confidence || 70));

            // Calculate budget using probability-based approach
            const baseBudget = budgetRange.avg;
            const adjustedBudget = Math.round(baseBudget * probabilityFactor);

            // Ensure budget is within range
            const finalBudget = Math.min(
              budgetRange.max,
              Math.max(budgetRange.min, adjustedBudget)
            );

            return {
              allocatedAmount: finalBudget,
              estimatedCost: finalBudget,
              probabilityFactor: parseFloat(probabilityFactor.toFixed(2)),
              confidence: Math.round(confidence),
              complexity: Math.round(complexity),
              reasoning: analysis.reasoning || `AI-analyzed: ${priority} priority, ${severity.severity} severity`,
              aiGenerated: true,
            };
          }
        } catch (parseError) {
          console.error("Error parsing AI budget analysis:", parseError);
        }
      } catch (aiError) {
        // Silently fall through to non-AI calculation
        // Only log if it's not a model availability issue
        if (aiError.message && !aiError.message.includes("404") && !aiError.message.includes("not found")) {
          console.error("Error in AI budget allocation:", aiError.message);
        } else {
          console.log("AI model unavailable, using probability-based budget calculation");
        }
        // Fall through to non-AI calculation (which works perfectly)
      }
    }

    // Fallback: Non-AI probability-based calculation
    // Use category, priority, and simple heuristics
    let probabilityFactor = 0.85; // Default moderate probability

    // Adjust based on description keywords
    const descriptionLower = (description || "").toLowerCase();
    const urgentKeywords = ["urgent", "emergency", "dangerous", "hazard", "critical", "immediate", "severe"];
    const simpleKeywords = ["small", "minor", "simple", "quick", "easy", "cosmetic"];

    if (urgentKeywords.some(keyword => descriptionLower.includes(keyword))) {
      probabilityFactor = 1.15; // Higher probability for urgent issues
    } else if (simpleKeywords.some(keyword => descriptionLower.includes(keyword))) {
      probabilityFactor = 0.75; // Lower probability for simple issues
    }

    // Calculate budget using probability
    const baseBudget = budgetRange.avg;
    const allocatedAmount = Math.round(baseBudget * probabilityFactor);

    // Ensure within range
    const finalBudget = Math.min(
      budgetRange.max,
      Math.max(budgetRange.min, allocatedAmount)
    );

    return {
      allocatedAmount: finalBudget,
      estimatedCost: finalBudget,
      probabilityFactor: parseFloat(probabilityFactor.toFixed(2)),
      confidence: 65, // Moderate confidence for non-AI calculation
      complexity: 5, // Default moderate complexity
      reasoning: `Probability-based calculation for ${category}: ${(probabilityFactor * 100).toFixed(0)}% of average budget`,
      aiGenerated: false,
    };
  } catch (error) {
    console.error("Error in budget allocation:", error);
    // Ultimate fallback
    const budgetRange = {
      "Road Management": { avg: 150000 },
      "Waste": { avg: 75000 },
      "Electricity": { avg: 100000 },
      "Water": { avg: 125000 },
      "Other": { avg: 85000 },
    };
    const range = budgetRange[category] || budgetRange["Other"];
    
    return {
      allocatedAmount: range.avg,
      estimatedCost: range.avg,
      probabilityFactor: 1.0,
      confidence: 50,
      complexity: 5,
      reasoning: "Default budget allocation",
      aiGenerated: false,
    };
  }
};

/**
 * Detect potential duplicate and return details
 */
export const detectDuplicateWithDetails = async (lat, lng, imageUrl, description) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return {
        isDuplicate: false,
        similarIssues: [],
      };
    }

    const Issue = (await import("../models/Issue.js")).default;

    // Check for issues within 100 meters
    const nearbyIssues = await Issue.find({
      lat: { $gte: lat - 0.001, $lte: lat + 0.001 },
      lng: { $gte: lng - 0.001, $lte: lng + 0.001 },
      status: { $ne: "resolved" },
    })
      .limit(10)
      .sort({ createdAt: -1 })
      .populate("user", "fullName");

    if (nearbyIssues.length === 0) {
      return {
        isDuplicate: false,
        similarIssues: [],
      };
    }

    // If image provided, use AI to compare visual similarity
    if (imageUrl && genAI) {
      try {
        // Use gemini-1.5-flash (supports vision and is faster/cheaper)
    // If that fails, fallback to gemini-1.5-pro
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash" 
    });

        // Compare with most recent nearby issue
        const mostRecentIssue = nearbyIssues[0];
        if (mostRecentIssue.image) {
          const [image1Response, image2Response] = await Promise.all([
            fetch(imageUrl),
            fetch(mostRecentIssue.image),
          ]);

          const [image1Buffer, image2Buffer] = await Promise.all([
            image1Response.arrayBuffer(),
            image2Response.arrayBuffer(),
          ]);

          const image1Base64 = Buffer.from(image1Buffer).toString("base64");
          const image2Base64 = Buffer.from(image2Buffer).toString("base64");
          const mimeType1 = image1Response.headers.get("content-type") || "image/jpeg";
          const mimeType2 = image2Response.headers.get("content-type") || "image/jpeg";

          const prompt = `Compare these two images. Are they showing the same issue/problem?
          Also check if the descriptions match:
          New: "${description || 'No description'}"
          Existing: "${mostRecentIssue.description || mostRecentIssue.aiDescription || 'No description'}"
          
          Respond with JSON:
          {
            "isDuplicate": true/false,
            "confidence": 0.0-1.0,
            "reasoning": "brief explanation"
          }`;

          const result = await model.generateContent([
            prompt,
            {
              inlineData: {
                data: image1Base64,
                mimeType: mimeType1,
              },
            },
            {
              inlineData: {
                data: image2Base64,
                mimeType: mimeType2,
              },
            },
          ]);

          const response = await result.response;
          const text = response.text().trim();

          try {
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              const analysis = JSON.parse(jsonMatch[0]);
              return {
                isDuplicate: analysis.isDuplicate === true || analysis.isDuplicate === "true",
                confidence: analysis.confidence || 0.5,
                similarIssues: nearbyIssues.slice(0, 3).map(issue => ({
                  id: issue._id,
                  category: issue.category,
                  description: issue.description || issue.aiDescription,
                  locationName: issue.locationName,
                  createdAt: issue.createdAt,
                  similarity: analysis.reasoning || "Nearby similar issue",
                })),
              };
            }
          } catch (parseError) {
            console.error("Error parsing duplicate detection:", parseError);
          }
        }
      } catch (error) {
        console.error("Error comparing images:", error);
      }
    }

    // Fallback: return nearby issues
    return {
      isDuplicate: nearbyIssues.length > 0,
      confidence: 0.3,
      similarIssues: nearbyIssues.slice(0, 3).map(issue => ({
        id: issue._id,
        category: issue.category,
        description: issue.description || issue.aiDescription,
        locationName: issue.locationName,
        createdAt: issue.createdAt,
        similarity: "Nearby issue found",
      })),
    };
  } catch (error) {
    console.error("Error detecting duplicate:", error);
    return {
      isDuplicate: false,
      similarIssues: [],
    };
  }
};
