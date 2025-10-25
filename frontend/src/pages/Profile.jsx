import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { User, Mail, Camera, Loader, Save } from "lucide-react";
import imageCompression from "browser-image-compression";

export default function Profile() {
  const { dbUser, api, refreshDbUser } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [photoURL, setPhotoURL] = useState(null);
  const [newProfilePicFile, setNewProfilePicFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (dbUser) {
      setName(dbUser.name || "");
      setEmail(dbUser.email || "");
      setPhotoURL(dbUser.photoURL || null);
      setPreviewUrl(dbUser.photoURL || null);
    }
  }, [dbUser]);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setNewProfilePicFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageClick = () => {
    fileInputRef.current.click();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    const formData = new FormData();
    formData.append("name", name);

    if (newProfilePicFile) {
      console.log(
        `Original file size: ${newProfilePicFile.size / 1024 / 1024} MB`
      );
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 800,
        useWebWorker: true,
        fileType: "image/webp",
      };
      try {
        const compressedFile = await imageCompression(
          newProfilePicFile,
          options
        );
        console.log(
          `Compressed file size: ${compressedFile.size / 1024 / 1024} MB`
        );
        formData.append(
          "profilePic",
          compressedFile,
          `profile_${dbUser._id}.webp`
        );
      } catch (compressionError) {
        console.error("Image compression error:", compressionError);
        setError("Failed to process image. Please try another one.");
        setLoading(false);
        return;
      }
    }

    try {
      const { data: updatedUser } = await api.put("/users/profile", formData, {
        headers: {},
      });
      setSuccess("Profile updated successfully!");
      await refreshDbUser();
      setNewProfilePicFile(null);
      setName(updatedUser.name);
      setPhotoURL(updatedUser.photoURL);
      setPreviewUrl(updatedUser.photoURL);
    } catch (err) {
      console.error("Profile update failed:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to update profile."
      );
    } finally {
      setLoading(false);
    }
  };

  if (!dbUser && !loading) {
    return <div className="pt-40 text-center">Loading profile...</div>;
  }

  return (
    <div className="min-h-screen pt-32 pb-20 flex justify-center items-start px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass w-full max-w-lg p-8 rounded-2xl shadow-xl"
      >
        <h2 className="text-3xl font-heading text-center mb-8">My Profile</h2>

        {error && (
          <div className="bg-red-500/20 text-red-300 p-3 rounded-lg mb-4 text-sm text-center">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-500/20 text-green-300 p-3 rounded-lg mb-4 text-sm text-center">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-center mb-6">
            <div
              className="relative group cursor-pointer"
              onClick={handleImageClick}
            >
              <img
                src={
                  previewUrl ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    name || email || "?"
                  )}&background=random&size=128`
                }
                alt="Profile"
                className="w-32 h-32 rounded-full object-cover border-4 border-glass-border shadow-lg"
              />
              <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="w-8 h-8 text-white" />
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/png, image/jpeg, image/webp"
                className="hidden"
                disabled={loading}
              />
            </div>
          </div>

          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-secondary-text" />
            <input
              type="text"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full glass pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:border-primary-accent/50"
              required
              disabled={loading}
            />
          </div>

          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-secondary-text" />
            <input
              type="email"
              placeholder="Email"
              value={email}
              readOnly
              className="w-full glass pl-10 pr-4 py-3 rounded-xl focus:outline-none text-secondary-text bg-gray-500/10 cursor-not-allowed"
              disabled={true}
            />
          </div>

          <motion.button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-accent text-white font-bold py-3 rounded-xl hover:bg-opacity-80 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            whileHover={{ scale: loading ? 1 : 1.03 }}
            whileTap={{ scale: loading ? 1 : 0.98 }}
          >
            {loading ? (
              <>
                <Loader className="w-5 h-5 animate-spin" /> Updating...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" /> Save Changes
              </>
            )}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}
