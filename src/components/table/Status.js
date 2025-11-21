import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { RiQuestionLine } from "react-icons/ri";
import { FormGroup, Input, Label } from "reactstrap";
import ShowModal from "../../elements/alerts&Modals/Modal";
import Btn from "../../elements/buttons/Btn";

const Status = ({ url, data, disabled, apiKey }) => {
  const { t } = useTranslation("common");
  const [status, setStatus] = useState(false);
  const [modal, setModal] = useState(false);
  useEffect(() => {
    setStatus(Boolean(Number(apiKey ? data[apiKey] : data.status)));
  }, [data, disabled]);

  const handleClick = async (value) => {
    try {
      // For variants, use 'active' field instead of 'status'
      const updateData = url.includes("variant")
        ? { active: value }
        : { [apiKey || "status"]: value ? 1 : 0 };

      // For variants and other resources, ensure the URL includes /api prefix if not already there
      const apiUrl = url.startsWith("/") ? url : `/${url}`;
      const endpoint = apiUrl.startsWith("/api")
        ? `${apiUrl}/${data.id || data._id}`
        : `/api${apiUrl}/${data.id || data._id}`;

      // Make API call to update the status
      const response = await fetch(endpoint, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      if (response.ok) {
        setStatus(value);
        console.log("Status updated successfully");
      } else {
        console.error("Failed to update status:", response.status);
        // Revert the status change if API call failed
        setStatus(!value);
      }
    } catch (error) {
      console.error("Status update error:", error);
      // Revert the status change if API call failed
      setStatus(!value);
    }
    setModal(false);
  };
  return (
    <>
      <FormGroup switch className="ps-0 form-switch form-check">
        <Label className="switch" onClick={() => !disabled && setModal(true)}>
          <Input
            type="switch"
            disabled={disabled ? disabled : false}
            checked={status}
          />
          <span className={`switch-state ${disabled ? "disabled" : ""}`}></span>
        </Label>
      </FormGroup>
      <ShowModal
        open={modal}
        close={false}
        setModal={setModal}
        buttons={
          <>
            <Btn
              title="No"
              onClick={() => setModal(false)}
              className="btn-md btn-outline fw-bold"
            />
            <Btn
              title="Yes"
              onClick={() => handleClick(!status)}
              className="btn-theme btn-md fw-bold"
            />
          </>
        }
      >
        <div className="remove-box">
          <div className="remove-icon">
            <RiQuestionLine className="icon-box wo-bg" />
          </div>
          <h5 className="modal-title">{t("Confirmation")}</h5>
          <p>{t("Areyousureyouwanttoproceed?")} </p>
        </div>
      </ShowModal>
    </>
  );
};

export default Status;
