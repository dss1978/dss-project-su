export default async function getAllData (
    url,
    method = 'GET', 
    data = null, 
    headers = {}
    ) {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: data && JSON.stringify(data),
    };
  
    try {
      const response = await fetch(url, options);
  
      if (!response.ok) {
        throw new Error(`Грешка: ${response.status} - ${response.statusText}`);
      }

      return await response.json();

    } catch (error) {
      console.error('Грешка при изпращане на заявка:', error.message);
      throw error;
    }
  }