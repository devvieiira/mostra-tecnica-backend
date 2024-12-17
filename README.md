Esse é um projeto de estágio realizado com um total de 360 horas, efetuado no IFRS Campus Feliz.


O backend foi desenvolvido em [NodeJS](https://nodejs.org/en/) com auxilio das seguintes tecnologias.

- [Fastify](https://fastify.dev/)
- [Prisma](https://www.prisma.io/studio)

## Como funciona?

Para iniciar esse projeto, siga os seguintes passos.

```U
#Utilizar os comandos dentro da pasta raíz, exemplos: mostra-tecnica/frontend
npm install
npx prisma generate
npx prisma migrate dev

# Se deseja executar a aplicação de maneira local, afins de teste.
npm run dev

# Caso deseja fazer o upload em uma VPS, utilize:
npm run build
npm run start
```

Quando a aplicação está ligada de modo local, ele funciona no caminho: [http://localhost:4000](http://localhost:4000)

Para o projeto funcionar, é necessário que o frontend da aplicação esteja ligado, você pode encontrar mais sobre o repositório no no meu [GitHub](https://github.com/devvieiira/mostra-tecnica).


## Como interligar o frontend com o backend?

Se você já possui o backend em sua máquina, basta interligado pelo arquivo _.env_ , colocando o caminho ou a url do seu backend.

Exemplo:
```
# Arquivo .env

FRONTEND_URL="Sua URL aqui"

// Configuração do banco de dados utilizando Docker e Postgresql
DATABASE_URL="postgresql://sistema-votacao:backend@localhost:5432/mydb?schema=sistema-db"

JWT_ASSIGN=G83W89GASBRIHB$GKOAEQYHhU%Ugaibrei@gsb54abh5rba

```

Lembre-se, que o frontend também precisa conter a _URL_ do frontend para o funcionamento do sistema.


