import React, { useContext, useState } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Edit3,
  Save,
  Mail,
  Shield,
  Stethoscope,
  UserCircle2,
} from "lucide-react";
import { toast } from "react-hot-toast";

const Profile = () => {
  const { user, login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);

  const [profile, setProfile] = useState({
    name: user?.name || "",
    email: user?.email || "",
    role: user?.role || "patient",
    specialization: user?.specialization || "",
    experience: user?.experience || "",
  });

  if (!user) {
    return (
      <div className="flex items-center justify-center h-[80vh] text-gray-600 text-lg">
        Please log in to view your profile.
      </div>
    );
  }

    const handleSave = () => {
    const updatedUser = { ...user, ...profile };
    localStorage.setItem("user", JSON.stringify(updatedUser));
    login(updatedUser, localStorage.getItem("authToken"));
    toast.success("Profile updated successfully!");
    setIsEditing(false);
    };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-white py-10 px-6 md:px-12 lg:px-24">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sky-700 font-medium mb-6 hover:underline hover:text-sky-800 transition"
      >
        <ArrowLeft size={18} /> Back to Dashboard
      </button>

      {/* Profile Container */}
      <div className="bg-white shadow-lg rounded-3xl p-8 max-w-4xl mx-auto border border-gray-100 relative">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start sm:justify-between gap-6">
          {/* Avatar */}
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-sky-100 flex items-center justify-center">
              <UserCircle2 size={50} className="text-sky-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                {profile.name || "User"}
              </h1>
              <p className="text-gray-500 text-sm capitalize">
                {profile.role === "doctor" ? "Doctor" : "Patient"}
              </p>
            </div>
          </div>

          {/* Edit Button */}
          <button
            onClick={() =>
              isEditing
                ? handleSave()
                : setIsEditing(true)
            }
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
              isEditing
                ? "bg-green-600 text-white hover:bg-green-700"
                : "bg-sky-600 text-white hover:bg-sky-700"
            }`}
          >
            {isEditing ? <Save size={16} /> : <Edit3 size={16} />}
            {isEditing ? "Save Changes" : "Edit Profile"}
          </button>
        </div>

        <hr className="my-6 border-gray-200" />

        {/* Profile Info */}
        <div className="grid sm:grid-cols-2 gap-8">
          {/* Basic Info */}
          <div>
            <h2 className="text-lg font-semibold text-sky-700 mb-3">
              Personal Details
            </h2>

            <div className="space-y-4">
              <div>
                <label className="flex items-center text-gray-500 text-sm gap-2 mb-1">
                  <UserCircle2 size={16} /> Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) =>
                      setProfile({ ...profile, name: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-sky-300 rounded-md text-sm focus:ring-1 focus:ring-sky-500 outline-none"
                  />
                ) : (
                  <p className="font-medium text-gray-800">{profile.name}</p>
                )}
              </div>

              <div>
                <label className="flex items-center text-gray-500 text-sm gap-2 mb-1">
                  <Mail size={16} /> Email
                </label>
                <p className="font-medium text-gray-800">{profile.email}</p>
              </div>

              <div>
                <label className="flex items-center text-gray-500 text-sm gap-2 mb-1">
                  <Shield size={16} /> Role
                </label>
                <p className="font-medium capitalize text-gray-800">
                  {profile.role}
                </p>
              </div>
            </div>
          </div>

          {/* Doctor Section */}
          {profile.role === "doctor" && (
            <div>
              <h2 className="text-lg font-semibold text-sky-700 mb-3">
                Professional Details
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="flex items-center text-gray-500 text-sm gap-2 mb-1">
                    <Stethoscope size={16} /> Specialization
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profile.specialization}
                      onChange={(e) =>
                        setProfile({
                          ...profile,
                          specialization: e.target.value,
                        })
                      }
                      placeholder="e.g., Cardiologist"
                      className="w-full px-3 py-2 border border-sky-300 rounded-md text-sm focus:ring-1 focus:ring-sky-500 outline-none"
                    />
                  ) : (
                    <p className="font-medium text-gray-800">
                      {profile.specialization || "Not specified"}
                    </p>
                  )}
                </div>

                <div>
                  <label className="flex items-center text-gray-500 text-sm gap-2 mb-1">
                    Experience (Years)
                  </label>
                  {isEditing ? (
                    <input
                      type="number"
                      min="0"
                      value={profile.experience}
                      onChange={(e) =>
                        setProfile({ ...profile, experience: e.target.value })
                      }
                      placeholder="e.g., 10"
                      className="w-full px-3 py-2 border border-sky-300 rounded-md text-sm focus:ring-1 focus:ring-sky-500 outline-none"
                    />
                  ) : (
                    <p className="font-medium text-gray-800">
                      {profile.experience
                        ? `${profile.experience} years`
                        : "Not specified"}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-400">
          Last updated just now
        </div>
      </div>
    </div>
  );
};

export default Profile;
