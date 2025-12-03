import React, { useEffect, useState } from 'react';
import axios from 'axios';

// Definición de roles disponibles en el sistema
const rolesDisponibles = ['ROLE_ADMIN', 'ROLE_USER'];

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [mensaje, setMensaje] = useState('');
  const [loading, setLoading] = useState(true);

  // Cargar usuarios al montar
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setMensaje('');
    try {
      // Endpoint para administradores
      const response = await axios.get('/api/admin/usuarios', {withCredentials: true});
      setUsers(response.data);
    } catch (error) {
      setMensaje('Error obteniendo usuarios');
      console.error('Error obteniendo usuarios', error);
    }
    setLoading(false);
  };

  // Cambiar rol del usuario
  const handleRoleChange = async (user, nuevoRol) => {
    setMensaje('');
    try {
      await axios.put(`/api/admin/usuarios/${user.id}`, {
        username: user.username,
        email: user.email,
        rol: nuevoRol
      }, {withCredentials: true});
      
      setMensaje(`Rol de ${user.username} actualizado a ${nuevoRol}`);
      fetchUsers(); // Recargar la lista de usuarios
    } catch (error) {
      setMensaje(error?.response?.data || 'Error cambiando rol');
      console.error('Error cambiando rol', error);
    }
  };

  // Eliminar usuario
  const handleDelete = async (user) => {
    setMensaje('');
    // Comprobación si el usuario es administrador
    if (user.roles.includes('ROLE_ADMIN')) {
      setMensaje('No se puede eliminar un usuario administrador');
      return;
    }
    
    if (!window.confirm(`¿Seguro que deseas eliminar a ${user.username}?`)) return;
    
    try {
      await axios.delete(`/api/admin/usuarios/${user.id}`, {withCredentials: true});
      setUsers(users.filter(u => u.id !== user.id));
      setMensaje('Usuario eliminado exitosamente');
    } catch (error) {
      setMensaje(error?.response?.data || 'Error eliminando usuario');
      console.error('Error eliminando usuario', error);
    }
  };

  // Componente para mostrar y cambiar roles
  const RoleManager = ({ user }) => {
    // Determinar el rol actual del usuario
    const currentRole = user.roles && user.roles.length > 0 ? user.roles[0] : 'Sin rol';
    const esAdmin = currentRole === 'ROLE_ADMIN';

    // Estilos para los botones de rol
    const buttonStyle = {
      margin: '0 5px',
      padding: '3px 8px',
      borderRadius: '4px',
      cursor: 'pointer',
      border: '1px solid #ccc'
    };

    const activeButtonStyle = {
      ...buttonStyle,
      backgroundColor: '#1976d2',
      color: 'white',
      fontWeight: 'bold',
      border: '1px solid #1976d2'
    };

    return (
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <span style={{ marginRight: '10px', fontWeight: 'bold' }}>
          {esAdmin ? 'Administrador' : 'Usuario'}:
        </span>
        <div>
          {rolesDisponibles.map(rol => (
            <button
              key={rol}
              onClick={() => currentRole !== rol && handleRoleChange(user, rol)}
              style={currentRole === rol ? activeButtonStyle : buttonStyle}
              disabled={esAdmin && rol === 'ROLE_ADMIN'} // Evitar cambiar el rol si ya es admin
            >
              {rol === 'ROLE_ADMIN' ? 'Admin' : 'Usuario'}
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div>
      <h2>Gestión de Usuarios</h2>
      {mensaje && (
        <div 
          style={{ 
            color: mensaje.includes('Error') ? 'red' : 'green', 
            marginBottom: '15px',
            padding: '10px',
            backgroundColor: mensaje.includes('Error') ? '#ffebee' : '#e8f5e9',
            borderRadius: '4px'
          }}
        >
          {mensaje}
        </div>
      )}
      {loading ? (
        <div>Cargando usuarios...</div>
      ) : (
        <table style={{ 
          borderCollapse: 'collapse', 
          width: '100%',
          boxShadow: '0 2px 3px rgba(0,0,0,0.1)',
          borderRadius: '4px',
          overflow: 'hidden'
        }}>
          <thead>
            <tr style={{ backgroundColor: '#f5f5f5' }}>
              <th style={{ padding: '12px 15px', textAlign: 'left' }}>Nombre</th>
              <th style={{ padding: '12px 15px', textAlign: 'left' }}>Email</th>
              <th style={{ padding: '12px 15px', textAlign: 'left' }}>Rol</th>
              <th style={{ padding: '12px 15px', textAlign: 'center' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => {
              const esAdmin = user.roles.includes('ROLE_ADMIN');
              return (
                <tr 
                  key={user.id}
                  style={{ 
                    borderBottom: '1px solid #eee',
                    backgroundColor: esAdmin ? '#f5f5f5' : 'white'
                  }}
                >
                  <td style={{ padding: '10px 15px' }}>{user.username}</td>
                  <td style={{ padding: '10px 15px' }}>{user.email}</td>
                  <td style={{ padding: '10px 15px' }}>
                    <RoleManager user={user} />
                  </td>
                  <td style={{ padding: '10px 15px', textAlign: 'center' }}>
                    <button
                      onClick={() => handleDelete(user)}
                      disabled={esAdmin}
                      style={{
                        padding: '5px 10px',
                        backgroundColor: esAdmin ? '#f5f5f5' : '#f44336',
                        color: esAdmin ? '#aaa' : 'white',
                        border: esAdmin ? '1px solid #ddd' : 'none',
                        borderRadius: '4px',
                        cursor: esAdmin ? 'not-allowed' : 'pointer'
                      }}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default UserManagement;