const DailySteps = require("../models/dailySteps_model");
const asyncHandler = require("../middleware/async");

// @desc    Sync daily steps (upsert)
// @route   POST /fitness/steps/sync
// @access  Private
exports.syncSteps = asyncHandler(async (req, res) => {
    const { date, steps } = req.body;
    const userId = req.user._id;

    // Validation
    if (!date) {
        return res.status(400).json({ message: "Date is required" });
    }

    if (steps === undefined || steps === null) {
        return res.status(400).json({ message: "Steps count is required" });
    }

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
        return res.status(400).json({ 
            message: "Date must be in YYYY-MM-DD format" 
        });
    }

    // Validate steps is a number and not negative
    const stepsNumber = Number(steps);
    if (isNaN(stepsNumber) || stepsNumber < 0) {
        return res.status(400).json({ 
            message: "Steps must be a non-negative number" 
        });
    }

    // Upsert: Update if exists, create if doesn't
    const dailySteps = await DailySteps.findOneAndUpdate(
        { userId, date },
        { userId, date, steps: stepsNumber },
        { 
            new: true, 
            upsert: true,
            runValidators: true,
        }
    );

    res.status(200).json({
        success: true,
        data: {
            date: dailySteps.date,
            steps: dailySteps.steps,
        },
    });
});

// @desc    Get today's steps
// @route   GET /fitness/steps/today
// @access  Private
exports.getTodaySteps = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    
    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];

    const dailySteps = await DailySteps.findOne({ userId, date: today });

    res.status(200).json({
        success: true,
        data: {
            date: today,
            steps: dailySteps ? dailySteps.steps : 0,
        },
    });
});

// @desc    Get steps for a date range
// @route   GET /fitness/steps/range?from=YYYY-MM-DD&to=YYYY-MM-DD
// @access  Private
exports.getStepsRange = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { from, to } = req.query;

    // Validation
    if (!from || !to) {
        return res.status(400).json({ 
            message: "Both 'from' and 'to' date parameters are required" 
        });
    }

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(from) || !dateRegex.test(to)) {
        return res.status(400).json({ 
            message: "Dates must be in YYYY-MM-DD format" 
        });
    }

    // Validate from <= to
    if (from > to) {
        return res.status(400).json({ 
            message: "'from' date must be before or equal to 'to' date" 
        });
    }

    const stepsData = await DailySteps.find({
        userId,
        date: { $gte: from, $lte: to },
    })
    .select('date steps -_id')
    .sort({ date: 1 })
    .lean();

    res.status(200).json({
        success: true,
        data: stepsData,
    });
});
