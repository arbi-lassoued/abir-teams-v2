export const getUser = () => {
  return {
    username: localStorage.getItem("username"),
    roles: JSON.parse(localStorage.getItem("roles") || "[]"),
  };
};

export const hasRole = (role) => {
  const roles = JSON.parse(localStorage.getItem("roles") || "[]");
  return roles.includes(role);
};