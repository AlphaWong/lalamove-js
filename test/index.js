/* global describe, it */
/**
 *
 * Test cases for 
 *
 *
 */
'use strict'

const assert = require('chai').assert,
      config = {
        host: 'https://sandbox-rest.lalamove.com',
        key: '70f1d37a23294d118227a29b3ea90c3c',
        secret: 'MCwCAQACBQC9gIh5AgMBAAECBQClUTftAgMA3ecCAwDanwICKLcCAgFZAgJFeg==',
        country: 'SG'
      }

describe('Lalamove API', () => {
  let body = {
    "serviceType": "MOTORCYCLE",
    "specialRequests": [],
    "requesterContact": {
        "name": "Draco Yam",
        "phone": "+6592344758"
    },
    "stops": [
        {
            "location": {"lat": "1.284318", "lng": "103.851335"},
            "addresses": {
                "en_SG": {
                    "displayString": "1 Raffles Place #04-00, One Raffles Place Shopping Mall, Singapore",
                    "country": "SG"
                }
            }
        },
        {
            "location": {"lat": "1.278578", "lng": "103.851860"},
            "addresses": {
                "en_SG": {
                    "displayString": "Asia Square Tower 1, 8 Marina View, Singapore",
                    "country": "SG"
                }
            }
        }
    ],
    "deliveries": [
        {
            "toStop": 1,
            "toContact": {
                "name": "Brian Garcia",
                "phone": "+6592344837"
            },
            "remarks": "ORDER #: 1234, ITEM 1 x 1, ITEM 2 x 2"
        }
    ]
  }

  it('should be able to throw 401 error for invalid key', () => {
    const lalamove = require('../index')({
      host: 'https://sandbox-rest.lalamove.com'
    , key: 'abc123'
    , secret: 'abc123'
    , country: 'SG'
    })
    return lalamove.quotation(body).then(() => {
      assert.equal('should not be able to call here', '')
    }).catch((e) => {
      assert.equal(e.status, 401)
    })
  })

  let _quotation
  it('should be able to get quotation', () => {
    const lalamove = require('../index')(config)
    body.scheduleAt = new Date(new Date().getTime() + 10 * 60000).toISOString()
    return lalamove.quotation(body).then((result) => {
      _quotation = result.body
      assert.isDefined(result.body.totalFee)
      assert.isDefined(result.body.totalFeeCurrency)
    })
  })

  let _order
  it('should be able to post order', () => {
    const lalamove = require('../index')(config)
    body.quotedTotalFee = {
      amount: _quotation.totalFee
    , currency: _quotation.totalFeeCurrency
    }
    return lalamove.postOrder(body).then((result) => {
      _order = result.body
      assert.isDefined(result.body.customerOrderId)
      assert.isDefined(result.body.orderRef)
    })
  })

  it('should be able to cancel order', () => {
    const lalamove = require('../index')(config)
    return lalamove.cancelOrder(_order.customerOrderId).then((result) => {
      assert.equal(result.status, 200)
    })
  })
})
