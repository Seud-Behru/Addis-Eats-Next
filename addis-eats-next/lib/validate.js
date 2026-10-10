// Carried over from the Vite Checkout.jsx: same rules, same messages.
// Runs on the server (action + route handler); the browser is only a courtesy.
export function validateDelivery(input) {
  const v = (key) => String(input?.[key] ?? "").trim();
  const errors = {};
  if (!v("name")) errors.name = "Please enter your name.";
  if (!v("phone")) errors.phone = "Please enter your phone number.";
  else if (!/^[0-9+\-\s]{9,15}$/.test(v("phone")))
    errors.phone = "Please enter a valid phone number.";
  if (!v("address")) errors.address = "Please enter your delivery address.";
  if (!v("city")) errors.city = "Please enter your city.";
  return errors;
}
