import { Router } from 'express';
import { CampaignController } from '../controllers/campaign.controller';
import { authenticateJWT, requireRoles } from '../middleware/auth';

const router = Router();

// List email campaigns
router.get('/', authenticateJWT, requireRoles('SUPER_ADMIN', 'EVENT_MANAGER'), CampaignController.getCampaigns);

// Trigger / Schedule Campaign
router.post('/send-now', authenticateJWT, requireRoles('SUPER_ADMIN', 'EVENT_MANAGER'), CampaignController.sendCampaign);

// Send Test Email Preview
router.post('/test-send', authenticateJWT, requireRoles('SUPER_ADMIN', 'EVENT_MANAGER'), CampaignController.sendTestEmail);

// Delete Campaign
router.delete('/:id', authenticateJWT, requireRoles('SUPER_ADMIN', 'EVENT_MANAGER'), CampaignController.deleteCampaign);

export default router;
