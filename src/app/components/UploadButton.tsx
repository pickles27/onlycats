/* eslint-disable @next/next/no-img-element */

"use client";

import { ChangeEvent, useState } from "react";
import toast from "react-hot-toast";

export const UploadButton = () => {
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) {
      toast.error("Please select a file to upload.");
      return;
    }

    setIsUploading(true);

    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message);
      }

      toast.success("Cat uploaded successfully!");
    } catch (error) {
      toast.error("Failed to upload.");
    } finally {
      e.target.value = "";
      setIsUploading(false);
    }
  };

  return (
    <form>
      <label
        htmlFor="file-upload"
        className="w-28 h-10 flex justify-center items-center gap-1 bg-sky-500/10 hover:bg-sky-500/40 rounded-md py-1 px-3 cursor-pointer"
      >
        {isUploading ? (
          <LoadingSpinner />
        ) : (
          <div className="flex items-center gap-1">
            Upload
            <img alt="Upload icon" className="w-8" src="../upload.png" />
          </div>
        )}
      </label>
      <input
        id="file-upload"
        accept="image/*"
        onChange={handleFileChange}
        type="file"
        className="hidden"
      />
    </form>
  );
};

const LoadingSpinner = () => (
  <svg
    className="animate-spin h-5 w-5 text-blue-500"
    xmlns="http://www.w3.org/2000/svg"
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
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
    ></path>
  </svg>
);
