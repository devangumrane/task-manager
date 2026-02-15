import api from './api';

export const getLearningPaths = () => api.get('/learning-paths');
export const createLearningPath = (data) => api.post('/learning-paths', data);
