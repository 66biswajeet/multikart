import { useState } from "react";
import { useTranslation } from "react-i18next";
import { RiDeleteBinLine } from "react-icons/ri";
import ShowModal from "../../elements/alerts&Modals/Modal";
import Btn from "../../elements/buttons/Btn";

const TableDeleteOption = ({ isCheck, url, setIsCheck }) => {
  const { t } = useTranslation("common");
  const [modal, setModal] = useState(false);
  
  const handleDelete = async (deleteIds) => {
    try {
      const response = await fetch(`/api${url}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ids: deleteIds })
      });
      
      if (response.ok) {
        // Clear the selected items
        setIsCheck([]);
        // You could add a toast notification here for success
        console.log('Items deleted successfully');
        
        // Trigger a re-render or call the mutate function if available
        // Instead of reloading, we'll just clear the selection
        // The parent component should handle the refetch
      } else {
        console.error('Bulk delete failed');
      }
    } catch (error) {
      console.error('Bulk delete error:', error);
    }
    setModal(false);
  };

  return (
    <>
      <a className="align-items-center btn btn-outline btn-sm d-flex" onClick={() => setModal(true)}>
        <RiDeleteBinLine /> {t("Delete")}
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
                handleDelete(isCheck);
              }}
            />
          </>
        }
      >
        <div className="remove-box">
          <div className="remove-icon">
            <RiDeleteBinLine className="icon-box" />
          </div>
          <h2 className="mt-2">{t("DeleteItem")}?</h2>
          <p>{t("ThisItemWillBeDeletedPermanently") + " " + t("YouCan'tUndoThisAction!!")} </p>
        </div>
      </ShowModal>
    </>
  );
};

export default TableDeleteOption;
