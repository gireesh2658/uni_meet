require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const cookieParser = require('cookie-parser');

const connectDB = require('./config/db');
const logger = require('./utils/logger');
const { errorResponse, successResponse } = require('./utils/apiResponse');
const errorMiddleware = require('./middleware/errorMiddleware');

const authRoutes = require('./routes/authRoutes');
const facultyRoutes = require('./routes/facultyRoutes');
const slotRoutes = require('./routes/slotRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const studentRoutes = require('./routes/studentRoutes');
const adminRoutes = require('./routes/adminRoutes');
const meetingRoutes = require('./routes/meetingRoutes');

const app = express();

// Security Headers
app.use(helmet());

// CORS - allow frontend origin
const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:8080',
  'http://localhost:8080',
  'http://localhost:5173',
];
app.use(cors({
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100,
  message: { success: false, message: 'Too many requests from this IP, please try again in 15 minutes' }
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  skipSuccessfulRequests: true,
  message: { success: false, message: 'Too many login attempts from this IP, please try again after 15 minutes' }
});

app.use(cookieParser());
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

app.use(mongoSanitize({ allowDots: true, replaceWith: '_' }));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

if (process.env.NODE_ENV === 'production') {
  app.use('/api', generalLimiter);
}

// Routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/faculty', facultyRoutes);
app.use('/api/slots', slotRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/meetings', meetingRoutes);

app.get('/api/health', (req, res) => {
  return successResponse(res, 200, 'Server is running', {
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

app.use((req, res) => {
  return errorResponse(res, 404, 'Route not found');
});

// Error handling middleware
app.use(errorMiddleware);

const PORT = process.env.PORT || 5000;

// Auto-complete appointments whose time slot has passed
const autoCompleteAppointments = async () => {
  try {
    const Appointment = require('./models/Appointment');
    const TimeSlot = require('./models/TimeSlot');
    const now = new Date();

    const approvedAppointments = await Appointment.find({ status: 'approved' })
      .populate('slotId')
      .lean();

    const toComplete = [];

    for (const appt of approvedAppointments) {
      try {
        if (!appt.slotId) continue;
        const apptDate = new Date(appt.date);
        const endTimeStr = appt.slotId.endTime; // e.g. "10:30" (24h)
        if (!endTimeStr) continue;

        let hours, minutes;
        if (endTimeStr.includes('AM') || endTimeStr.includes('PM')) {
          const [time, mod] = endTimeStr.split(' ');
          [hours, minutes] = time.split(':').map(Number);
          if (mod === 'PM' && hours !== 12) hours += 12;
          if (mod === 'AM' && hours === 12) hours = 0;
        } else {
          [hours, minutes] = endTimeStr.split(':').map(Number);
        }

        const apptEnd = new Date(apptDate);
        apptEnd.setHours(hours, minutes, 0, 0);

        if (now > apptEnd) {
          toComplete.push(appt._id);
        }
      } catch (e) { /* skip malformed */ }
    }

    if (toComplete.length > 0) {
      await Appointment.updateMany({ _id: { $in: toComplete } }, { $set: { status: 'missed' } });
      logger.info(`Auto-marked ${toComplete.length} appointment(s) as missed`);
    }
  } catch (err) {
    logger.error('Auto-complete job error:', err);
  }
};

// Connect to the database then start the server
connectDB().then(() => {
  // Run auto-complete on startup, then every 30 minutes
  autoCompleteAppointments();
  setInterval(autoCompleteAppointments, 30 * 60 * 1000);

  app.listen(PORT, () => {
    logger.info(`Server is running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  });
});

