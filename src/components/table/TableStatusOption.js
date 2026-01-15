import { useState } from "react";
import { useTranslation } from "react-i18next";
import { RiToggleLine } from "react-icons/ri";
import ShowModal from "../../elements/alerts&Modals/Modal";
import Btn from "../../elements/buttons/Btn";

const TableStatusOption = ({
  isCheck,
  url,
  setIsCheck,
  statusType,
  refetch,
}) => {
  const { t } = useTranslation("common");
  const [modal, setModal] = useState(false);

  const handleStatusUpdate = async (updateIds, newStatus) => {
    try {
      // For vendor routes, use PATCH to the main route
      const isVendorRoute = url?.includes("/vendor/");
      const apiUrl = isVendorRoute ? `/api${url}` : `/api${url}/bulk-status`;
      const method = isVendorRoute ? "PATCH" : "PUT";

      const response = await fetch(apiUrl, {
        method: method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ids: updateIds,
          status: newStatus,
        }),
      });

      if (response.ok) {
        // Clear the selected items
        setIsCheck([]);
        // Call refetch to update the table
        if (refetch) {
          refetch();
        }
        console.log("Status updated successfully");
      } else {
        console.error("Bulk status update failed");
      }
    } catch (error) {
      console.error("Bulk status update error:", error);
    }
    setModal(false);
  };

  const statusText = statusType === "active" ? t("Active") : t("Inactive");
  const actionText = statusType === "active" ? t("Activate") : t("Deactivate");

  return (
    <>
      <a
        className="align-items-center btn btn-outline btn-sm d-flex ms-2"
        onClick={() => setModal(true)}
      >
        <RiToggleLine /> {actionText}
      </a>
      <ShowModal
        open={modal}
        close={false}
        setModal={setModal}
        buttons={
          <>
            <Btn
              title="No"
              onClick={() => {
                setModal(false);
              }}
              className="btn-md btn-outline fw-bold"
            />
            <Btn
              title="Yes"
              className="btn-theme btn-md fw-bold"
              onClick={() => {
                handleStatusUpdate(isCheck, statusType === "active");
              }}
            />
          </>
        }
      >
        <div className="remove-box">
          <div className="remove-icon">
            <RiToggleLine className="icon-box" />
          </div>
          <h2 className="mt-2">
            {actionText} {t("Items")}?
          </h2>
          <p>{t("ThisWillChangeStatusOfSelectedItems")}</p>
        </div>
      </ShowModal>
    </>
  );
};

export default TableStatusOption;
