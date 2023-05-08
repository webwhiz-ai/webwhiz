import { CHUNK_SIZE } from '../knowledgebase/knowledgebase.schema';
import { splitTextIntoChunksOnLines } from './chunker';

describe('chunker', () => {
  it('should handle reallly long lines', () => {
    const chunks = splitTextIntoChunksOnLines(
      `this is a small line.

And this is a reaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaly  reaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaly reaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaly reaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaly reaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaly reaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaly reaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaly line.

And we have some small lines after that`,
      100,
    );

    expect(chunks.length).toBe(5);
  });

  it('should not make duplicate chunks', () => {
    const chunks = splitTextIntoChunksOnLines(
      `Throughout the lifecycle of a subscription, numerous invoices are generated. Typically, there is one at the time of purchase, and then one for each renewal.A subscription invoice belongs to a Subscription.The subscription invoice objectAttributesstore_idThe ID of the Store this subscription invoice belongs to.subscription_idThe ID of the Subscription associated with this subscription.billing_reasonThe reason for the invoice being generated.initial - The initial invoice generated when the subscription is created.renewal - A renewal invoice generated when the subscription is renewed.updated - An invoice generated when the subscription is updated.card_brandLowercase brand of the card used to pay for the invoice. One of visa, mastercard, american_express, discover, jcb, diners_club. Will be empty for non-card payments.card_last_fourThe last 4 digits of the card used to pay for the invoice. Will be empty for non-card payments.currencyThe ISO 4217 currency code for the invoice (e.g. USD, GBP, etc).currency_rateIf the invoice currency is USD, this will always be 1.0. Otherwise, this is the currency conversion rate used to determine the cost of the invoice in USD at the time of payment.subtotalA positive integer in cents representing the subtotal of the invoice in the invoice currency.discount_totalA positive integer in cents representing the total discount value applied to the invoice in the invoice currency.taxA positive integer in cents representing the tax applied to the invoice in the invoice currency.totalA positive integer in cents representing the total cost of the invoice in the invoice currency.subtotal_usdA positive integer in cents representing the subtotal of the invoice in USD.discount_totalA positive integer in cents representing the total discount value applied to the invoice in USD.tax_usdA positive integer in cents representing the tax applied to the invoice in USD.total_usdA positive integer in cents representing the total cost of the invoice in USD.statusThe status of the invoice. One of paid, open, void, uncollectible or draft.status_formattedThe formatted status of the invoice.refundedA boolean value indicating whether the invoice has been refunded.refunded_atIf the invoice has been refunded, this will be an ISO-8601 formatted date-time string indicating when the invoice was refunded. Otherwise, it will be null.urlsAn object of customer-facing URLs for the invoice. It contains:invoice_url - The unique URL to download a PDF of the invoice. Note: for security reasons, download URLs are signed (but do not expire).created_atAn ISO-8601 formatted date-time string indicating when the invoice was created.updated_atAn ISO-8601 formatted date-time string indicating when the invoice was last updated.Subscription invoice object{
  "type": "subscription-invoices",
  "id": "1",
  "attributes": {
    "store_id": 1,
    "subscription_id": 1,
    "billing_reason": "initial",
    "card_brand": "visa",
    "card_last_four": "4242",
    "currency": "USD",
    "currency_rate": "1.00000000",
    "subtotal": 999,
    "discount_total": 0,
    "tax": 0,
    "total": 999,
    "subtotal_usd": 999,
    "discount_total_usd": 0,
    "tax_usd": 0,
    "total_usd": 999,
    "status": "paid",
    "status_formatted": "Paid",
    "refunded": 0,
    "refunded_at": null,
    "subtotal_formatted": "$9.99",
    "discount_total_formatted": "$0.00",
    "tax_formatted": "$0.00",
    "total_formatted": "$9.99",
    "urls": {
      "invoice_url": "https://app.lemonsqueezy.com/my-orders/.../subscription-invoice/..."
    },
    "created_at": "2023-01-18T12:16:24.000000Z",
    "updated_at": "2023-01-18T12:16:24.000000Z",
    "test_mode": false
  },
  "relationships": {
    "store": {
      "links": {
        "related": "https://api.lemonsqueezy.com/v1/subscription-invoices/1/store",
        "self": "https://api.lemonsqueezy.com/v1/subscription-invoices/1/relationships/store"
      }
    },
    "subscription": {
      "links": {
        "related": "https://api.lemonsqueezy.com/v1/subscription-invoices/1/subscription",
        "self": "https://api.lemonsqueezy.com/v1/subscription-invoices/1/relationships/subscription"
      }
    }
  },
  "links": {
    "self": "https://api.lemonsqueezy.com/v1/subscription-invoices/1"
  }
}
Retrieve a subscription invoiceRetrieves the subscription invoice with the given ID.GET /v1/subscription-invoices/:idcurl "https://api.lemonsqueezy.com/v1/subscription-invoices/1" 
     -H 'Accept: application/vnd.api+json' 
     -H 'Content-Type: application/vnd.api+json' 
     -H 'Authorization: Bearer {api_key}'
ReturnsReturns a subscription invoice object.Response{
  "jsonapi": {
    "version": "1.0"
  },
  "links": {
    "self": "https://api.lemonsqueezy.com/v1/subscription-invoices/1"
  },
  "data": {
    "type": "subscription-invoices",
    "id": "1",
    "attributes": {
      "store_id": 1,
      "subscription_id": 1,
      "billing_reason": "initial",
      "card_brand": "visa",
      "card_last_four": "4242",
      "currency": "USD",
      "currency_rate": "1.00000000",
      "subtotal": 999,
      "discount_total": 0,
      "tax": 0,
      "total": 999,
      "subtotal_usd": 999,
      "discount_total_usd": 0,
      "tax_usd": 0,
      "total_usd": 999,
      "status": "paid",
      "status_formatted": "Paid",
      "refunded": 0,
      "refunded_at": null,
      "subtotal_formatted": "$9.99",
      "discount_total_formatted": "$0.00",
      "tax_formatted": "$0.00",
      "total_formatted": "$9.99",
      "urls": {
        "invoice_url": "https://app.lemonsqueezy.com/my-orders/.../subscription-invoice/..."
      },
      "created_at": "2023-01-18T12:16:24.000000Z",
      "updated_at": "2023-01-18T12:16:24.000000Z",
      "test_mode": false
    },
    "relationships": {
      "store": {
        "links": {
          "related": "https://api.lemonsqueezy.com/v1/subscription-invoices/1/store",
          "self": "https://api.lemonsqueezy.com/v1/subscription-invoices/1/relationships/store"
        }
      },
      "subscription": {
        "links": {
          "related": "https://api.lemonsqueezy.com/v1/subscription-invoices/1/subscription",
          "self": "https://api.lemonsqueezy.com/v1/subscription-invoices/1/relationships/subscription"
        }
      }
    },
    "links": {
      "self": "https://api.lemonsqueezy.com/v1/subscription-invoices/1"
    }
  }
}
List all subscription invoicesReturns a paginated list of subscription invoices.Tip: to retrieve subscription invoices for a certain subscription, you can include related resources or use a nested query.Parametersstore_idOnly return subscription invoices belonging to the store with this ID.statusOnly return subscription invoices with this status.refundedOnly return subscription invoices that are refunded (the value should be true or false).GET /v1/subscription-invoicescurl "https://api.lemonsqueezy.com/v1/subscription-invoices" 
     -H 'Accept: application/vnd.api+json' 
     -H 'Content-Type: application/vnd.api+json' 
     -H 'Authorization: Bearer {api_key}'
curl "https://api.lemonsqueezy.com/v1/subscription-invoices?filter[status]=past_due" 
     -H 'Accept: application/vnd.api+json' 
     -H 'Content-Type: application/vnd.api+json' 
     -H 'Authorization: Bearer {api_key}'
ReturnsReturns a paginated list of subscription invoice objects ordered by created_at (descending).Response{
  "meta": {
    "page": {
      "currentPage": 1,
      "from": 1,
      "lastPage": 1,
      "perPage": 10,
      "to": 10,
      "total": 10
    }
  },
  "jsonapi": {
    "version": "1.0"
  },
  "links": {
    "first": "https://api.lemonsqueezy.com/v1/subscription-invoices?page%5Bnumber%5D=1&page%5Bsize%5D=10&sort=-createdAt",
    "last": "https://api.lemonsqueezy.com/v1/subscription-invoices?page%5Bnumber%5D=1&page%5Bsize%5D=10&sort=-createdAt",
  },
  "data": [
    {
      "type": "subscription-invoices",
      "id": "1",
      "attributes": {
        "store_id": 1,
        "subscription_id": 1,
        "billing_reason": "initial",
        "card_brand": "visa",
        "card_last_four": "4242",
        "currency": "USD",
        "currency_rate": "1.00000000",
        "subtotal": 999,
        "discount_total": 0,
        "tax": 0,
        "total": 999,
        "subtotal_usd": 999,
        "discount_total_usd": 0,
        "tax_usd": 0,
        "total_usd": 999,
        "status": "paid",
        "status_formatted": "Paid",
        "refunded": 0,
        "refunded_at": null,
        "subtotal_formatted": "$9.99",
        "discount_total_formatted": "$0.00",
        "tax_formatted": "$0.00",
        "total_formatted": "$9.99",
        "urls": {
          "invoice_url": "https://app.lemonsqueezy.com/my-orders/.../subscription-invoice/..."
        },
        "created_at": "2023-01-18T12:16:24.000000Z",
        "updated_at": "2023-01-18T12:16:24.000000Z",
        "test_mode": false
      },
      "relationships": {
        "store": {
          "links": {
            "related": "https://api.lemonsqueezy.com/v1/subscription-invoices/1/store",
            "self": "https://api.lemonsqueezy.com/v1/subscription-invoices/1/relationships/store"
          }
        },
        "subscription": {
          "links": {
            "related": "https://api.lemonsqueezy.com/v1/subscription-invoices/1/subscription",
            "self": "https://api.lemonsqueezy.com/v1/subscription-invoices/1/relationships/subscription"
          }
        }
      },
      "links": {
        "self": "https://api.lemonsqueezy.com/v1/subscription-invoices/1"
      }
    },
    {...},
    {...},
  ]
}`,
      CHUNK_SIZE,
    );

    expect(chunks.length).toBe(2);
  });
});
