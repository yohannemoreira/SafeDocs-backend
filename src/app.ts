import express, { Request, Response } from 'express';

const app = express();

app.get('/users', (request, response) => {
  return response.send('Hello World!');
});

app.listen(3000, () => {
console.log('HTTP Server running!');
});


let baseURL = "";

function generalFuncAPI(endPoit: String, method: String, parameters: [String: String], authorization: String){
    let urlString = baseURL + endPoit;
    let url = new URL(urlString);
    var request = express.request
}

/* func generalFuncAPI<T: Decodable>(returnType: T, endPoint: EndPoint, method: String, parameters: [String: String], authorization: String, completion: @escaping (Result<T, Error>) -> Void) where T : Decodable {

        let urlString = baseURL + endPoint.rawValue
        guard let url = URL(string: urlString) else { return }

        var request = URLRequest(url: url)
        request.httpMethod = method
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")

        if(authorization != ""){
            request.setValue("Bearer (authorization)", forHTTPHeaderField: "Authorization")
        }

        if(!parameters.isEmpty){
            do {
                let params = try JSONSerialization.data(withJSONObject: parameters)
                request.httpBody = params
            } catch let error {
                print(error.localizedDescription)
                return
            }
        }


        URLSession.shared.dataTask(with: request) { data, response, error in
            if let error = error { //Se erro for nil, deu certo e ele não entra aqui
                completion(.failure(error))
                self.cuida1()
            }
            print(String(bytes: data!, encoding: .utf8) ?? "Nao teve data")
            do {
                let result = try JSONDecoder().decode(T.self, from: data!)
                completion(.success(result))
                self.cuida2()
            } catch let err {
                completion(.failure(err))
                self.cuida3()
            }

        }.resume()
    }