---
description: Resource Worker endpoints
---

# Resource Worker API



{% swagger method="get" path="/minAmount" baseUrl="https://dev-api.thorswap.net/resource-worker" summary="Get Minimum amount to send" %}
{% swagger-description %}

{% endswagger-description %}

{% swagger-parameter in="query" name="from" required="true" %}
The originating asset.

\


Example: BTC.BTC
{% endswagger-parameter %}

{% swagger-parameter in="query" name="to" required="true" %}
The destination asset.

\


Example: ETH.ETH
{% endswagger-parameter %}

{% swagger-response status="200: OK" description="The minimum amount" %}

{% endswagger-response %}
{% endswagger %}

{% swagger method="get" path="/minAmount/detail" baseUrl="https://dev-api.thorswap.net/resource-worker" summary="Minimum amount to send with details details" %}
{% swagger-description %}

{% endswagger-description %}

{% swagger-parameter in="query" name="from" required="true" %}
The originating asset.

\


Example: BTC.BTC
{% endswagger-parameter %}

{% swagger-parameter in="query" name="to" %}
The destination asset.

\


Example: ETH.ETH
{% endswagger-parameter %}
{% endswagger %}
