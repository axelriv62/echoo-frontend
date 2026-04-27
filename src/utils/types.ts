type Ban = {
    admin : unknown,
    bannedAt: string,
    unbannedAt : string | null,
    reason: string | null,
}

type Comment = {
    id: string,
    user: unknown,
    post: unknown,
    parentComment: unknown | null,
    childrenComments: unknown[] | null,
    content: string,
    deleted: boolean,
    createdAt: string,
    updatedAt: string | null,
}

type Reaction = {
    id: string,
    type: string,
    user: unknown,
    post: Post,
    createdAt: string,
}

type Topic = {
    id: string,
    name: string,
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
    user: unknown,
    page: unknown,
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

type User = {
    id: string,
    username: string,
    password: string,
    roles: string[],
    email : string,
    imageProfile: string | null,
    ignoredUsers: unknown[],
    followedUsers: unknown[],
    createdAt : string,
    enabled: boolean,
    credentialsNonExpired: boolean,
    accountNonLocked: boolean,
    banHistory: Ban[] | null,
    followedPages : Page[] | null,
    reactions: Reaction[] | null,
}