// Script para crear clientes de prueba
async function createTestClients() {
  const API_URL = 'http://localhost:4000/api/clients';
  
  const testClients = [
    {
      name: "Juan Pérez",
      email: "juan.perez@email.com",
      phone: "+57 300 123 4567",
      company: "Tech Solutions S.A.S",
      status: "active"
    },
    {
      name: "María García",
      email: "maria.garcia@empresa.com",
      phone: "+57 301 987 6543",
      company: "Innovar Ltda",
      status: "prospect"
    },
    {
      name: "Carlos López",
      email: "carlos.lopez@company.co",
      phone: "+57 302 456 7890",
      company: "Digital Corp",
      status: "inactive"
    },
    {
      name: "Ana Martínez",
      email: "ana.martinez@startup.io",
      phone: "+57 303 111 2222",
      company: "StartupTech",
      status: "active"
    },
    {
      name: "Luis Rodríguez",
      email: "luis.rodriguez@consulting.com",
      phone: "+57 304 333 4444",
      company: "Business Consulting",
      status: "prospect"
    }
  ];

  for (const client of testClients) {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(client)
      });

      if (response.ok) {
        const result = await response.json();
        console.log(`Cliente creado: ${client.name}`, result);
      } else {
        console.error(`Error creando cliente ${client.name}:`, response.status);
      }
    } catch (error) {
      console.error(`Error creando cliente ${client.name}:`, error);
    }
  }
}

createTestClients().then(() => {
  console.log('¡Clientes de prueba creados exitosamente!');
});
