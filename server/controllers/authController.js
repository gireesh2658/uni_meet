const crypto = require('crypto');
const User = require('../models/User');
const Student = require('../models/Student');
const Faculty = require('../models/Faculty');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const { generateAccessToken, generateRefreshToken } = require('../utils/generateToken');
const sendEmail = require('../utils/sendEmail');
const emailTemplates = require('../utils/emailTemplates');
const logger = require('../utils/logger');

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV !== 'development',
  sameSite: 'strict',
  path: '/'
};

exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role, department, studentId, employeeId, designation, phone } = req.body;

    const userExists = await User.findByEmail(email).lean();
    if (userExists) {
      return errorResponse(res, 400, 'User already exists with this email');
    }

    if (role === 'admin' && req.headers['admin-secret'] !== process.env.ADMIN_SECRET) {
      const adminExists = await User.findOne({ role: 'admin' }).lean();
      if (adminExists) {
        return errorResponse(res, 403, 'Unauthorized to create admin account');
      }
    }

    const newUser = await User.create({
      name,
      email,
      password,
      role
    });

    if (role === 'student') {
      await Student.create({
        userId: newUser._id,
        studentId,
        department,
        phone
      });
    } else if (role === 'faculty') {
      await Faculty.create({
        userId: newUser._id,
        employeeId,
        department,
        designation,
        phone
      });
    }

    const accessToken = generateAccessToken(newUser._id, newUser.role);
    const refreshToken = generateRefreshToken(newUser._id);
    
    newUser.refreshToken = crypto.createHash('sha256').update(refreshToken).digest('hex');
    await newUser.save({ validateBeforeSave: false });

    // Non-blocking welcome email
    sendEmail({
      to: newUser.email,
      subject: 'Welcome to Unimeet!',
      html: emailTemplates.welcomeEmail(newUser.name, newUser.role)
    }).catch(err => logger.error(`Welcome email failed: ${err.message}`));

    res.cookie('accessToken', accessToken, { ...cookieOptions, maxAge: 15 * 60 * 1000 });
    res.cookie('refreshToken', refreshToken, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 });

    return successResponse(res, 201, 'Registration successful', {
      user: { id: newUser._id, name: newUser.name, email: newUser.email, role: newUser.role }
    });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password +failedLoginAttempts +lockUntil');
    if (!user) {
      return errorResponse(res, 401, 'Invalid credentials');
    }

    if (user.isLocked()) {
      return errorResponse(res, 403, 'Account is temporarily locked due to too many failed attempts. Please try again later.');
    }

    if (!user.isActive) {
      return errorResponse(res, 403, 'Your account has been suspended');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      user.failedLoginAttempts += 1;
      if (user.failedLoginAttempts >= 10) {
        user.lockUntil = Date.now() + 15 * 60 * 1000;
      }
      await user.save({ validateBeforeSave: false });
      return errorResponse(res, 401, 'Invalid credentials');
    }

    user.failedLoginAttempts = 0;
    user.lockUntil = undefined;
    user.lastLogin = new Date();
    
    const accessToken = generateAccessToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id);

    user.refreshToken = crypto.createHash('sha256').update(refreshToken).digest('hex');
    await user.save({ validateBeforeSave: false });

    res.cookie('accessToken', accessToken, { ...cookieOptions, maxAge: 15 * 60 * 1000 });
    res.cookie('refreshToken', refreshToken, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 });

    return successResponse(res, 200, 'Login successful', {
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    next(error);
  }
};

exports.refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.cookies;
    if (!refreshToken) return errorResponse(res, 401, 'No refresh token provided');

    const decoded = require('../utils/generateToken').verifyRefreshToken(refreshToken);
    const user = await User.findById(decoded.id).select('+refreshToken isActive');

    if (!user || !user.isActive) {
      return errorResponse(res, 401, 'Invalid token or inactive user');
    }

    const hashedToken = crypto.createHash('sha256').update(refreshToken).digest('hex');
    if (hashedToken !== user.refreshToken) {
      return errorResponse(res, 401, 'Invalid refresh token');
    }

    const accessToken = generateAccessToken(user._id, user.role);
    res.cookie('accessToken', accessToken, { ...cookieOptions, maxAge: 15 * 60 * 1000 });
    
    return successResponse(res, 200, 'Token refreshed successfully');
  } catch (error) {
    next(error);
  }
};

exports.logout = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('+refreshToken');
    if (user) {
      user.refreshToken = undefined;
      await user.save({ validateBeforeSave: false });
    }
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    return successResponse(res, 200, 'Logged out successfully');
  } catch (error) {
    next(error);
  }
};

exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      // Always return 200 to prevent email enumeration
      return successResponse(res, 200, 'If your email is registered, you will receive a reset link shortly');
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 mins
    await user.save({ validateBeforeSave: false });

    const resetURL = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;

    // In development, log the reset link so you can test without SMTP
    if (process.env.NODE_ENV === 'development') {
      logger.info(`\n========== PASSWORD RESET LINK ==========`);
      logger.info(`User: ${user.email}`);
      logger.info(`Link: ${resetURL}`);
      logger.info(`=========================================\n`);
    }
    
    sendEmail({
      to: user.email,
      subject: 'Password Reset Request',
      html: emailTemplates.passwordResetEmail(user.name, resetURL)
    }).catch(err => {
      logger.error(`Forgot password email failed: ${err.message}`);
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      user.save({ validateBeforeSave: false });
    });

    const responseData = process.env.NODE_ENV === 'development' ? { resetURL } : {};
    return successResponse(res, 200, 'If your email is registered, you will receive a reset link shortly', responseData);
  } catch (error) {
    next(error);
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const { token } = req.query;
    const { newPassword } = req.body;

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() }
    });

    if (!user) {
      return errorResponse(res, 400, 'Token is invalid or has expired');
    }

    user.password = newPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.refreshToken = undefined;
    await user.save();

    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    return successResponse(res, 200, 'Password has been reset successfully');
  } catch (error) {
    next(error);
  }
};

exports.changePassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');
    
    const isMatch = await user.comparePassword(oldPassword);
    if (!isMatch) {
      return errorResponse(res, 400, 'Incorrect old password');
    }
    
    user.password = newPassword;
    user.refreshToken = undefined;
    await user.save();

    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    
    return successResponse(res, 200, 'Password changed successfully');
  } catch (error) {
    next(error);
  }
};

exports.getMe = async (req, res, next) => {
  try {
    let profile = null;
    
    if (req.user.role === 'student') {
      profile = await Student.findOne({ userId: req.user._id }).lean();
    } else if (req.user.role === 'faculty') {
      profile = await Faculty.findOne({ userId: req.user._id }).lean();
    }
    
    return successResponse(res, 200, 'User details fetched', {
      user: req.user,
      profile
    });
  } catch (error) {
    next(error);
  }
};
