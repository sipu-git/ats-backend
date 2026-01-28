import mongoose, { Schema, type Document, type Model } from "mongoose";

export interface EducationItem {
  schoolOrCollege: string;
  course: string;
  startYear?: string;
  endYear?: string;
}

export interface ExperienceItem {
  company: string;
  designation: string;
  startDate?: string;
  endDate?: string;
}

export interface IRawData extends Document {
  documentId: string;
  originalFileName: string;
  name: string;
  email: string;
  phone: string;
  skills: string[];
  education: EducationItem[];
  experience: ExperienceItem[];
  createdAt: Date;
  updatedAt: Date;
}

const EducationSchema = new Schema<EducationItem>({
  schoolOrCollege: { type: String, default: "" },
  course: { type: String, default: "" },
  startYear: { type: String, default: "" },
  endYear: { type: String, default: "" }
});

const ExperienceSchema = new Schema<ExperienceItem>({
  company: { type: String, default: "" },
  designation: { type: String, default: "" },
  startDate: { type: String, default: "" },
  endDate: { type: String, default: "" }
});

const RawDataSchema: Schema<IRawData> = new Schema(
  {
    documentId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    originalFileName: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true,
      default: ""
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      default: ""
    },
    phone: {
      type: String,
      trim: true,
      default: ""
    },
    skills: {
      type: [String],
      default: []
    },
    education: {
      type: [EducationSchema],
      default: []
    },
    experience: {
      type: [ExperienceSchema],
      default: []
    }
  },
  { timestamps: true }
);

const RawDataModel: Model<IRawData> =
  mongoose.models.RawData ||
  mongoose.model<IRawData>("RawData", RawDataSchema);

export default RawDataModel;
