const https = require('https');
const http = require('http');

exports.handler = async (event) => {
    console.log('Starting SafeDocs health check...');
    
    // Configuração de URLs por ambiente
    const config = {
        local: 'http://localhost:3000',
        localtunnel: 'https://safedocs-test.loca.lt',
    };
    
    const environment = process.env.NODE_ENV || 'localtunnel';
    const baseUrl = process.env.API_BASE_URL || config[environment];
    
    console.log('Environment:', environment);
    console.log('Checking API at:', baseUrl);
    
    const endpoints = [
        `${baseUrl}/health`,
        `${baseUrl}/health/db`, 
        `${baseUrl}/health/s3`,
        `${baseUrl}/health/api`
    ];
    
    const results = [];
    
    for (const endpoint of endpoints) {
        console.log(`Checking endpoint: ${endpoint}`);
        
        try {
            const response = await makeRequest(endpoint);
            let data = {};
            
            try {
                data = JSON.parse(response.body);
            } catch (parseError) {
                console.log('Failed to parse JSON response');
                data = { status: 'unknown', rawBody: response.body };
            }
            
            const result = {
                endpoint,
                status: response.statusCode,
                healthy: response.statusCode === 200 && (data.status === 'healthy' || data.status === 'ok' || data.status === 'connected' || data.status === 'success'),
                responseTime: response.responseTime,
                data: data,
                timestamp: new Date().toISOString()
            };
            
            results.push(result);
            
            if (result.healthy) {
                console.log(`${endpoint} - OK (${result.responseTime}ms)`);
            } else {
                console.log(`${endpoint} - FAILED (Status: ${result.status})`);
            }
            
        } catch (error) {
            const result = {
                endpoint,
                status: 'error',
                healthy: false,
                error: error.message,
                timestamp: new Date().toISOString()
            };
            
            results.push(result);
            console.log(`${endpoint} - ERROR: ${error.message}`);
        }
    }
    
    // Analisar resultados
    const failures = results.filter(r => !r.healthy);
    const healthyCount = results.length - failures.length;
    
    if (failures.length > 0) {
        console.log(`Health check completed: ${healthyCount}/${results.length} services healthy`);
        console.log('Failed services:', failures.map(f => f.endpoint).join(', '));
        
        // Log detalhes dos erros
        failures.forEach(failure => {
            console.log(`${failure.endpoint}:`, failure.error || failure.data);
        });
        
    } else {
        console.log(`All ${results.length} services are healthy!`);
    }
    
    const summary = {
        overallStatus: failures.length === 0 ? 'healthy' : 'unhealthy',
        totalChecks: results.length,
        healthyServices: healthyCount,
        failedServices: failures.length,
        results: results,
        timestamp: new Date().toISOString(),
        executionTime: results.reduce((sum, r) => sum + (r.responseTime || 0), 0)
    };
    
    console.log('Health check summary:', JSON.stringify(summary, null, 2));
    
    return {
        statusCode: 200,
        body: JSON.stringify(summary)
    };
};

function makeRequest(url) {
    return new Promise((resolve, reject) => {
        const startTime = Date.now();
        const protocol = url.startsWith('https') ? https : http;
        
        const req = protocol.get(url, (res) => {
            let body = '';
            
            res.on('data', (chunk) => {
                body += chunk;
            });
            
            res.on('end', () => {
                const responseTime = Date.now() - startTime;
                resolve({
                    statusCode: res.statusCode,
                    body: body,
                    responseTime: responseTime
                });
            });
        });
        
        req.on('error', (error) => {
            reject(new Error(`Request failed: ${error.message}`));
        });
        
        req.setTimeout(15000, () => {
            req.abort();
            reject(new Error('Request timeout (15s)'));
        });
    });
}

// Para testes locais
if (require.main === module) {
    console.log('Running health check locally...');
    exports.handler({}).then(result => {
        console.log('Local test completed');
    }).catch(error => {
        console.error('Local test failed:', error);
    });
}