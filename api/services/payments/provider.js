const crypto = require("crypto");

class PaymentProvider {
  async createPaymentIntent() {
    throw new Error("createPaymentIntent no implementado");
  }

  validateWebhook() {
    return false;
  }

  async getPaymentStatus() {
    throw new Error("getPaymentStatus no implementado");
  }
}

class MercadoPagoProvider extends PaymentProvider {
  constructor({ accessToken, webhookSecret, baseUrl }) {
    super();
    this.accessToken = accessToken;
    this.webhookSecret = webhookSecret;
    this.baseUrl = baseUrl || "https://api.mercadopago.com";
  }

  async createPaymentIntent({ order, items, backUrls, notificationUrl }) {
    if (!this.accessToken) {
      throw new Error("Mercado Pago access token no configurado");
    }

    const response = await fetch(`${this.baseUrl}/checkout/preferences`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        items: (items || []).map((item) => ({
          title: item.title || `Producto ${item.productId}`,
          quantity: item.quantity,
          unit_price: item.price,
          currency_id: "ARS",
        })),
        external_reference: String(order._id),
        back_urls: backUrls,
        notification_url: notificationUrl,
        auto_return: "approved",
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Mercado Pago error: ${response.status} ${errText}`);
    }

    const payload = await response.json();
    return {
      paymentId: payload.id,
      checkoutUrl: payload.init_point,
      raw: payload,
    };
  }

  validateWebhook(req) {
    if (!this.webhookSecret) return true;
    const signature = req.headers["x-signature"];
    if (!signature) return false;

    const expected = crypto
      .createHmac("sha256", this.webhookSecret)
      .update(JSON.stringify(req.body || {}))
      .digest("hex");

    return signature === expected;
  }

  async getPaymentStatus({ paymentId, externalReference }) {
    if (!this.accessToken) {
      throw new Error("Mercado Pago access token no configurado");
    }

    const url = `${this.baseUrl}/merchant_orders/search?external_reference=${externalReference}`;
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${this.accessToken}` },
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(
        `No se pudo obtener estado de pago: ${response.status} ${errText}`
      );
    }

    const data = await response.json();
    const firstOrder = data?.results?.[0];
    const firstPayment = firstOrder?.payments?.[0];

    const status =
      firstPayment?.status || firstOrder?.order_status || "pending";
    return { status, raw: { ...data, paymentId } };
  }
}

const providersCache = {};

const getPaymentProvider = (providerName) => {
  const key = providerName.toLowerCase();
  if (providersCache[key]) return providersCache[key];

  if (key === "mercadopago") {
    providersCache[key] = new MercadoPagoProvider({
      accessToken: process.env.MP_ACCESS_TOKEN,
      webhookSecret: process.env.MP_WEBHOOK_SECRET,
    });
  }

  return providersCache[key];
};

module.exports = { PaymentProvider, getPaymentProvider };
