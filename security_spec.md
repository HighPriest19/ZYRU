# Security Specification - ZYRU™

## Data Invariants
- A `Design` must belong to a valid `User` and reference a valid `Product`.
- An `Order` must belong to a valid `User` and cannot be modified by the user once it's in terminal states (Shipped/Delivered).
- A `Vote` must be tied to a `User` and a specific `Poll`.
- Users can only read their own `private` data (PII like addresses in `Order`).
- Public `Product` and `Poll` data are readable by anyone.

## The Dirty Dozen Payloads
1. **Identity Spoofing**: Attempting to create a `Design` with a `userId` that doesn't match the authenticated user.
2. **PII Leak**: A user attempting to read another user's `Order` details.
3. **Price Manipulation**: Attempting to create an `Order` with a `totalPrice` that doesn't match the calculated items (hard to enforce strictly in rules without a server, but we can prevent users from updating the price after creation).
4. **State Shortcut**: A user attempting to update their `Order` status from `Received` to `Delivered`.
5. **Vote Spamming**: Attempting to create multiple `Vote` documents for the same `pollId` (if we enforce one vote per user per poll).
6. **Ghost Fields**: Attempting to add an `isAdmin` field to a `User` profile.
7. **Resource Poisoning**: Sending a 1MB string for a `Product` name.
8. **Orphaned Write**: Creating a `Design` for a `baseProductId` that doesn't exist.
9. **Role Escalation**: A non-admin user attempting to delete a `Product`.
10. **Terminal State Break**: Attempting to update an `Order` after it's marked as `Delivered`.
11. **Email Spoofing**: Attempting to access admin-only data using an unverified email that matches an admin's email string.
12. **Collection Scraping**: A script attempting to list all `User` profiles without proper filtering.

## Test Runner Plan
I will implement a robust `firestore.rules` that addresses these scenarios using the Pillar approach.
