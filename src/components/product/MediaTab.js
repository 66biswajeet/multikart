import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useDropzone } from "react-dropzone";
import { Col, Card, CardBody, Label } from "reactstrap";
import {
  RiDeleteBinLine,
  RiStarFill,
  RiStarLine,
  RiUploadCloud2Line,
} from "react-icons/ri";
import Image from "next/image";
import Btn from "@/elements/buttons/Btn";
import { placeHolderImage } from "@/data/CommonPath";

const MediaTab = ({ values, setFieldValue, errors, updateId }) => {
  const { t } = useTranslation("common");
  const [uploadedFiles, setUploadedFiles] = useState([]);

  // This combines existing media (from oldData) with newly uploaded files for display
  const allMedia = [
    ...(values.media || []),
    ...uploadedFiles.map((file) => ({
      url: file.preview,
      is_primary: false,
      file, // Keep a reference to the File object
    })),
  ];

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".gif"],
    },
    onDrop: (acceptedFiles) => {
      // Create previews
      const filesWithPreview = acceptedFiles.map((file) =>
        Object.assign(file, {
          preview: URL.createObjectURL(file),
        })
      );

      // Add new files to Formik state for submission
      setFieldValue("new_media_files", [
        ...(values.new_media_files || []),
        ...filesWithPreview,
      ]);

      // Add to local state for display
      setUploadedFiles((prev) => [...prev, ...filesWithPreview]);
    },
  });

  // Set an image as primary
  const setAsPrimary = (index) => {
    const updatedMedia = allMedia.map((media, i) => ({
      ...media,
      // 'url' is the unique key for existing media
      // 'preview' is the unique key for new files
      is_primary: i === index,
    }));

    // Update the main 'media' array in Formik
    setFieldValue(
      "media",
      updatedMedia.filter((m) => !m.file)
    ); // Only save existing media
  };

  // Remove an image
  const removeImage = (index, mediaItem) => {
    if (mediaItem.file) {
      // 1. It's a NEW file (not yet saved)
      // Remove from local preview state
      setUploadedFiles((prev) =>
        prev.filter((file) => file.preview !== mediaItem.url)
      );
      // Remove from Formik 'new_media_files'
      setFieldValue(
        "new_media_files",
        values.new_media_files.filter((file) => file.preview !== mediaItem.url)
      );
    } else {
      // 2. It's an EXISTING file (already saved)
      // Add its URL to the delete list for the API
      setFieldValue("delete_media_urls", [
        ...(values.delete_media_urls || []),
        mediaItem.url,
      ]);
      // Remove it from the main 'media' array in Formik
      setFieldValue(
        "media",
        values.media.filter((m) => m.url !== mediaItem.url)
      );
    }
  };

  return (
    <Col>
      <div className="title-header option-title">
        <h5>{t("Media")}</h5>
      </div>

      {/* Dropzone Uploader */}
      <div {...getRootProps({ className: "dropzone-wrapper" })}>
        <input {...getInputProps()} />
        <div className="dropzone-box">
          <RiUploadCloud2Line className="fs-1" />
          <p>{t("Dropfileshereorclicktoupload")}</p>
        </div>
      </div>

      {/* Image Preview Grid */}
      <div className="d-flex flex-wrap align-items-center gap-3 mt-4">
        {allMedia.map((mediaItem, index) => (
          <Card key={index} className="media-preview-card">
            <Image
              src={mediaItem.url || placeHolderImage}
              alt="Product Image"
              width={150}
              height={150}
              className="card-img-top"
              objectFit="cover"
            />
            <CardBody className="p-2">
              <div className="d-flex justify-content-between align-items-center">
                <Btn
                  type="button"
                  className={`btn-icon ${
                    mediaItem.is_primary ? "btn-warning" : "btn-outline-warning"
                  }`}
                  onClick={() => setAsPrimary(index)}
                  title={
                    mediaItem.is_primary ? t("Primary") : t("SetAsPrimary")
                  }
                >
                  {mediaItem.is_primary ? <RiStarFill /> : <RiStarLine />}
                </Btn>
                <Btn
                  type="button"
                  className="btn-icon btn-outline-danger"
                  onClick={() => removeImage(index, mediaItem)}
                  title={t("Delete")}
                >
                  <RiDeleteBinLine />
                </Btn>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    </Col>
  );
};

export default MediaTab;
