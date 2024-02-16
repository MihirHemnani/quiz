import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from 'cors';
import LeaderBoard from "./models/Leaderboard.js"

const app = express();
dotenv.config();

app.use(express.json())
app.use(cors())

// connecting to mongoose database
const connectDatabase = async () => {
    try {
        mongoose.set("strictQuery", true)

        mongoose.connect(process.env.MONGO_URI)

        // console.log("Mongoose Connected");
    } catch (err) {
        console.error(err);
    }
}

// creating the routes
app.post('/api/leaderboard', async (req, res) => {
    const {username, email, college, score, correctAnswers} = req.body;
    try {
        const existingEntry = await LeaderBoard.findOne({
            email: email
        });
        if (existingEntry && score > existingEntry.score) {
            await LeaderBoard.updateOne(
              { _id: existingEntry._id },
              { score: score, correctAnswers: correctAnswers }
            );
        } else if (!existingEntry) {
            // If the entry doesn't exist, create a new one
            await LeaderBoard.create({
              username: username.toLowerCase(),
              college: college.toLowerCase(),
              score: score,
            });
        }
        res.status(200).json({msg: "Done"});
    } catch (err) {
        console.log(err)
        res.status(400).json({ error: err.message });
    }
})

app.post('/api/currentposition', async(req, res) => {
    const {email} = req.body;

    try {

        const results = await LeaderBoard.find({}).sort({
            score: -1,
            updatedAt: 1,
        });
        
        const userIndex = results.findIndex(user => user.email === email);
        console.log(userIndex)
        res.status(201).json({rank: userIndex + 1})

    } catch(err) {
        console.log(err)
        res.status(404).json({msg: err})
    }
})

app.get('/api/leaderboard', async(req, res) => {
    try {    
        const results = await LeaderBoard.find({}).sort({
            score: -1, // Sort by score in descending order (highest score first)
            createdAt: 1, // If scores are the same, sort by createdAt in ascending order
        }).limit(10);
        res.status(200).json(results);
    } catch(err) {
        console.log(err)
        res.status(400).json({ error: err.message });
    }
})

app.post('/api/user', async (req, res) => {
    const {username, college} = req.body;
    try {
        const result = await LeaderBoard.findOne({username: username.toLowerCase(), college: college.toLowerCase()})
        res.status(200).json({msg: (result === null ? "NO" : "YES")});
    } catch (err) {
        console.log(err)
        res.status(400).json({ error: err.message });
    }
})

connectDatabase().then(() => {
    app.listen(process.env.PORT, () => {
        console.log(`HI I am Server...`);
    });
}).catch((err) => {
    console.error(err);
});

