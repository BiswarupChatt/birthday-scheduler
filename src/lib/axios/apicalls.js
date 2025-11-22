import api from "./axiosConfig";

export const loginUser = async (username, password) => {
  const res = await api.post("/auth/login", { username, password });
  return res.data;
};

export const resetPassword = async (oldPassword, newPassword) => {
  const res = await api.post("/auth/change-password", { oldPassword, newPassword });
  return res.data;
};

export const sendNow = async (payload) => {
  const { data } = await api.post("/message/send-now", payload);
  return data;
};

export const resetSession = async () => {
  const { data } = await api.post("/message/reset-session");
  return data;
};

export const getAllEmployees = async (params = {}) => {
  const { data } = await api.get("/employee", { params });
  return data;
};

export const createEmployee = async (payload) => {
  const { data } = await api.post("/employee", payload);
  return data;
};

export const updateEmployee = async (id, payload) => {
  const { data } = await api.put(`/employee/${id}`, payload);
  return data;
};

export const deleteEmployee = async (id) => {
  const { data } = await api.delete(`/employee/${id}`);
  return data;
};

export const getUpcomingBirthdays = async (days = 7) => {
  const { data } = await api.post("/employee/upcoming-birthdays", { days });
  return data;
};

export const createBirthdaySchedule = async ({ message, imageUrl, id }) => {
  const { data } = await api.post(`/birthday-schedule/${id}`, {
    message,
    imageUrl,
  });

  return data;
};

export const getAllBirthdaySchedules = async () => {
  const { data } = await api.get(`/birthday-schedule/all`);
  return data;
};