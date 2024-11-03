"use client";
import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { CrossIcon } from "./SvgIcons";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

type FilterModalProps = {
  onClose: () => void;
  setCountry: (country: string | null) => void;
  onApplyFilters: () => void;
};

export default function FilterModal({
  onClose,
  setCountry,
  onApplyFilters,
}: FilterModalProps) {
  const [locationEnabled, setLocationEnabled] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    const storedCountry = Cookies.get("country");
    if (storedCountry) {
      setLocationEnabled(true);
    }
  }, []);

  const fetchLocation = async () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const locationData = await response.json();
          setCountry(locationData.address.country_code.toLowerCase());
        } catch (error) {
          toast.error("Failed to fetch country information.");
        }
      });
    } else {
      toast.error("Geolocation is not supported by this browser.");
    }
  };

  const handleSwitchToggle = () => {
    const newLocationEnabled = !locationEnabled;
    setLocationEnabled(newLocationEnabled);
    if (newLocationEnabled) {
      fetchLocation();
    } else {
      setCountry(null);
    }
  };

  const handleApplyFilters = () => {
    onApplyFilters();
    handleClose();
  };

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  return (
    <div
      className={`fixed inset-0 bg-black bg-opacity-80 flex flex-col items-center justify-center transition-opacity duration-300 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
    >
      <ToastContainer position="top-center" />
      <div
        className={`transform transition-transform duration-300 ${
          isVisible ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="w-[300px] h-[50px] bg-gray2 rounded-t-xl flex flex-col items-end justify-center">
          <button
            onClick={handleClose}
            className="rounded-lg w-[30px] h-[30px] mt-5 mr-5 flex items-center justify-center bg-gray hover:bg-gray3 active:bg-gray"
          >
            <CrossIcon />
          </button>
        </div>
        <div className="w-[300px] h-[300px] bg-gray2 rounded-b-xl flex flex-col items-center gap-5">
          <div>Search Filters</div>
          <div className="flex">
            <div>Location</div>
            <label className="cursor-pointer ml-5">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={locationEnabled}
                onChange={handleSwitchToggle}
              />
              <div className="relative w-11 h-6 bg-gray rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-green"></div>
            </label>
          </div>
          <button
            onClick={handleApplyFilters}
            className="rounded-lg w-[100px] h-[30px] flex items-center justify-center mt-[150px] text-black bg-yellow hover:bg-yellow2 active:bg-yellow3"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
}
