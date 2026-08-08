import { Router } from 'express';
import { ContactController } from '../controllers/contact.controller';
import { authenticateJWT, requireRoles } from '../middleware/auth';

const router = Router();

// Public route to submit contact form
router.post('/contact', ContactController.submitContactForm);

// Admin management routes
router.get(
  '/admin/contact-enquiries',
  authenticateJWT,
  requireRoles('SUPER_ADMIN', 'EVENT_MANAGER'),
  ContactController.getContactEnquiries
);

router.put(
  '/admin/contact-enquiries/:id',
  authenticateJWT,
  requireRoles('SUPER_ADMIN', 'EVENT_MANAGER'),
  ContactController.updateEnquiryStatus
);

router.delete(
  '/admin/contact-enquiries/:id',
  authenticateJWT,
  requireRoles('SUPER_ADMIN'),
  ContactController.deleteEnquiry
);

export default router;
