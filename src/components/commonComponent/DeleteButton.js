import React from "react";
import { RiDeleteBinLine } from "react-icons/ri";

const DeleteButton = ({
  onClick,
  disabled = false,
  className = "",
  title = "Delete",
  size = "sm",
  variant = "danger",
  ...props
}) => {
  return (
    <button
      type="button"
      className={`btn btn-${variant} btn-${size} ${className}`}
      onClick={onClick}
      disabled={disabled}
      title={title}
      {...props}
    >
      <RiDeleteBinLine /> {title}
    </button>
  );
};

export default DeleteButton;
