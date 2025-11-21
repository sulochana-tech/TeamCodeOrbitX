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

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

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

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

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
          const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

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
