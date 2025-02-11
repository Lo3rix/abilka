import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import './UserProfile.css';

const UserProfile = () => {
  const { userId } = useParams();
  const [user, setUser] = useState(null);

  useEffect(() => {
    axios
      .get(`http://localhost:8000/api/users/${userId}/profile/`)
      .then((response) => {
        setUser(response.data);
      })
      .catch((error) => {
        console.error('Error fetching user profile:', error);
      });
  }, [userId]);

  if (!user) {
    return <p>Загрузка...</p>;
  }

  return (
    <div className="user-profile">
      <img src={user.avatar} alt="Avatar" className="avatar" />
      <h2>{user.username}</h2>
      <p>Email: {user.email}</p>
      <p>Дата регистрации: {new Date(user.created_at).toLocaleString()}</p>
      {/* Расширим по мере необходимости */}
    </div>
  );
};

export default UserProfile;
