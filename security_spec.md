# Kaviyam Reading Security Rules Specification (Phase 0 TDD)

## 1. Data Invariants
*   **Users (`/users/{userId}`)**: A user profile can only be read or written by the authenticated owner (`request.auth.uid == userId`). PII fields such as `email` must be completely protected, and the role cannot be self-escalated.
*   **Books (`/books/{bookId}`)**: Master list of stories can be read by anyone (publicly or authenticated patrons). However, only authenticated patrons are authorized to create/generate custom AI books (`isCustomAI == true`), and nobody (except designated platform admins if the feature exists) can modify/delete standard books.
*   **Bookmarks (`/users/{userId}/bookmarks/{bookId}`)**: Association connecting a reader's saved books. Only the authenticated owner of the bookshelf (`userId`) can view, add, or delete bookmarks.
*   **SecurityLogs (`/logs/{logId}`)**: Audit logs. These are write-only by signed-in users (or anyone registering) to prevent audit trail erasing. Nobody is allowed to update or delete logs once written.
*   **Simulated Emails (`/emails/{emailId}`)**: Simulated outbound mail. Can only be accessed/read by the recipient matching their authenticated email address.

## 2. The "Dirty Dozen" Payloads (Exploit/Malicious Inputs)
1.  **Identity Spoofing on User Profile**: Attempt to write/update user profile under a different user's UID.
2.  **Unverified User Profiling**: Attempt to create a user profile without verified email token.
3.  **Role Self-Escalation**: Attempt to insert system claims or modify `isAdmin` / role variables within user profile.
4.  **Malicious Book Inject (Poisoning)**: Attempting to create a book with an excessively large title (greater than 200 characters) or invalid formats.
5.  **Direct Book Alteration**: Attempting to alter or delete books authored by other patrons or standard system entries.
6.  **Illegal Bookmark Grafting**: Attempting to insert a bookmark into another patron's private `/users/{otherId}/bookmarks` collection.
7.  **Log Erasing (Log Deletion)**: Attempting to delete a security log entry from `/logs/{logId}`.
8.  **Log Alteration (State Shortcutting)**: Attempting to update a security log's status field from `Failed` to `Success` after creation.
9.  **Email Snooping (PII Breach)**: Attempting to query or view simulated emails of another patron address.
10. **Email Injection**: Injecting a custom unauthorized simulated email on behalf of a victim's email address.
11. **Malicious ID Injection (Resource Poisoning)**: Creating documents where the document ID contains characters other than `[a-zA-Z0-9_-]` or exceeds 128 characters.
12. **Temporal Integrity Spoof**: Injecting a payload where `createdAt` is a hardcoded spoofed historical time rather than `request.time`.

## 3. The Test Runner Reference (Mock Cases)
We will enforce this Zero-Trust structure in our ruleset. Below, we generate the corresponding `DRAFT_firestore.rules` and finally our hardened `firestore.rules`.
