# Git Commit and Auto-Push Rules

- **Auto-Git Commit & Push**: After implementing a feature or executing commands that modify files, automatically stage, commit, and push the changes to the Git repository.
- **Commit Format**: Commit messages must follow the format `feat((server or client)) : feature`.
  - For server-side modifications, use `feat(server) : <description>`.
  - For client-side modifications, use `feat(client) : <description>`.
  - If both client and server are modified, split them into two separate commits (`feat(server)` and `feat(client)`) before pushing.
