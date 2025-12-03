import React, { useState, useEffect } from 'react';
import axios from 'axios';

const UserProfile = () => {
  const [user, setUser] = useState(null);
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get('/api/perfil');
        setUser(response.data);
        setNombre(response.data.nombre);
        setEmail(response.data.email);
      } catch (error) {
        console.error('Error obteniendo perfil', error);
      }
    };
    fetchUser();
  }, []);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      await axios.put('/api/perfil', { nombre, email });
      alert('Perfil actualizado');
    } catch (error) {
      console.error('Error actualizando perfil', error);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }
    try {
      await axios.put('/api/perfil/contrasena', { currentPassword, newPassword, confirmPassword });
      alert('Contraseña actualizada');
    } catch (error) {
      console.error('Error actualizando contraseña', error);
    }
  };

  return (
    <div>
      <h2>Perfil de Usuario</h2>
      {user && (
        <div>
          <form onSubmit={handleProfileUpdate}>
            <div>
              <label>Nombre:</label>
              <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
            </div>
            <div>
              <label>Email:</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <button type="submit">Actualizar Perfil</button>
          </form>
          <form onSubmit={handlePasswordUpdate}>
            <div>
              <label>Contraseña Actual:</label>
              <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />
            </div>
            <div>
              <label>Nueva Contraseña:</label>
              <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
            </div>
            <div>
              <label>Confirmar Nueva Contraseña:</label>
              <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
            </div>
            <button type="submit">Actualizar Contraseña</button>
          </form>
        </div>
      )}
    </div>
  );
};

export default UserProfile;