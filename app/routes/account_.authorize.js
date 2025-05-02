export async function loader({context}) {
  return context.customerAccount.authorize();
}
