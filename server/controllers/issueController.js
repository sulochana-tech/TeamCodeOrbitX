import Issue from "../models/Issue.js";
import BeforeAfter from "../models/BeforeAfter.js";
import User from "../models/User.js";
import cloudinary from "../config/cloudinary.js";
import {
  analyzeImageCategory,
  generateDescriptionAI,
  detectDuplicateIssue,
} from "../utils/aiUtils.js";

/* ============================================================
   CREATE ISSUE (with AI + Cloudinary)
============================================================ */
export const createIssue = async (req, res) => {
  try {
    let { description, category, locationName, lat, lng } = req.body;

    // Convert to numbers
    lat = Number(lat);
    lng = Number(lng);

    if (isNaN(lat) || isNaN(lng)) {
      return res.status(400).json({
        message: "Latitude and Longitude must be valid numbers",
      });
    }

    // Upload image to Cloudinary
    let uploadedImage = null;
    if (req.file) {
      const upload = await cloudinary.uploader.upload(req.file.path, {
        folder: "issues",
      });
      uploadedImage = upload.secure_url;
    }

    // Duplicate Detection - Optional, only if user wants it
    // For now, we'll skip automatic duplicate detection to avoid blocking submissions
    // You can enable this later if needed
    // const isDuplicate = await detectDuplicateIssue(lat, lng, uploadedImage);
    // if (isDuplicate) {
    //   return res.status(400).json({
    //     message: "Duplicate issue detected in this location",
    //   });
    // }

    // AI Category - Only use if category is not provided by user
    // Don't auto-process, let user choose or use AI button
    if (!category || category.trim() === "") {
      // Only auto-detect if no category selected
      if (uploadedImage) {
        try {
          category = await analyzeImageCategory(uploadedImage);
        } catch (error) {
          console.error("Error auto-detecting category:", error);
          category = "Other"; // Fallback
        }
      } else {
        category = "Other"; // Default if no image
      }
    }

    // AI Description - Only use if description is too short or empty
    // Don't auto-generate unless user hasn't provided enough info
    if (!description || description.trim().length < 10) {
      // Only auto-generate if description is very short
      if (uploadedImage) {
        try {
          description = await generateDescriptionAI(uploadedImage);
        } catch (error) {
          console.error("Error auto-generating description:", error);
          description = description || "Issue reported. Please see image for details.";
        }
      } else {
        description = description || "Issue reported. Please provide more details.";
      }
    }

    // Save Issue
    const issue = await Issue.create({
      user: req.user._id,
      description,
      category,
      ward: req.body.ward || "",
      locationName,
      lat,
      lng,
      image: uploadedImage,
      isAnonymous: req.body.isAnonymous === "true" || req.body.isAnonymous === true,
    });

    // Award 10 points for reporting a new issue
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { points: 10 },
    });

    return res.json({
      message: "Issue created successfully",
      issue,
    });
  } catch (error) {
    console.error("Error creating issue:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

/* ============================================================
   GET ALL ISSUES  (THIS IS WHAT YOU WERE MISSING)
============================================================ */
export const getAllIssues = async (req, res) => {
  try {
    const issues = await Issue.find()
      .populate("user", "fullName email")
      .populate("upvoteCount")
      .sort({ createdAt: -1 });
    
    // Hide user info for anonymous posts (but keep it in the data structure)
    const processedIssues = issues.map((issue) => {
      const issueObj = issue.toObject();
      if (issueObj.isAnonymous) {
        // Keep user data but mark as anonymous for frontend
        issueObj.user = {
          _id: issueObj.user?._id,
          fullName: "Anonymous",
          email: "anonymous@example.com",
        };
      }
      return issueObj;
    });
    
    res.json(processedIssues);
  } catch (error) {
    console.error("Error fetching issues:", error);
    res.status(500).json({ message: "Error getting issues", error });
  }
};

/* ============================================================
   GET ISSUE BY ID  (ALSO REQUIRED)
============================================================ */
export const getIssueById = async (req, res) => {
  try {
    // Validate ObjectId format
    const mongoose = await import("mongoose");
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid issue ID format" });
    }

    const issue = await Issue.findById(req.params.id)
      .populate("user", "fullName email")
      .populate("upvoteCount")
      .populate({
        path: "comments",
        populate: { path: "user", select: "fullName email" },
      });

    if (!issue) {
      return res.status(404).json({ message: "Issue not found" });
    }
    
    // Hide user info for anonymous posts
    const issueObj = issue.toObject();
    if (issueObj.isAnonymous) {
      issueObj.user = {
        _id: issueObj.user?._id,
        fullName: "Anonymous",
        email: "anonymous@example.com",
      };
    }
    
    res.json(issueObj);
  } catch (error) {
    console.error("Error fetching issue:", error);
    res.status(500).json({ message: "Error fetching issue", error });
  }
};

/* ============================================================
   GET BEFORE/AFTER PHOTOS FOR AN ISSUE (PUBLIC)
============================================================ */
export const getBeforeAfterPhotos = async (req, res) => {
  try {
    const { id } = req.params;
    
    const beforeAfter = await BeforeAfter.find({ issue: id })
      .populate("issue", "category locationName status")
      .sort({ createdAt: -1 });
    
    res.json(beforeAfter);
  } catch (error) {
    console.error("Error fetching before/after photos:", error);
    res.status(500).json({ message: "Error fetching photos", error });
  }
};
