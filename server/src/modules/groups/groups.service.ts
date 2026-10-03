import { Types } from 'mongoose';
import { Group, IGroup } from '../../models/Group';
import { User } from '../../models/User';
import { ApiError } from '../../middleware/errorHandler';
import { CreateGroupInput, UpdateGroupInput } from './groups.validation';

export class GroupsService {
  static async createGroup(userId: string, input: CreateGroupInput): Promise<IGroup> {
    const memberIds = new Set<string>([userId]);

    if (input.memberEmails && input.memberEmails.length > 0) {
      const extraUsers = await User.find({ email: { $in: input.memberEmails } });
      for (const u of extraUsers) {
        memberIds.add(u._id.toString());
      }
    }

    const group = await Group.create({
      name: input.name,
      description: input.description || '',
      currency: input.currency || 'INR',
      createdBy: new Types.ObjectId(userId),
      members: Array.from(memberIds).map((id) => new Types.ObjectId(id)),
    });

    return group.populate([
      { path: 'createdBy', select: 'name email avatar' },
      { path: 'members', select: 'name email avatar' },
    ]);
  }

  static async getUserGroups(userId: string): Promise<IGroup[]> {
    return Group.find({ members: new Types.ObjectId(userId) })
      .populate('createdBy', 'name email avatar')
      .populate('members', 'name email avatar')
      .sort({ updatedAt: -1 });
  }

  static async getGroupById(groupId: string, userId: string): Promise<IGroup> {
    if (!Types.ObjectId.isValid(groupId)) {
      throw ApiError.badRequest('Invalid group ID format');
    }

    const group = await Group.findById(groupId)
      .populate('createdBy', 'name email avatar')
      .populate('members', 'name email avatar');

    if (!group) {
      throw ApiError.notFound('Group not found');
    }

    const isMember = group.members.some((m: any) => m._id.toString() === userId);
    if (!isMember) {
      throw ApiError.forbidden('You are not a member of this group');
    }

    return group;
  }

  static async addMemberByEmail(groupId: string, requestingUserId: string, email: string): Promise<IGroup> {
    const group = await this.getGroupById(groupId, requestingUserId);

    const userToAdd = await User.findOne({ email });
    if (!userToAdd) {
      throw ApiError.notFound(`No user found with email "${email}". Please ask them to register on SplitSync first.`);
    }

    const alreadyMember = group.members.some((m: any) => m._id.toString() === userToAdd._id.toString());
    if (alreadyMember) {
      throw ApiError.badRequest('User is already a member of this group');
    }

    group.members.push(userToAdd._id as Types.ObjectId);
    await group.save();

    return group.populate([
      { path: 'createdBy', select: 'name email avatar' },
      { path: 'members', select: 'name email avatar' },
    ]);
  }

  static async removeMember(groupId: string, requestingUserId: string, memberIdToRemove: string): Promise<IGroup> {
    const group = await this.getGroupById(groupId, requestingUserId);

    const isCreator = group.createdBy._id.toString() === requestingUserId;
    const isSelf = requestingUserId === memberIdToRemove;

    if (!isCreator && !isSelf) {
      throw ApiError.forbidden('Only group creator or the member themselves can perform this action');
    }

    if (group.createdBy._id.toString() === memberIdToRemove && group.members.length > 1) {
      throw ApiError.badRequest('Group creator cannot leave the group while other members are present. Delete group instead.');
    }

    group.members = group.members.filter((m: any) => m._id.toString() !== memberIdToRemove);
    await group.save();

    return group.populate([
      { path: 'createdBy', select: 'name email avatar' },
      { path: 'members', select: 'name email avatar' },
    ]);
  }

  static async updateGroup(groupId: string, requestingUserId: string, input: UpdateGroupInput): Promise<IGroup> {
    const group = await this.getGroupById(groupId, requestingUserId);

    if (group.createdBy._id.toString() !== requestingUserId) {
      throw ApiError.forbidden('Only group creator can update group details');
    }

    if (input.name) group.name = input.name;
    if (input.description !== undefined) group.description = input.description;
    if (input.currency) group.currency = input.currency;

    await group.save();

    return group.populate([
      { path: 'createdBy', select: 'name email avatar' },
      { path: 'members', select: 'name email avatar' },
    ]);
  }

  static async deleteGroup(groupId: string, requestingUserId: string): Promise<void> {
    const group = await this.getGroupById(groupId, requestingUserId);

    if (group.createdBy._id.toString() !== requestingUserId) {
      throw ApiError.forbidden('Only group creator can delete this group');
    }

    await Group.findByIdAndDelete(groupId);
  }
}
