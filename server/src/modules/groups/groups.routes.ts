import { Router } from 'express';
import { GroupsController } from './groups.controller';
import { authenticate } from '../../middleware/auth';
import { validateRequest } from '../../middleware/validation';
import { createGroupSchema, updateGroupSchema, addMemberSchema } from './groups.validation';

const router = Router();

// All group endpoints require authentication
router.use(authenticate);

router.post('/', validateRequest(createGroupSchema), GroupsController.createGroup);
router.get('/', GroupsController.listGroups);
router.get('/:id', GroupsController.getGroup);
router.put('/:id', validateRequest(updateGroupSchema), GroupsController.updateGroup);
router.delete('/:id', GroupsController.deleteGroup);

router.post('/:id/members', validateRequest(addMemberSchema), GroupsController.addMember);
router.delete('/:id/members/:memberId', GroupsController.removeMember);

export const groupRoutes = router;
