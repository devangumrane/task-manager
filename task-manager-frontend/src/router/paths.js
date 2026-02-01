export const ROUTES = {
  LOGIN: "/login",
  REGISTER: "/register",

  DASHBOARD: "/", // Lists projects

  PROJECTS: "/projects",
  PROJECT: (p) => `/projects/${p}`,

  TASK: (p, t) => `/projects/${p}/tasks/${t}`,

  PROFILE: "/profile",
  USER_PROFILE: (id) => `/users/${id}`,
};
