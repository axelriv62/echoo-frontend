/**
 * TypeScript types for the data models used in the application.
 * These types define the structure of the data returned by the backend API and used throughout the frontend application.
 */

type Comment = {
    id: string,
    user: User,
    postId: string,
    parentCommentId: string | null,
    content: string,
    createdAt: string,
    updatedAt: string | null,
}

type Page = {
    id: string,
    name: string,
    description: string,
    urlImage: string | null,
    creator: User | null,
    topics: Topic[] | null,
    createdAt: string,
    updatedAt: string | null,
}

type Post = {
    id: string,
    user: User,
    page: Page,
    title: string,
    description: string | null,
    urlImage: string | null,
    nbLikes: number,
    nbDislikes: number
    topics: Topic[] | null,
    comments: Comment[] | null,
    createdAt: string,
    updatedAt: string | null,
}

type Topic = {
    id: string,
    name: string,
}

type User = {
    id: string,
    username: string,
    imageProfile: string | null,
    followedPages: { pageId: string, rolePage: string }[] | null,
    followedUsers: unknown[] | null, // TODO: la doc swagger est pas claire là-dessus, à tester avec bruno
}
