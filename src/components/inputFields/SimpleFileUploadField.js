import { ErrorMessage } from "formik";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { RiCloseLine } from "react-icons/ri";
import { Input } from "reactstrap";
import InputWrapper from "../../utils/hoc/InputWrapper";
import { handleModifier } from "../../utils/validation/ModifiedErrorMessage";

const SimpleFileUploadField = ({ values, setFieldValue, errors, name, title, ...props }) => {
  const { t } = useTranslation("common");
  const [preview, setPreview] = useState(null);
  const [fileName, setFileName] = useState("");

  // Load existing image preview if editing
  useEffect(() => {
    if (values[name] && typeof values[name] === 'string') {
      // It's a URL (existing image)
      setPreview(values[name]);
      setFileName(values[name].split('/').pop());
    } else if (values[name] instanceof File) {
      // It's a new file
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(values[name]);
      setFileName(values[name].name);
    } else {
      setPreview(null);
      setFileName("");
    }
  }, [values[name]]);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setFieldValue(name, file);
      setFileName(file.name);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setFieldValue(name, null);
    setFieldValue(`delete_${name}`, true); // Flag for API to delete from Cloudinary
    setPreview(null);
    setFileName("");
  };

  return (
    <>
      <div className="form-group">
        {title && <label className="form-label">{t(title)}</label>}
        
        <ul className="image-select-list">
          {/* Upload button */}
          <li className="choosefile-input">
            <Input
              id={name}
              name={name}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
            <label htmlFor={name} style={{ cursor: 'pointer' }}>
              <Image 
                height={40} 
                width={40} 
                src="/assets/images/add-image.png" 
                className="img-fluid" 
                alt="Add image" 
              />
            </label>
          </li>

          {/* Preview */}
          {preview && (
            <li>
              <div className="media-img-box">
                <Image 
                  src={preview} 
                  className="img-fluid" 
                  alt="Preview" 
                  height={130} 
                  width={130} 
                  style={{ objectFit: 'cover' }}
                />
                <p className="remove-icon">
                  <RiCloseLine 
                    onClick={removeImage}
                    style={{ cursor: 'pointer' }}
                  />
                </p>
              </div>
              <h6>{fileName}</h6>
            </li>
          )}
        </ul>

        {props?.helpertext && <p className="help-text">{props.helpertext}</p>}
        
        {errors?.[name] && (
          <ErrorMessage
            name={name}
            render={(msg) => (
              <div className="invalid-feedback d-block">
                {t(handleModifier(name).split(" ").join(""))} {t("IsRequired")}
              </div>
            )}
          />
        )}
      </div>
    </>
  );
};

export default InputWrapper(SimpleFileUploadField);
