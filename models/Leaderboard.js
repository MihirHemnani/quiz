import { Schema, model } from "mongoose";

const LeaderBoard = new Schema({

    username: {
        type: String,
        required: true
    },
    
    college: {
        type: String,
        required: true,
    },

    score: {
        type: Number,
        required: true
    },

    correctAnswers:{
        type: Number,
        required: true
    }
    
}, {
    collection: "leaderboard",
    timestamps: true
});

export default model("LeaderBoard", LeaderBoard);