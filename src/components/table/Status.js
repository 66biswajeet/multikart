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
      // Prepare the update payload
      const updateData = {
        [apiKey || 'status']: value ? 1 : 0
      };
      
      // Make API call to update the status
      const response = await fetch(`/api${url}/${data.id || data._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData)
      });
      
      if (response.ok) {
        setStatus(value);
        console.log('Status updated successfully');
        
        // Update the local data without page reload
        // You could emit an event or call a callback here if needed
      } else {
        console.error('Failed to update status');
        // Revert the status change if API call failed
      }
    } catch (error) {
      console.error('Status update error:', error);
      // Revert the status change if API call failed
    }
    setModal(false);
  };
  return (
    <>
      <FormGroup switch className="ps-0 form-switch form-check">
        <Label className="switch" onClick={() => !disabled && setModal(true)}>
          <Input type="switch" disabled={disabled ? disabled : false} checked={status} />
          <span className={`switch-state ${disabled ? "disabled" : ""}`}></span>
        </Label>
      </FormGroup>
      <ShowModal
        open={modal}
        close={false}
        setModal={setModal}
        buttons={
          <>
            <Btn title="No" onClick={() => setModal(false)} className="btn-md btn-outline fw-bold" />
            <Btn title="Yes" onClick={() => handleClick(!status)} className="btn-theme btn-md fw-bold" />
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
