/* eslint-disable @next/next/no-img-element */

"use client";

import { ChangeEvent, useState } from "react";
import { LoadingSpinner } from "./LoadingSpinner";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import FileUploadRoundedIcon from "@mui/icons-material/FileUploadRounded";

export const UploadButton = () => {
  const [isUploading, setIsUploading] = useState(false);
  const router = useRouter();

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!e.target.files || !file) {
      toast.error("Please select a file to upload 😾");
      return;
    }

    if (e.target.files.length > 1) {
      toast.error("Please upload one cat at a time 🙀");
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
        throw new Error(result.error);
      }

      toast.success("Cat uploaded successfully! 😸");
      router.refresh();
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
        className="sm:w-28 flex justify-center items-center gap-1 bg-sky-600 transition delay-75 hover:bg-sky-500 text-white font-bold rounded-full sm:rounded-lg py-2 px-2 sm:px-3 cursor-pointer drop-shadow-md"
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
      />
    </form>
  );
};
