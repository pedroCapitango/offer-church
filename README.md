# Sistema de Gestão de Dízimos e Ofertas da Igreja

Um sistema completo para gerenciamento de dízimos e ofertas, onde membros da igreja podem enviar comprovantes de pagamento, tesoureiros podem validar os pagamentos e pastores têm acesso a relatórios financeiros detalhados.

## 🎯 Funcionalidades

### Para Membros
- ✅ Envio de comprovantes de dízimos e ofertas com arquivos
- ✅ Adição de comentários e especificações aos pagamentos
- ✅ Visualização do histórico de pagamentos próprios
- ✅ Download de comprovantes de pagamentos validados

### Para Tesoureiros
- ✅ Visualização de todos os pagamentos pendentes
- ✅ Validação ou rejeição de pagamentos com observações
- ✅ Acesso a relatórios financeiros e estatísticas
- ✅ Dashboard com resumo mensal e anual
- ✅ Geração automática de comprovantes para pagamentos validados

### Para Pastores
- ✅ Acesso a relatórios financeiros completos
- ✅ Análise de contribuições por membro
- ✅ Resumos financeiros por período
- ✅ Estatísticas de status de pagamentos
- ✅ Dashboard com visão geral da igreja

## 🚀 Tecnologias Utilizadas

### Backend
- **Node.js** com Express.js
- **MongoDB** com Mongoose
- **JWT** para autenticação
- **Multer** para upload de arquivos
- **Bcrypt** para criptografia de senhas
- **Express Validator** para validação de dados

### Frontend
- **React** com TypeScript
- **React Router** para navegação
- **Axios** para requisições HTTP
- **CSS personalizado** com design responsivo

## ⚙️ Instalação e Configuração

### Pré-requisitos
- Node.js (versão 16 ou superior)
- MongoDB (versão 4.4 ou superior)
- npm ou yarn

### Instalação
```bash
# 1. Clonar o repositório
git clone https://github.com/pedroCapitango/offer-church.git
cd offer-church

# 2. Configurar variáveis de ambiente
cp .env.example .env

# 3. Instalar dependências
npm install
cd client && npm install && cd ..

# 4. Executar a aplicação
npm run dev
```

## 📱 Demonstração

![Login Page](https://github.com/user-attachments/assets/de50162d-0b05-41b3-b045-d554874eee10)

*Tela de login do sistema com interface limpa e intuitiva*

## 🔧 Configuração

Edite o arquivo `.env`:
```env
MONGODB_URI=mongodb://localhost:27017/offer-church
JWT_SECRET=seu-super-secreto-jwt-key
PORT=3001
CLIENT_URL=http://localhost:3000
```

## 📋 Fluxo de Trabalho

1. **Membro** envia dízimo/oferta com comprovante
2. **Tesoureiro** valida e aprova/rejeita o pagamento
3. **Sistema** gera comprovante automático se aprovado
4. **Membro** pode baixar o comprovante validado
5. **Pastor** acompanha relatórios e estatísticas

## 🛡️ Segurança

- Senhas criptografadas com bcrypt
- Autenticação via JWT
- Controle de acesso baseado em roles
- Validação de arquivos e dados
- Limite de tamanho de upload (5MB)

---

*Desenvolvido com ❤️ para servir à igreja e facilitar a gestão de dízimos e ofertas.*