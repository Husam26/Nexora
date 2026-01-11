const DATE_FIELDS = ["issueDate", "dueDate", "createdAt", "updatedAt"];
const EXACT_MATCH_FIELDS = ["status", "workspace", "_id"];

function sanitizeQuery(obj) {
  if (!obj || typeof obj !== "object") return obj;

  for (const key in obj) {
    let value = obj[key];

    // 🔹 CUSTOMER NAME → safe case-insensitive match
    if (key === "customer" && value?.name) {
      if (typeof value.name === "string") {
        obj["customer.name"] = value.name.trim(); // Do not convert to $regex here
        delete obj.customer;
      }
      continue;
    }

    // 🔹 DATE FIELD SAFETY
    if (DATE_FIELDS.includes(key)) {
      if (value?.$regex || value?.$options) {
        delete obj[key];
      }
      continue;
    }

    // 🔹 STRING → CASE INSENSITIVE (except exact match fields)
    if (typeof value === "string" && !EXACT_MATCH_FIELDS.includes(key)) {
      obj[key] = value.trim();
      continue;
    }

    // 🔁 RECURSIVE CLEAN
    if (typeof value === "object") {
      sanitizeQuery(value);
    }
  }
  

  return obj;
}

module.exports = sanitizeQuery;
