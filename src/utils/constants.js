export const UserRolersEnum = {
    ADMIN: 'ADMIN',
    PROJECT_ADMIN: 'ADMIN',
    MEMBER: 'MEMBER'
}

export const AvailableUserRole = Object.values(UserRolersEnum); // Object.values() extracts all values from the object into an array. ['ADMIN', 'PROJECT_ADMIN', 'MEMBER']

export const TaskStatusEnum = {
    TODO: "todo",
    IN_PROGRESS: "in_progress",
    DONE: "done"
}

export const TaskStatuses = Object.values(TaskStatusEnum);