if (currentPage === 'adminDashboard') {
  return (
    <div className="space-y-6 mt-8">
      <h2 className="text-2xl font-bold text-blue-600">Panel de Administración</h2>
      
      {/* Vue desktop */}
      <div className="hidden md:block bg-white rounded-lg shadow-lg overflow-hidden">
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
                      className="text-green-600 hover:text-green-900 mr-2 text-sm"
                    >
                      Validar
                    </button>
                  )}
                  <button
                    onClick={() => handleUpdateBalance(user._id)}
                    className="text-blue-600 hover:text-blue-900 mr-2 text-sm"
                  >
                    Actualizar saldo
                  </button>
                  <button
                    onClick={() => handleToggleBlock(user._id, user.estado)}
                    className={`text-sm ${user.estado === 'bloqueado' ? 
                      'text-green-600 hover:text-green-900' : 
                      'text-red-600 hover:text-red-900'}`}
                  >
                    {user.estado === 'bloqueado' ? 'Desbloquear' : 'Bloquear'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Vue mobile */}
      <div className="md:hidden space-y-4">
        {users.map((user) => (
          <div key={user._id} className="bg-white rounded-lg shadow-lg p-4 border border-gray-200">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold text-gray-900">{user.nombre} {user.apellidos}</h3>
              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                user.estado === 'activo' ? 'bg-green-100 text-green-800' :
                user.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {user.estado.charAt(0).toUpperCase() + user.estado.slice(1)}
              </span>
            </div>
            
            <div className="space-y-1 text-sm text-gray-600 mb-3">
              <div>DNI: {user.dni}</div>
              <div>Cuenta: {user.numeroCuenta || 'No asignado'}</div>
              <div>Saldo: {user.saldo ? `${user.saldo.toFixed(2)} €` : '0.00 €'}</div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {user.estado === 'pendiente' && (
                <button
                  onClick={() => handleValidateUser(user._id)}
                  className="px-3 py-1 bg-green-100 text-green-800 rounded text-sm"
                >
                  Validar
                </button>
              )}
              <button
                onClick={() => handleUpdateBalance(user._id)}
                className="px-3 py-1 bg-blue-100 text-blue-800 rounded text-sm"
              >
                Saldo
              </button>
              <button
                onClick={() => handleToggleBlock(user._id, user.estado)}
                className={`px-3 py-1 rounded text-sm ${
                  user.estado === 'bloqueado' ? 
                  'bg-green-100 text-green-800' : 
                  'bg-red-100 text-red-800'
                }`}
              >
                {user.estado === 'bloqueado' ? 'Desbloquear' : 'Bloquear'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
