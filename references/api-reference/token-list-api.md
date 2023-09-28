# Token List API

{% swagger src="../../.gitbook/assets/openapi (4).yaml" path="/tokenlist/health" method="get" %}
[openapi (4).yaml](<../../.gitbook/assets/openapi (4).yaml>)
{% endswagger %}

{% swagger method="get" path="/utils/chains" baseUrl="https://dev-api.thorswap.net/tokenlist" summary="GET Supported chains" %}
{% swagger-description %}
Returns a flat array of supported blockchain names
{% endswagger-description %}

{% swagger-response status="200: OK" description="Array of supported chains" %}

{% endswagger-response %}
{% endswagger %}

{% swagger method="get" path="/utils/chains/details" baseUrl="https://dev-api.thorswap.net/tokenlist" summary="Chains with details" %}
{% swagger-description %}
Returns a detailed array of supported chains
{% endswagger-description %}

{% swagger-response status="200: OK" description="Array of objects for each supported chain" %}

{% endswagger-response %}
{% endswagger %}

{% swagger method="get" path="utils/currencies" baseUrl="https://dev-api.thorswap.net/tokenlist/" summary="List supported currencies" %}
{% swagger-description %}
Returns a flat array of supported currencies.
{% endswagger-description %}

{% swagger-parameter in="query" name="categories" required="false" type="String | String[]" %}
Asset categories to filter by.\
**Options:** all, avax-erc20s, eth-erc20s, thorchain-all, thorchain-coins, thorchain-tokens, thorchain-stables
{% endswagger-parameter %}

{% swagger-response status="200: OK" description="Flat array of supported currencies" %}

{% endswagger-response %}
{% endswagger %}

{% swagger method="get" path="/utils/currencies/details" baseUrl="https://dev-api.thorswap.net/tokenlist" summary="List supported currencies with details" %}
{% swagger-description %}

{% endswagger-description %}

{% swagger-parameter in="query" type="String | String []" name="categories" %}
Asset categories to filter by.\
**Options:** all, avax-erc20s, eth-erc20s, thorchain-all, thorchain-coins, thorchain-tokens, thorchain-stables
{% endswagger-parameter %}
{% endswagger %}
