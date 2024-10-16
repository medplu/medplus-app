const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the professional-specific schema
const professionalSchema = new Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    consultationFee: {
        type: Number,
        required: false
    },
    email: {
        type: String,
        required: true,
        unique: true // Ensure email is unique
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',  // Reference to the base User model
        required: true
    },
    category: {
        type: String,
    },
    yearsOfExperience: {
        type: Number,
    },
    certifications: [String], // Array of certifications (optional)
    availability: {
        type: Boolean,
        default: false // Default to not available
    },
    slots: [
        {
            day: { type: String, required: false },  // Day of the week (e.g., 'Monday')
            time: { type: String, required: false }, // Time range (e.g., '10:00 AM - 11:00 AM')
            isBooked: { type: Boolean, default: false } // Whether the slot is booked or not
        }
    ],
    bio: {
        type: String,
        required: false // Bio is optional
    },
    profileImage: {
        type: String,
        required: false // Profile image URL is optional
    },
    emailNotifications: {
        type: Boolean,
        default: false // Default to not receiving email notifications
    },
    pushNotifications: {
        type: Boolean,
        default: false // Default to not receiving push notifications
    },
    location: {
        latitude: {
            type: Number,
            required: false
        },
        longitude: {
            type: Number,
            required: false
        }
    }
}, { timestamps: true });

// Create and export the 'Professional' model
const Professional = mongoose.model('Professional', professionalSchema);

module.exports = Professional;