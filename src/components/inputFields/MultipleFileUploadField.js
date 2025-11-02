import { ErrorMessage } from "formik";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { RiCloseLine } from "react-icons/ri";
import { Input } from "reactstrap";
import InputWrapper from "../../utils/hoc/InputWrapper";
import { handleModifier } from "../../utils/validation/ModifiedErrorMessage";

const MultipleFileUploadField = ({ values, setFieldValue, errors, name, title, maxFiles = 10, ...props }) => {
  const { t } = useTranslation("common");
  const [previews, setPreviews] = useState([]);

  // Load existing images and new files
  useEffect(() => {
    const currentValue = values[name];
    
    if (!currentValue) {
      setPreviews([]);
      return;
    }

    // Handle array of URLs (existing images from server)
    if (Array.isArray(currentValue)) {
      const previewItems = currentValue.map((item, index) => {
        if (typeof item === 'string') {
          // Existing image URL
          return {
            id: `existing-${index}`,
            preview: item,
            fileName: item.split('/').pop(),
            isExisting: true,
            url: item
          };
        } else if (item instanceof File) {
          // New file
          return {
            id: `new-${index}`,
            preview: URL.createObjectURL(item),
            fileName: item.name,
            isExisting: false,
            file: item
          };
        }
        return null;
      }).filter(Boolean);
      
      setPreviews(previewItems);
    }
  }, [values[name]]);

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files);
    
    if (files.length === 0) return;

    const currentValue = values[name] || [];
    const currentCount = Array.isArray(currentValue) ? currentValue.length : 0;
    
    if (currentCount + files.length > maxFiles) {
      alert(`You can only upload up to ${maxFiles} images`);
      return;
    }

    // Add new files to existing array
    const newValue = [...currentValue, ...files];
    setFieldValue(name, newValue);

    // Clear the input to allow selecting the same file again
    event.target.value = '';
  };

  const removeImage = (index) => {
    const currentValue = values[name] || [];
    const itemToRemove = currentValue[index];
    
    // If it's an existing URL (string), add it to delete list
    if (typeof itemToRemove === 'string') {
      const deleteFieldName = `delete_${name}`;
      const currentDeleteList = values[deleteFieldName] || [];
      setFieldValue(deleteFieldName, [...currentDeleteList, itemToRemove]);
    }
    
    // Remove from array
    const newValue = currentValue.filter((_, i) => i !== index);
    setFieldValue(name, newValue.length > 0 ? newValue : []);
  };

  // Cleanup blob URLs on unmount
  useEffect(() => {
    return () => {
      previews.forEach(preview => {
        if (!preview.isExisting && preview.preview) {
          URL.revokeObjectURL(preview.preview);
        }
      });
    };
  }, [previews]);

  return (
    <>
      <div className="form-group">
        {title && <label className="form-label">{t(title)}</label>}
        
        <ul className="image-select-list">
          {/* Upload button - only show if under max limit */}
          {previews.length < maxFiles && (
            <li className="choosefile-input">
              <Input
                id={name}
                name={name}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
              <label htmlFor={name} style={{ cursor: 'pointer' }}>
                <Image 
                  height={40} 
                  width={40} 
                  src="/assets/images/add-image.png" 
                  className="img-fluid" 
                  alt="Add images" 
                />
              </label>
            </li>
          )}

          {/* Previews */}
          {previews.map((item, index) => (
            <li key={item.id}>
              <div className="media-img-box">
                <Image 
                  src={item.preview} 
                  className="img-fluid" 
                  alt={item.fileName} 
                  height={130} 
                  width={130} 
                  style={{ objectFit: 'cover' }}
                />
                <p className="remove-icon">
                  <RiCloseLine 
                    onClick={() => removeImage(index)}
                    style={{ cursor: 'pointer' }}
                  />
                </p>
              </div>
              <h6>{item.fileName}</h6>
            </li>
          ))}
        </ul>

        {props?.helpertext && <p className="help-text">{props.helpertext}</p>}
        
        {previews.length > 0 && (
          <p className="text-muted small mt-2">
            {previews.length} / {maxFiles} images
          </p>
        )}
        
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

export default InputWrapper(MultipleFileUploadField);
