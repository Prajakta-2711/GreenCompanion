import axios from 'axios';

// Configure axios instance
const api = axios.create({
  baseURL: 'https://your-api-domain.com/api', // This will need to be updated with the actual API URL
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Authentication
export const login = async (username: string, password: string) => {
  const response = await api.post('/login', { username, password });
  return response.data;
};

export const register = async (userData) => {
  const response = await api.post('/register', userData);
  return response.data;
};

export const logout = async () => {
  const response = await api.post('/logout');
  return response.data;
};

export const getCurrentUser = async () => {
  const response = await api.get('/user');
  return response.data;
};

// Plants
export const getPlants = async () => {
  const response = await api.get('/plants');
  return response.data;
};

export const getPlant = async (id: number) => {
  const response = await api.get(`/plants/${id}`);
  return response.data;
};

export const createPlant = async (plantData) => {
  const response = await api.post('/plants', plantData);
  return response.data;
};

export const updatePlant = async (id: number, plantData) => {
  const response = await api.patch(`/plants/${id}`, plantData);
  return response.data;
};

export const deletePlant = async (id: number) => {
  const response = await api.delete(`/plants/${id}`);
  return response.data;
};

// Tasks
export const getTasks = async () => {
  const response = await api.get('/tasks');
  return response.data;
};

export const completeTask = async (id: number) => {
  const response = await api.post(`/tasks/${id}/complete`);
  return response.data;
};

// Activities
export const getActivities = async (plantId?: number) => {
  const url = plantId ? `/plants/${plantId}/activities` : '/activities';
  const response = await api.get(url);
  return response.data;
};

// Plant Scanner
export const analyzePlantImage = async (imageBase64: string) => {
  const response = await api.post('/plant-scanner/analyze', { imageBase64 });
  return response.data;
};

// Hardware
export const getHardwareStatus = async () => {
  const response = await api.get('/hardware/status');
  return response.data;
};
