import { useState } from "react";
import { useTranslation } from "react-i18next";
import api from "../api/axios";
import MapPicker from "../components/MapPicker";
import { categories } from "../data/categories";
import { getAllWards, getLocationsByWard } from "../data/rupandehiWards";

export default function ReportIssue() {
  const { t } = useTranslation();
  const [image, setImage] = useState(null);
  const [description, setDescription] = useState("");
  const [locationName, setLocationName] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedWard, setSelectedWard] = useState("");
  const [showMap, setShowMap] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
    }
  };

  const removeImage = () => {
    setImage(null);
  };

  const generateAI = async () => {
    if (!image) {
      alert("Please upload an image document first");
      return;
    }

    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("image", image);
      const { data } = await api.post("/issues/ai-generate", fd);
      setDescription(data.aiDescription || "");
    } catch (error) {
      console.error("AI generation error:", error);
      alert("Failed to generate description. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
    setSelectedWard("");
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

  const getCurrentLocationDirect = () => {
    setGettingLocation(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setLat(latitude);
          setLng(longitude);
          setGettingLocation(false);

          fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
          )
            .then((res) => res.json())
            .then((data) => {
              if (data.display_name) {
                setLocationName(data.display_name);
              }
            })
            .catch((err) => console.error("Geocoding error:", err));

          setShowMap(true);
        },
        (error) => {
          console.error("Error getting location:", error);
          alert(
            "Unable to retrieve your location. Please ensure location services are enabled in your browser settings."
          );
          setGettingLocation(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    } else {
      alert("Geolocation services are not supported by your browser");
      setGettingLocation(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!image) {
      alert("Please upload an image before submitting");
      return;
    }
    if (!description.trim()) {
      alert("Please provide a description of the issue");
      return;
    }
    if (!locationName.trim() || !lat || !lng) {
      alert("Please provide complete location information");
      return;
    }

    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("image", image);
      fd.append("description", description);
      fd.append("category", selectedCategory || "");
      fd.append("ward", selectedWard || "");
      fd.append("locationName", locationName);
      fd.append("lat", lat);
      fd.append("lng", lng);
      fd.append("isAnonymous", isAnonymous);

      await api.post("/issues/create", fd);
      alert(
        isAnonymous
          ? "Issue report submitted successfully. Your submission has been recorded anonymously."
          : "Issue report submitted successfully. Thank you for your contribution to community improvement."
      );

      // Reset form
      setImage(null);
      setDescription("");
      setSelectedCategory("");
      setSelectedWard("");
      setLocationName("");
      setLat("");
      setLng("");
      setIsAnonymous(false);
      setCurrentStep(1);
    } catch (error) {
      console.error("Submission error:", error);
      alert(
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
        alert("Please upload an image before proceeding");
        return;
      }
      if (!description.trim()) {
        alert("Please provide a description before proceeding");
        return;
      }
    }
    if (currentStep === 2) {
      if (!selectedCategory || !selectedWard || !locationName || !lat || !lng) {
        alert("Please complete all location information before proceeding");
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
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-blue-800 rounded-full flex items-center justify-center mr-4">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <div className="text-left">
              <h1 className="text-3xl font-bold text-gray-900">
                Public Issue Reporting System
              </h1>
              <p className="text-gray-600 mt-1">
                Municipal Corporation - Citizen Service Portal
              </p>
            </div>
          </div>
          <div className="w-32 h-1 bg-blue-800 mx-auto rounded-full"></div>
        </div>

        {/* Progress Indicator */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                    step.completed || currentStep === step.number
                      ? "bg-blue-800 border-blue-800 text-white"
                      : "border-gray-300 text-gray-500"
                  } font-semibold`}
                >
                  {step.completed ? (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : (
                    step.number
                  )}
                </div>
                <span
                  className={`ml-3 text-sm font-medium ${
                    currentStep === step.number
                      ? "text-blue-800"
                      : "text-gray-600"
                  }`}
                >
                  {step.title}
                </span>
                {index < steps.length - 1 && (
                  <div
                    className={`w-16 h-0.5 mx-4 ${
                      step.completed ? "bg-blue-800" : "bg-gray-300"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Main Form Container */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Form Content */}
          <div className="p-8">
            <form onSubmit={handleSubmit}>
              {/* Step 1: Issue Details */}
              {currentStep === 1 && (
                <div className="space-y-8">
                  <div className="border-b border-gray-200 pb-6">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                      Issue Documentation
                    </h2>
                    <p className="text-gray-600">
                      Please provide detailed information about the community
                      issue
                    </p>
                  </div>

                  {/* Evidence Upload - FIXED VERSION */}
                  <div>
                    <label className="block text-lg font-medium text-gray-900 mb-4">
                      Evidence Documentation{" "}
                      {image && (
                        <span className="text-green-600 text-sm">
                          ✓ Uploaded
                        </span>
                      )}
                    </label>

                    {!image ? (
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors bg-gray-50 cursor-pointer">
                        <input
                          type="file"
                          className="absolute opacity-0 w-full h-full cursor-pointer"
                          onChange={handleImageUpload}
                          accept="image/*"
                        />
                        <div className="pointer-events-none">
                          <svg
                            className="w-16 h-16 text-gray-400 mx-auto mb-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                          <p className="text-gray-700 font-medium mb-2 text-lg">
                            Upload Evidence Photo
                          </p>
                          <p className="text-gray-500">
                            Click to upload clear photographic evidence of the
                            issue
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="border-2 border-green-200 border-dashed rounded-lg p-6 bg-green-50">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center">
                              <svg
                                className="w-8 h-8 text-green-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              </svg>
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">
                                {image.name}
                              </p>
                              <p className="text-sm text-gray-600">
                                {(image.size / 1024 / 1024).toFixed(2)} MB •
                                Ready for submission
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={removeImage}
                            className="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50 transition-colors"
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        </div>
                        <div className="mt-4 flex gap-3">
                          <button
                            type="button"
                            onClick={() =>
                              document
                                .querySelector('input[type="file"]')
                                .click()
                            }
                            className="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors text-sm font-medium"
                          >
                            Change Photo
                          </button>
                          <input
                            type="file"
                            className="hidden"
                            onChange={handleImageUpload}
                            accept="image/*"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-lg font-medium text-gray-900 mb-4">
                      Detailed Description
                    </label>
                    <textarea
                      placeholder="Provide a comprehensive description of the issue, including nature, impact, and any relevant observations..."
                      className="w-full border border-gray-300 p-4 rounded-lg focus:border-blue-600 focus:ring-2 focus:ring-blue-100 focus:outline-none resize-none bg-white"
                      rows="5"
                      onChange={(e) => setDescription(e.target.value)}
                      value={description}
                      required
                    />

                    <button
                      type="button"
                      onClick={generateAI}
                      disabled={loading || !image}
                      className="w-full mt-4 bg-blue-700 text-white py-3 rounded-lg hover:bg-blue-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition font-medium flex items-center justify-center gap-3"
                    >
                      {loading ? (
                        <>
                          <svg
                            className="animate-spin h-5 w-5 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          Processing Documentation...
                        </>
                      ) : (
                        <>
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M13 10V3L4 14h7v7l9-11h-7z"
                            />
                          </svg>
                          Generate Professional Description
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Location Information */}
              {currentStep === 2 && (
                <div className="space-y-8">
                  <div className="border-b border-gray-200 pb-6">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                      Location Specification
                    </h2>
                    <p className="text-gray-600">
                      Precise location information is required for efficient
                      issue resolution
                    </p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Category Selection */}
                    <div>
                      <label className="block text-lg font-medium text-gray-900 mb-4">
                        Issue Classification
                      </label>
                      <select
                        className="w-full border border-gray-300 p-4 rounded-lg focus:border-blue-600 focus:ring-2 focus:ring-blue-100 focus:outline-none bg-white"
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

                    {/* Ward Selection */}
                    <div>
                      <label className="block text-lg font-medium text-gray-900 mb-4">
                        Municipal Ward
                      </label>
                      <select
                        className="w-full border border-gray-300 p-4 rounded-lg focus:border-blue-600 focus:ring-2 focus:ring-blue-100 focus:outline-none bg-white"
                        value={selectedWard}
                        onChange={handleWardChange}
                        required
                      >
                        <option value="">Select ward number</option>
                        {getAllWards().map((ward) => (
                          <option key={ward} value={ward}>
                            Ward {ward}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Location Method Selection */}
                  <div>
                    <label className="block text-lg font-medium text-gray-900 mb-4">
                      Location Identification Method
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={getCurrentLocationDirect}
                        disabled={gettingLocation}
                        className="p-6 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                            <svg
                              className="w-6 h-6 text-green-600"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                            </svg>
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              Current Location
                            </h3>
                            <p className="text-sm text-gray-600 mt-1">
                              Use device GPS for precise coordinates
                            </p>
                          </div>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setShowMap(!showMap)}
                        className="p-6 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <svg
                              className="w-6 h-6 text-blue-600"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                              />
                            </svg>
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              Map Selection
                            </h3>
                            <p className="text-sm text-gray-600 mt-1">
                              Select location on interactive map
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
                <div className="space-y-8">
                  <div className="border-b border-gray-200 pb-6">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                      Report Verification
                    </h2>
                    <p className="text-gray-600">
                      Review and confirm your issue report details
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-3">
                          Issue Information
                        </h3>
                        <div className="space-y-3">
                          <div>
                            <label className="text-sm font-medium text-gray-600">
                              Category
                            </label>
                            <p className="text-gray-900">
                              {selectedCategory || "Not specified"}
                            </p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-600">
                              Ward
                            </label>
                            <p className="text-gray-900">
                              {selectedWard || "Not specified"}
                            </p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-600">
                              Evidence File
                            </label>
                            <p className="text-gray-900">
                              {image ? image.name : "No file uploaded"}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-3">
                          Location Details
                        </h3>
                        <div className="space-y-3">
                          <div>
                            <label className="text-sm font-medium text-gray-600">
                              Location Name
                            </label>
                            <p className="text-gray-900">
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
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg
                      className="w-10 h-10 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                    Ready to Submit
                  </h2>
                  <p className="text-gray-600 max-w-md mx-auto mb-8">
                    Your issue report is complete and ready for submission to
                    municipal authorities.
                  </p>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 max-w-md mx-auto">
                    <h3 className="font-semibold text-blue-900 mb-3">
                      Submission Summary
                    </h3>
                    <div className="text-sm text-blue-800 space-y-2">
                      <p>• Issue will be processed within 48 hours</p>
                      <p>• Reference number will be provided upon submission</p>
                      <p>
                        • Progress updates available through tracking system
                      </p>
                      {isAnonymous && <p>• Submitted as anonymous report</p>}
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-8 border-t border-gray-200 mt-8">
                <button
                  type="button"
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  className="px-8 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium"
                >
                  Previous
                </button>

                {currentStep < 4 ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="px-8 py-3 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition font-medium"
                  >
                    Continue
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition font-medium"
                  >
                    {loading ? "Submitting..." : "Submit Report"}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Footer Note */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">
            Municipal Corporation Public Service Portal • Secure Issue Reporting
            System
          </p>
        </div>
      </div>
    </div>
  );
}
