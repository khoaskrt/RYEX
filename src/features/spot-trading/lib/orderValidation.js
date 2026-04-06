export function parsePositive(value) {
  const parsed = Number.parseFloat(String(value || '').trim());
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

export function validateOrderInput({ orderType, price, amount, availableUsdt, availableBtc, isBuy }) {
  const parsedAmount = parsePositive(amount);
  const parsedPrice = orderType === 'market' ? parsePositive(price || '1') : parsePositive(price);

  if (parsedAmount <= 0) {
    return { ok: false, message: 'Số lượng phải lớn hơn 0' };
  }

  if (orderType === 'limit' && parsedPrice <= 0) {
    return { ok: false, message: 'Giá limit phải lớn hơn 0' };
  }

  if (isBuy) {
    const requiredUsdt = parsedAmount * parsedPrice;
    const walletUsdt = parsePositive(availableUsdt);
    if (walletUsdt < requiredUsdt) {
      return { ok: false, message: 'Không đủ số dư USDT trong tài khoản trading' };
    }
  } else {
    const walletBtc = parsePositive(availableBtc);
    if (walletBtc < parsedAmount) {
      return { ok: false, message: 'Không đủ số dư BTC trong tài khoản trading' };
    }
  }

  return { ok: true, message: '' };
}
