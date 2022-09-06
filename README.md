### Areas to improve upon
* implement environment variables and secrets management so that secrets are not committed to git
* use more secure hashing algorithm for generating JWTs
* add linting/formatting
* add more unit tests for failure cases
* add E2E testing using Cypress
* support absolute imports instead of relative
* add better router structure

### Some considerations
* case 4 could potentially be the same endpoint as case 3 with a query param flag to indicate if you only want contract employees
* although case 5 use very similar logic to case 3 & 4, because the API response syntax is different, it should be a separate endpoint

### Questions for a Product Manager
* do all employees have a department and sub department
* if `on_contract` is not specified, should it default to false