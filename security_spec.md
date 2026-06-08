# Security Spec for Academic OS

## Data Invariants
1. A user profile must only match the request.auth.uid.
2. A study progress document must align its userId with the parent user path.
3. A session must align its userId with the parent user path.

## The "Dirty Dozen" Payloads
1. Create user profile with uid != request.auth.uid
2. Get another user's profile
3. Update another user's profile
4. Inject an invalid grade type.
5. Create a progress document for another user
6. Update another user's progress
7. Create progress with missing userId
8. Read another user's progress list
9. Create a session for another user
10. Update a session for another user
11. Read another user's sessions
12. Attempt to create documents in non-existent root paths and bypass the catch-all.
