const fetchWithToken = async (url: string, options: any = {}) => {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('No token found');
  const headers = { ...options.headers, Authorization: `Bearer ${token}` };
  return fetch(url, { ...options, headers });
};

export { fetchWithToken }; 