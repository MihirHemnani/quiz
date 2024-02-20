import { Schema, model } from "mongoose";

const Answers = new Schema({
    questionId: {
        type: Number,
        required: true
    },
    answer: {
        type: String,
        required: true
    }
}, {
    collection: "answers",
    timestamps: true
});

export default model("Answers", Answers);