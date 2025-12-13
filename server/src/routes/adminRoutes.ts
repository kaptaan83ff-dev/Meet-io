
import express from 'express';
import { getAllUsers, deleteUser, updateUserRole } from '../controllers/adminController';
import { protect } from '../middleware/authMiddleware';
import { admin } from '../middleware/adminMiddleware';

const router = express.Router();

// Apply protect and admin middleware to all routes
router.use(protect);
router.use(admin);

router.route('/users')
    .get(getAllUsers);

router.route('/users/:id')
    .delete(deleteUser);

router.route('/users/:id/role')
    .patch(updateUserRole);

export default router;
