import React, { useState } from 'react';

const App = () => {
  const [currentPage, setCurrentPage] = useState('login');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loginData, setLoginData] = useState({
    dni: '',
    password: ''
  });

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('https://banco-global-europa.onrender.com/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(loginData)
      });

      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('token', data.token);
        setIsAuthenticated(true);
        setCurrentPage('dashboard');
      } else {
        alert(data.error || 'Error al iniciar sesión');
      }
    } catch (error) {
      alert('Error de conexión');
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
              onClick={() => {
                setIsAuthenticated(false);
                setIsAdmin(false);
                setCurrentPage('login');
                localStorage.removeItem('token');
              }}
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
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
            >
              Entrar
            </button>
          </form>
        </div>
      );
    }
    
    if (currentPage === 'register') {
      return (
        <div className="max-w-2xl mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-blue-600 mb-6">Registro</h2>
          <form className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nombre</label>
                <input
                  type="text"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Apellidos</label>
                <input
                  type="text"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Teléfono</label>
                <input
                  type="tel"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Correo electrónico</label>
                <input
                  type="email"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Número DNI o Pasaporte</label>
                <input
                  type="text"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">País</label>
                <select className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2">
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
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Código Postal</label>
                <input
                  type="text"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Domicilio</label>
                <input
                  type="text"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Descargar DNI o Pasaporte</label>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="mt-1 block w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Contraseña</label>
                <input
                  type="password"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Confirmación de contraseña</label>
                <input
                  type="password"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
            >
              Registrarse
            </button>
          </form>
        </div>
      );
    }

    if (currentPage === 'dashboard') {
      return (
        <div className="space-y-6 mt-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Número de cuenta</h3>
              <p className="mt-2 text-2xl font-semibold text-blue-600">ES91 2100 0418 4502 0005 1332</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Saldo actual</h3>
              <p className="mt-2 text-2xl font-semibold text-blue-600">25.000,00 €</p>
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;
