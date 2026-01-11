import mongoose from "mongoose";

const supportTicketSchema = new mongoose.Schema(
  {
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    ticket_id: {
      type: String,
      unique: true,
      required: true,
    },
    subject: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ["Payout", "Technical", "Account"],
      default: "Technical",
    },
    message: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["Open", "In-Progress", "Closed"],
      default: "Open",
    },
    admin_reply: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

// Middleware to generate a unique Ticket ID (e.g., TKT-123456)
supportTicketSchema.pre("validate", function (next) {
  if (!this.ticket_id) {
    this.ticket_id = "TKT-" + Math.floor(100000 + Math.random() * 900000);
  }
  next();
});

const SupportTicket =
  mongoose.models.SupportTicket ||
  mongoose.model("SupportTicket", supportTicketSchema);

export default SupportTicket;
