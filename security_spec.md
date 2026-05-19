# Security Specification - A Biblioteca Etérea

## Data Invariants
1. A **Poem** must have a non-empty title and content. Content can be Markdown.
2. A **Book** must have a valid status from the allowed list: 'writing', 'completed', 'planning'.
3. Only the specific admin (identified by UID or authenticated account) can write to these collections.
4. Public can read poems and books.

## The Dirty Dozen Payloads (Rejection Targets)
1. Creating a poem without a title.
2. Creating a poem as an unauthenticated user.
3. Updating a poem's `date` or `authorId` if immutable logic was requested (though we'll keep it simple for now, we should still guard).
4. Injecting a 2MB string into a tag field.
5. Deleting a poem as a public user.
6. Changing a book's status to an invalid value like 'deleted'.
7. Massive shadow field injection into a document.
8. Listing poems with an unauthorized query (if list rules were restricted).
9. Spoofing admin status.
10. Creating a document with a malformed ID.
11. Bypassing size limits on strings.
12. Attempting to write to a non-existent collection.

## Implementation Strategy
- Use `rules_version = '2'`.
- Default deny everything.
- Allow read to `poems` and `books` for everyone.
- Allow write/update/delete only if authenticated as the admin (Kailan).
- *Note*: Since the user asked for a specific login/pass, I will use regular Firebase Auth but the rules will check for a specific UID if I were to set it up, or more simply for this demo, I will require authentication. 

Wait, the user wants a specific "login: kailan_adm senha: kailan2508ad". Firebase Auth doesn't exactly work like that with static strings unless I use a custom token or just a very specific password-based account. I will explain that I'll set up a "Kailan Admin" account in Firebase Auth or use a specific protected flag. 

In fact, for the rules to be secure, I should check `request.auth.uid`. I will assume the admin will sign in with an account that I'll designate as admin.
