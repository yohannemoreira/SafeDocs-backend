const baseURL = "";

// Tipar os métodos HTTP
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

// Interface para os parâmetros
interface ApiRequestOptions {
  endpoint: string;
  method: HttpMethod;
  parameters?: Record<string, unknown>;
  authorization?: string;
}

export async function generalFuncAPI<T>({
  endpoint,
  method,
  parameters,
  authorization,
}: ApiRequestOptions): Promise<T> {
  const url = `${baseURL}${endpoint}`;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (authorization) {
    headers['Authorization'] = `Bearer ${authorization}`;
  }

  const config: RequestInit = {
    method: method,
    headers: headers,
  };

  if (parameters && method !== 'GET') {
    config.body = JSON.stringify(parameters); 
  }

  try {
    // Realiza a requisição
    const response = await fetch(url, config);
    
    // O `cuida1()` do seu código original, que trata falhas, iria no bloco catch abaixo.
    if (!response.ok) {
      // Tenta extrair uma mensagem de erro do corpo da resposta, se houver
      const errorData = await response.json().catch(() => null);
      const errorMessage = errorData?.message || `Erro na requisição: ${response.status} ${response.statusText}`;
      throw new Error(errorMessage);
    }
    
    // O `cuida3()` do seu código, que trata erros de decodificação,
    // também seria pego pelo bloco catch se response.json() falhar.
    const result: T = await response.json();

    // O `cuida2()` do seu código, que trata o sucesso aqui.
    return result;

  } catch (error) {
    console.error('Falha na função da API:', error);
    // O `cuida1()` ou `cuida3()` iriam aqui para tratar o erro de forma global
    throw error;
  }
}