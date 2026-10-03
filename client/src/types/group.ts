export interface GroupMember {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface Group {
  _id: string;
  name: string;
  description?: string;
  image?: string;
  createdBy: GroupMember;
  members: GroupMember[];
  currency: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateGroupPayload {
  name: string;
  description?: string;
  currency?: string;
  memberEmails?: string[];
}

export interface AddMemberPayload {
  groupId: string;
  email: string;
}
