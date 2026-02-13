import { EventEmitter } from 'events';

class EventBus extends EventEmitter { }

export const eventBus = new EventBus();

export const EVENTS = {
    TASK: {
        CREATED: 'task.created',
        UPDATED: 'task.updated',
        DELETED: 'task.deleted',
    },
    PROJECT: {
        CREATED: 'project.created',
    },
    NOTIFICATION: {
        CREATED: 'notification.created'
    }
};
