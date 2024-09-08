/* eslint-disable @next/next/no-img-element */

"use client";

export const UploadButton = () => {
  const handleUploadClick = () => {
    // todo: add upload functionality
  };

  return (
    <button
      aria-label="Upload"
      className="flex items-center gap-1 bg-sky-500/10 hover:bg-sky-500/40 rounded-md py-0.5 px-3"
      onClick={handleUploadClick}
    >
      <img alt="Upload icon" className="w-8" src="../upload.png" />
      Upload
    </button>
  );
};
