module.exports = (items, taxPercent, discount = 0) => {
  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const taxAmount = (subtotal * taxPercent) / 100;
  const totalAmount = subtotal + taxAmount - discount;

  const itemsWithTotal = items.map((item) => ({
    ...item,
    total: item.price * item.quantity,
  }));

  return {
    items: itemsWithTotal,
    subtotal,
    taxAmount,
    totalAmount,
  };
};
