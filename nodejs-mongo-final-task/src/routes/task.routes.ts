import express from 'express';
import { body } from 'express-validator';
import {
  createTask,
  getTasks,
  getTask,
  updateTask,
  deleteTask,
} from '../controllers/task.controller';
import { protect } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validation.midlleware';

const router = express.Router();

router.use(protect); // All task routes are protected

router.route('/')
  .get(getTasks)
  .post(
    validate([
      body('title').notEmpty().withMessage('Title is required'),
      body('priority')
        .optional()
        .isIn(['low', 'medium', 'high'])
        .withMessage('Priority must be low, medium, or high'),
      body('status')
        .optional()
        .isIn(['pending', 'completed'])
        .withMessage('Status must be pending or completed'),
      body('dueDate')
        .optional()
        .isISO8601()
        .withMessage('Due date must be a valid date'),
    ]),
    createTask
  );

router.route('/:id')
  .get(getTask)
  .put(
    validate([
      body('title').optional().notEmpty().withMessage('Title cannot be empty'),
      body('priority')
        .optional()
        .isIn(['low', 'medium', 'high'])
        .withMessage('Priority must be low, medium, or high'),
      body('status')
        .optional()
        .isIn(['pending', 'completed'])
        .withMessage('Status must be pending or completed'),
      body('dueDate')
        .optional()
        .isISO8601()
        .withMessage('Due date must be a valid date'),
    ]),
    updateTask
  )
  .delete(deleteTask);

export default router;