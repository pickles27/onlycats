/* eslint-disable @next/next/no-img-element */

"use client";

import { ChangeEvent, useState } from "react";
import { LoadingSpinner } from "./LoadingSpinner";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

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
