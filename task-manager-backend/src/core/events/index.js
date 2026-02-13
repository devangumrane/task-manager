import { registerTaskListeners } from "../../modules/tasks/task.listeners.js";

export function initEventListeners() {
    registerTaskListeners();
    console.log("✅ [EventBus] Listeners initialized");
}
