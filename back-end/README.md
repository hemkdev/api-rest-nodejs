# API REST - Node.js + PostgreSQL

API REST com CRUD de usuários desenvolvida com Node.js, Express, Prisma e PostgreSQL.

## Tecnologias

- Node.js
- Express
- PostgreSQL
- Prisma ORM
- Zod

## Como rodar o projeto

### Pré-requisitos

- Node.js instalado
- PostgreSQL instalado

### Instalação

Clone o repositório:
```bash
git clone https://github.com/hemkdev/api-rest-nodejs
cd api-rest-nodejs/back-end
```

Instale as dependências:
```bash
npm install
```

Crie o arquivo `.env` na pasta `back-end` com base no `.env.example`:
```env
DATABASE_URL="postgresql://postgres:suaSenha@localhost:5432/BancoCrud?schema=public"
```

Rode as migrations:
```bash
npx prisma migrate deploy
```

Gere o Prisma Client:
```bash
npx prisma generate
```

Suba o servidor:
```bash
node server.js
```

O servidor estará rodando em `http://localhost:3000`.

## Endpoints

| Método | Rota | Descrição |
|---|---|---|
| GET | /usuarios | Lista todos os usuários |
| GET | /usuarios/:id | Busca um usuário por id |
| POST | /usuarios | Cria um novo usuário |
| PUT | /usuarios/:id | Atualiza um usuário |
| DELETE | /usuarios/:id | Deleta um usuário |

## Exemplo de body

```json
{
  "nome": "Hemk",
  "idade": 18,
  "email": "hemk@email.com"
}
```