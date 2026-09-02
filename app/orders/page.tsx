import { redirect } from 'next/navigation'

// Redirect old /orders route to the account orders page
export default function OrdersRedirect() {
  redirect('/account/orders')
}
