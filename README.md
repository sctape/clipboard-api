# Clipboard Health Take Home

## Prerequisites
* `docker-compose` and `docker`
* `node` and `npm` for running tests

## Getting things running
```bash
docker-compose up
```

## Running tests
```bash
npm install && npm run test
```

## Running on a local machine
```bash
npm install
npx prisma migrate dev --name init
npm run dev
```

## HTTP Request Examples
### Generate an auth token
```bash
curl -L -X POST 'localhost:3000/token/' \
-H 'Content-Type: application/json' \
--data-raw '{
    "username": "dummy",
    "password": "password"
}'
```

### Create an employee
```bash
curl -L -X POST 'localhost:3000/employee/' \
-H 'Authorization: Bearer <AUTH_TOKEN>' \
-H 'Content-Type: application/json' \
--data-raw '{
    "name": "Himani",
    "salary": "240000",
    "currency": "USD",
    "department": "Engineering",
    "sub_department": "Platform"
}'
```

### Delete an employee
```bash
curl -L -X DELETE 'localhost:3000/employee/7' \
-H 'Authorization: Bearer <AUTH_TOKEN>'
```

### Fetch summary statistics
```bash
curl -L -X GET 'localhost:3000/employee/salary-stats' \
-H 'Authorization: Bearer <AUTH_TOKEN>'
```

### Fetch summary statistics for contract employees
```bash
curl -L -X GET 'localhost:3000/employee/salary-stats/on-contract' \
-H 'Authorization: Bearer <AUTH_TOKEN>'
```

### Fetch summary statistics by department
```bash
curl -L -X GET 'localhost:3000/employee/salary-stats/by-department' \
-H 'Authorization: Bearer <AUTH_TOKEN>'
```

### Fetch summary statistics by sub-department
```bash
curl -L -X GET 'localhost:3000/employee/salary-stats/by-sub-department' \
-H 'Authorization: Bearer <AUTH_TOKEN>'
```

## Areas to improve upon
* implement environment variables and secrets management so that secrets are not committed to git
* use more secure hashing algorithm for generating JWTs
* add linting/formatting
* add more unit tests for failure cases
* add E2E testing using Cypress
* support absolute imports instead of relative
* add better router structure
* docker configuration for running tests in a container
* move database from sqlite to postgres/mysql in a container
* add OpenAPI spec for API endpoint documentation

## Some considerations
* case 4 could potentially be the same endpoint as case 3 with a query param flag to indicate if you only want contract employees
* although case 5 use very similar logic to case 3 & 4, because the API response syntax is different, it should be a separate endpoint

## Questions for a Product Manager
* do all employees have a department and sub department
* if `on_contract` is not specified, should it default to false