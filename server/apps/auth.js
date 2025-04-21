import { Router } from "express";
import { db } from "../utils/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const authRouter = Router();

// 🐨 Todo: Exercise #1
// ให้สร้าง API เพื่อเอาไว้ Register ตัว User แล้วเก็บข้อมูลไว้ใน Database ตามตารางที่ออกแบบไว้

authRouter.post('/register', async (req,res) => {
    const user = {
        username: req.body.username,
        password: req.body.password,
        firstName: req.body.firstName,
        lastName: req.body.lastName
    }

    try{
    const salt = await bcrypt.genSalt(10)
    user.password = await bcrypt.hash(user.password, salt)

    const collection = db.collection('users')
    await collection.insertOne(user)

    return res.status(201).json({
        message: "User has been created successfully",
    })
    }catch (err) {
        res.status(500).json({ error: err.message });
    }
})

authRouter.post('/login', async (req,res) => {
    try{
        const collection = db.collection('users')
        const user = await collection.findOne({username: req.body.username})

        if (!user){
            return res.status(404).json({
                message: "user not found",
            });
        }


        const isValidpassword = await bcrypt.compare(req.body.password, user.password)
        
        if (!isValidpassword){
            return res.status(400).json({
                message: "password not valid",
              }); 
        }

        console.log(process.env.SECRET_KEY)

        const token = jwt.sign(
         {id: user._id, firstName: user.firstName, lastName: user.lastName},
         process.env.SECRET_KEY,
         {
            expiresIn: "900000",
        }
        )


    return res.json({
        message: "login succesfully",
        token,
      })

    }catch (err) {
        res.status(500).json({ error: err.message });
    }
})


export default authRouter;
