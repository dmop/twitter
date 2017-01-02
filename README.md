Portal de dashboards Twitter
===

Esse repositório contém tanto o dashboard, quanto uma parte de backend para carregar uma base PostgreSQL.

A parte de backend está em `endpoints/kettle/backend/`.


# Dependências

* [**Node.js**](https://nodejs.org) para resolver dependências

# Deploy do plugin

1. Com o server ainda funcionando, faça deploy do repositório direto na pasta `system/`
```
cd pentaho-solutions/system
git clone https://bitbucket.org/oncase/trf3.git
```
2. Instalar dependências do portal
```
cd trf3/portal
npm install
```

## Banco e soluções

3. Criar um banco postgresql e restaurar  `endpoints/kettle/backend/banco/trf3.backup` utilizando o pgadmin
4. Crie uma conexão no BAserver chamada `trf3`;
5. Publique o schema `endpoints/kettle/backend/cube/TRF3.mondrian.xml`.

## Reinício

Reinicie o BA Server para carregar o plugin

# Acesso

Você pode acessar pela url http://localhost:8080/pentaho/content/trf3/portal/index.html

# Updates

Já que o plugin pertence a um repositório e está ligado à origem, basta fazer:
```
git pull
```

A maioria das atualizações do repositórios podem ser feitas "no quente", com o servidor rodando.

Isso é possível porque arquivos estáticos não entram para o cache.

Quando as atualizações envolverem endpoints [ktr, kjb], também pode-se atualizar no quente, mas deve-se fazer atualização da api através da url:
* http://localhost:8080/plugin/trf3/api/refresh
