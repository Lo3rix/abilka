import axios from 'axios';

const API_URL = 'http://localhost:8000/api/';

class AuthService {
  login(username, password) {
    return axios
      .post(API_URL + 'login/', {
        username,
        password,
      })
      .then(response => {
        if (response.data.access) {
          localStorage.setItem('user', JSON.stringify(response.data));
          return this.getCurrentUserProfile(response.data.access);
        }
        return response.data;
      });
  }

  logout() {
    localStorage.removeItem('user');
  }

  register(username, email, password, avatar) {
    const formData = new FormData();
    formData.append('username', username);
    formData.append('email', email);
    formData.append('password', password);
    if (avatar) {
      formData.append('avatar', avatar);
    }

    return axios.post(API_URL + 'register/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  getCurrentUser() {
    return JSON.parse(localStorage.getItem('user'));
  }

  getCurrentUserProfile(token) {
    return axios
      .get(API_URL + 'user/', {
        headers: {
          'Authorization': 'Bearer ' + token
        }
      })
      .then(response => {
        const user = this.getCurrentUser();
        user.profile = response.data;
        localStorage.setItem('user', JSON.stringify(user));
        return response.data;
      });
  }
}

export default new AuthService();