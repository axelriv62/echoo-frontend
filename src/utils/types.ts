/**
 * TypeScript types for the data models used in the application.
 * These types define the structure of the data returned by the backend API and used throughout the frontend application.
 */

export type Comment = {
    id: string,
    user: User,
    postId: string,
    parentCommentId: string | null,
    content: string,
    createdAt: string,
    updatedAt: string | null,
}

export type Page = {
    id: string,
    name: string,
    description: string,
    urlImage: string | null,
    creator: User | null,
    topics: Topic[] | null,
    createdAt: string,
    updatedAt: string | null,
}

export type Post = {
    id: string,
    user: User,
    page: Page,
    title: string,
    description: string | null,
    urlImage: string | null,
    nbLikes: number,
    nbDislikes: number,
    topics: Topic[] | null,
    comments: Comment[] | null,
    createdAt: string,
    updatedAt: string | null,
}

export type Topic = {
    id: string,
    name: string,
}

export type FollowedPage = {
    pageId: string,
    rolePage: string,
}

export type Reaction = {
    postId: string,
    userId: string,
    type: string,
}

export type BanHistoryEntry = {
    reason: string,
    bannedAt: string,
    unbannedAt: string | null,
}

export type FollowedUser = {
    id: string,
    username: string,
    imageProfile: string | null,
    followedPages: FollowedPage[] | null,
    followedUsers: string[] | null,
    topics: Topic[] | null,
}

export type User = {
    id: string,
    username: string,
    imageProfile: string | null,
    email?: string,
    enabled?: boolean,
    createdAt?: string,
    ignoredUsers?: string[] | null,
    followedPages: FollowedPage[] | null,
    followedUsers: FollowedUser[] | null,
    reactions?: Reaction[] | null,
    roles?: string[] | null,
    banHistory?: BanHistoryEntry[] | null,
    topics?: Topic[] | null,
}

export type UpdateUserProfilePayload = {
    username: string,
    imageProfile: string | null,
    email: string | null,
    topicsIds: string[],
}
