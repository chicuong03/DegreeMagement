import mongoose from 'mongoose';

const DegreeTypeSchema = new mongoose.Schema(
    {
        degreetype_name: {
            type: String,
            required: true,
            trim: true,
            unique: true,
        },

        degreetype_note: {
            type: String,
            default: '',
            trim: true,
        }
    },
    {
        timestamps: true
    }
);

export default mongoose.models.DegreeType || mongoose.model('DegreeType', DegreeTypeSchema);
