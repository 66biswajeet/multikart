import { mimeImageMapping } from "@/data/MimeImageType";
import { ErrorMessage } from "formik";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { RiCloseLine } from "react-icons/ri";
import { Input } from "reactstrap";
import InputWrapper from "../../utils/hoc/InputWrapper";
import { handleModifier } from "../../utils/validation/ModifiedErrorMessage";
import AttachmentModal from "../attachment/widgets/attachmentModal";
import request from "../../utils/axiosUtils";
import { useRouter } from "next/navigation";
import { ToastNotification } from "@/utils/customFunctions/ToastNotification";

const FileUploadField = ({ values, updateId, setFieldValue, errors, multiple, loading, showImage, paramsProps, ...props }) => {
  const storeImageObject = props.name.split("_id")[0];
  const { t } = useTranslation("common");
  const router = useRouter();
  const [modal, setModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState([]);
  const [isDeleting, setIsDeleting] = useState(false);
  
  useEffect(() => {
    if (values) {
      multiple ? setSelectedImage(values[storeImageObject]) : values[storeImageObject] ? setSelectedImage(loading ? null : [values[storeImageObject]]) : values[props.name] ? setSelectedImage([values[props.name]]) : setSelectedImage([]);
    }
  }, [values[storeImageObject], loading]);
  
  useEffect(() => {
    if (props?.uniquename) {
      if (Array.isArray(props?.uniquename)) {
        const onlyIds = props?.uniquename?.map((data) => data.id);
        setSelectedImage(loading ? null : props?.uniquename);
        setFieldValue(props?.name, onlyIds);
      } else {
        setSelectedImage(loading ? null : [props?.uniquename]);
        setFieldValue(props?.name, props?.uniquename?.id);
      }
    }
  }, [props?.uniquename, loading, showImage]);

  const removeImage = async (result) => {
    if (props.name) {
      setIsDeleting(true);
      
      try {
        // Delete from Cloudinary via API
        const attachmentId = result.id || result._id;
        if (attachmentId) {
          const response = await request({
            url: `/attachment/${attachmentId}`,
            method: "DELETE"
          }, router);
          
          if (response?.data?.success) {
            ToastNotification("success", "Image deleted successfully");
          }
        }
        
        // Update form state
        if (multiple) {
          let updatedImage = selectedImage.filter((elem) => (elem.id || elem._id) !== (result.id || result._id));
          setSelectedImage(updatedImage);
          setFieldValue(storeImageObject, updatedImage);
          setFieldValue(props?.name, updatedImage.map(img => img.id || img._id));
        } else {
          setFieldValue(props?.name, null);
          setSelectedImage([]);
          setFieldValue(storeImageObject, "");
        }
      } catch (error) {
        console.error("Error deleting image:", error);
        ToastNotification("error", "Failed to delete image");
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const getMimeTypeImage = (result) => {
    return mimeImageMapping[result?.mime_type] ?? result?.original_url?.split("/")[1] == "storage" ? result?.original_url : result?.original_url;
  };
  const ImageShow = () => {
    return (
      <>
        {selectedImage?.length > 0 &&
          selectedImage?.map((result, i) => (
            <li key={i}>
              <div className="media-img-box">
                <Image src={getMimeTypeImage(result)} className="img-fluid" alt="ratio image" height={130} width={130} />
                <p className="remove-icon">
                  <RiCloseLine 
                    onClick={() => !isDeleting && removeImage(result)} 
                    style={{ cursor: isDeleting ? 'not-allowed' : 'pointer', opacity: isDeleting ? 0.5 : 1 }}
                  />
                </p>
              </div>
              <h6>{result?.file_name}</h6>
            </li>
          ))}
      </>
    );
  };
  return (
    <>
      <ul className={`image-select-list`}>
        <li className="choosefile-input">
          <Input
            {...props}
            onClick={(event) => {
              event.preventDefault();
              setModal(props.id);
            }}
          />
          <label htmlFor={props.id}>
            <Image height={40} width={40} src={"/assets/images/add-image.png"} className="img-fluid" alt="" />
          </label>
        </li>

        <ImageShow />

        <AttachmentModal paramsProps={paramsProps} modal={modal == props.id} name={props.name} multiple={multiple} values={values} setModal={setModal} setFieldValue={setFieldValue} setSelectedImage={setSelectedImage} selectedImage={selectedImage} showImage={showImage} redirectToTabs={true} uploadOnly={true} />
      </ul>
      <p className="help-text">{props?.helpertext}</p>
      {errors?.[props?.name] ? (
        <ErrorMessage
          name={props.name}
          render={(msg) => (
            <div className="invalid-feedback d-block">
              {t(handleModifier(storeImageObject).split(" ").join(""))} {t("IsRequired")}
            </div>
          )}
        />
      ) : null}
    </>
  );
};

export default InputWrapper(FileUploadField);
