import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import enTranslations from "./locales/en.json?url";
import npTranslations from "./locales/np.json?url";

// Load JSON files dynamically
const loadTranslations = async () => {
  const [enRes, npRes] = await Promise.all([
    fetch(enTranslations).then((res) => res.json()),
    fetch(npTranslations).then((res) => res.json()),
  ]);
  return { en: enRes, np: npRes };
};

// For now, use inline translations to avoid async loading issues
const enTranslationsData = {
  common: {
    home: "Home",
    about: "About",
    faq: "FAQ",
    contact: "Contact",
    stats: "Stats",
    feed: "Feed",
    report: "Report",
    heatmap: "Heatmap",
    leaderboard: "Leaderboard",
    profile: "Profile",
    admin: "Admin",
    login: "Login",
    register: "Register",
    logout: "Logout",
    submit: "Submit",
    cancel: "Cancel",
    save: "Save",
    delete: "Delete",
    edit: "Edit",
    view: "View",
    loading: "Loading...",
    error: "Error",
    success: "Success",
    close: "Close"
  },
  navbar: {
    title: "Rupandehi Portal",
    welcome: "Rupandehi Public Issue Reporting Portal"
  },
  hero: {
    title: "Report Issues in Rupandehi District",
    subtitle: "Together, let's build a cleaner, safer, smarter Rupandehi.",
    getStarted: "Get Started",
    learnMore: "Learn More"
  },
  reportIssue: {
    title: "Report an Issue",
    uploadImage: "Upload Image *",
    description: "Description",
    generateAI: "🤖 Generate Description with AI",
    uploadImageFirst: "Please upload an image first to use AI features",
    aiError: "Failed to generate AI description. Please try again or write manually.",
    selectCategory: "Select Category *",
    selectWard: "Select Ward *",
    selectLocation: "Select Location *",
    locationName: "Location Name",
    latitude: "Latitude",
    longitude: "Longitude",
    useCurrentLocation: "📍 Use My Current Location (GPS)",
    chooseFromList: "🏢 Choose from List",
    useMap: "🗺️ Use Map",
    selectedLocation: "Selected Location Details",
    postAnonymously: "🔒 Post Anonymously",
    anonymousNote: "Your name will be hidden from public view, but admins can still see who posted this issue.",
    submitIssue: "📤 Submit Issue",
    submitIssueAnonymously: "📤 Submit Issue (Anonymously)",
    issueSubmitted: "Issue submitted!",
    issueSubmittedAnonymously: "Issue submitted anonymously!"
  },
  categories: {
    roadManagement: "Road Management",
    waste: "Waste",
    electricity: "Electricity",
    water: "Water",
    other: "Other"
  },
  status: {
    pending: "Pending",
    inProgress: "In Progress",
    resolved: "Resolved",
    all: "All"
  },
  issueDetails: {
    status: "Status",
    location: "Location",
    reportedBy: "Reported By",
    reportedAt: "Reported At",
    anonymous: "🔒 Anonymous",
    likeIssue: "Like this issue",
    youLiked: "You liked this",
    comments: "💬 Comments",
    writeComment: "Write a comment... (Press Enter to post)",
    post: "Post",
    noComments: "💬 No comments yet.",
    beFirst: "Be the first to comment!",
    successStory: "Success Story!",
    issueResolved: "This issue has been resolved! See the before and after comparison below.",
    before: "📷 Before",
    after: "✨ After",
    completedOn: "Completed on",
    shareSuccessStory: "Share Success Story",
    leaveReview: "⭐ Leave a Review",
    reviewNote: "Help us improve by rating how well this issue was resolved.",
    rating: "Rating *",
    comment: "Comment (Optional)",
    shareThoughts: "Share your thoughts about how the issue was resolved...",
    submitReview: "Submit Review",
    updateReview: "Update Review",
    reviews: "⭐ Reviews",
    excellent: "Excellent! 🌟",
    veryGood: "Very Good! 👍",
    good: "Good! 😊",
    fair: "Fair ⚠️",
    poor: "Poor 😞"
  },
  admin: {
    panel: "🛠️ Admin Panel",
    manageIssues: "Manage and track all reported issues from users",
    filterByStatus: "Filter by Status",
    filterByCategory: "Filter by Category / Department",
    filterByWard: "Filter by Ward",
    activeFilters: "Active Filters:",
    clearAll: "Clear All Filters",
    showing: "Showing",
    of: "of",
    issues: "issues",
    totalIssues: "Total Issues",
    pending: "⏳ Pending",
    inProgress: "🔄 In Progress",
    resolved: "✅ Resolved",
    allCategories: "All Categories",
    allWards: "All Wards",
    reportedBy: "👤 Reported By",
    ward: "🏛️",
    location: "📍",
    upvotes: "❤️",
    comments: "💬",
    date: "📅",
    noIssues: "No issues found",
    updateStatus: "🛠️ Update Status",
    setToPending: "⏳ Set to Pending",
    setToInProgress: "🔄 Set to In Progress",
    markAsResolved: "✅ Mark as Resolved",
    downloadPDF: "📄 Download PDF Report",
    uploadCompletionPhoto: "📸 Upload Completion Photo (After)",
    beforeImage: "📷 Before Image (Original Issue Photo):",
    beforeImageNote: "This is the original image submitted by the reporter. It will automatically be used as the \"before\" photo.",
    afterImage: "After Image * (Upload the completed work photo)",
    uploadPhoto: "📤 Upload Completion Photo",
    uploading: "Uploading...",
    completionPhotos: "🎉 Completion Photos",
    uploadedOn: "Uploaded on",
    reviewsFeedback: "⭐ Reviews & Feedback",
    viewAllReviews: "View All Reviews",
    noReviews: "No reviews yet",
    reviewFor: "Review for:",
    anonymousPost: "🔒 Anonymous Post",
    anonymousNote: "This post is anonymous to the public, but you can see the reporter's details as an admin."
  },
  leaderboard: {
    title: "🏆 Top Contributors",
    subtitle: "Users ranked by their contribution points",
    noContributors: "No contributors yet",
    beFirst: "Be the first to report issues!",
    points: "points",
    howToEarn: "How to earn points:",
    reportIssue: "Report a new issue:",
    upvoted: "Your issue gets upvoted:",
    addComment: "Add helpful comments:",
    issueResolved: "Issue gets resolved:",
    bonusPoints: "bonus points"
  },
  profile: {
    title: "Your Profile",
    name: "Name:",
    email: "Email:",
    points: "Points:",
    badge: "Your Badge:",
    shareAchievement: "🎉 Share Your Achievement",
    shareNote: "Let your friends know about your contribution to the community!"
  },
  notifications: {
    title: "Notifications",
    markAllRead: "Mark all as read",
    noNotifications: "No notifications",
    new: "New",
    earlier: "Earlier",
    issueResolved: "🎉 Issue Resolved!",
    issueInProgress: "🔄 Issue In Progress",
    photosUploaded: "📸 Completion Photos Uploaded!"
  },
  heatmap: {
    street: "🗺️ Street",
    satellite: "🛰️ Satellite",
    statistics: "📊 Statistics",
    totalIssues: "Total Issues:",
    locations: "Locations:",
    heatIntensity: "🔥 Heat Intensity",
    low: "Low (1-2 issues)",
    medium: "Medium (3-5 issues)",
    high: "High (6+ issues)",
    noIssues: "No issues found",
    noIssuesDesc: "There are no reported issues to display on the heatmap yet."
  },
  feed: {
    title: "Public Issues",
    status: "Status:",
    resolved: "✅ Resolved"
  },
  advancedReporting: {
    hero: {
      title: "Advanced Reporting Features",
      subtitle: "Powerful tools and analytics to track, analyze, and manage community issues effectively"
    },
    features: {
      title: "Key Features"
    },
    analytics: {
      title: "Real-time Analytics",
      description: "Comprehensive dashboards with visual charts and statistics"
    },
    filtering: {
      title: "Advanced Filtering",
      description: "Filter by category, location, status, date, and more"
    },
    reports: {
      title: "Custom Reports",
      description: "Generate detailed reports for analysis and documentation"
    },
    export: {
      title: "Data Export",
      description: "Export data in multiple formats (PDF, CSV, Excel)"
    },
    timeline: {
      title: "Timeline Tracking",
      description: "Track issue progress from report to resolution"
    },
    search: {
      title: "Smart Search",
      description: "Quick search across all issues with advanced filters"
    },
    capabilities: {
      title: "System Capabilities",
      data: {
        title: "Data Management",
        item1: "Real-time data synchronization",
        item2: "Historical data tracking",
        item3: "Automated data backup",
        item4: "Data integrity checks"
      },
      cloud: {
        title: "Cloud Integration",
        item1: "Secure cloud storage",
        item2: "Multi-device access",
        item3: "Automatic sync",
        item4: "Scalable infrastructure"
      },
      mobile: {
        title: "Mobile Support",
        item1: "Responsive design",
        item2: "Mobile app compatibility",
        item3: "Offline mode support",
        item4: "Push notifications"
      }
    },
    benefits: {
      title: "Benefits",
      efficiency: {
        title: "Improved Efficiency",
        description: "Streamline workflows and reduce manual processes"
      },
      insights: {
        title: "Better Insights",
        description: "Make data-driven decisions with comprehensive analytics"
      },
      speed: {
        title: "Faster Response",
        description: "Quick access to information for faster issue resolution"
      },
      security: {
        title: "Enhanced Security",
        description: "Secure data handling with role-based access control"
      }
    },
    cta: {
      title: "Ready to Get Started?",
      description: "Start using advanced reporting features today",
      button1: "Report an Issue",
      button2: "View Statistics"
    }
  },
  makeDifference: {
    hero: {
      title: "Ready to Make a Difference?",
      subtitle: "Join thousands of citizens working together to improve Rupandehi District",
      cta: "Get Started Now"
    },
    impact: {
      title: "Our Impact"
    },
    stats: {
      resolved: "Issues Resolved",
      users: "Active Users",
      impacted: "People Impacted",
      satisfaction: "Satisfaction Rate"
    },
    ways: {
      title: "Ways You Can Help",
      report: {
        title: "Report Issues",
        description: "Report problems you see in your community - roads, waste, electricity, water, and more",
        action: "Report Now"
      },
      support: {
        title: "Support Issues",
        description: "Upvote and comment on issues that matter to you and your community",
        action: "View Feed"
      },
      share: {
        title: "Share Success Stories",
        description: "Share before/after photos and success stories on social media to inspire others",
        action: "View Leaderboard"
      },
      community: {
        title: "Engage with Community",
        description: "Track issues on the heatmap and see how your community is improving",
        action: "View Heatmap"
      }
    },
    stories: {
      title: "Success Stories",
      story1: {
        title: "Community Cleanup Initiative",
        description: "50+ waste spots cleared in last month through coordinated reporting",
        impact: "15,000+ People Benefited"
      },
      story2: {
        title: "Road Repair Campaign",
        description: "Major potholes fixed across 12 wards within 2 weeks",
        impact: "Improved Safety for All"
      },
      story3: {
        title: "Water Supply Restoration",
        description: "Water supply issues resolved in 8 locations, benefiting thousands",
        impact: "24/7 Water Access Restored"
      }
    },
    cta: {
      title: "Be Part of the Change",
      description: "Every report matters. Together we can build a better Rupandehi.",
      button1: "Join Now",
      button2: "Report an Issue"
    }
  },
  footer: {
    aboutTitle: "About Rupandehi Portal",
    aboutDescription: "A citizen-driven platform for reporting and tracking community issues in Rupandehi District.",
    quickLinks: "Quick Links",
    resources: "Resources",
    advancedReporting: "Advanced Reporting",
    makeDifference: "Make a Difference",
    contactUs: "Contact Us",
    address: "Rupandehi District Office, Butwal, Lumbini Province, Nepal",
    phone: "+977-71-520000",
    email: "info@rupandehi.gov.np",
    website: "www.rupandehi.gov.np",
    copyright: "© {{year}} Rupandehi District. All rights reserved.",
    government: "Government of Nepal",
    district: "Rupandehi District"
  }
};

const npTranslationsData = {
  common: {
    home: "घर",
    about: "बारेमा",
    faq: "बारम्बार सोधिने प्रश्न",
    contact: "सम्पर्क",
    stats: "तथ्याङ्क",
    feed: "फिड",
    report: "रिपोर्ट",
    heatmap: "हिटम्याप",
    leaderboard: "लीडरबोर्ड",
    profile: "प्रोफाइल",
    admin: "प्रशासक",
    login: "लगइन",
    register: "दर्ता",
    logout: "लगआउट",
    submit: "पेश गर्नुहोस्",
    cancel: "रद्द गर्नुहोस्",
    save: "बचत गर्नुहोस्",
    delete: "मेटाउनुहोस्",
    edit: "सम्पादन गर्नुहोस्",
    view: "हेर्नुहोस्",
    loading: "लोड हुँदै...",
    error: "त्रुटि",
    success: "सफलता",
    close: "बन्द गर्नुहोस्"
  },
  navbar: {
    title: "रुपन्देही पोर्टल",
    welcome: "रुपन्देही सार्वजनिक समस्या रिपोर्टिङ प्रणाली"
  },
  hero: {
    title: "रुपन्देही जिल्लामा समस्या रिपोर्ट गर्नुहोस्",
    subtitle: "सफा, सुरक्षित र स्मार्ट रुपन्देही निर्माण गरौँ।",
    getStarted: "सुरु गर्नुहोस्",
    learnMore: "थप जान्नुहोस्"
  },
  reportIssue: {
    title: "समस्या रिपोर्ट गर्नुहोस्",
    uploadImage: "तस्बिर अपलोड गर्नुहोस् *",
    description: "विवरण",
    generateAI: "🤖 AI को साथ विवरण उत्पादन गर्नुहोस्",
    uploadImageFirst: "AI सुविधा प्रयोग गर्न पहिले तस्बिर अपलोड गर्नुहोस्",
    aiError: "AI विवरण उत्पादन गर्न असफल भयो। कृपया पुनः प्रयास गर्नुहोस् वा म्यानुअल रूपमा लेख्नुहोस्।",
    selectCategory: "श्रेणी छान्नुहोस् *",
    selectWard: "वडा छान्नुहोस् *",
    selectLocation: "स्थान छान्नुहोस् *",
    locationName: "स्थानको नाम",
    latitude: "अक्षांश",
    longitude: "देशान्तर",
    useCurrentLocation: "📍 मेरो हालको स्थान प्रयोग गर्नुहोस् (GPS)",
    chooseFromList: "🏢 सूचीबाट छान्नुहोस्",
    useMap: "🗺️ नक्सा प्रयोग गर्नुहोस्",
    selectedLocation: "छानिएको स्थानको विवरण",
    postAnonymously: "🔒 गुमनाम रूपमा पोस्ट गर्नुहोस्",
    anonymousNote: "तपाईंको नाम सार्वजनिक दृश्यबाट लुकाइनेछ, तर प्रशासकहरूले अझै पनि देख्न सक्छन् कि कसले यो समस्या पोस्ट गरेको छ।",
    submitIssue: "📤 समस्या पेश गर्नुहोस्",
    submitIssueAnonymously: "📤 समस्या पेश गर्नुहोस् (गुमनाम)",
    issueSubmitted: "समस्या पेश गरियो!",
    issueSubmittedAnonymously: "समस्या गुमनाम रूपमा पेश गरियो!"
  },
  categories: {
    roadManagement: "सडक व्यवस्थापन",
    waste: "फोहोर",
    electricity: "बिजुली",
    water: "पानी",
    other: "अन्य"
  },
  status: {
    pending: "बाँकी",
    inProgress: "प्रगतिमा",
    resolved: "समाधान भयो",
    all: "सबै"
  },
  issueDetails: {
    status: "स्थिति",
    location: "स्थान",
    reportedBy: "रिपोर्ट गरेको",
    reportedAt: "रिपोर्ट गरिएको मिति",
    anonymous: "🔒 गुमनाम",
    likeIssue: "यो समस्या मन पराउनुहोस्",
    youLiked: "तपाईंले मन पराउनुभयो",
    comments: "💬 टिप्पणीहरू",
    writeComment: "टिप्पणी लेख्नुहोस्... (पोस्ट गर्न Enter थिच्नुहोस्)",
    post: "पोस्ट",
    noComments: "💬 अझै कुनै टिप्पणी छैन।",
    beFirst: "पहिलो टिप्पणी गर्नुहोस्!",
    successStory: "सफलताको कथा!",
    issueResolved: "यो समस्या समाधान भएको छ! तलको तुलना हेर्नुहोस्।",
    before: "📷 पहिले",
    after: "✨ पछि",
    completedOn: "पूरा भएको मिति",
    shareSuccessStory: "सफलताको कथा साझा गर्नुहोस्",
    leaveReview: "⭐ समीक्षा दिनुहोस्",
    reviewNote: "समस्या कति राम्रोसँग समाधान भयो भनी मूल्याङ्कन गरेर हामीलाई सुधार गर्न मद्दत गर्नुहोस्।",
    rating: "मूल्याङ्कन *",
    comment: "टिप्पणी (वैकल्पिक)",
    shareThoughts: "समस्या कसरी समाधान भयो भन्ने बारेमा आफ्नो विचार साझा गर्नुहोस्...",
    submitReview: "समीक्षा पेश गर्नुहोस्",
    updateReview: "समीक्षा अपडेट गर्नुहोस्",
    reviews: "⭐ समीक्षाहरू",
    excellent: "उत्कृष्ट! 🌟",
    veryGood: "धेरै राम्रो! 👍",
    good: "राम्रो! 😊",
    fair: "मध्यम ⚠️",
    poor: "नराम्रो 😞"
  },
  admin: {
    panel: "🛠️ प्रशासक प्यानल",
    manageIssues: "प्रयोगकर्ताहरूले रिपोर्ट गरेका सबै समस्याहरू व्यवस्थापन र ट्र्याक गर्नुहोस्",
    filterByStatus: "स्थिति अनुसार फिल्टर गर्नुहोस्",
    filterByCategory: "श्रेणी / विभाग अनुसार फिल्टर गर्नुहोस्",
    filterByWard: "वडा अनुसार फिल्टर गर्नुहोस्",
    activeFilters: "सक्रिय फिल्टरहरू:",
    clearAll: "सबै फिल्टरहरू सफा गर्नुहोस्",
    showing: "देखाउँदै",
    of: "मध्ये",
    issues: "समस्याहरू",
    totalIssues: "कुल समस्याहरू",
    pending: "⏳ बाँकी",
    inProgress: "🔄 प्रगतिमा",
    resolved: "✅ समाधान भयो",
    allCategories: "सबै श्रेणीहरू",
    allWards: "सबै वडाहरू",
    reportedBy: "👤 रिपोर्ट गरेको",
    ward: "🏛️",
    location: "📍",
    upvotes: "❤️",
    comments: "💬",
    date: "📅",
    noIssues: "कुनै समस्या फेला परेन",
    updateStatus: "🛠️ स्थिति अपडेट गर्नुहोस्",
    setToPending: "⏳ बाँकीमा सेट गर्नुहोस्",
    setToInProgress: "🔄 प्रगतिमा सेट गर्नुहोस्",
    markAsResolved: "✅ समाधान भएको रूपमा चिन्ह लगाउनुहोस्",
    downloadPDF: "📄 PDF रिपोर्ट डाउनलोड गर्नुहोस्",
    uploadCompletionPhoto: "📸 पूर्णता तस्बिर अपलोड गर्नुहोस् (पछि)",
    beforeImage: "📷 पहिलेको तस्बिर (मूल समस्या तस्बिर):",
    beforeImageNote: "यो रिपोर्टरले पेश गरेको मूल तस्बिर हो। यो स्वचालित रूपमा \"पहिले\" तस्बिरको रूपमा प्रयोग गरिनेछ।",
    afterImage: "पछिको तस्बिर * (पूरा भएको कामको तस्बिर अपलोड गर्नुहोस्)",
    uploadPhoto: "📤 पूर्णता तस्बिर अपलोड गर्नुहोस्",
    uploading: "अपलोड हुँदै...",
    completionPhotos: "🎉 पूर्णता तस्बिरहरू",
    uploadedOn: "अपलोड गरिएको मिति",
    reviewsFeedback: "⭐ समीक्षा र प्रतिक्रिया",
    viewAllReviews: "सबै समीक्षाहरू हेर्नुहोस्",
    noReviews: "अझै कुनै समीक्षा छैन",
    reviewFor: "समीक्षा:",
    anonymousPost: "🔒 गुमनाम पोस्ट",
    anonymousNote: "यो पोस्ट जनताको लागि गुमनाम छ, तर तपाईं प्रशासकको रूपमा रिपोर्टरको विवरण देख्न सक्नुहुन्छ।"
  },
  leaderboard: {
    title: "🏆 शीर्ष योगदानकर्ताहरू",
    subtitle: "योगदान अङ्क अनुसार क्रमबद्ध प्रयोगकर्ताहरू",
    noContributors: "अझै कुनै योगदानकर्ता छैन",
    beFirst: "पहिलो समस्या रिपोर्ट गर्नुहोस्!",
    points: "अङ्क",
    howToEarn: "अङ्क कसरी कमाउने:",
    reportIssue: "नयाँ समस्या रिपोर्ट गर्नुहोस्:",
    upvoted: "तपाईंको समस्या अपभोट भयो:",
    addComment: "उपयोगी टिप्पणीहरू थप्नुहोस्:",
    issueResolved: "समस्या समाधान भयो:",
    bonusPoints: "बोनस अङ्क"
  },
  profile: {
    title: "तपाईंको प्रोफाइल",
    name: "नाम:",
    email: "इमेल:",
    points: "अङ्क:",
    badge: "तपाईंको ब्याज:",
    shareAchievement: "🎉 तपाईंको उपलब्धि साझा गर्नुहोस्",
    shareNote: "समुदायमा तपाईंको योगदानको बारेमा आफ्ना साथीहरूलाई जानकारी दिनुहोस्!"
  },
  notifications: {
    title: "सूचनाहरू",
    markAllRead: "सबै पढेको रूपमा चिन्ह लगाउनुहोस्",
    noNotifications: "कुनै सूचना छैन",
    new: "नयाँ",
    earlier: "पहिले",
    issueResolved: "🎉 समस्या समाधान भयो!",
    issueInProgress: "🔄 समस्या प्रगतिमा",
    photosUploaded: "📸 पूर्णता तस्बिरहरू अपलोड गरियो!"
  },
  heatmap: {
    street: "🗺️ सडक",
    satellite: "🛰️ उपग्रह",
    statistics: "📊 तथ्याङ्क",
    totalIssues: "कुल समस्याहरू:",
    locations: "स्थानहरू:",
    heatIntensity: "🔥 ताप तीव्रता",
    low: "कम (१-२ समस्याहरू)",
    medium: "मध्यम (३-५ समस्याहरू)",
    high: "उच्च (६+ समस्याहरू)",
    noIssues: "कुनै समस्या फेला परेन",
    noIssuesDesc: "अझै हिटम्यापमा देखाउन कुनै रिपोर्ट गरिएका समस्याहरू छैनन्।"
  },
  feed: {
    title: "सार्वजनिक समस्याहरू",
    status: "स्थिति:",
    resolved: "✅ समाधान भयो"
  },
  advancedReporting: {
    hero: {
      title: "उन्नत रिपोर्टिङ सुविधाहरू",
      subtitle: "समुदायका समस्याहरू प्रभावकारी रूपमा ट्र्याक, विश्लेषण र व्यवस्थापन गर्न शक्तिशाली उपकरणहरू र विश्लेषण"
    },
    features: {
      title: "मुख्य सुविधाहरू"
    },
    analytics: {
      title: "वास्तविक समय विश्लेषण",
      description: "दृश्य चार्ट र तथ्याङ्कहरूसहित व्यापक ड्यासबोर्डहरू"
    },
    filtering: {
      title: "उन्नत फिल्टरिङ",
      description: "श्रेणी, स्थान, स्थिति, मिति र थप अनुसार फिल्टर गर्नुहोस्"
    },
    reports: {
      title: "अनुकूल रिपोर्टहरू",
      description: "विश्लेषण र कागजातका लागि विस्तृत रिपोर्टहरू उत्पादन गर्नुहोस्"
    },
    export: {
      title: "डाटा निर्यात",
      description: "धेरै ढाँचाहरूमा डाटा निर्यात गर्नुहोस् (PDF, CSV, Excel)"
    },
    timeline: {
      title: "समयरेखा ट्र्याकिङ",
      description: "रिपोर्टबाट समाधानसम्म समस्या प्रगति ट्र्याक गर्नुहोस्"
    },
    search: {
      title: "स्मार्ट खोज",
      description: "उन्नत फिल्टरहरूसहित सबै समस्याहरूमा छिटो खोज"
    },
    capabilities: {
      title: "प्रणाली क्षमताहरू",
      data: {
        title: "डाटा व्यवस्थापन",
        item1: "वास्तविक समय डाटा समकालिकरण",
        item2: "ऐतिहासिक डाटा ट्र्याकिङ",
        item3: "स्वचालित डाटा ब्याकअप",
        item4: "डाटा अखण्डता जाँचहरू"
      },
      cloud: {
        title: "क्लाउड एकीकरण",
        item1: "सुरक्षित क्लाउड भण्डारण",
        item2: "बहु-उपकरण पहुँच",
        item3: "स्वचालित समकालिकरण",
        item4: "स्केलेबल अवस्थापना"
      },
      mobile: {
        title: "मोबाइल समर्थन",
        item1: "प्रतिक्रियाशील डिजाइन",
        item2: "मोबाइल एप सुसंगतता",
        item3: "अफलाइन मोड समर्थन",
        item4: "पुश सूचनाहरू"
      }
    },
    benefits: {
      title: "लाभहरू",
      efficiency: {
        title: "सुधारित दक्षता",
        description: "कार्यप्रवाहहरू सुव्यवस्थित गर्नुहोस् र म्यानुअल प्रक्रियाहरू कम गर्नुहोस्"
      },
      insights: {
        title: "राम्रो अन्तर्दृष्टि",
        description: "व्यापक विश्लेषणसहित डाटा-संचालित निर्णयहरू बनाउनुहोस्"
      },
      speed: {
        title: "छिटो प्रतिक्रिया",
        description: "छिटो समस्या समाधानका लागि जानकारीमा छिटो पहुँच"
      },
      security: {
        title: "बढाइएको सुरक्षा",
        description: "भूमिका-आधारित पहुँच नियन्त्रणसहित सुरक्षित डाटा ह्यान्डलिङ"
      }
    },
    cta: {
      title: "सुरु गर्न तयार हुनुहुन्छ?",
      description: "आजै उन्नत रिपोर्टिङ सुविधाहरू प्रयोग गर्न सुरु गर्नुहोस्",
      button1: "समस्या रिपोर्ट गर्नुहोस्",
      button2: "तथ्याङ्क हेर्नुहोस्"
    }
  },
  makeDifference: {
    hero: {
      title: "फरक पार्न तयार हुनुहुन्छ?",
      subtitle: "रुपन्देही जिल्लालाई सुधार गर्न सँगै काम गर्ने हजारौं नागरिकहरूमा सामेल हुनुहोस्",
      cta: "अहिले सुरु गर्नुहोस्"
    },
    impact: {
      title: "हाम्रो प्रभाव"
    },
    stats: {
      resolved: "समाधान भएका समस्याहरू",
      users: "सक्रिय प्रयोगकर्ताहरू",
      impacted: "प्रभावित मानिसहरू",
      satisfaction: "सन्तुष्टि दर"
    },
    ways: {
      title: "तपाईंले मद्दत गर्न सक्ने तरिकाहरू",
      report: {
        title: "समस्याहरू रिपोर्ट गर्नुहोस्",
        description: "तपाईंले आफ्नो समुदायमा देख्नुभएका समस्याहरू रिपोर्ट गर्नुहोस् - सडक, फोहोर, बिजुली, पानी र थप",
        action: "अहिले रिपोर्ट गर्नुहोस्"
      },
      support: {
        title: "समस्याहरू समर्थन गर्नुहोस्",
        description: "तपाईं र तपाईंको समुदायका लागि महत्त्वपूर्ण समस्याहरूमा अपभोट र टिप्पणी गर्नुहोस्",
        action: "फिड हेर्नुहोस्"
      },
      share: {
        title: "सफलताका कथाहरू साझा गर्नुहोस्",
        description: "अरूलाई प्रेरणा दिन सामाजिक सञ्जालमा पहिले/पछिका तस्बिरहरू र सफलताका कथाहरू साझा गर्नुहोस्",
        action: "लीडरबोर्ड हेर्नुहोस्"
      },
      community: {
        title: "समुदायसँग जोडिनुहोस्",
        description: "हिटम्यापमा समस्याहरू ट्र्याक गर्नुहोस् र तपाईंको समुदाय कसरी सुधार हुँदैछ हेर्नुहोस्",
        action: "हिटम्याप हेर्नुहोस्"
      }
    },
    stories: {
      title: "सफलताका कथाहरू",
      story1: {
        title: "समुदाय सफाई पहल",
        description: "समन्वित रिपोर्टिङ मार्फत अघिल्लो महिनामा ५०+ फोहोर स्थानहरू सफा गरियो",
        impact: "१५,०००+ मानिसहरू लाभान्वित"
      },
      story2: {
        title: "सडक मर्मत अभियान",
        description: "२ हप्ताभित्र १२ वडाहरूमा प्रमुख गाडाहरू ठीक गरियो",
        impact: "सबैका लागि सुरक्षा सुधार"
      },
      story3: {
        title: "पानी आपूर्ति पुनर्स्थापना",
        description: "८ स्थानहरूमा पानी आपूर्ति समस्याहरू समाधान भयो, हजारौंलाई लाभान्वित",
        impact: "२४/७ पानी पहुँच पुनर्स्थापित"
      }
    },
    cta: {
      title: "परिवर्तनको भाग बन्नुहोस्",
      description: "हरेक रिपोर्ट महत्त्वपूर्ण छ। सँगै हामी राम्रो रुपन्देही निर्माण गर्न सक्छौं।",
      button1: "अहिले सामेल हुनुहोस्",
      button2: "समस्या रिपोर्ट गर्नुहोस्"
    }
  },
  footer: {
    aboutTitle: "रुपन्देही पोर्टलको बारेमा",
    aboutDescription: "रुपन्देही जिल्लामा समुदायका समस्याहरू रिपोर्ट र ट्र्याक गर्न नागरिक-संचालित प्लेटफर्म।",
    quickLinks: "छिटो लिङ्कहरू",
    resources: "स्रोतहरू",
    advancedReporting: "उन्नत रिपोर्टिङ",
    makeDifference: "फरक पार्नुहोस्",
    contactUs: "हामीलाई सम्पर्क गर्नुहोस्",
    address: "रुपन्देही जिल्ला कार्यालय, बुटवल, लुम्बिनी प्रदेश, नेपाल",
    phone: "+९७७-७१-५२००००",
    email: "info@rupandehi.gov.np",
    website: "www.rupandehi.gov.np",
    copyright: "© {{year}} रुपन्देही जिल्ला। सबै अधिकार सुरक्षित।",
    government: "नेपाल सरकार",
    district: "रुपन्देही जिल्ला"
  }
};

// Get saved language from localStorage or default to English
const savedLanguage = localStorage.getItem("language") || "en";

const resources = {
  en: {
    translation: enTranslationsData,
  },
  np: {
    translation: npTranslationsData,
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: savedLanguage,
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});

// Save language preference when changed
i18n.on("languageChanged", (lng) => {
  localStorage.setItem("language", lng);
});

export default i18n;
