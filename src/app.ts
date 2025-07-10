// Em um arquivo como /lib/api.ts

// Defina a URL base da sua API em um só lugar
const baseURL = "";

// Para melhor autocompletar e segurança, podemos tipar os métodos HTTP
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

// Definimos uma interface para os parâmetros da função para mantê-la organizada
interface ApiRequestOptions {
  endpoint: string;
  method: HttpMethod;
  parameters?: Record<string, unknown>;
  authorization?: string;
}
// Forma de chamada é passando um APIRequestOptions : 
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

  // Adiciona o token de autorização se ele for fornecido
  // Equivalente a: if(authorization != "")
  if (authorization) {
    headers['Authorization'] = `Bearer ${authorization}`;
  }

  const config: RequestInit = {
    method: method,
    headers: headers,
  };

  // Adiciona o corpo (body) da requisição apenas se houver parâmetros
  // e o método não for GET (que não deve ter corpo)
  // Equivalente a: if(!parameters.isEmpty)
  if (parameters && method !== 'GET') {
    config.body = JSON.stringify(parameters); // Equivalente a: JSONSerialization.data
  }

  try {
    // Realiza a requisição
    // Equivalente a: URLSession.shared.dataTask
    const response = await fetch(url, config);
    
    // O `cuida1()` do seu código original, que trata falhas, iria no bloco catch abaixo.
    
    // Verifica se a resposta HTTP foi bem-sucedida (status 2xx)
    // Se não for, lança um erro para ser pego pelo bloco catch
    if (!response.ok) {
      // Tenta extrair uma mensagem de erro do corpo da resposta, se houver
      const errorData = await response.json().catch(() => null);
      const errorMessage = errorData?.message || `Erro na requisição: ${response.status} ${response.statusText}`;
      throw new Error(errorMessage);
    }
    
    // O `cuida3()` do seu código, que trata erros de decodificação,
    // também seria pego pelo bloco catch se response.json() falhar.

    // Decodifica a resposta JSON para o tipo T genérico
    // Equivalente a: JSONDecoder().decode(T.self, from: data!)
    const result: T = await response.json();

    // O `cuida2()` do seu código, que trata o sucesso, iria aqui.
    // Ex: console.log("Requisição bem-sucedida!");

    return result;

  } catch (error) {
    console.error('Falha na função da API:', error);
    
    // O `cuida1()` ou `cuida3()` iriam aqui para tratar o erro de forma global,
    // como exibir uma notificação para o usuário.
    // Ex: showErrorNotification(error.message);

    // Lança o erro novamente para que a função que chamou a API possa tratá-lo também
    throw error;
  }
}