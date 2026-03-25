export interface MemberJoinedEvent {
  type: 'member.joined';
  groupId: string;
  groupName: string;
  userId: string;
  username: string;
}
