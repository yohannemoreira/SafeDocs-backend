echo " Deploying SafeDocs Health Monitor Lambda..."

# Verificar se AWS CLI está configurado
if ! command -v aws &> /dev/null; then
    echo "AWS CLI not found. Please install it first."
    exit 1
fi

# Instalar dependências (se houver)
echo "Installing dependencies..."
npm install --production

# Criar ZIP
echo "Creating deployment package..."
if [ -f "function.zip" ]; then
    rm function.zip
fi

zip -r function.zip index.js package.json

# Verificar se função existe
FUNCTION_NAME="safedocs-health-monitor"
if aws lambda get-function --function-name $FUNCTION_NAME >/dev/null 2>&1; then
    echo "🔄 Updating existing Lambda function..."
    aws lambda update-function-code \
        --function-name $FUNCTION_NAME \
        --zip-file fileb://function.zip
else
    echo "Creating new Lambda function..."
    aws lambda create-function \
        --function-name $FUNCTION_NAME \
        --runtime nodejs18.x \
        --role arn:aws:iam::$(aws sts get-caller-identity --query Account --output text):role/lambda-execution-role \
        --handler index.handler \
        --zip-file fileb://function.zip \
        --environment Variables="{API_BASE_URL=https://sua-api.herokuapp.com}" \
        --timeout 30
fi

echo "Lambda deployed successfully!"
echo "Function name: $FUNCTION_NAME"

# Limpar arquivo ZIP
rm function.zip

echo "Deployment completed!"