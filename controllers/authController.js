import { comparePassword, hashPassword } from "../helpers/authhelper.js";
import userModel from "../models/userModel.js";
import orderModel from "../models/orderModel.js";
import JWT from "jsonwebtoken";

export const registerController = async (req, res) => {
    try {
        const { name, email, password, phone, address, answer } = req.body;
        if (!name) {
            return res.send({ message: "Name is required :)" });
        }
        if (!email) {
            return res.send({ message: "Email is required :)" });
        }
        if (!password) {
            return res.send({ message: "Passwrod is required :)" });
        }
        if (!phone) {
            return res.send({ message: "Phone is required :)" });
        }
        if (!address) {
            return res.send({ message: "Address is required :)" });
        }
        if (!answer) {
            return res.send({ message: "Answer is required :)" });
        }

        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
            return res.status(200).send({
                success: false,
                message: "Already registered please login!"
            });
        };

        const hashedPassword = await hashPassword(password);

        const user = await new userModel({
            name, email, phone, address, password: hashedPassword, answer,
        }).save();
        return res.status(201).send({
            success: true,
            message: "Registered Successfully",
            user,
        });

    } catch (error) {
        console.log(error)
        res.status(500).send({
            success: false,
            message: "Error in Registration",
            error,
        });
    }
};

export const loginController = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(404).send({
                success: false,
                message: "Invalid Email or Password "
            });
        }
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(404).send({
                success: false,
                message: "Email is not Registered"
            });
        }
        const match = await comparePassword(password, user.password)
        if (!match) {
            return res.status(200).send({
                success: false,
                message: "Invalid password"
            });
        }
        const token = await JWT.sign({ _id: user._id }, process.env.jwt_secret, { expiresIn: '7d' });
        res.status(200).send({
            success: true,
            message: "Login Succesful!",
            user: {
                name: user.name,
                email: user.email,
                phone: user.phone,
                address: user.address,
                role: user.role,
            },
            token,
        });
    } catch (error) {
        console.log(error)
        res.status(500).send({
            success: false,
            message: "Error in Login",
            error
        });
    }
};

export const forgotPasswordController = async (req, res) => {
    try {
        const { email, answer, newPassword } = req.body
        if (!email) {
            res.status(400).send({
                message: "Email is required",
            });
        }
        if (!answer) {
            res.status(400).send({
                message: "Answer is required",
            });
        }
        if (!newPassword) {
            res.status(400).send({
                message: "NewPassword is required",
            });
        }
        const user = await userModel.findOne({ email, answer });

        if (!user) {
            return res.status(400).send({
                success: false,
                message: "Wrong email or answer!",
            });
        }

        const hashed = await hashPassword(newPassword);
        await userModel.findByIdAndUpdate(user._id, { password: hashed });
        res.status(200).send({
            success: true,
            message: "Password Reset Successfully!"
        })

    } catch (error) {
        console.log(error)
        res.status(500).send({
            success: false,
            message: "Something went wrong!",
            error,
        })
    }
};

export const testController = (req, res) => {
    try {
        res.send("Protected Routes");
    } catch (error) {
        console.log(error);
        res.send({ error });
    }
};

export const updateProfileController = async (req, res) => {
    try {
        const { name, email, password, address, phone } = req.body;
        const user = await userModel.findById(req.user._id);

        if (password && password.length < 6) {
            return res.json({ error: "Passsword is required and 6 character long" });
        }
        const hashedPassword = password ? await hashPassword(password) : undefined;
        const updatedUser = await userModel.findByIdAndUpdate(
            req.user._id,
            {
                name: name || user.name,
                password: hashedPassword || user.password,
                phone: phone || user.phone,
                address: address || user.address,
            },
            { new: true }
        );
        res.status(200).send({
            success: true,
            message: "Profile Updated!",
            updatedUser,
        });
    } catch (error) {
        console.log(error);
        res.status(400).send({
            success: false,
            message: "Error in Updating Profile!",
            error,
        });
    }
};

export const getOrdersController = async (req, res) => {
    try {
        const orders = await orderModel
            .find({})
            .populate("products", "-photo")
            .populate("buyer", "name");
        res.json(orders);
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: "Error while Getting Orders",
            error,
        });
    }
};

export const getAllOrdersController = async (req, res) => {
    try {
        const orders = await orderModel
            .find({})
            .populate("products", "-photo")
            .populate("buyer", "name")
            .sort({ createdAt: "-1" });
        res.json(orders);
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: "Error While Getting All Orders",
            error,
        });
    }
};

export const orderStatusController = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { status } = req.body;
        const orders = await orderModel.findByIdAndUpdate(
            orderId,
            { status },
            { new: true }
        );
        res.json(orders);
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: "Error While Updating Orders",
            error,
        });
    }
};