export interface User {
  id: string;
  email: string;
  username: string;
  timezone: string;
  createdAt: string;
}

export interface UserBatchResponse {
  users: Pick<User, 'id' | 'username'>[];
}
