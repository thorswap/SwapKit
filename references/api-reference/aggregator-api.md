---
description: Aggregator API
---

# Aggregator API



{% swagger method="get" path="" baseUrl="https://dev-api.thorswap.net/aggregator/utils/validateAddress" summary="Validate address" %}
{% swagger-description %}

{% endswagger-description %}

{% swagger-parameter in="query" name="chain" required="true" %}
Currency to validate (chain). Non-case sensitive.\
options: avax, btc, bch, bnb, gaia, doge, eth, ltc, thor
{% endswagger-parameter %}

{% swagger-parameter in="query" name="address" required="true" %}
Address to validate
{% endswagger-parameter %}

{% swagger-response status="200: OK" description="Complete response that tells if address is valid or not" %}

{% endswagger-response %}

{% swagger-response status="500: Internal Server Error" description="Error message describing if there was an issue with request." %}

{% endswagger-response %}
{% endswagger %}
