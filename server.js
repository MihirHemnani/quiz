import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from 'cors';
import LeaderBoard from "./models/Leaderboard.js"
import Answers from "./models/Answers.js"

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
app.post('/api/updatescore', async (req, res) => {
    const {email} = req.body;
    try {

        const user = await LeaderBoard.findOne({
            email: email
        })
        if(user) {
            await LeaderBoard.updateOne(
                { email: email },
                { score: user.score + 1 }
            );
            res.status(200).json({msg: true});
        } else {
            res.status(200).json({msg: false});
        }

    } catch (err) {
        console.log(err)
        res.status(400).json({ error: err.message });
    }
})

app.post('/api/getscore', async (req, res) => {
    const {email} = req.body;
    try {

        const user = await LeaderBoard.findOne({
            email: email
        })

        if(user) {
            res.status(200).json({score: user.score});
        } else {
            res.status(200).json({score: 0});
        }

    } catch (err) {
        console.log(err)
        res.status(400).json({ error: err.message });
    }
})

// creating the routes
app.post('/api/register', async (req, res) => {
    const {username, email, college} = req.body;
    try {
        // const existingEntry1 = await LeaderBoard.findOne({
        //     email: email,
        //     username: username,
        //     college:college
        // });
        const existingEntry2 = await LeaderBoard.findOne({
            email: email,
        });
        // if (existingEntry1) {
        //     res.status(200).json({msg: "olduser", user: existingEntry1});
        // } 
        if (existingEntry2) {
            res.status(200).json({msg: "emailidused"});
        } 
        else {
            await LeaderBoard.create({
                username: username.toLowerCase(),
                college: college.toLowerCase(),
                score: 0,
                email: email
            });
            res.status(200).json({msg: "newuser"});
        }
    } catch (err) {
        console.log(err)
        res.status(400).json({ error: err.message });
    }
})

app.post('/api/currentposition', async(req, res) => {
    const {email} = req.body;
    
    try {

        const user = await LeaderBoard.findOne({
            email: email
        })

        if(user) {

            const results = await LeaderBoard.find({}).sort({
                score: -1,
                updatedAt: 1,
            });
            
            const userIndex = results.findIndex(user => user.email === email);
            // console.log(userIndex)
            res.status(201).json({rank: userIndex + 1, msg: true})

        } else {
            res.status(201).json({msg: false})
        }

    } catch(err) {
        console.log(err)
        res.status(404).json({msg: err})
    }
})

app.get('/api/leaderboard', async(req, res) => {
    try {    
        const results = await LeaderBoard.find({}).sort({
            score: -1, // Sort by score in descending order (highest score first)
            updatedAt: 1, // If scores are the same, sort by updatedAt in ascending order
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

app.post('/api/answer', async (req, res) => {
    const {questionId, answer} = req.body;
    const question = (questionId * 83) + 67;
    try {
        const q = await Answers.findOne({questionId: question})
        if(q.answer === answer) {
            res.status(200).json({msg: true})
        } else {
            res.status(200).json({msg: false})
        }
    } catch (err) {
        console.log(err);
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

