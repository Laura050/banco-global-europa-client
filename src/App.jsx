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
  const renderContent = () => {
    if (currentPage === 'login') {
      return (
        <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-blue-600 mb-6">Iniciar Sesión</h2>
          <form className="space-y-4" onSubmit={handleLogin}>
            <div>
              <label className="block text-sm font-medium text-gray-700">DNI/Pasaporte</label>
              <input
                type="text"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                value={loginData.dni}
                onChange={(e) => setLoginData({...loginData, dni: e.target.value})}
                required
                disabled={isLoading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Contraseña</label>
              <input
                type="password"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                value={loginData.password}
                onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                required
                disabled={isLoading}
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-2 px-4 rounded-md ${
                isLoading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                  Procesando...
                </div>
              ) : (
                'Entrar'
              )}
            </button>
          </form>
        </div>
      );
    }
    
    if (currentPage === 'register') {
      return (
        <div className="max-w-2xl mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-blue-600 mb-6">Registro</h2>
          <form className="space-y-4" onSubmit={handleRegister}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nombre</label>
                <input
                  type="text"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  value={registerData.nombre}
                  onChange={(e) => setRegisterData({...registerData, nombre: e.target.value})}
                  required
                  disabled={isLoading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Apellidos</label>
                <input
                  type="text"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  value={registerData.apellidos}
                  onChange={(e) => setRegisterData({...registerData, apellidos: e.target.value})}
                  required
                  disabled={isLoading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Teléfono</label>
                <input
                  type="tel"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  value={registerData.telefono}
                  onChange={(e) => setRegisterData({...registerData, telefono: e.target.value})}
                  required
                  disabled={isLoading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Correo electrónico</label>
                <input
                  type="email"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  value={registerData.email}
                  onChange={(e) => setRegisterData({...registerData, email: e.target.value})}
                  required
                  disabled={isLoading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Número DNI o Pasaporte</label>
                <input
                  type="text"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  value={registerData.dni}
                  onChange={(e) => setRegisterData({...registerData, dni: e.target.value})}
                  required
                  disabled={isLoading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">País</label>
                <select 
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  value={registerData.pais}
                  onChange={(e) => setRegisterData({...registerData, pais: e.target.value})}
                  required
                  disabled={isLoading}
                >
                  <option value="">Seleccionar país</option>
                  <option value="España">España</option>
                  <option value="Francia">Francia</option>
                  <option value="Alemania">Alemania</option>
                  <option value="Italia">Italia</option>
                  <option value="Portugal">Portugal</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Ciudad</label>
                <input
                  type="text"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  value={registerData.ciudad}
                  onChange={(e) => setRegisterData({...registerData, ciudad: e.target.value})}
                  required
                  disabled={isLoading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Código Postal</label>
                <input
                  type="text"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  value={registerData.codigoPostal}
                  onChange={(e) => setRegisterData({...registerData, codigoPostal: e.target.value})}
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Domicilio</label>
                <input
                  type="text"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  value={registerData.domicilio}
                  onChange={(e) => setRegisterData({...registerData, domicilio: e.target.value})}
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Descargar DNI o Pasaporte</label>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="mt-1 block w-full"
                  required
                  disabled={isLoading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Contraseña</label>
                <input
                  type="password"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  value={registerData.password}
                  onChange={(e) => setRegisterData({...registerData, password: e.target.value})}
                  required
                  disabled={isLoading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Confirmación de contraseña</label>
                <input
                  type="password"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  value={registerData.confirmPassword}
                  onChange={(e) => setRegisterData({...registerData, confirmPassword: e.target.value})}
                  required
                  disabled={isLoading}
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-2 px-4 rounded-md ${
                isLoading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                  Procesando...
                </div>
              ) : (
                'Registrarse'
              )}
            </button>
          </form>
        </div>
      );
    }

    if (currentPage === 'verification') {
      return (
        <div className="max-w-md mx-auto mt-8 text-center">
          <h1 className="text-2xl font-bold text-blue-600 mb-4">
            Bienvenido a tu Banco Global Europa
          </h1>
          <p className="text-lg text-gray-800">
            Su cuenta está en espera de verificación....
          </p>
          <button
            onClick={() => setCurrentPage('login')}
            className="mt-6 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
          >
            Volver a inicio de sesión
          </button>
        </div>
      );
    }

    if (currentPage === 'adminDashboard') {
      return (
        <div className="space-y-6 mt-8">
          <h2 className="text-2xl font-bold text-blue-600">Panel de Administración</h2>
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">DNI</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Número de cuenta</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Saldo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user._id}>
                    <td className="px-6 py-4 whitespace-nowrap">{user.nombre} {user.apellidos}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{user.dni}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{user.numeroCuenta || 'No asignado'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{user.saldo ? `${user.saldo.toFixed(2)} €` : '0.00 €'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        user.estado === 'activo' ? 'bg-green-100 text-green-800' :
                        user.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {user.estado.charAt(0).toUpperCase() + user.estado.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.estado === 'pendiente' && (
                        <button
                          onClick={() => handleValidateUser(user._id)}
                          className="text-green-600 hover:text-green-900 mr-2"
                        >
                          Validar
                        </button>
                      )}
                      <button
                        onClick={() => handleUpdateBalance(user._id)}
                        className="text-blue-600 hover:text-blue-900 mr-2"
                      >
                        Actualizar saldo
                      </button>
                      <button
                        onClick={() => handleToggleBlock(user._id, user.estado)}
                        className={user.estado === 'bloqueado' ? 
                          'text-green-600 hover:text-green-900' : 
                          'text-red-600 hover:text-red-900'}
                      >
                        {user.estado === 'bloqueado' ? 'Desbloquear' : 'Bloquear'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    }

    if (currentPage === 'dashboard') {
      return (
        <div className="space-y-6 mt-8">
          <div className="
