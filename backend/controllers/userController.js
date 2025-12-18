import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import validator from "validator";
import userModel from "../models/userModel.js";
import speakeasy from "speakeasy";
import qrcode from "qrcode";
import "dotenv/config";


const createToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET);
}

const loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await userModel.findOne({ email })

        if (!user) {
            return res.json({ success: false, message: "User does not exist" })
        }

        const isMatch = await bcrypt.compare(password, user.password)

        if (!isMatch) {
            return res.json({ success: false, message: "Invalid credentials" })
        }

        // If 2FA is enabled, return a temporary token and require OTP step
        if (user.twoFactorEnabled) {
            const tempToken = jwt.sign({ id: user._id, twofa: true }, process.env.JWT_SECRET, { expiresIn: "5m" })
            return res.json({ success: true, twoFactorRequired: true, tempToken })
        }

        const token = createToken(user._id)
        res.json({ success: true, token })
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" })
    }
}

const loginAdmin = async (req, res) => {
    const { email, password } = req.body;
    try {
        if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
            const token = jwt.sign({ email, isAdmin: true }, process.env.JWT_SECRET);
            res.json({ success: true, token })
        } else {
            res.json({ success: false, message: "Invalid Admin Credentials" })
        }
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" })
    }
}

const registerUser = async (req, res) => {
    const { name, email, password, phone } = req.body;
    try {
        //check if user already exists
        const exists = await userModel.findOne({ email })
        if (exists) {
            return res.json({ success: false, message: "User already exists" })
        }

        // validating email format & strong password
        if (!validator.isEmail(email)) {
            return res.json({ success: false, message: "Please enter a valid email" })
        }
        if (password.length < 8) {
            return res.json({ success: false, message: "Please enter a strong password" })
        }
        if (!validator.isMobilePhone(phone) && phone.length != 10) {
            return res.json({ success: false, message: "Please enter a valid phone number" })
        }
        // hashing user password
        const salt = await bcrypt.genSalt(10); // the more no. round the more time it will take
        const hashedPassword = await bcrypt.hash(password, salt)

        const newUser = new userModel({ name, email, password: hashedPassword, phone })
        const user = await newUser.save()
        const token = createToken(user._id)
        res.json({ success: true, token })

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" })
    }
}

export { loginUser, registerUser, loginAdmin }

// ===== 2FA (TOTP) =====

// Start 2FA setup: generate secret and QR data URL (requires auth)
const startTwoFactorSetup = async (req, res) => {
    try {
        const userId = req.body.userId
        const user = await userModel.findById(userId)
        if (!user) return res.json({ success: false, message: "User not found" })

        const secret = speakeasy.generateSecret({
            name: `EatMore App (${user.email})`
        })

        user.totpSecret = secret.base32
        await user.save()

        const otpauthUrl = secret.otpauth_url
        const qrDataUrl = await qrcode.toDataURL(otpauthUrl)
        return res.json({ success: true, qrDataUrl, otpauthUrl })
    } catch (e) {
        console.log(e)
        return res.json({ success: false, message: "Failed to start 2FA setup" })
    }
}

// Enable 2FA after user enters first valid code (requires auth)
const verifyEnableTwoFactor = async (req, res) => {
    try {
        const userId = req.body.userId
        const { code } = req.body
        const user = await userModel.findById(userId)
        if (!user || !user.totpSecret) return res.json({ success: false, message: "2FA not initialized" })

        const isValid = speakeasy.totp.verify({
            secret: user.totpSecret,
            encoding: 'base32',
            token: String(code || '').trim(),
            window: 2
        })
        if (!isValid) return res.json({ success: false, message: "Invalid code" })

        user.twoFactorEnabled = true
        await user.save()
        return res.json({ success: true })
    } catch (e) {
        console.log(e)
        return res.json({ success: false, message: "Failed to enable 2FA" })
    }
}

// Verify login 2FA using temp token from login
const verifyTwoFactorLogin = async (req, res) => {
    try {
        const tempToken = req.headers['x-temp-token']
        const { code } = req.body
        if (!tempToken) return res.json({ success: false, message: "Missing temp token" })
        const payload = jwt.verify(tempToken, process.env.JWT_SECRET)
        if (!payload?.id || !payload?.twofa) return res.json({ success: false, message: "Invalid temp token" })

        const user = await userModel.findById(payload.id)
        if (!user || !user.totpSecret || !user.twoFactorEnabled) return res.json({ success: false, message: "2FA not enabled" })

        const isValid = speakeasy.totp.verify({
            secret: user.totpSecret,
            encoding: 'base32',
            token: String(code || '').trim(),
            window: 2
        })
        if (!isValid) return res.json({ success: false, message: "Invalid code" })

        const token = createToken(user._id)
        return res.json({ success: true, token })
    } catch (e) {
        console.log(e)
        return res.json({ success: false, message: "Verification failed" })
    }
}

export { startTwoFactorSetup, verifyEnableTwoFactor, verifyTwoFactorLogin }

// Get 2FA status (requires auth)
const getTwoFactorStatus = async (req, res) => {
    try {
        const userId = req.body.userId
        const user = await userModel.findById(userId).select('twoFactorEnabled')
        if (!user) return res.json({ success: false, message: 'User not found' })
        return res.json({ success: true, twoFactorEnabled: !!user.twoFactorEnabled })
    } catch (e) {
        console.log(e)
        return res.json({ success: false, message: 'Failed to fetch status' })
    }
}

// Disable 2FA (requires auth) - optionally verify code
const disableTwoFactor = async (req, res) => {
    try {
        const userId = req.body.userId
        const { code } = req.body
        const user = await userModel.findById(userId)
        if (!user) return res.json({ success: false, message: 'User not found' })
        if (!user.twoFactorEnabled) return res.json({ success: true })

        if (user.totpSecret && code) {
            const ok = speakeasy.totp.verify({
                secret: user.totpSecret,
                encoding: 'base32',
                token: String(code || '').trim(),
                window: 2
            })
            if (!ok) return res.json({ success: false, message: 'Invalid code' })
        }

        user.twoFactorEnabled = false
        user.totpSecret = null
        await user.save()
        return res.json({ success: true })
    } catch (e) {
        console.log(e)
        return res.json({ success: false, message: 'Failed to disable 2FA' })
    }
}

export { getTwoFactorStatus, disableTwoFactor }