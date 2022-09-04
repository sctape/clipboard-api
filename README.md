### Some considerations
* case 4 could potentially be the same endpoint as case 3 with a query param flag to indicate if you only want contract employees
* although case 5 use very similar logic to case 3 & 4, because the API response syntax is different, it should be a separate endpoint

### Questions for a Product Manager
* do all employees have a department and sub department
* if `on_contract` is not specified, should it default to false