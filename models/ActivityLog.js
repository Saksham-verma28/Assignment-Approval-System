const mongoose = require('mongoose');

const ActivityLogSchema = new mongoose.Schema({
    timestamp: {
        type: Date,
        default: Date.now,
        required: true,
        index: true
    },
    actionType: {
        type: String,
        required: true,
        enum: ['CREATE', 'UPDATE', 'DELETE', 'ASSIGN', 'VERIFY', 'LOGOUT', 'LOGIN']
    },
    entityType: {
        type: String,
        required: true,
        enum: ['User', 'Department', 'System']
    },
    entityId: {
        type: mongoose.Schema.Types.ObjectId,
        index: true
    },
    description: {
        type: String,
        required: true
    },
    performedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    },
    icon: {
        type: String
    },
    color: {
        type: String
    }
});

module.exports = mongoose.model('ActivityLog', ActivityLogSchema);
