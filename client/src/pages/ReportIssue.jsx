import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import api from "../api/axios";
import MapPicker from "../components/MapPicker";
import IssueTemplates from "../components/IssueTemplates";
import VoiceRecorder from "../components/VoiceRecorder";
import QRCodeScanner from "../components/QRCodeScanner";
import { categories } from "../data/categories";
import {
  saveOfflineIssue,
  isOnline,
  setupAutoSync,
} from "../utils/offlineStorage";
import { getAllWards, getLocationsByWard } from "../data/rupandehiWards";
import {
  getAllMunicipalities,
  getWardsByMunicipality,
} from "../data/municipalities";
import { useToast } from "../components/Toast";
import {
  Upload,
  MapPin,
  CheckCircle,
  AlertCircle,
  Zap,
  X,
  Camera,
  Loader2,
  ArrowLeft,
  ArrowRight,
  Navigation,
  Map as MapIcon,
  Trash2,
  Sparkles,
  FileText,
  QrCode,
} from "lucide-react";

export default function ReportIssue() {
  const { t } = useTranslation();
  const [image, setImage] = useState(null);
  const [description, setDescription] = useState("");
  const [locationName, setLocationName] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedMunicipality, setSelectedMunicipality] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedWard, setSelectedWard] = useState("");
  const [showMap, setShowMap] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const { success, error, warning, info } = useToast();

  // Setup offline sync on mount
  useEffect(() => {
    const syncFunction = async (issueData) => {
      try {
        const fd = new FormData();
        Object.keys(issueData).forEach((key) => {
          if (key === "image" && issueData[key] instanceof File) {
            fd.append("image", issueData[key]);
          } else {
            fd.append(key, issueData[key]);
          }
        });
        await api.post("/issues/create", fd);
      } catch (err) {
        throw err;
      }
    };
    setupAutoSync(syncFunction);
  }, []);

  // Debug: Log when coordinates change
  useEffect(() => {
    if (lat && lng) {
      console.log(`📍 State updated - Lat: ${lat}, Lng: ${lng}`);
    }
  }, [lat, lng]);

  const handleTemplateSelect = (template) => {
    setSelectedCategory(template.category);
    setDescription(template.description);
    setShowTemplates(false);
    success(
      "Template selected! Review and customize the details before submitting."
    );
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
    }
  };

  const removeImage = () => {
    setImage(null);
  };

  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [showAIAnalysis, setShowAIAnalysis] = useState(false);

  const generateAI = async () => {
    if (!image) {
      warning("Please upload an image first to use AI analysis");
      return;
    }

    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("image", image);
      // Include existing description if user wants to enhance it
      if (description && description.trim().length > 0) {
        fd.append("description", description);
      }

      const { data } = await api.post("/issues/ai-generate", fd);

      // Only set description if user hasn't written one yet
      // If user has written something, they can still use AI suggestions but it won't overwrite
      if (!description || description.trim().length < 10) {
        setDescription(data.aiDescription || "");
      } else {
        // If user already has a description, show AI suggestion but don't auto-replace
        info(
          "AI description generated! You can replace your text or keep what you wrote."
        );
      }

      // Store comprehensive AI analysis
      if (data.category || data.priority || data.severity || data.tags) {
        setAiAnalysis({
          category: data.category,
          priority: data.priority,
          severity: data.severity,
          tags: data.tags,
          categories: data.categories,
          aiDescription: data.aiDescription, // Store AI description separately
        });

        // Auto-select category if suggested with high confidence (only if user hasn't selected)
        if (data.category && !selectedCategory) {
          setSelectedCategory(data.category);
        }

        // Show AI analysis panel
        setShowAIAnalysis(true);
      }

      success("AI analysis completed. Check the insights below.");
    } catch (err) {
      console.error("AI generation error:", err);
      error(
        "Failed to generate AI description. Please try again or write your own description."
      );
    } finally {
      setLoading(false);
    }
  };

  const enhanceDescription = async () => {
    if (!description || description.trim().length < 10) {
      warning("Please write a description first (at least 10 characters)");
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post("/issues/ai-enhance", { description });
      if (data.enhanced) {
        setDescription(data.enhanced);
        success("Description enhanced with AI.");
      }
    } catch (err) {
      console.error("Description enhancement error:", err);
      error("Failed to enhance description. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleMunicipalityChange = (e) => {
    setSelectedMunicipality(e.target.value);
    setSelectedWard("");
    setSelectedCategory("");
  };

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
  };

  const handleWardChange = (e) => {
    setSelectedWard(e.target.value);
  };

  const handleLocationSelect = (e) => {
    const locationIndex = e.target.value;
    if (locationIndex && selectedWard) {
      const locations = getLocationsByWard(selectedWard);
      const location = locations[locationIndex];
      setLocationName(location.name);
      setLat(location.lat);
      setLng(location.lng);
    }
  };

  const getCurrentLocationDirect = (e) => {
    // Prevent any form submission
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    console.log("📍 === GET CURRENT LOCATION START ===");
    console.log("✅ Button clicked! Function called successfully.");
    console.log("Navigator object:", typeof navigator !== 'undefined' ? 'EXISTS' : 'MISSING');
    console.log("Geolocation API:", navigator?.geolocation ? 'AVAILABLE' : 'NOT AVAILABLE');
    
    // Immediate visual feedback - show loading state
    setGettingLocation(true);
    info("Requesting your location... Please allow location access if prompted.");
    
    // Check if geolocation is supported
    if (!navigator) {
      console.error("❌ Navigator object not available");
      error("Browser does not support geolocation. Please use the map to select your location.");
      setGettingLocation(false);
      return;
    }

    if (!navigator.geolocation) {
      console.error("❌ Geolocation API not available in navigator");
      error("Geolocation is not supported in this browser. Please use the map to select your location.");
      setGettingLocation(false);
      return;
    }

    console.log("✅ Geolocation API available");
    console.log("Requesting position...");
    
    // Simplified options - start with less strict requirements
    const geoOptions = {
      enableHighAccuracy: false, // Start with less strict accuracy
      timeout: 30000, // 30 second timeout - longer
      maximumAge: 60000, // Accept cached position up to 1 minute
    };

    console.log("📍 Requesting position with options:", geoOptions);
    
    navigator.geolocation.getCurrentPosition(
      // Success callback
      (position) => {
        console.log("✅ SUCCESS! Position received:", position);
        
        try {
          const { latitude, longitude, accuracy } = position.coords;
          console.log(`📍 Raw coordinates: ${latitude}, ${longitude}`);
          console.log(`📍 Accuracy: ${accuracy} meters`);
          
          // Validate coordinates are valid numbers
          if (latitude === null || longitude === null || 
              latitude === undefined || longitude === undefined ||
              isNaN(latitude) || isNaN(longitude)) {
            throw new Error("Invalid coordinates received");
          }
          
          // Validate coordinate ranges
          if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
            throw new Error(`Coordinates out of range: ${latitude}, ${longitude}`);
          }

          // Format coordinates to 6 decimal places (~10cm precision)
          const finalLat = parseFloat(latitude.toFixed(6));
          const finalLng = parseFloat(longitude.toFixed(6));

          console.log(`📍 Final coordinates: ${finalLat}, ${finalLng}`);

          // IMPORTANT: Update state immediately
          setLat(String(finalLat));
          setLng(String(finalLng));
          
          // Set a default location name if geocoding fails
          setLocationName(`GPS Location: ${finalLat}, ${finalLng}`);
          
          console.log("✅ State updated with coordinates");
          
          // Show success message
          success(`Location retrieved successfully! Accuracy: ${Math.round(accuracy || 0)}m`);
          
          // Automatically show map
          if (!showMap) {
            setShowMap(true);
          }
          
          // Try reverse geocoding (don't block on this)
          console.log("📍 Starting reverse geocoding...");
          fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${finalLat}&lon=${finalLng}&format=json&addressdetails=1&zoom=18`,
            {
              method: 'GET',
              headers: {
                'User-Agent': 'RupandehiDistrictApp/1.0',
                'Accept': 'application/json',
              },
            }
          )
            .then((response) => {
              console.log("📍 Geocoding response status:", response.status);
              if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
              }
              return response.json();
            })
            .then((data) => {
              console.log("📍 Geocoding data received:", data);
              
              if (data && data.display_name) {
                setLocationName(data.display_name);
                info(`Location: ${data.display_name.substring(0, 80)}${data.display_name.length > 80 ? '...' : ''}`);
              } else if (data && data.address) {
                const addr = data.address;
                const parts = [];
                if (addr.road) parts.push(addr.road);
                if (addr.village || addr.town || addr.city || addr.hamlet) {
                  parts.push(addr.village || addr.town || addr.city || addr.hamlet);
                }
                if (addr.municipality || addr.county) {
                  parts.push(addr.municipality || addr.county);
                }
                const locationStr = parts.length > 0 
                  ? parts.join(", ")
                  : `GPS: ${finalLat}, ${finalLng}`;
                setLocationName(locationStr);
              }
            })
            .catch((geocodeErr) => {
              console.warn("⚠️ Geocoding failed (non-critical):", geocodeErr);
              // Keep the default location name we set earlier
            })
            .finally(() => {
              setGettingLocation(false);
              console.log("✅ === GET CURRENT LOCATION COMPLETE ===");
            });
            
        } catch (processingError) {
          console.error("❌ Error processing location:", processingError);
          error(`Failed to process location: ${processingError.message}`);
          setGettingLocation(false);
        }
      },
      // Error callback
      (geolocationError) => {
        console.error("❌ Geolocation ERROR:", geolocationError);
        console.error("Error code:", geolocationError.code);
        console.error("Error message:", geolocationError.message);
        console.error("Full error object:", JSON.stringify(geolocationError, null, 2));
        
        let userMessage = "❌ Failed to get your location: ";
        let detailedMessage = "";
        
        // Use numeric codes directly for switch
        const errorCode = geolocationError.code;
        
        switch (errorCode) {
          case 1: // PERMISSION_DENIED
          case geolocationError.PERMISSION_DENIED:
            userMessage = "🔒 Location permission denied!";
            detailedMessage = "Please allow location access in your browser settings:\n\n1. Click the lock/security icon in your browser's address bar\n2. Find 'Location' or 'Permissions'\n3. Change from 'Block' to 'Allow'\n4. Refresh the page and try again.";
            console.error("❌ PERMISSION_DENIED (Code 1)");
            break;
          case 2: // POSITION_UNAVAILABLE
          case geolocationError.POSITION_UNAVAILABLE:
            userMessage = "📍 Location unavailable!";
            detailedMessage = "Your device cannot determine your location. Please:\n\n1. Check if GPS/location services are enabled on your device\n2. Make sure you're in an area with GPS signal\n3. Try moving to a different location";
            console.error("❌ POSITION_UNAVAILABLE (Code 2)");
            break;
          case 3: // TIMEOUT
          case geolocationError.TIMEOUT:
            userMessage = "⏱️ Location request timed out!";
            detailedMessage = "The location request took too long. Please:\n\n1. Check your internet connection\n2. Ensure GPS is enabled\n3. Try again";
            console.error("❌ TIMEOUT (Code 3)");
            break;
          default:
            userMessage = `⚠️ Location error: ${errorCode || 'Unknown'}`;
            detailedMessage = geolocationError.message || "An unknown error occurred. Please try using the map to select your location manually.";
            console.error("❌ Unknown error code:", errorCode);
            break;
        }
        
        error(userMessage);
        warning(detailedMessage || "You can still select your location manually on the map below.");
        setGettingLocation(false);
        console.log("✅ Error handling complete");
      },
      geoOptions
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!image) {
      warning("Please upload an image before submitting");
      return;
    }
    if (!description.trim()) {
      warning("Please provide a description of the issue");
      return;
    }
    if (!selectedMunicipality) {
      warning("Please select a municipality");
      return;
    }
    if (!selectedCategory) {
      warning("Please select an issue category");
      return;
    }
    if (!selectedWard) {
      warning("Please select a ward");
      return;
    }
    if (!locationName.trim() || !lat || !lng) {
      warning("Please provide complete location information");
      return;
    }

    setLoading(true);
    try {
      const issueData = {
        image,
        description,
        municipality: selectedMunicipality || "",
        category: selectedCategory || "",
        ward: selectedWard || "",
        locationName,
        lat,
        lng,
        isAnonymous,
      };

      // Check if online
      if (!isOnline()) {
        // Save offline
        const offlineId = saveOfflineIssue(issueData);
        success(
          "Issue saved offline! It will be automatically submitted when you're back online."
        );

        // Reset form
        setImage(null);
        setDescription("");
        setSelectedMunicipality("");
        setSelectedCategory("");
        setSelectedWard("");
        setLocationName("");
        setLat("");
        setLng("");
        setIsAnonymous(false);
        setCurrentStep(1);
        setLoading(false);
        return;
      }

      const fd = new FormData();
      fd.append("image", image);
      fd.append("description", description);
      fd.append("municipality", selectedMunicipality || "");
      fd.append("category", selectedCategory || "");
      fd.append("ward", selectedWard || "");
      fd.append("locationName", locationName);
      fd.append("lat", lat);
      fd.append("lng", lng);
      fd.append("isAnonymous", isAnonymous);

      const response = await api.post("/issues/create", fd);
      const budgetInfo = response.data.budget;
      
      let successMessage = isAnonymous
        ? "Issue report submitted successfully. Your submission has been recorded anonymously."
        : "Issue report submitted successfully. Thank you for your contribution to community improvement.";
      
      // Add budget allocation info if available
      if (budgetInfo) {
        const budgetAmount = budgetInfo.allocatedAmount.toLocaleString();
        const probability = (budgetInfo.probabilityFactor * 100).toFixed(0);
        const aiIndicator = budgetInfo.aiGenerated ? "AI-analyzed" : "Estimated";
        
        successMessage += `\n\n💰 ${aiIndicator} Budget Allocation: रु ${budgetAmount}`;
        successMessage += ` (${probability}% probability, ${budgetInfo.confidence}% confidence)`;
        
        if (budgetInfo.reasoning) {
          successMessage += `\n📊 ${budgetInfo.reasoning}`;
        }
      }
      
      success(successMessage);

      // Reset form
      setImage(null);
      setDescription("");
      setSelectedMunicipality("");
      setSelectedCategory("");
      setSelectedWard("");
      setLocationName("");
      setLat("");
      setLng("");
      setIsAnonymous(false);
      setCurrentStep(1);
    } catch (err) {
      console.error("Submission error:", err);
      error(
        "Failed to submit issue report. Please verify your information and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    // Validate current step before proceeding
    if (currentStep === 1) {
      if (!image) {
        warning("Please upload an image before proceeding");
        return;
      }
      if (!description.trim()) {
        warning("Please provide a description before proceeding");
        return;
      }
    }
    if (currentStep === 2) {
      if (
        !selectedMunicipality ||
        !selectedCategory ||
        !selectedWard ||
        !locationName ||
        !lat ||
        !lng
      ) {
        warning(
          "Please complete all location information (Municipality, Ward, Category, and location) before proceeding"
        );
        return;
      }
    }

    if (currentStep < 4) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  // Progress Steps
  const steps = [
    { number: 1, title: "Issue Details", completed: currentStep > 1 },
    { number: 2, title: "Location Information", completed: currentStep > 2 },
    { number: 3, title: "Verification", completed: currentStep > 3 },
    { number: 4, title: "Submission", completed: false },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Official Government Header */}
        <div className="bg-white border-l-4 border-[#003865] shadow-md mb-8 p-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-[#003865] rounded flex items-center justify-center flex-shrink-0">
              <FileText className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-[#003865] mb-1">
                Public Issue Reporting System
              </h1>
              <p className="text-gray-600 text-sm">
                रुपन्देही जिल्ला | Rupandehi District Administration Office
              </p>
              <p className="text-gray-500 text-xs mt-1">
                नागरिक सेवा पोर्टल | Citizen Service Portal
              </p>
            </div>
            <div className="hidden md:block text-right border-l border-gray-200 pl-4">
              <p className="text-xs text-gray-500 mb-1">Reference No.</p>
              <p className="text-sm font-mono text-[#003865]">AUTO-GEN</p>
            </div>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="bg-white border border-gray-200 shadow-sm mb-6 p-6">
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">
            Submission Progress
          </h3>
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center flex-1">
                <div className="flex items-center">
                  <div
                    className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                      step.completed || currentStep === step.number
                        ? "bg-[#003865] border-[#003865] text-white"
                        : "border-gray-300 text-gray-500 bg-white"
                    } font-semibold text-sm`}
                  >
                    {step.completed ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      step.number
                    )}
                  </div>
                  <span
                    className={`ml-3 text-xs font-medium ${
                      currentStep === step.number
                        ? "text-[#003865] font-semibold"
                        : "text-gray-600"
                    }`}
                  >
                    {step.title}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`h-0.5 mx-4 flex-1 ${
                      step.completed ? "bg-[#003865]" : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Templates Section */}
        {showTemplates && (
          <div className="mb-6">
            <IssueTemplates onSelectTemplate={handleTemplateSelect} />
          </div>
        )}

        {/* Main Form Container */}
        <div className="bg-white border border-gray-200 shadow-sm">
          {/* Form Content */}
          <div className="p-6 md:p-8">
            <form onSubmit={handleSubmit}>
              {/* Step 1: Issue Details */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="border-b border-gray-200 pb-4">
                    <div className="flex items-center justify-between mb-2">
                      <h2 className="text-xl font-bold text-[#003865]">
                        Issue Documentation
                      </h2>
                      {!showTemplates && (
                        <button
                          type="button"
                          onClick={() => setShowTemplates(!showTemplates)}
                          className="px-4 py-2 bg-blue-50 text-[#003865] border border-blue-200 rounded hover:bg-blue-100 transition-colors text-sm font-semibold flex items-center gap-2"
                        >
                          <FileText className="w-4 h-4" />
                          Use Template
                        </button>
                      )}
                      {showTemplates && (
                        <button
                          type="button"
                          onClick={() => setShowTemplates(false)}
                          className="px-4 py-2 bg-gray-100 text-gray-700 border border-gray-300 rounded hover:bg-gray-200 transition-colors text-sm font-semibold flex items-center gap-2"
                        >
                          <X className="w-4 h-4" />
                          Hide Templates
                        </button>
                      )}
                    </div>
                    <h2 className="text-xl font-bold text-[#003865] mb-2">
                      Issue Documentation
                    </h2>
                    <p className="text-gray-600 text-sm">
                      Please provide detailed information about the community
                      issue you wish to report
                    </p>
                  </div>

                  {/* Evidence Upload */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2 uppercase tracking-wide">
                      Evidence Documentation
                      <span className="text-red-600 ml-1">*</span>
                      {image && (
                        <span className="text-green-600 text-xs font-normal normal-case ml-2">
                          ✓ Uploaded
                        </span>
                      )}
                    </label>
                    <p className="text-xs text-gray-500 mb-3">
                      Please upload clear photographic evidence of the issue
                      (Required)
                    </p>

                    {!image ? (
                      <div className="relative border-2 border-dashed border-gray-300 rounded p-8 text-center bg-gray-50 hover:border-[#003865] hover:bg-gray-100 transition-colors cursor-pointer">
                        <input
                          type="file"
                          name="issueImage"
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                          onChange={handleImageUpload}
                          accept="image/*"
                        />
                        <div className="pointer-events-none relative z-0">
                          <div className="w-16 h-16 mx-auto mb-4 bg-[#003865] rounded flex items-center justify-center">
                            <Upload className="w-8 h-8 text-white" />
                          </div>
                          <p className="text-gray-800 font-semibold mb-2">
                            Upload Evidence Photo
                          </p>
                          <p className="text-gray-600 text-sm">
                            Click to upload clear photographic evidence of the
                            issue
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="border-2 border-green-200 bg-green-50 p-4 rounded">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-green-600 rounded flex items-center justify-center">
                              <CheckCircle className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900 text-sm">
                                {image.name}
                              </p>
                              <p className="text-xs text-gray-600">
                                {(image.size / 1024 / 1024).toFixed(2)} MB •
                                Ready for submission
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={removeImage}
                            className="text-red-600 hover:text-red-800 p-2 rounded hover:bg-red-50 transition-colors border border-red-200"
                            title="Remove image"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="mt-3 flex gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              document
                                .querySelector('input[type="file"]')
                                .click()
                            }
                            className="px-3 py-1.5 text-[#003865] border border-[#003865] rounded hover:bg-[#003865] hover:text-white transition-colors text-xs font-medium flex items-center gap-2"
                          >
                            <Camera className="w-3 h-3" />
                            Change Photo
                          </button>
                          <input
                            type="file"
                            name="issueImageReplace"
                            className="hidden"
                            onChange={handleImageUpload}
                            accept="image/*"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  <div className="relative">
                    <div className="flex items-center justify-between mb-4">
                      <label
                        htmlFor="description-textarea"
                        className="block text-lg font-medium text-gray-900 cursor-pointer"
                      >
                        Detailed Description
                      </label>
                      <span className="text-sm text-gray-500 font-medium">
                        Write yourself, use AI, or record voice
                      </span>
                    </div>

                    {/* Voice Recorder */}
                    <div className="mb-4">
                      <VoiceRecorder
                        onTranscript={(transcript) => {
                          if (transcript) {
                            setDescription((prev) =>
                              prev ? `${prev}\n${transcript}` : transcript
                            );
                          }
                        }}
                        language="ne-NP"
                      />
                    </div>

                    <textarea
                      id="description-textarea"
                      name="description"
                      placeholder="Write your own description of the issue here... OR click 'AI Analysis' button below to generate one from your photo"
                      className="w-full border-2 border-gray-300 p-4 rounded-lg focus:border-blue-600 focus:ring-2 focus:ring-blue-100 focus:outline-none resize-vertical bg-white text-gray-900 cursor-text relative z-10"
                      rows="6"
                      onChange={(e) => setDescription(e.target.value)}
                      value={description}
                      required
                      autoComplete="off"
                    />
                    {!description && (
                      <p className="text-sm text-gray-500 mt-2 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        You can write your own description or use AI to generate
                        one from your photo
                      </p>
                    )}

                    <div className="flex gap-3 mt-3">
                      <button
                        type="button"
                        onClick={generateAI}
                        disabled={loading || !image}
                        className="flex-1 bg-[#003865] text-white py-2.5 px-4 rounded border border-[#003865] hover:bg-[#002D4F] disabled:bg-gray-400 disabled:border-gray-400 disabled:cursor-not-allowed transition-colors text-sm font-semibold flex items-center justify-center gap-2"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Processing...</span>
                          </>
                        ) : (
                          <>
                            <Zap className="w-4 h-4" />
                            <span>Generate AI Description (Optional)</span>
                          </>
                        )}
                      </button>

                      {description && description.trim().length >= 10 && (
                        <button
                          type="button"
                          onClick={enhanceDescription}
                          disabled={loading}
                          className="px-4 py-2.5 bg-green-700 text-white rounded border border-green-700 hover:bg-green-800 disabled:bg-gray-400 disabled:border-gray-400 disabled:cursor-not-allowed transition-colors text-sm font-semibold flex items-center justify-center gap-2"
                          title="Enhance your written description with AI"
                        >
                          <Zap className="w-4 h-4" />
                          <span className="hidden sm:inline">Enhance</span>
                        </button>
                      )}
                    </div>

                    {/* Show AI-generated description as suggestion if user already has text */}
                    {showAIAnalysis &&
                      aiAnalysis?.aiDescription &&
                      description &&
                      description.trim().length >= 10 && (
                        <div className="mt-4 p-4 bg-blue-50 border-2 border-blue-200 rounded-xl">
                          <div className="flex items-start justify-between mb-2">
                            <p className="text-sm font-semibold text-blue-900 flex items-center gap-2">
                              <Zap className="w-4 h-4" />
                              AI Generated Description (Suggestion):
                            </p>
                            <button
                              type="button"
                              onClick={() =>
                                setDescription(aiAnalysis.aiDescription)
                              }
                              className="text-xs bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                            >
                              Use This
                            </button>
                          </div>
                          <p className="text-sm text-gray-700 italic">
                            {aiAnalysis.aiDescription}
                          </p>
                        </div>
                      )}

                    {/* AI Analysis Insights Panel */}
                    {showAIAnalysis && aiAnalysis && (
                      <div className="mt-4 bg-blue-50 border-l-4 border-[#003865] p-4 rounded">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-sm font-bold text-[#003865] uppercase tracking-wide flex items-center gap-2">
                            <Zap className="w-4 h-4" />
                            AI Analysis Insights
                          </h3>
                          <button
                            type="button"
                            onClick={() => setShowAIAnalysis(false)}
                            className="text-gray-500 hover:text-gray-700"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {/* Category Suggestions */}
                          {aiAnalysis.categories &&
                            aiAnalysis.categories.length > 0 && (
                              <div className="bg-white border border-gray-200 p-3 rounded">
                                <p className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                                  Suggested Categories
                                </p>
                                <div className="space-y-2">
                                  {aiAnalysis.categories
                                    .slice(0, 3)
                                    .map((cat, idx) => (
                                      <button
                                        key={idx}
                                        type="button"
                                        onClick={() =>
                                          setSelectedCategory(cat.category)
                                        }
                                        className={`w-full text-left px-2 py-1.5 rounded border text-xs transition-colors ${
                                          selectedCategory === cat.category
                                            ? "bg-[#003865] text-white border-[#003865]"
                                            : "bg-white border-gray-300 hover:border-[#003865] hover:bg-gray-50"
                                        }`}
                                      >
                                        <div className="flex items-center justify-between">
                                          <span className="font-medium">
                                            {cat.category}
                                          </span>
                                          <span
                                            className={`text-xs px-1.5 py-0.5 rounded ${
                                              selectedCategory === cat.category
                                                ? "bg-white/20 text-white"
                                                : "bg-gray-100 text-gray-600"
                                            }`}
                                          >
                                            {Math.round(cat.confidence * 100)}%
                                          </span>
                                        </div>
                                      </button>
                                    ))}
                                </div>
                              </div>
                            )}

                          {/* Priority & Severity */}
                          {(aiAnalysis.priority || aiAnalysis.severity) && (
                            <div className="bg-white border border-gray-200 p-3 rounded">
                              <p className="text-xs font-semibold text-gray-700 mb-2 uppercase">
                                Priority & Severity
                              </p>
                              <div className="space-y-2">
                                {aiAnalysis.priority && (
                                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                                    <span className="text-sm text-gray-700">
                                      Priority:
                                    </span>
                                    <span
                                      className={`font-bold text-sm px-3 py-1 rounded-full ${
                                        aiAnalysis.priority === "high"
                                          ? "bg-red-100 text-red-700"
                                          : aiAnalysis.priority === "medium"
                                          ? "bg-yellow-100 text-yellow-700"
                                          : "bg-blue-100 text-blue-700"
                                      }`}
                                    >
                                      {aiAnalysis.priority.toUpperCase()}
                                    </span>
                                  </div>
                                )}
                                {aiAnalysis.severity && (
                                  <div className="p-2 bg-gray-50 rounded-lg">
                                    <div className="flex items-center justify-between mb-1">
                                      <span className="text-sm text-gray-700">
                                        Severity:
                                      </span>
                                      <span
                                        className={`font-bold text-xs px-2 py-1 rounded-full ${
                                          aiAnalysis.severity.severity ===
                                          "critical"
                                            ? "bg-red-100 text-red-700"
                                            : aiAnalysis.severity.severity ===
                                              "high"
                                            ? "bg-orange-100 text-orange-700"
                                            : aiAnalysis.severity.severity ===
                                              "moderate"
                                            ? "bg-yellow-100 text-yellow-700"
                                            : "bg-blue-100 text-blue-700"
                                        }`}
                                      >
                                        {aiAnalysis.severity.severity?.toUpperCase()}
                                      </span>
                                    </div>
                                    {aiAnalysis.severity.reasoning && (
                                      <p className="text-xs text-gray-600 mt-1">
                                        {aiAnalysis.severity.reasoning}
                                      </p>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Tags */}
                          {aiAnalysis.tags && aiAnalysis.tags.length > 0 && (
                            <div className="bg-white border border-gray-200 p-3 rounded md:col-span-2">
                              <p className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                                Suggested Tags
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {aiAnalysis.tags.map((tag, idx) => (
                                  <span
                                    key={idx}
                                    className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs font-medium border border-gray-300"
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Step 2: Location Information */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="border-b border-gray-200 pb-4">
                    <h2 className="text-xl font-bold text-[#003865] mb-2">
                      Location Specification
                    </h2>
                    <p className="text-gray-600 text-sm">
                      Precise location information is required for efficient
                      issue resolution
                    </p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {/* Municipality Selection */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2 uppercase tracking-wide">
                        Municipality
                        <span className="text-red-600 ml-1">*</span>
                      </label>
                      <select
                        className="w-full border border-gray-300 p-2.5 rounded focus:border-[#003865] focus:ring-1 focus:ring-[#003865] focus:outline-none bg-white text-sm"
                        value={selectedMunicipality}
                        onChange={handleMunicipalityChange}
                        required
                      >
                        <option value="">Select municipality</option>
                        {getAllMunicipalities().map((municipality) => (
                          <option key={municipality} value={municipality}>
                            {municipality}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Ward Selection */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2 uppercase tracking-wide">
                        Municipal Ward
                        <span className="text-red-600 ml-1">*</span>
                      </label>
                      <select
                        className="w-full border border-gray-300 p-2.5 rounded focus:border-[#003865] focus:ring-1 focus:ring-[#003865] focus:outline-none bg-white text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                        value={selectedWard}
                        onChange={handleWardChange}
                        disabled={!selectedMunicipality}
                        required
                      >
                        <option value="">
                          {selectedMunicipality
                            ? "Select ward number"
                            : "Select municipality first"}
                        </option>
                        {selectedMunicipality &&
                          getWardsByMunicipality(selectedMunicipality).map(
                            (ward) => (
                              <option key={ward} value={ward}>
                                {ward}
                              </option>
                            )
                          )}
                      </select>
                    </div>

                    {/* Category Selection */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2 uppercase tracking-wide">
                        Issue Classification
                        <span className="text-red-600 ml-1">*</span>
                      </label>
                      <select
                        className="w-full border border-gray-300 p-2.5 rounded focus:border-[#003865] focus:ring-1 focus:ring-[#003865] focus:outline-none bg-white text-sm"
                        value={selectedCategory}
                        onChange={handleCategoryChange}
                        required
                      >
                        <option value="">Select issue category</option>
                        {categories.map((category) => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Location Method Selection */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2 uppercase tracking-wide">
                      Location Identification Method
                      <span className="text-red-600 ml-1">*</span>
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          console.log("🔘 GPS Button clicked!");
                          getCurrentLocationDirect(e);
                        }}
                        disabled={gettingLocation}
                        className={`p-4 border-2 rounded transition-colors text-left ${
                          gettingLocation
                            ? "border-[#003865] bg-blue-50 cursor-wait"
                            : lat && lng
                            ? "border-green-500 bg-green-50 hover:border-green-600 hover:bg-green-100"
                            : "border-gray-300 hover:border-[#003865] hover:bg-gray-50"
                        } disabled:opacity-70 disabled:cursor-not-allowed`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-12 h-12 rounded flex items-center justify-center transition-colors ${
                              gettingLocation
                                ? "bg-[#003865]"
                                : lat && lng
                                ? "bg-green-600"
                                : "bg-gray-200"
                            }`}
                          >
                            {gettingLocation ? (
                              <Loader2 className="w-6 h-6 text-white animate-spin" />
                            ) : lat && lng ? (
                              <CheckCircle className="w-6 h-6 text-white" />
                            ) : (
                              <Navigation className="w-6 h-6 text-[#003865]" />
                            )}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 text-sm mb-1">
                              Current Location (GPS)
                            </h3>
                            <p className="text-xs text-gray-600">
                              {gettingLocation
                                ? "Requesting location permission..."
                                : lat && lng
                                ? "Location retrieved! Click to update"
                                : "Click to use device GPS for precise coordinates"}
                            </p>
                            {lat && lng && !gettingLocation && (
                              <p className="text-xs text-green-700 mt-1 font-medium">
                                ✓ Lat: {parseFloat(lat).toFixed(6)}, Lng: {parseFloat(lng).toFixed(6)}
                              </p>
                            )}
                          </div>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setShowMap(!showMap)}
                        className={`p-4 border-2 rounded transition-colors text-left ${
                          showMap
                            ? "border-[#003865] bg-blue-50"
                            : "border-gray-300 hover:border-[#003865] hover:bg-gray-50"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-12 h-12 rounded flex items-center justify-center ${
                              showMap ? "bg-[#003865]" : "bg-gray-200"
                            }`}
                          >
                            <MapIcon
                              className={`w-6 h-6 ${
                                showMap ? "text-white" : "text-[#003865]"
                              }`}
                            />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 text-sm mb-1">
                              Map Selection
                            </h3>
                            <p className="text-xs text-gray-600">
                              {showMap
                                ? "Map is visible - Click to hide"
                                : "Select location on interactive map"}
                            </p>
                          </div>
                        </div>
                      </button>
                    </div>
                  </div>

                  {showMap && (
                    <MapPicker
                      lat={lat}
                      lng={lng}
                      setLat={setLat}
                      setLng={setLng}
                      setLocationName={setLocationName}
                    />
                  )}
                </div>
              )}

              {/* Step 3: Verification */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="border-b border-gray-200 pb-4">
                    <h2 className="text-xl font-bold text-[#003865] mb-2">
                      Report Verification
                    </h2>
                    <p className="text-gray-600 text-sm">
                      Please review and confirm your issue report details before
                      submission
                    </p>
                  </div>

                  <div className="bg-gray-50 border border-gray-200 p-5 space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-sm font-semibold text-[#003865] uppercase tracking-wide mb-3 border-b border-gray-300 pb-2">
                          Issue Information
                        </h3>
                        <div className="space-y-3">
                          <div>
                            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                              Category
                            </label>
                            <p className="text-sm text-gray-900 mt-1 font-medium">
                              {selectedCategory || "Not specified"}
                            </p>
                          </div>
                          <div>
                            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                              Ward
                            </label>
                            <p className="text-sm text-gray-900 mt-1 font-medium">
                              {selectedWard
                                ? `Ward ${selectedWard}`
                                : "Not specified"}
                            </p>
                          </div>
                          <div>
                            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                              Evidence File
                            </label>
                            <p className="text-sm text-gray-900 mt-1 font-medium">
                              {image ? image.name : "No file uploaded"}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-[#003865] uppercase tracking-wide mb-3 border-b border-gray-300 pb-2">
                          Location Details
                        </h3>
                        <div className="space-y-3">
                          <div>
                            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                              Location Name
                            </label>
                            <p className="text-sm text-gray-900 mt-1 font-medium">
                              {locationName || "Not specified"}
                            </p>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="text-sm font-medium text-gray-600">
                                Latitude
                              </label>
                              <p className="text-gray-900 font-mono text-sm">
                                {lat || "Not set"}
                              </p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-gray-600">
                                Longitude
                              </label>
                              <p className="text-gray-900 font-mono text-sm">
                                {lng || "Not set"}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-gray-200 pt-6">
                      <h3 className="font-semibold text-gray-900 mb-3">
                        Issue Description
                      </h3>
                      <p className="text-gray-700 bg-white p-4 rounded border border-gray-200">
                        {description || "No description provided"}
                      </p>
                    </div>

                    {/* Anonymous Option */}
                    <div className="border-t border-gray-200 pt-6">
                      <label className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={isAnonymous}
                          onChange={(e) => setIsAnonymous(e.target.checked)}
                          className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 mt-1"
                        />
                        <div>
                          <span className="font-semibold text-gray-900">
                            Submit as Anonymous Report
                          </span>
                          <p className="text-sm text-gray-600 mt-1">
                            Your personal information will not be recorded.
                            Report tracking will be available through reference
                            number.
                          </p>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Submission */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <div className="border-b border-gray-200 pb-4">
                    <h2 className="text-xl font-bold text-[#003865] mb-2">
                      Final Review & Submission
                    </h2>
                    <p className="text-gray-600 text-sm">
                      Review your information below and click Submit Report to
                      finalize your submission
                    </p>
                  </div>

                  <div className="bg-blue-50 border-l-4 border-[#003865] p-5">
                    <h3 className="font-semibold text-[#003865] mb-3 text-sm uppercase tracking-wide">
                      Submission Information
                    </h3>
                    <ul className="text-sm text-gray-700 space-y-1.5 list-disc list-inside">
                      <li>
                        Issue will be processed within 48 hours of submission
                      </li>
                      <li>
                        Reference number will be provided upon successful
                        submission
                      </li>
                      <li>
                        Progress updates available through the tracking system
                      </li>
                      {isAnonymous && (
                        <li>Your submission has been recorded anonymously</li>
                      )}
                    </ul>
                  </div>

                  <div className="bg-gray-50 border border-gray-200 p-4 rounded">
                    <p className="text-xs text-gray-600 text-center">
                      By submitting this report, you acknowledge that the
                      information provided is accurate to the best of your
                      knowledge.
                    </p>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center pt-6 border-t border-gray-200 mt-6 gap-3">
                <button
                  type="button"
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 rounded hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white transition-colors text-sm font-semibold flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>

                {currentStep < 4 ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="px-8 py-2.5 bg-[#003865] text-white rounded border border-[#003865] hover:bg-[#002D4F] transition-colors text-sm font-semibold flex items-center justify-center gap-2"
                  >
                    <span>Continue</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-8 py-2.5 bg-green-700 text-white rounded border border-green-700 hover:bg-green-800 disabled:bg-gray-400 disabled:border-gray-400 disabled:cursor-not-allowed transition-colors text-sm font-semibold flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        <span>Submit Report</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* QR Code Scanner Modal */}
        {showQRScanner && (
          <QRCodeScanner
            onScan={(data) => {
              // Parse QR code data (assuming JSON format)
              try {
                const parsed = JSON.parse(data);
                if (parsed.municipality)
                  setSelectedMunicipality(parsed.municipality);
                if (parsed.category) setSelectedCategory(parsed.category);
                if (parsed.ward) setSelectedWard(parsed.ward);
                if (parsed.locationName) setLocationName(parsed.locationName);
                if (parsed.lat) setLat(parsed.lat);
                if (parsed.lng) setLng(parsed.lng);
                success("QR Code scanned! Form fields filled automatically.");
              } catch (e) {
                // If not JSON, treat as location name
                setLocationName(data);
                info("QR Code scanned. Location name added.");
              }
              setShowQRScanner(false);
            }}
            onClose={() => setShowQRScanner(false)}
          />
        )}

        {/* Footer Note */}
        <div className="text-center mt-6 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            Rupandehi District Administration Office • Public Grievance
            Management System
          </p>
          <p className="text-xs text-gray-400 mt-1">
            नेपाल सरकार | Government of Nepal
          </p>
        </div>
      </div>
    </div>
  );
}
