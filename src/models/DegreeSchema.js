import mongoose from 'mongoose';
const degreeSchema = new mongoose.Schema({
    studentName: {
        type: String,
        required: true
    },
    university: {
        type: String,
        required: true
    },
    dateOfBirth: {
        type: String,
        required: true
    },
    graduationDate: {
        type: String,
        required: true
    },
    score: {
        type: String,
        required: true
    },
    grade: {
        type: String,
        required: true
    },
    major: {
        type: String,
        default: 'Không có dữ liệu'
    },
    degreeType: {
        type: String,
        required: true
    },
    degreeNumber: {
        type: String,
        required: true
    },
    nftId: {
        type: String,
        required: true
    },
    imageUri: {
        type: String,
        required: true
    },
    metadataUri: {
        type: String,
        required: true
    },
    attributes: [
        {
            trait_type: {
                type: String,
                required: true
            },
            value: {
                type: String,
                required: true
            }
        }
    ],
    dateCreated: {
        type: Date,
        default: Date.now
    },

});

const Degree = mongoose.models.Degree || mongoose.model('Degree', degreeSchema);

export default Degree;
