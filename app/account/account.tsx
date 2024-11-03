"use client";
import { useEffect, useState, useRef } from "react";
import { ToastContainer, toast } from "react-toastify";
import { signOut } from "next-auth/react";
import { EditIcon } from "../components/SvgIcons";
import "react-toastify/dist/ReactToastify.css";
import Image from "next/image";

type User = {
  first_name: string;
  last_name: string;
  email: string;
  subscription_plan: string;
  profile_photo_url?: string;
};

export default function Account() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    async function fetchAccountDetails() {
      try {
        const response = await fetch("/api/account");
        if (response.ok) {
          const data: User = await response.json();
          setUser(data);
        } else {
          const errorData = await response.json();
          if (errorData.message === "No account details found") {
            toast.error("No account details found");
          } else {
            toast.error("Failed to fetch account details");
          }
        }
      } catch (error) {
        toast.error("Client side error.");
      } finally {
        setLoading(false);
      }
    }

    fetchAccountDetails();
  }, []);

  const handleDeleteAccount = async () => {
    const confirmed = confirm("Are you sure you want to delete your account?");
    if (!confirmed) return;

    try {
      const response = await fetch("/api/account", {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Account deleted successfully.");
        await signOut({ callbackUrl: "/" });
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "Failed to delete account.");
      }
    } catch (error) {
      toast.error("Client side error.");
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      handleUploadProfilePhoto(file);
    }
  };

  const handleUploadProfilePhoto = async (file: File) => {
    if (!file) {
      toast.error("Please select an image file.");
      return;
    }

    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await fetch("/api/account", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        toast.success("Profile photo updated.");
        setUser((prevUser) =>
          prevUser
            ? { ...prevUser, profile_photo_url: data.profile_photo_url }
            : null
        );
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "Failed to update profile photo.");
      }
    } catch (error) {
      toast.error("Client side error.");
    }
  };

  const email = user?.email;
  const emailWithoutDomain = email?.substring(0, email.indexOf("@"));

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <ToastContainer position="top-center" />
      {loading ? (
        <div>Loading...</div>
      ) : !user ? (
        <div>No account details found.</div>
      ) : (
        <>
          <div className="rounded-xl p-5 bg-gray2 flex flex-col items-center justify-center">
            <div className="cursor-pointer">
              <div
                className="relative"
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
                onClick={() => fileInputRef.current?.click()}
              >
                <Image
                  src={user.profile_photo_url || "/default-profile-photo.jpg"}
                  alt="Profile Photo"
                  width={100}
                  height={100}
                  className="rounded-full"
                />
                {isHovering && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                    <EditIcon />
                  </div>
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                style={{ display: "none" }}
                ref={fileInputRef}
              />
            </div>
            <div className="mt-5 text-xl font-bold">{emailWithoutDomain}</div>
          </div>
          <div className="w-screen lg:w-[500px] rounded-xl mt-5 p-5 bg-gray2 flex items-center justify-between">
            <div className="flex flex-col ml-20 items-center justify-center">
              <div className="font-bold">First Name</div>
              {user.first_name}
            </div>
            <div className="flex flex-col mr-20 items-center justify-center">
              <div className="font-bold">Last Name</div>
              {user.last_name}
            </div>
          </div>
          <div className="w-screen lg:w-[500px] rounded-xl mt-5 p-5 gap-[200px] bg-gray2 flex items-center justify-center">
            <div className="flex flex-col items-center justify-center">
              <div className="font-bold">Email</div>
              {user.email}
            </div>
          </div>
          <div className="w-screen lg:w-[500px] rounded-xl mt-5 p-5 gap-[200px] bg-gray2 flex items-center justify-center">
            <div className="flex flex-col items-center justify-center">
              <div className="font-bold">Subscription Plan</div>
              {user.subscription_plan}
            </div>
          </div>
          <div className="w-screen lg:w-[500px] mt-5 p-5 border border-red rounded-xl">
            <div className="text-xl font-bold">Danger Zone</div>
            <div className="mt-5">
              Permanently delete your account and all of its contents from
              SnapStyle. This action is not reversible, so please continue with
              caution.
            </div>
            <div className="mt-5 flex justify-end">
              <button
                onClick={handleDeleteAccount}
                className="rounded-lg w-[150px] h-[30px] flex items-center justify-center bg-red hover:bg-red2 active:bg-red3"
              >
                Delete Account
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
