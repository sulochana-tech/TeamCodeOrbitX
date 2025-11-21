import { useState } from "react";
import { getBadge } from "../utils/badges";
import { 
  Share2, 
  X, 
  Facebook, 
  Twitter, 
  MessageCircle, 
  Linkedin, 
  Copy, 
  Download,
  CheckCircle,
  Award
} from "lucide-react";

// Ensure icons are visible with explicit styling
const iconStyle = { 
  display: 'block', 
  flexShrink: 0,
  width: '100%',
  height: '100%'
};

export default function AchievementShare({ user, rank, totalUsers }) {
  const [showShareModal, setShowShareModal] = useState(false);

  const achievementText = rank
    ? `Community Contribution: Ranked #${rank} out of ${totalUsers} contributors with ${user.points} service points.`
    : `Community Service: ${user.points} points earned with ${getBadge(user.points)} recognition.`;

  const shareText = `${achievementText}\n\nParticipate in community improvement through our public service portal.\n\n#PublicService #CommunityEngagement`;

  const shareUrl = window.location.origin;

  // Social media share functions
  const shareOnFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    window.open(url, "_blank", "width=600,height=400");
  };

  const shareOnTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(`Community contribution achievement: ${achievementText}`)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(url, "_blank", "width=600,height=400");
  };

  const shareOnWhatsApp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
    window.open(url, "_blank");
  };

  const shareOnLinkedIn = () => {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
    window.open(url, "_blank", "width=600,height=400");
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const downloadAsImage = () => {
    const canvas = document.createElement("canvas");
    canvas.width = 1200;
    canvas.height = 630;
    const ctx = canvas.getContext("2d");

    // Professional background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, 1200, 630);

    // Header with official color
    ctx.fillStyle = "#1e40af";
    ctx.fillRect(0, 0, 1200, 120);

    // Title
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 48px 'Arial', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("COMMUNITY SERVICE RECOGNITION", 600, 70);

    // Achievement content
    ctx.fillStyle = "#1f2937";
    ctx.font = "bold 42px 'Arial', sans-serif";
    ctx.fillText(user.fullName || "Community Member", 600, 200);

    // Badge
    ctx.fillStyle = "#059669";
    ctx.font = "bold 36px 'Arial', sans-serif";
    ctx.fillText(getBadge(user.points), 600, 260);

    // Points display
    ctx.fillStyle = "#1e40af";
    ctx.font = "bold 72px 'Arial', sans-serif";
    ctx.fillText(`${user.points}`, 600, 350);
    ctx.fillStyle = "#6b7280";
    ctx.font = "32px 'Arial', sans-serif";
    ctx.fillText("Service Points", 600, 390);

    // Rank information
    if (rank) {
      ctx.fillStyle = "#374151";
      ctx.font = "28px 'Arial', sans-serif";
      ctx.fillText(`Position ${rank} of ${totalUsers} Contributors`, 600, 450);
    }

    // Official footer
    ctx.fillStyle = "#6b7280";
    ctx.font = "24px 'Arial', sans-serif";
    ctx.fillText("Municipal Corporation Public Service Portal", 600, 520);
    ctx.font = "20px 'Arial', sans-serif";
    ctx.fillText("Community Engagement System", 600, 550);

    // Convert to image and download
    canvas.toBlob(
      (blob) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.download = `service-recognition-${(user.fullName || "user").replace(/\s+/g, "-")}-${Date.now()}.png`;
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
      },
      "image/png",
      1.0
    );
  };

  return (
    <>
      <button
        onClick={() => setShowShareModal(true)}
        className="px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors font-medium flex items-center gap-2 border border-blue-600 shadow-sm"
      >
        <Share2 className="w-4 h-4" style={{ display: 'inline-block', flexShrink: 0, width: '16px', height: '16px' }} aria-hidden="true" />
        <span>Share Recognition</span>
      </button>

      {showShareModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="bg-blue-800 px-6 py-4 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/10 rounded flex items-center justify-center">
                    <Share2 className="w-5 h-5" style={{ display: 'block', width: '20px', height: '20px' }} aria-hidden="true" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold">Share Service Recognition</h2>
                    <p className="text-blue-200 text-sm">Distribute your community contribution achievement</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowShareModal(false)}
                  className="text-white/80 hover:text-white w-8 h-8 flex items-center justify-center rounded hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5" style={{ display: 'block', width: '20px', height: '20px' }} aria-hidden="true" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* Recognition Card */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-lg p-6 mb-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Award className="w-8 h-8 text-white" style={{ display: 'block', width: '32px', height: '32px' }} aria-hidden="true" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Service Recognition</h3>
                  <p className="text-lg text-gray-700 font-semibold">{user.fullName || "Community Member"}</p>
                  
                  <div className="bg-white rounded-lg p-4 my-4 border border-blue-200">
                    <p className="text-blue-800 font-bold text-lg mb-1" style={{ fontSize: '1.25rem', lineHeight: '1.75rem' }}>
                      {getBadge(user.points)}
                    </p>
                    <p className="text-3xl font-bold text-blue-600">{user.points}</p>
                    <p className="text-gray-600">Service Points</p>
                  </div>

                  {rank && (
                    <div className="bg-white rounded-lg p-3 border border-green-200">
                      <p className="text-green-800 font-semibold flex items-center justify-center gap-2">
                        <CheckCircle className="w-4 h-4" style={{ display: 'inline-block', flexShrink: 0, width: '16px', height: '16px' }} aria-hidden="true" />
                        <span>Position {rank} of {totalUsers} Contributors</span>
                      </p>
                    </div>
                  )}

                  <p className="text-gray-600 mt-4 text-sm">
                    Municipal Corporation Public Service Portal
                  </p>
                </div>
              </div>

              {/* Share Options */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Distribution Channels</h4>
                
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={shareOnFacebook}
                    className="flex items-center justify-center gap-2 p-3 bg-[#1877F2] text-white rounded hover:bg-[#166FE5] transition-colors text-sm font-medium border border-[#166FE5]"
                  >
                    <Facebook className="w-4 h-4" style={{ display: 'block', flexShrink: 0, width: '16px', height: '16px' }} aria-hidden="true" />
                    <span>Facebook</span>
                  </button>

                  <button
                    onClick={shareOnTwitter}
                    className="flex items-center justify-center gap-2 p-3 bg-black text-white rounded hover:bg-gray-800 transition-colors text-sm font-medium border border-gray-700"
                  >
                    <Twitter className="w-4 h-4" style={{ display: 'block', flexShrink: 0, width: '16px', height: '16px' }} aria-hidden="true" />
                    <span>Twitter</span>
                  </button>

                  <button
                    onClick={shareOnWhatsApp}
                    className="flex items-center justify-center gap-2 p-3 bg-[#25D366] text-white rounded hover:bg-[#20BD5C] transition-colors text-sm font-medium border border-[#20BD5C]"
                  >
                    <MessageCircle className="w-4 h-4" style={{ display: 'block', flexShrink: 0, width: '16px', height: '16px' }} aria-hidden="true" />
                    <span>WhatsApp</span>
                  </button>

                  <button
                    onClick={shareOnLinkedIn}
                    className="flex items-center justify-center gap-2 p-3 bg-[#0A66C2] text-white rounded hover:bg-[#0959AC] transition-colors text-sm font-medium border border-[#0959AC]"
                  >
                    <Linkedin className="w-4 h-4" style={{ display: 'block', flexShrink: 0, width: '16px', height: '16px' }} aria-hidden="true" />
                    <span>LinkedIn</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={copyToClipboard}
                    className="flex items-center justify-center gap-2 p-3 bg-gray-700 text-white rounded hover:bg-gray-800 transition-colors text-sm font-medium border border-gray-600"
                  >
                    <Copy className="w-4 h-4" style={{ display: 'block', flexShrink: 0, width: '16px', height: '16px' }} aria-hidden="true" />
                    <span>Copy Text</span>
                  </button>

                  <button
                    onClick={downloadAsImage}
                    className="flex items-center justify-center gap-2 p-3 bg-blue-700 text-white rounded hover:bg-blue-800 transition-colors text-sm font-medium border border-blue-600"
                  >
                    <Download className="w-4 h-4" style={{ display: 'block', flexShrink: 0, width: '16px', height: '16px' }} aria-hidden="true" />
                    <span>Download Certificate</span>
                  </button>
                </div>
              </div>

              {/* Message Preview */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-sm font-medium text-gray-700 mb-2">Message Preview</p>
                <div className="bg-white p-3 rounded border border-gray-300 max-h-24 overflow-y-auto">
                  <p className="text-xs text-gray-600 whitespace-pre-line leading-relaxed">
                    {shareText}
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
              <div className="flex justify-between items-center">
                <p className="text-xs text-gray-600">
                  Official Public Service Communication
                </p>
                <button
                  onClick={() => setShowShareModal(false)}
                  className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors text-sm font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}