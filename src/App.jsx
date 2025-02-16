import React, { useState, useEffect } from 'react';

const App = () => {
  const [currentPage, setCurrentPage] = useState('login');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [users, setUsers] = useState([]);
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loginData, setLoginData] = useState({
    dni: '',
    password: ''
  });

  const [registerData, setRegisterData] = useState({
    nombre: '',
    apellidos: '',
    telefono: '',
    email: '',
    dni: '',
    pais: '',
    ciudad: '',
    codigoPostal: '',
    domicilio: '',
    password: '',
    confirmPassword: ''
  });

  const handleLogout = () => {
    if (window.confirm('¿Está seguro que desea cerrar sesión?')) {
      setIsAuthenticated(false);
      setIsAdmin(false);
      setCurrentPage('login');
      setLoginData({
        dni: '',
        password: ''
      });
      setUserData(null);
      setUsers([]);
      localStorage.removeItem('token');
      alert('Sesión cerrada con éxito');
    }
  };

  const fetchUserData = async () => {
    try {
      const response = await fetch('https://banco-global-europa.onrender.com/api/users/account', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        console.log('Données utilisateur:', data);
        setUserData(data);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  useEffect(() => {
    if (isAuthenticated && !isAdmin) {
      fetchUserData();
    }
  }, [isAuthenticated, isAdmin]);

  const fetchUsers = async () => {
    try {
      const response = await fetch('https://banco-global-europa.onrender.com/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        setUsers(data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      fetchUsers();
    }
  }, [isAuthenticated, isAdmin]);

  const handleValidateUser = async (userId) => {
    const numeroCuenta = prompt('Introducir número de cuenta (formato: ESXX XXXX XXXX XXXX XXXX XXXX):');
    if (!numeroCuenta) return;

    if (!numeroCuenta.startsWith('ES')) {
      alert('El número de cuenta debe empezar por ES');
      return;
    }

    try {
      const response = await fetch(`https://banco-global-europa.onrender.com/api/admin/users/${userId}/validate`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ numeroCuenta })
      });
      if (response.ok) {
        fetchUsers();
      } else {
        alert('Error al validar usuario');
      }
    } catch (error) {
      alert('Error de conexión');
    }
  };

  const handleUpdateBalance = async (userId) => {
    const newBalance = prompt('Introducir nuevo saldo:');
    if (newBalance === null || isNaN(newBalance)) return;

    try {
      const response = await fetch(`https://banco-global-europa.onrender.com/api/admin/users/${userId}/balance`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ saldo: parseFloat(newBalance) })
      });
      if (response.ok) {
        fetchUsers();
      }
    } catch (error) {
      alert('Error al actualizar saldo');
    }
  };

  const handleToggleBlock = async (userId, currentStatus) => {
    const newStatus = currentStatus === 'bloqueado' ? 'activo' : 'bloqueado';
    try {
      const response = await fetch(`https://banco-global-europa.onrender.com/api/admin/users/${userId}/block`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ estado: newStatus })
      });
      if (response.ok) {
        fetchUsers();
      }
    } catch (error) {
      alert('Error al cambiar estado de usuario');
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      console.log('Tentative de connexion avec:', loginData);
      const response = await fetch('https://banco-global-europa.onrender.com/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(loginData)
      });

      const data = await response.json();
      
      if (response.ok) {
        if (data.estado === 'bloqueado') {
          alert('Su cuenta está bloqueada. Contacte con el administrador.');
          return;
        }

        if (data.estado === 'pendiente') {
          alert('Su cuenta está en espera de verificación');
          setCurrentPage('verification');
          return;
        }

        localStorage.setItem('token', data.token);
        setIsAuthenticated(true);
        setIsAdmin(data.isAdmin);
        setCurrentPage(data.isAdmin ? 'adminDashboard' : 'dashboard');
      } else {
        if (data.estado === 'bloqueado') {
          alert('Su cuenta está bloqueada. Contacte con el administrador.');
        } else if (data.estado === 'pendiente') {
          alert('Su cuenta está en espera de verificación');
          setCurrentPage('verification');
        } else {
          alert(data.error || 'Error al iniciar sesión');
        }
      }
    } catch (error) {
      alert('Error de conexión');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    if (registerData.password !== registerData.confirmPassword) {
      alert('Las contraseñas no coinciden');
      setIsLoading(false);
      return;
    }
    try {
      const response = await fetch('https://banco-global-europa.onrender.com/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(registerData)
      });

      const data = await response.json();
      if (response.ok) {
        setCurrentPage('verification');
      } else {
        alert(data.error || 'Error en el registro');
      }
    } catch (error) {
      alert('Error de conexión');
    } finally {
      setIsLoading(false);
    }
  };

  const Header = () => (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center">
          <svg className="w-16 h-16" viewBox="0 0 400 300">
            <path d="M50 150 A150 150 0 0 1 350 150" stroke="red" strokeWidth="20" fill="none"/>
            <line x1="50" y1="180" x2="350" y2="180" stroke="red" strokeWidth="20"/>
            <line x1="75" y1="210" x2="325" y2="210" stroke="red" strokeWidth="20"/>
            <line x1="100" y1="240" x2="300" y2="240" stroke="red" strokeWidth="20"/>
            <text x="200" y="140" fontSize="48" fill="red" textAnchor="middle" fontWeight="bold">BGE</text>
          </svg>
          <span className="ml-3 text-xl font-bold text-blue-600">Banco Global Europa</span>
        </div>
        
        <nav>
          {isAuthenticated ? (
            <button
              onClick={handleLogout}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Cerrar sesión
            </button>
          ) : (
            <div className="space-x-4">
              <button
                onClick={() => setCurrentPage('login')}
                className="text-blue-600 hover:text-blue-800"
              >
                Iniciar sesión
              </button>
              <button
                onClick={() => setCurrentPage('register')}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Registrarse
              </button>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
