import { Router, Request, Response } from 'express';
import authRoutes from './auth.routes';
import visitorRoutes from './visitor.routes';
import exhibitorRoutes from './exhibitor.routes';
import subEventRoutes from './sub-event.routes';
import eventRoutes from './event.routes';
import settingsRoutes from './settings.routes';
import checkinRoutes from './checkin.routes';
import statsRoutes from './stats.routes';
import adminManagementRoutes from './admin-management.routes';
import gateRoutes from './gate.routes';
import reminderRoutes from './reminder.routes';
import campaignRoutes from './campaign.routes';
import companyEmployeeRoutes from './company-employee.routes';
import masterRoutes from './master.routes';
import devRoutes from './dev.routes';
import exhibitorLeadRoutes from './exhibitor-lead.routes';
import contactRoutes from './contact.routes';

const apiRouter = Router();

// Health check endpoint
apiRouter.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'Masters EXPO26 Node.js API', time: new Date() });
});

// Core Expo Sub-Routers
apiRouter.use('/', authRoutes);
apiRouter.use('/', visitorRoutes);
apiRouter.use('/', exhibitorRoutes);
apiRouter.use('/', subEventRoutes);
apiRouter.use('/', eventRoutes);
apiRouter.use('/', settingsRoutes);
apiRouter.use('/', checkinRoutes);
apiRouter.use('/', statsRoutes);
apiRouter.use('/', adminManagementRoutes);
apiRouter.use('/', gateRoutes);
apiRouter.use('/', companyEmployeeRoutes);
apiRouter.use('/', masterRoutes);
apiRouter.use('/', contactRoutes);
apiRouter.use('/reminders', reminderRoutes);
apiRouter.use('/campaigns', campaignRoutes);
apiRouter.use('/exhibitor-leads', exhibitorLeadRoutes);
if (process.env.NODE_ENV !== 'production' || process.env.ENABLE_DEV_ROUTES === 'true') {
  apiRouter.use('/dev', devRoutes);
}

export default apiRouter;
