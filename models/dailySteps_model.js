const mongoose = require('mongoose');

const DailyStepsSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer',
        required: [true, "User ID is required"],
        index: true,
    },
    date: {
        type: String,
        required: [true, "Date is required"],
        match: [
            /^\d{4}-\d{2}-\d{2}$/,
            "Date must be in YYYY-MM-DD format",
        ],
        index: true,
    },
    steps: {
        type: Number,
        required: [true, "Steps count is required"],
        min: [0, "Steps cannot be negative"],
        default: 0,
    },
}, {
    timestamps: true,
});

// Compound unique index to ensure one record per user per date
DailyStepsSchema.index({ userId: 1, date: 1 }, { unique: true });

module.exports = mongoose.models.DailySteps || mongoose.model("DailySteps", DailyStepsSchema);
