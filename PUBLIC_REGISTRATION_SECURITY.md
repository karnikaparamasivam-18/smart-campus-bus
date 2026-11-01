# Public registration security change

- Public registration accepts only `email`, `full_name`, and `password`.
- Requests containing an extra `role` field are rejected with HTTP 422.
- The backend explicitly assigns `student` when creating a public account.
- The registration UI no longer offers admin/scanner role choices and always routes successful sign-ups to the student area.
- Admin/scanner provisioning is intentionally not implemented by this change; add a separate protected workflow before creating those accounts.
- Microsoft sign-in is not yet configured. The next phase should restrict sign-in to the college's Microsoft Entra tenant and validate identity tokens on the backend.
