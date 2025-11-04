import mongoose from "mongoose";

const teamSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    captain: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true, // The captain (team creator)
    },

    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      }
    ],
    
  },
  { timestamps: true }
);

// ✅ Export Model
export default mongoose.models.Team || mongoose.model("Team", teamSchema);
