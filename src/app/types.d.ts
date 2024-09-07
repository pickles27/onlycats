export type ActionType = "LIKE" | "UPLOAD";

export interface Action {
  action: ActionType;
  actionId: string;
  createdAt: string;
  ipAddress: string;
  postId: string;
}

export interface Post {
  createdAt: string;
  imageUrl: string;
  likes: number;
  postId: string;
}
