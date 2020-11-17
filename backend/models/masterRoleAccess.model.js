const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const masterRoleAccessSchema = new Schema({
    RoleId: {
        type: String,
        required: true,
        unique: true
    },
    AccessId: {
        type: String,
        required: true,
        unique: true
    },
    isDelete: {
        type: Boolean,
        required: true
    }
}, {
    timestamps: true
});

const MasterRoleAccess = mongoose.model('dbMasterRoleAccess', masterRoleAccessSchema);

module.exports = MasterRoleAccess;