import { Router } from 'express';
import { ExhibitorLeadController } from '../controllers/exhibitor-lead.controller';
import { authenticateJWT } from '../middleware/auth';

const router = Router();

// Require authentication for all lead routes
router.use(authenticateJWT);

router.post('/scan', ExhibitorLeadController.scanVisitorLead);
router.get('/', ExhibitorLeadController.getExhibitorLeads);
router.get('/export', ExhibitorLeadController.exportExhibitorLeadsCsv);
router.patch('/:id', ExhibitorLeadController.updateLead);

export default router;
