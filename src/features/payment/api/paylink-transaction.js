/**
 * Запрашивает у PayLink фактическое состояние платежа.
 * Параметры из return_url (status, uid, token) приходят от браузера покупателя
 * и могут быть подделаны, поэтому решение об оплате принимается только по
 * ответу PayLink.
 *
 * Документация:
 * - https://docs.paylink.kz/en/integration/card_api/transactions/status_query/
 * - https://docs.paylink.kz/en/integration/widget/query/
 */

const GATEWAY_URL = "https://gateway.paylink.kz/transactions";
const CHECKOUT_URL = "https://checkout.paylink.kz/ctp/api/checkouts";
const SAFE_ID = /^[A-Za-z0-9_-]{1,128}$/;

function authHeader() {
  const shopId = process.env.PAYLINK_SHOP_ID;
  const shopSecret = process.env.PAYLINK_SHOP_SECRET;
  if (!shopId || !shopSecret) return null;
  return `Basic ${Buffer.from(`${shopId}:${shopSecret}`).toString("base64")}`;
}

async function getJson(url, auth) {
  const response = await fetch(url, {
    method: "GET",
    headers: { Accept: "application/json", Authorization: auth },
    cache: "no-store",
    signal: AbortSignal.timeout(10000),
  });
  if (!response.ok) {
    console.warn(`PayLink ${url} ответил ${response.status}`);
    return null;
  }
  try {
    return await response.json();
  } catch {
    return null;
  }
}

/**
 * @returns {Promise<{uid, status, amount, currency, test}|null>}
 *   amount в минимальных единицах (тиын), как PayLink его возвращает.
 */
export async function fetchPaylinkTransaction({ uid, token }) {
  const auth = authHeader();
  if (!auth) {
    console.error("PayLink не настроен: нет PAYLINK_SHOP_ID / PAYLINK_SHOP_SECRET");
    return null;
  }

  if (uid && SAFE_ID.test(uid)) {
    try {
      const data = await getJson(`${GATEWAY_URL}/${encodeURIComponent(uid)}`, auth);
      const tx = data?.transaction;
      if (tx?.uid) {
        return {
          uid: String(tx.uid),
          status: tx.status,
          amount: Number(tx.amount),
          currency: tx.currency,
          test: tx.test === true,
        };
      }
    } catch (error) {
      console.error("Ошибка запроса транзакции PayLink по uid:", error.message);
    }
  }

  if (token && SAFE_ID.test(token)) {
    try {
      const data = await getJson(`${CHECKOUT_URL}/${encodeURIComponent(token)}`, auth);
      const checkout = data?.checkout;
      const payment = checkout?.gateway_response?.payment;
      if (checkout && payment?.uid) {
        return {
          uid: String(payment.uid),
          status: payment.status,
          amount: Number(payment.amount ?? checkout.order?.amount),
          currency: payment.currency ?? checkout.order?.currency,
          test: checkout.test === true,
        };
      }
    } catch (error) {
      console.error("Ошибка запроса checkout PayLink по token:", error.message);
    }
  }

  return null;
}
