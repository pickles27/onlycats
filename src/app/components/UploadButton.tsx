"use client";

import { ChangeEvent, useState } from "react";
import { LoadingSpinner } from "./LoadingSpinner";
import { useInfinitePosts } from "../hooks/useInfinitePosts";
import FileUploadRoundedIcon from "@mui/icons-material/FileUploadRounded";
import imageCompression from "browser-image-compression";
import toast from "react-hot-toast";

export const UploadButton = () => {
  const { mutate } = useInfinitePosts();
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!e.target.files || !file) {
      toast.error("Please select a file to upload 😾");
      return;
    }

    if (e.target.files.length > 1) {
      toast.error("Please upload one cat at a time 🙀");
      return;
    }

    setIsUploading(true);

    try {
      const compressedFile = await imageCompression(file, { maxSizeMB: 5 });

      const formData = new FormData();
      formData.append("image", compressedFile);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(
          data?.error || "Encountered an issue while uploading 🙀"
        );
      }

      toast.success("Cat uploaded successfully! 😸");
      mutate();
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      e.target.value = "";
      setIsUploading(false);
    }
  };

  return (
    <form>
      <label
        htmlFor="file-upload"
        className="sm:w-28 flex justify-center items-center gap-1 bg-sky-600 transition delay-75 hover:bg-sky-500 text-white font-bold rounded-full sm:rounded-lg py-2 px-2 sm:px-3 cursor-pointer shadow-md"
      >
        {isUploading ? (
          <LoadingSpinner />
        ) : (
          <div className="flex items-center gap-1">
            <span className="sr-only sm:not-sr-only">Upload</span>
            <FileUploadRoundedIcon />
          </div>
        )}
      </label>
      <input
        id="file-upload"
        accept="image/*"
        onChange={handleFileChange}
        type="file"
        className="hidden"
        disabled={isUploading}
      />
    </form>
  );
};
