export  const UserRolersEnum = {
    ADMIN: 'ADMIN',
    PROJECT_ADMIN: 'ADMIN',
    MEMBER:'MEMBER'
}

export const AvailableuserRole = Object.values(UserRolersEnum);

export const TaskStatusEnum = {
    TODO : "todo",
    IN_PROGRESS : "in_progress",
    DONE:"done"
}

export const TaskStatuses = Object.values(TaskStatusEnum);