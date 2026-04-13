const express = require('express');
const { getStats, getUsers, getUserById, suspendUser, activateUser, toggleUserStatus, getPendingFaculty, getAllFaculty, approveFaculty, getAppointments, cancelAppointment } = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

const router = express.Router();

router.use(protect);
router.use(authorizeRoles('admin'));

router.get('/stats', getStats);
router.get('/users', getUsers);
router.get('/users/:id', getUserById);
router.patch('/users/:id/suspend', suspendUser);
router.patch('/users/:id/activate', activateUser);
router.patch('/users/:id/toggle-status', toggleUserStatus);
router.delete('/users/:id', async (req, res, next) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'You cannot delete your own account' });
    }
    const User = require('../models/User');
    const target = await User.findById(req.params.id);
    if (!target) return res.status(404).json({ success: false, message: 'User not found' });
    if (target.role === 'admin') {
      const activeAdmins = await User.countDocuments({ role: 'admin', isActive: true });
      if (activeAdmins <= 1) return res.status(403).json({ success: false, message: 'Cannot delete the last active admin' });
    }
    await User.findByIdAndDelete(req.params.id);
    return res.json({ success: true, message: 'User deleted successfully' });
  } catch (e) { next(e); }
});
router.get('/faculty/pending', getPendingFaculty);
router.get('/faculty', getAllFaculty);
router.patch('/faculty/:id/approve', approveFaculty);
router.get('/appointments', getAppointments);
router.patch('/appointments/:id/cancel', cancelAppointment);

module.exports = router;
