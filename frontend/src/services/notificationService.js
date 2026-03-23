import axios from "axios";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:8080";
const NOTIFICATION_BASE_URL = `${API_BASE_URL}/api/notifications`;

export const getUserNotifications = async (userId) => {
  const response = await axios.get(
    `${NOTIFICATION_BASE_URL}/users/${userId}`,
  );
  return response.data;
};

export const getRoleNotifications = async (role) => {
  const response = await axios.get(
    `${NOTIFICATION_BASE_URL}/roles/${role}`,
  );
  return response.data;
};

export const markNotificationAsRead = async (notificationId) => {
  const response = await axios.put(
    `${NOTIFICATION_BASE_URL}/${notificationId}/read`,
  );
  return response.data;
};

const notificationService = {
  getUserNotifications,
  getRoleNotifications,
  markNotificationAsRead,
};

export default notificationService;
