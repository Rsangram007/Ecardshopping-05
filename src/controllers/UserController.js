const userModel = require('../models/UserModel')
const mongoose = require('mongoose')
const jwt = require("jsonwebtoken")
const bcrypt = require('bcrypt')
const Objectid = mongoose.Types.ObjectId.isValid
const { isPresent,
    isValidName,
    isValidEmail,
    isValidPhone,
    isValidPassword,
    isValidPin,
    isValidadd } = require('../validation/validation')

const { uploadFile } = require('../AWS/aws')

const createUser = async function (req, res) {
    try {

        let data = req.body
        let file = req.files

        if (Object.keys(data).length == 0 && typeof (file) == 'undefined') return res.status(400).send({ status: false, message: "Please Enter data to Create the User" })
        let { fname, lname, email, phone, password, address } = data

        if (!isPresent(fname)) return res.status(400).send({ status: false, message: "fname is mandatory" })
        if (!isValidName(fname)) return res.status(400).send({ status: false, message: "Please Provide the valid fname" })

        if (!isPresent(lname)) return res.status(400).send({ status: false, message: "lname is mandatory" })
        if (!isValidName(lname)) return res.status(400).send({ status: false, message: "Please Provide the valid lname" })

        if (!isPresent(email)) return res.status(400).send({ status: false, message: "email is mandatory" })
        if (!isValidEmail(email)) return res.status(400).send({ status: false, message: "email should be in  valid format eg:- name@gmail.com" })

        if (await userModel.findOne({ email })) return res.status(400).send({ status: false, message: "This email is already Registered Please give another Email" })

        if (!isPresent(file)) return res.status(400).send({ status: false, message: "profile Image can't be empty" })


        if (!isPresent(phone)) return res.status(400).send({ status: false, message: "Phone is mandatory" })
        if (!isValidPhone(phone)) return res.status(400).send({ status: false, message: "please provide Valid phone Number with 10 digits starts with 6||7||8||9" })

        if (await userModel.findOne({ phone })) return res.status(400).send({ status: false, message: "This Phone is already Registered Please give another Phone" })

        if (!isPresent(password)) return res.status(400).send({ status: false, message: "Password is mandatory" })
        if (!isValidPassword(password)) return res.status(400).send({ status: false, message: "password must have one capital one small one number and one special character[#?!@$%^&*-]" })

        // // ---------> Address <---------

        // if (!isPresent(address)) return res.status(400).send({ status: false, message: "Address is mandatory" })

        // // ---------> Shipping Address <---------

        // if (!isPresent(address.shipping)) return res.status(400).send({ status: false, message: "Please provide the Shipping address" })
        // if (!isPresent(address.shipping.street)) return res.status(400).send({ status: false, message: "shipping Street is mandatory" })
        // if (!isValidadd(address.shipping.street)) return res.status(400).send({ status: false, message: "shipping street containt only these letters [a-zA-Z_ ,.-]" })
        // if (!isPresent(address.shipping.city)) return res.status(400).send({ status: false, message: "city is mandatory" })
        // if (!isValidadd(address.shipping.city)) return res.status(400).send({ status: false, message: "shipping city containt only these letters [a-zA-Z_ ,.-]" })
        // if (!isPresent(address.shipping.pincode)) return res.status(400).send({ status: false, message: "shipping pincode is mandatory" })
        // if (!isValidPin(address.shipping.pincode)) return res.status(400).send({ status: false, message: "Please provide valid Pincode of 6 digits" })

        // // ---------> Billing Address <---------

        // if (!isPresent(address.billing)) return res.status(400).send({ status: false, message: "Please provide address for billing" })
        // if (!isPresent(address.billing.street)) return res.status(400).send({ status: false, message: "billing Street is mandatory" })
        // if (!isValidadd(address.billing.street)) return res.status(400).send({ status: false, message: "billing street containt only these letters [a-zA-Z_ ,.-]" })
        // if (!isPresent(address.billing.city)) return res.status(400).send({ status: false, message: "city is mandatory" })
        // if (!isValidadd(address.billing.city)) return res.status(400).send({ status: false, message: "billing city containt only these letters [a-zA-Z_ ,.-]" })
        // if (!isPresent(address.billing.pincode)) return res.status(400).send({ status: false, message: " billing pincode is mandatory" })
        // if (!isValidPin(address.billing.pincode)) return res.status(400).send({ status: false, message: "Please provide valid Pincode of 6 digits" })


        if (!address) { return res.status(400).send({ status: false, message: " Adress is mandatory" }) }

        address = JSON.parse(address)
        let { shipping, billing } = address
        if (!address.hasOwnProperty("shipping")) return res.status(400).send({ status: false, message: "Shipping Address is required " })
        if (!address.hasOwnProperty("billing")) return res.status(400).send({ status: false, message: "billing Address is required " })

        if (!shipping.hasOwnProperty("street")) return res.status(400).send({ status: false, message: "Shipping street is required " })
        if (!shipping.hasOwnProperty("city")) return res.status(400).send({ status: false, message: "Shipping city is required " })
        if (!shipping.hasOwnProperty("pincode")) return res.status(400).send({ status: false, message: "Shipping pincode is required " })
        if (!isPresent(shipping.street)) return res.status(400).send({ status: false, message: " shipping street is invalid " })
        if (!isValidName(shipping.city)) return res.status(400).send({ status: false, message: "Shipping city is invalid" })
        if (!isValidPin(shipping.pincode)) return res.status(400).send({ status: false, message: " shipping pincode is invalid. There must be six digits" })


        if (!billing.hasOwnProperty("street")) return res.status(400).send({ status: false, message: "billing street is required " })
        if (!billing.hasOwnProperty("city")) return res.status(400).send({ status: false, message: "billing city is required " })
        if (!billing.hasOwnProperty("pincode")) return res.status(400).send({ status: false, message: "billing pincode is required " })

        if (!isPresent(billing.street)) return res.status(400).send({ status: false, message: " billing street is invalid " })
        if (!isValidName(billing.city)) return res.status(400).send({ status: false, message: "billing city is invalid" })
        if (!isValidPin(billing.pincode)) return res.status(400).send({ status: false, message: " billing pincode is invalid. There must be six digits" })

        data.address = address




        if (file && file.length > 0) {
            data.profileImage = await uploadFile(file[0])
        }
        else {
            return res.status(400).send({ status: false, message: "PROFILE IMAGE FILE IS REQUIRED" })
        }
        data.password = await bcrypt.hash(password, 10)

        let createdata = await userModel.create(data)
        return res.status(201).send({ status: true, message: "user created", data: createdata })
    } catch (error) {
        return res.status(500).send({ msg: error.message, status: false })
    }
}


const userLogin = async function (req, res) {
    try {
        let { email, password } = req.body
        if (Object.entries(req.body).length === 0) {
            return res.status(400).send({ status: false, message: "Please enter email and Password" })
        }
        if (!isPresent(email)) {
            return res.status(400).send({ status: false, message: "Please enter email" })
        }
        if (!isPresent(password)) {
            return res.status(400).send({ status: false, message: "Please enter Password" })
        }
        if (!isValidEmail(email)) {
            return res.status(400).send({ status: false, message: "Please enter Email in correct format like jay58@gmail.com" })
        }
        if (!isValidPassword(password)) {
            return res.status(400).send({ status: false, message: "password must have one capital one small one number and one special character[#?!@$%^&*-]" })
        }
        let data = await userModel.findOne({ email: email })
        if (!data) {
            return res.status(404).send({ status: false, message: "User not found with this email" })
        }
        let checkpassword = await bcrypt.compare(password, data.password);
        if (!checkpassword) return res.status(400).send({ status: false, message: "login failed this password not matches with email" })

        const token = jwt.sign({
            id: data._id.toString(),
            exp: (Date.now() / 1000) + 60 * 60 * 24 * 14
        }, "mykey")
        return res.status(200).send({ status: true, message: "user login successfull", data: { userid: data._id, token: token } })
    } catch (error) {
        return res.status(500).send({ msg: error.message, status: false })
    }
}
const getUser = async function (req, res) {
    try {

        let userId = req.params.userId
        if (!Objectid(userId)) {
            return res.status(400).send({ status: false, message: " PLEASE ENTER CORRECT USER ID" })
        }
        const findUseridInDb = await userModel.findById(userId)
        if (!findUseridInDb) {
            return res.status(400).send({ status: false, message: "THIS USER IS NOT PRESENT IN OUR MONGODB" })
        }
        return res.status(200).send({ status: true, message: "USER PROFILE DETAILS", data: findUseridInDb })

    } catch (error) {
        return res.status(500).send({ msg: error.message, status: false })
    }



}
const updateUser = async function (req, res) {
    try {
        let data = req.body
        let file = req.files
        if (Object.keys(data).length == 0 && typeof (file) == 'undefined') return res.status(400).send({ status: false, message: "Please Enter data to update the User" })

        if (file && file.length > 0) {
            data.profileImage = await uploadFile(file[0])
        }

        if (data["address.billing.street"] == "") { return res.status(400).send({ status: false, message: "you can't update billing street as a empty string" }) }

        if (data["address.billing.city"] === "") { return res.status(400).send({ status: false, message: "you can't update billing city as a empty string" }) }

        if (data["address.billing.pincode"] === "") { return res.status(400).send({ status: false, message: "you can't update billing pincode as a empty string" }) }

        if (data["address.shipping.street"] === "") { return res.status(400).send({ status: false, message: "you can't update shipping street as a empty string" }) }

        if (data["address.shipping.city"] === "") { return res.status(400).send({ status: false, message: "you can't update shipping city as a empty string" }) }

        if (data["address.shipping.pincode"] === "") { return res.status(400).send({ status: false, message: "you can't update shipping pincode as a empty string" }) }

        const { fname, lname, email, phone, password } = req.body

        if (fname === "") return res.status(400).send({ status: false, message: "you can't update fname as a empty string" })
        if (lname === "") return res.status(400).send({ status: false, message: "you can't update lname as a empty string" })
        if (phone === "") return res.status(400).send({ status: false, message: "you can't update phone as a empty string" })
        if (email === "") return res.status(400).send({ status: false, message: "you can't update email as a empty string" })
        if (password === "") return res.status(400).send({ status: false, message: "you can't update password as a empty string" })

        if (typeof (fname) !== "undefined") {
            if (!isValidName(fname)) return res.status(400).send({ status: false, message: "Please Provide the valid fname,enter only alphabates" })
        }
        if (lname) {
            if (!isValidName(lname)) return res.status(400).send({ status: false, message: "Please Provide the valid lname,enter only alphabates" })
        }
        if (email) {
            if (!isValidEmail(email)) return res.status(400).send({ status: false, message: "email should be in  valid format eg:- name@gmail.com" })

            if (await userModel.findOne({ email })) return res.status(400).send({ status: false, message: "This email is already Registered Please give another Email" })
        }

        if (phone) {
            if (!isValidPhone(phone)) return res.status(400).send({ status: false, message: "please provide Valid phone Number with 10 digits starts with 6||7||8||9" })

            if (await userModel.findOne({ phone })) return res.status(400).send({ status: false, message: "This Phone is already Registered Please give another Phone" })
        }
        if (password) {
            if (!isValidPassword(password)) return res.status(400).send({ status: false, message: "please provide Valid password with 1st letter should be Capital letter and contains spcial character with Min length 8 and Max length 15" })
            data.password = await bcrypt.hash(password, 10)
        }
        if (data["address.billing.street"]) {
            if (!isValidadd(data["address.billing.street"])) return res.status(400).send({ status: false, message: " biling street containt only these letters [a-zA-Z_ ,.-]" })
        }
        if (data["address.billing.city"]) {
            if (!isValidadd(data["address.billing.city"])) return res.status(400).send({ status: false, message: "billing city containt only these letters [a-zA-Z_ ,.-]" })
        }

        if (data["address.billing.pincode"]) {
            // console.log(data["address.billing.pincode"])
            if (!isValidPin(data["address.billing.pincode"])) return res.status(400).send({ status: false, message: "Please provide valid billing Pincode of 6 digits" })
        }
        if (data["address.shipping.street"]) { if (!isValidadd(data["address.shipping.street"])) return res.status(400).send({ status: false, message: "shipping street is mandatory" }) }

        if (data["address.shipping.city"]) {
            if (!isValidadd(data["address.shipping.city"])) return res.status(400).send({ status: false, message: "shipping city containt only these letters [a-zA-Z_ ,.-]" })
        }

        if (data["address.shipping.pincode"]) {
            if (!isValidPin(data["address.shipping.pincode"])) return res.status(400).send({ status: false, message: "Please provide valid shipping Pincode of 6 digits" })
        }


        let updatedata = await userModel.findByIdAndUpdate(
            { _id: req.params.userId },
            { $set: data },
            { new: true }
        )
        return res.status(200).send({ status: true, message: "data updated successfully", data: updatedata })
    } catch (error) {
        return res.status(500).send({ msg: error.message, status: false })
    }
}

module.exports = { createUser, userLogin, getUser, updateUser }