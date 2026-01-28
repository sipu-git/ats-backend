import { connectDB } from "../configs/db.config";
import { CounterModel } from "../models/counter.model";
import RawDataModel, { type EducationItem, type ExperienceItem } from "../models/data.model";

function generateDocId() {
  return `DOC-${Date.now()}`;
}
export async function createRawData(data: {
  originalFileName: string;
  name: string;
  email: string;
  phone: string;
  skills: string[];
  education: EducationItem[];
  experience: ExperienceItem[];
}) {
  await connectDB();

  const counter = await CounterModel.findOneAndUpdate(
    { name: "rawdata" },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );

  const documentId = `DOC-${counter.seq}`;

  return RawDataModel.create({
    documentId:generateDocId(),
    ...data,
  });
}
